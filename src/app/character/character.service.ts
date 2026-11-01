import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { Character, CharacterAdvantage, CharacterAttributes, CharacterEquipment, CharacterFlaw, CharacterMoney, CharacterOrigin, CharacterOtherScores, CharacterSkill, CharacterSnapshot, CombatBonus } from './character.model';
import { EquipmentService } from '../equipment/equipment.service';
import { AdvantageService } from '../advantage/advantage.service';

export const MAX_CHARACTER_STORAGE_BYTES = 4 * 1024 * 1024;
export const MAX_PORTRAIT_DATA_URL_LENGTH = 420_000;

@Injectable({ providedIn: 'root' })
export class CharacterService {
  private readonly storageKey = 'jdr-lanfeust-characters';
  private readonly isBrowser: boolean;
  private readonly characters = signal<Character[]>([]);
  private readonly equipmentService = inject(EquipmentService);
  private readonly advantageService = inject(AdvantageService);
  readonly characterList = this.characters.asReadonly();

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      const savedCharacters = localStorage.getItem(this.storageKey);
      if (savedCharacters) {
        try {
          const parsedCharacters = JSON.parse(savedCharacters);
          if (!Array.isArray(parsedCharacters) || parsedCharacters.some((character) => !this.isCharacter(character))) {
            throw new Error('Invalid character data');
          }
          this.characters.set(parsedCharacters.map((character) => this.normalizeCharacter(character)));
          this.saveToStorage();
        } catch (error) {
          console.error('Impossible de charger les personnages sauvegardés ; les données ont été conservées.', error);
        }
      }
    }
  }

  add(firstName: string, lastName: string, description: string, origin: CharacterOrigin, portrait?: string): Character | undefined {
    const character: Character = {
      id: crypto.randomUUID(), firstName, lastName, portrait, description, origin, level: 0, experience: 0,
      attributes: this.emptyAttributes(),
      otherScores: this.emptyOtherScores(),
      money: this.emptyMoney(),
      skills: [],
      advantages: [],
      flaws: [],
      equipment: [],
      history: [],
    };
    this.characters.update((characters) => [...characters, character]);
    if (!this.saveToStorage()) {
      this.characters.update((characters) => characters.filter((item) => item.id !== character.id));
      return undefined;
    }
    return character;
  }

  update(id: string, firstName: string, lastName: string, description: string, origin: CharacterOrigin, portrait?: string | null): void {
    this.characters.update((characters) => characters.map((character) =>
      character.id === id
        ? { ...character, firstName, lastName, description, origin, portrait: portrait === undefined ? character.portrait : portrait ?? undefined }
        : character,
    ));
    this.saveToStorage();
  }

  remove(id: string): void {
    const previousCharacters = this.characters();
    const removedIds = new Set([id]);
    let previousSize = 0;
    while (removedIds.size !== previousSize) {
      previousSize = removedIds.size;
      previousCharacters.forEach((character) => {
        if (character.ownerCharacterId && removedIds.has(character.ownerCharacterId)) removedIds.add(character.id);
      });
    }
    this.characters.update((characters) => characters.filter((character) => !removedIds.has(character.id)));
    if (!this.saveToStorage()) {
      this.characters.set(previousCharacters);
    }
  }

  findById(id: string): Character | undefined {
    return this.characters().find((character) => character.id === id);
  }

  clearAllData(): void {
    this.characters.set([]);
    if (this.isBrowser) localStorage.removeItem(this.storageKey);
  }

  copyFromSnapshot(characterId: string, snapshotId: string): Character | undefined {
    const character = this.findById(characterId);
    const snapshot = character?.history?.find((item) => item.snapshotId === snapshotId);
    if (!snapshot) return undefined;

    const { snapshotId: ignoredSnapshotId, characterId: ignoredCharacterId, capturedAt: ignoredCapturedAt, ...snapshotData } = structuredClone(snapshot);
    const copy: Character = {
      ...snapshotData,
      id: crypto.randomUUID(),
      lastName: `${snapshot.lastName} (copie)`,
      history: [],
      ownerCharacterId: undefined,
      animalLevelCap: undefined,
      companionDamage: undefined,
    };
    this.characters.update((characters) => [...characters, copy]);
    if (!this.saveToStorage()) {
      this.characters.update((characters) => characters.filter((item) => item.id !== copy.id));
      return undefined;
    }
    return copy;
  }

  setAttributes(id: string, attributes: CharacterAttributes): void {
    this.characters.update((characters) => characters.map((character) =>
      character.id === id ? { ...character, attributes, otherScores: this.recalculateOtherScores(attributes, character.level, character.otherScores, character.equipment.filter((item) => item.equipped).map((item) => item.equipmentId), character.advantages.map((item) => item.advantageId), !!character.ownerCharacterId) } : character,
    ));
    this.saveToStorage();
  }

  recalculateOtherScores(attributes: CharacterAttributes, level: number, currentScores: CharacterOtherScores, equipmentIds: string[] = [], advantageIds: string[] = [], isCompanion = false): CharacterOtherScores {
    const effectiveAttributes = isCompanion ? attributes : this.advantageService.effectiveAttributes(attributes, advantageIds);
    const points = currentScores.combatBonusPoints;
    const equipmentBonuses = this.equipmentService.combatBonuses(equipmentIds);
    const levelUps = Math.max(0, level);
    const levelBonus = Math.floor((2 * levelUps) / 3);
    return {
      ...currentScores,
      attack: effectiveAttributes.force + effectiveAttributes.intelligence + (isCompanion ? levelBonus : points.attack + equipmentBonuses.attack + this.advantageService.combatScoreBonus(advantageIds, 'attack')),
      defense: effectiveAttributes.dexterite + effectiveAttributes.charisme + (isCompanion ? levelBonus : points.defense + equipmentBonuses.defense + this.advantageService.combatScoreBonus(advantageIds, 'defense')),
      save: effectiveAttributes.constitution + effectiveAttributes.sagesse + (isCompanion ? levelBonus : points.save + this.advantageService.combatScoreBonus(advantageIds, 'save')),
      hitPoints: isCompanion
        ? (5 + effectiveAttributes.constitution) * levelUps
        : 10 + effectiveAttributes.constitution + (levelUps * (5 + effectiveAttributes.constitution)),
      energyPoints: 5 + effectiveAttributes.sagesse + (levelUps * (1 + effectiveAttributes.sagesse)) + this.advantageService.energyPointsBonus(advantageIds),
    };
  }

  setOtherScores(id: string, otherScores: CharacterOtherScores): void {
    this.characters.update((characters) => characters.map((character) =>
      character.id === id
        ? {
          ...character,
          otherScores: character.ownerCharacterId
            ? this.recalculateOtherScores(character.attributes, character.level, otherScores, [], character.advantages.map((item) => item.advantageId), true)
            : otherScores,
        }
        : character,
    ));
    this.saveToStorage();
  }

  updateCompanionSetup(id: string, level: number, attributes: CharacterAttributes, damage: string): boolean {
    const companion = this.findById(id);
    if (!companion?.ownerCharacterId
      || !Number.isInteger(level)
      || level < 1
      || level > (companion.animalLevelCap ?? 0)
      || Object.values(attributes).some((value) => !Number.isInteger(value) || value < 0)) return false;

    const previousCharacters = this.characters();
    const experience = level * 100;
    const otherScores = this.recalculateOtherScores(
      attributes,
      level,
      companion.otherScores,
      companion.equipment.filter((item) => item.equipped).map((item) => item.equipmentId),
      companion.advantages.map((item) => item.advantageId),
      true,
    );
    const history = level > companion.level
      ? [...(companion.history ?? []), this.createSnapshot(companion)]
      : companion.history;
    this.characters.update((characters) => characters.map((character) =>
      character.id === id
        ? { ...character, level, experience, attributes, otherScores, companionDamage: damage.trim(), history }
        : character,
    ));
    if (this.saveToStorage()) return true;
    this.characters.set(previousCharacters);
    return false;
  }

  addCombatBonusPoints(id: string, bonuses: Exclude<CombatBonus, null>[]): void {
    if (bonuses.length !== 2 || bonuses[0] === bonuses[1]) return;

    this.characters.update((characters) => characters.map((character) => {
      if (character.id !== id) return character;
      const combatBonusPoints = { ...character.otherScores.combatBonusPoints };
      bonuses.forEach((bonus) => combatBonusPoints[bonus]++);
      const otherScores = this.recalculateOtherScores(character.attributes, character.level, {
        ...character.otherScores,
        combatBonusPoints,
      }, character.equipment.filter((item) => item.equipped).map((item) => item.equipmentId), character.advantages.map((item) => item.advantageId), !!character.ownerCharacterId);
      return { ...character, otherScores };
    }));
    this.saveToStorage();
  }

  setMoney(id: string, money: CharacterMoney): void {
    this.characters.update((characters) => characters.map((character) =>
      character.id === id ? { ...character, money } : character,
    ));
    this.saveToStorage();
  }

  setSkills(id: string, skills: CharacterSkill[]): void {
    this.characters.update((characters) => characters.map((character) =>
      character.id === id ? { ...character, skills } : character,
    ));
    this.saveToStorage();
  }

  setAdvantages(id: string, advantages: CharacterAdvantage[]): void {
    const character = this.findById(id);
    if (!character) return;

    const animalAdvantageId = this.advantageService.advantageList().find((advantage) => advantage.animalChoice)?.id;
    const animalSelections = animalAdvantageId
      ? advantages.filter((advantage) => advantage.advantageId === animalAdvantageId)
      : [];
    const existingCompanion = this.characters().find((item) => item.ownerCharacterId === id);
    let companion: Character | undefined;
    let selectedAdvantages = advantages;

    if (animalSelections.length > 0) {
      const animalName = animalSelections[0].animalName?.trim();
      if (!animalName) return;
      const animalId = existingCompanion?.id ?? crypto.randomUUID();
      const animalLevelCap = animalSelections.length * 5;
      companion = existingCompanion
        ? { ...existingCompanion, firstName: animalName, animalLevelCap }
        : {
          id: animalId,
          firstName: animalName,
          lastName: '',
          description: '',
          origin: 'other',
          level: 0,
          experience: 0,
          attributes: this.emptyAttributes(),
          otherScores: this.emptyOtherScores(),
          money: this.emptyMoney(),
          skills: [],
          advantages: [],
          flaws: [],
          equipment: [],
          history: [],
          ownerCharacterId: id,
          animalLevelCap,
        };
      const experience = Math.min(companion.experience, animalLevelCap * 100);
      const level = Math.floor(experience / 100);
      companion = {
        ...companion,
        experience,
        level,
        otherScores: this.recalculateOtherScores(
          companion.attributes,
          level,
          companion.otherScores,
          companion.equipment.filter((item) => item.equipped).map((item) => item.equipmentId),
          companion.advantages.map((item) => item.advantageId),
          true,
        ),
      };
      selectedAdvantages = advantages.map((advantage) =>
        advantage.advantageId === animalAdvantageId
          ? { ...advantage, animalName, animalId }
          : advantage,
      );
    }

    this.characters.update((characters) => {
      const updatedCharacters = characters.map((item) => {
        if (item.id === id) {
          const equipment = this.withoutArmorWhenTroll(item.equipment, selectedAdvantages);
          return {
            ...item,
            advantages: selectedAdvantages,
            equipment,
            otherScores: this.recalculateOtherScores(
              item.attributes,
              item.level,
              item.otherScores,
              equipment.filter((entry) => entry.equipped).map((entry) => entry.equipmentId),
              selectedAdvantages.map((entry) => entry.advantageId),
              !!item.ownerCharacterId,
            ),
          };
        }
        return item;
      }).filter((item) => item.ownerCharacterId !== id || animalSelections.length > 0);
      return companion && !updatedCharacters.some((item) => item.id === companion?.id)
        ? [...updatedCharacters, companion]
        : updatedCharacters.map((item) => item.id === companion?.id ? companion : item);
    });
    this.saveToStorage();
  }

  companionsFor(characterId: string): Character[] {
    return this.characters().filter((character) => character.ownerCharacterId === characterId);
  }

  setFlaws(id: string, flaws: CharacterFlaw[]): void {
    this.characters.update((characters) => characters.map((character) =>
      character.id === id ? { ...character, flaws } : character,
    ));
    this.saveToStorage();
  }

  setEquipment(id: string, equipment: CharacterEquipment[]): void {
    this.characters.update((characters) => characters.map((character) =>
      character.id === id ? {
        ...character,
        equipment: this.withoutArmorWhenTroll(equipment, character.advantages),
        otherScores: this.recalculateOtherScores(
          character.attributes,
          character.level,
          character.otherScores,
          this.withoutArmorWhenTroll(equipment, character.advantages).filter((item) => item.equipped).map((item) => item.equipmentId),
          character.advantages.map((item) => item.advantageId),
          !!character.ownerCharacterId,
        ),
      } : character,
    ));
    this.saveToStorage();
  }

  private withoutArmorWhenTroll(equipment: CharacterEquipment[], advantages: CharacterAdvantage[]): CharacterEquipment[] {
    if (!advantages.some((item) => item.advantageId === 'troll')) return equipment;
    const armorIds = new Set(this.equipmentService.equipmentList().filter((item) => item.type === 'armor').map((item) => item.id));
    return equipment.map((item) =>
      armorIds.has(item.equipmentId) ? { ...item, equipped: false } : item,
    );
  }

  setExperience(id: string, experience: number): { level: number; experience: number; hitPoints: number; energyPoints: number } {
    // Calculate the level based on experience (1 level per 100 experience points)
    const character = this.findById(id);
    const maximumExperience = character?.animalLevelCap === undefined
      ? Number.POSITIVE_INFINITY
      : character.animalLevelCap * 100;
    const cappedExperience = Math.min(Math.max(0, Math.floor(experience)), maximumExperience);
    const level = Math.floor(cappedExperience / 100);
    const scores = character ? this.recalculateOtherScores(character.attributes, level, character.otherScores, character.equipment.filter((item) => item.equipped).map((item) => item.equipmentId), character.advantages.map((item) => item.advantageId), !!character.ownerCharacterId) : undefined;

    this.characters.update((characters) => characters.map((character) => {
      if (character.id !== id || !scores) return character;
      const history = level > character.level
        ? [...(character.history ?? []), this.createSnapshot(character)]
        : character.history;
      return { ...character, experience: cappedExperience, level, otherScores: scores, history };
    }));
    this.saveToStorage();

    return { level, experience: cappedExperience, hitPoints: scores?.hitPoints ?? 0, energyPoints: scores?.energyPoints ?? 0 };
  }

  importCharacters(data: unknown): boolean {
    if (!Array.isArray(data) || data.some((character) => !this.isCharacter(character))) {
      return false;
    }

    const previousCharacters = this.characters();
    this.characters.set(data.map((character) => this.normalizeCharacter(character)));
    if (this.saveToStorage()) return true;

    this.characters.set(previousCharacters);
    return false;
  }

  private isCharacter(value: unknown): value is Character {
    if (typeof value !== 'object' || value === null) {
      return false;
    }

    const character = value as Record<string, unknown>;
    return typeof character['id'] === 'string'
      && typeof character['firstName'] === 'string'
      && typeof character['lastName'] === 'string'
      && (character['description'] === undefined || typeof character['description'] === 'string')
      && (character['origin'] === undefined || this.isOrigin(character['origin']))
      && (character['experience'] === undefined || this.isExperience(character['experience']));
  }

  private isExperience(value: unknown): value is number {
    return typeof value === 'number' && Number.isInteger(value) && value >= 0;
  }

  private isOrigin(value: unknown): value is CharacterOrigin {
    return value === 'darshan'
      || value === 'eckmul'
      || value === 'souardie'
      || value === 'region-primitive-reculee'
      || value === 'baronies'
      || value === 'barronies'
      || value === 'other';
  }

  private normalizeCharacter(value: Character): Character {
    const animalLevelCap = Number.isInteger(value.animalLevelCap) && (value.animalLevelCap ?? 0) > 0
      ? value.animalLevelCap
      : undefined;
    const rawExperience = this.isExperience(value.experience) ? value.experience : 0;
    const experience = animalLevelCap === undefined ? rawExperience : Math.min(rawExperience, animalLevelCap * 100);
    const equipment = Array.isArray(value.equipment) ? value.equipment.map((item) => ({
      equipmentId: item.equipmentId,
      quantity: Number.isInteger(item.quantity) && item.quantity > 0 ? item.quantity : 1,
      equipped: item.equipped === true,
      weighted: item.weighted === true,
    })) : [];
    const attributes = this.isAttributes(value.attributes) ? value.attributes : this.emptyAttributes();
    const otherScores = this.isOtherScores(value.otherScores) ? this.normalizeOtherScores(value.otherScores) : this.emptyOtherScores();
    const level = Math.floor(experience / 100);
    const advantages = Array.isArray(value.advantages) ? value.advantages : [];
    const ownerCharacterId = typeof value.ownerCharacterId === 'string' ? value.ownerCharacterId : undefined;

    return {
      id: value.id,
      firstName: value.firstName,
      lastName: value.lastName,
      portrait: typeof value.portrait === 'string' && value.portrait.length <= MAX_PORTRAIT_DATA_URL_LENGTH ? value.portrait : undefined,
      description: typeof value.description === 'string' ? value.description : '',
      origin: this.isOrigin(value.origin) ? value.origin : 'other',
      experience,
      level,
      attributes,
      otherScores: this.recalculateOtherScores(attributes, level, otherScores, equipment.filter((item) => item.equipped).map((item) => item.equipmentId), advantages.map((item) => item.advantageId), !!ownerCharacterId),
      money: this.isMoney(value.money) ? value.money : this.emptyMoney(),
      skills: Array.isArray(value.skills) ? value.skills : [],
      advantages,
      flaws: Array.isArray(value.flaws) ? value.flaws : [],
      equipment,
      ownerCharacterId,
      animalLevelCap,
      companionDamage: typeof value.companionDamage === 'string' ? value.companionDamage : '',
      history: Array.isArray(value.history)
        ? value.history.filter((snapshot): snapshot is CharacterSnapshot => this.isSnapshot(snapshot)).map((snapshot) => this.normalizeSnapshot(snapshot))
        : [],
    };
  }

  private createSnapshot(character: Character): CharacterSnapshot {
    const { history, ...currentData } = structuredClone(character);
    return {
      ...currentData,
      snapshotId: crypto.randomUUID(),
      characterId: character.id,
      capturedAt: new Date().toISOString(),
    };
  }

  private normalizeSnapshot(snapshot: CharacterSnapshot): CharacterSnapshot {
    return { ...snapshot, money: this.isMoney(snapshot.money) ? snapshot.money : this.emptyMoney() };
  }

  private isSnapshot(value: unknown): value is CharacterSnapshot {
    if (typeof value !== 'object' || value === null) return false;
    const snapshot = value as Record<string, unknown>;
    return typeof snapshot['snapshotId'] === 'string'
      && typeof snapshot['characterId'] === 'string'
      && typeof snapshot['capturedAt'] === 'string'
      && this.isCharacter(snapshot);
  }

  private emptyAttributes(): CharacterAttributes {
    return { force: 0, dexterite: 0, constitution: 0, sagesse: 0, intelligence: 0, charisme: 0 };
  }

  private emptyOtherScores(): CharacterOtherScores {
    return { attack: 0, defense: 0, save: 0, hitPoints: 0, energyPoints: 0, combatBonus: null, combatBonusPoints: { attack: 0, defense: 0, save: 0 } };
  }

  private emptyMoney(): CharacterMoney {
    return { gold: 0, silver: 0, copper: 0 };
  }

  private isMoney(value: unknown): value is CharacterMoney {
    if (typeof value !== 'object' || value === null) return false;
    const money = value as Record<string, unknown>;
    return ['gold', 'silver', 'copper']
      .every((key) => typeof money[key] === 'number' && Number.isInteger(money[key]) && (money[key] as number) >= 0);
  }

  private isOtherScores(value: unknown): value is CharacterOtherScores {
    if (typeof value !== 'object' || value === null) return false;
    const scores = value as Record<string, unknown>;
    return ['attack', 'defense', 'save', 'hitPoints', 'energyPoints']
      .every((key) => typeof scores[key] === 'number' && Number.isInteger(scores[key]) && (scores[key] as number) >= 0)
      && (scores['combatBonus'] === null || scores['combatBonus'] === undefined || this.isCombatBonus(scores['combatBonus']))
      && (scores['combatBonusPoints'] === undefined || this.isBonusPoints(scores['combatBonusPoints']));
  }

  private isCombatBonus(value: unknown): value is Exclude<CombatBonus, null> {
    return value === 'attack' || value === 'defense' || value === 'save';
  }

  private isBonusPoints(value: unknown): value is CharacterOtherScores['combatBonusPoints'] {
    if (typeof value !== 'object' || value === null) return false;
    const points = value as Record<string, unknown>;
    return ['attack', 'defense', 'save'].every((key) => typeof points[key] === 'number' && Number.isInteger(points[key]) && (points[key] as number) >= 0)
      && (points['attack'] as number) + (points['defense'] as number) + (points['save'] as number) === 2;
  }

  private normalizeOtherScores(value: CharacterOtherScores): CharacterOtherScores {
    const points = value.combatBonusPoints ?? { attack: 0, defense: 0, save: 0 };
    return { ...value, combatBonusPoints: points };
  }

  private isAttributes(value: unknown): value is CharacterAttributes {
    if (typeof value !== 'object' || value === null) return false;
    const attributes = value as Record<string, unknown>;
    return ['force', 'dexterite', 'constitution', 'sagesse', 'intelligence', 'charisme']
      .every((key) => typeof attributes[key] === 'number' && Number.isInteger(attributes[key]) && (attributes[key] as number) >= 0);
  }

  private saveToStorage(): boolean {
    if (this.isBrowser) {
      if (this.characters().length === 0) {
        localStorage.removeItem(this.storageKey);
        return true;
      }
      const serialized = JSON.stringify(this.characters());
      if (serialized.length > MAX_CHARACTER_STORAGE_BYTES) return false;
      try {
        localStorage.setItem(this.storageKey, serialized);
      } catch {
        return false;
      }
    }
    return true;
  }
}
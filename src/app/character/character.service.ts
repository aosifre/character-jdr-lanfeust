import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { Character, CharacterAdvantage, CharacterAttributes, CharacterEquipment, CharacterFlaw, CharacterOrigin, CharacterOtherScores, CharacterSkill, CharacterSnapshot, CombatBonus } from './character.model';
import { EquipmentService } from '../equipment/equipment.service';

export const MAX_CHARACTER_STORAGE_BYTES = 4 * 1024 * 1024;
export const MAX_PORTRAIT_DATA_URL_LENGTH = 420_000;

@Injectable({ providedIn: 'root' })
export class CharacterService {
  private readonly storageKey = 'jdr-lanfeust-characters';
  private readonly isBrowser: boolean;
  private readonly characters = signal<Character[]>([]);
  private readonly equipmentService = inject(EquipmentService);
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
        } catch {
          localStorage.removeItem(this.storageKey);
        }
      }
    }
  }

  add(firstName: string, lastName: string, description: string, origin: CharacterOrigin, portrait?: string): Character | undefined {
    const character: Character = {
      id: crypto.randomUUID(), firstName, lastName, portrait, description, origin, level: 0, experience: 0,
      attributes: this.emptyAttributes(),
      otherScores: this.emptyOtherScores(),
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

  update(id: string, firstName: string, lastName: string, description: string, origin: CharacterOrigin): void {
    this.characters.update((characters) => characters.map((character) =>
      character.id === id ? { ...character, firstName, lastName, description, origin } : character,
    ));
    this.saveToStorage();
  }

  remove(id: string): void {
    this.characters.update((characters) => characters.filter((character) => character.id !== id));
    this.saveToStorage();
  }

  findById(id: string): Character | undefined {
    return this.characters().find((character) => character.id === id);
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
      character.id === id ? { ...character, attributes, otherScores: this.recalculateOtherScores(attributes, character.level, character.otherScores, character.equipment.filter((item) => item.equipped).map((item) => item.equipmentId)) } : character,
    ));
    this.saveToStorage();
  }

  recalculateOtherScores(attributes: CharacterAttributes, level: number, currentScores: CharacterOtherScores, equipmentIds: string[] = []): CharacterOtherScores {
    const points = currentScores.combatBonusPoints;
    const equipmentBonuses = this.equipmentService.combatBonuses(equipmentIds);
    return {
      ...currentScores,
      attack: attributes.force + attributes.intelligence + points.attack + equipmentBonuses.attack,
      defense: attributes.dexterite + attributes.charisme + points.defense + equipmentBonuses.defense,
      save: attributes.constitution + attributes.sagesse + points.save,
      hitPoints: level > 1 ? 10 + attributes.constitution + 5 * level : 10 + attributes.constitution,
      energyPoints: level > 1 ? (1 + attributes.sagesse) * level : 5 + attributes.sagesse,
    };
  }

  setOtherScores(id: string, otherScores: CharacterOtherScores): void {
    this.characters.update((characters) => characters.map((character) =>
      character.id === id ? { ...character, otherScores } : character,
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
    this.characters.update((characters) => characters.map((character) =>
      character.id === id ? { ...character, advantages } : character,
    ));
    this.saveToStorage();
  }

  setFlaws(id: string, flaws: CharacterFlaw[]): void {
    this.characters.update((characters) => characters.map((character) =>
      character.id === id ? { ...character, flaws } : character,
    ));
    this.saveToStorage();
  }

  setEquipment(id: string, equipment: CharacterEquipment[]): void {
    this.characters.update((characters) => characters.map((character) =>
      character.id === id ? { ...character, equipment, otherScores: this.recalculateOtherScores(character.attributes, character.level, character.otherScores, equipment.filter((item) => item.equipped).map((item) => item.equipmentId)) } : character,
    ));
    this.saveToStorage();
  }

  setExperience(id: string, experience: number): { level: number; experience: number; hitPoints: number; energyPoints: number } {
    // Calculate the level based on experience (1 level per 100 experience points)
    const level = Math.floor(experience / 100);

    const character = this.findById(id);
    const scores = character ? this.recalculateOtherScores(character.attributes, level, character.otherScores, character.equipment.filter((item) => item.equipped).map((item) => item.equipmentId)) : undefined;

    this.characters.update((characters) => characters.map((character) => {
      if (character.id !== id || !scores) return character;
      const history = level > character.level
        ? [...(character.history ?? []), this.createSnapshot(character)]
        : character.history;
      return { ...character, experience, level, otherScores: scores, history };
    }));
    this.saveToStorage();

    return { level, experience, hitPoints: scores?.hitPoints ?? 0, energyPoints: scores?.energyPoints ?? 0 };
  }

  importCharacters(data: unknown): boolean {
    if (!Array.isArray(data) || data.some((character) => !this.isCharacter(character))) {
      return false;
    }

    this.characters.set(data.map((character) => this.normalizeCharacter(character)));
    this.saveToStorage();
    return true;
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
    return value === 'human' || value === 'darshan' || value === 'troll' || value === 'eckmul';
  }

  private normalizeCharacter(value: Character): Character {
    const experience = this.isExperience(value.experience) ? value.experience : 0;
    return {
      id: value.id,
      firstName: value.firstName,
      lastName: value.lastName,
      portrait: typeof value.portrait === 'string' && value.portrait.length <= MAX_PORTRAIT_DATA_URL_LENGTH ? value.portrait : undefined,
      description: typeof value.description === 'string' ? value.description : '',
      origin: this.isOrigin(value.origin) ? value.origin : 'human',
      experience,
      level: Math.floor(experience / 100),
      attributes: this.isAttributes(value.attributes) ? value.attributes : this.emptyAttributes(),
      otherScores: this.isOtherScores(value.otherScores) ? this.normalizeOtherScores(value.otherScores) : this.emptyOtherScores(),
      skills: Array.isArray(value.skills) ? value.skills : [],
      advantages: Array.isArray(value.advantages) ? value.advantages : [],
      flaws: Array.isArray(value.flaws) ? value.flaws : [],
      equipment: Array.isArray(value.equipment) ? value.equipment.map((item) => ({
        equipmentId: item.equipmentId,
        quantity: Number.isInteger(item.quantity) && item.quantity > 0 ? item.quantity : 1,
        equipped: item.equipped === true,
        weighted: item.weighted === true,
      })) : [],
      history: Array.isArray(value.history) ? value.history.filter((snapshot): snapshot is CharacterSnapshot => this.isSnapshot(snapshot)) : [],
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
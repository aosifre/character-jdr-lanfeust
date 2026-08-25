import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Character, CharacterAdvantage, CharacterAttributes, CharacterFlaw, CharacterOrigin, CharacterOtherScores, CharacterSkill, CombatBonus } from './character.model';

@Injectable({ providedIn: 'root' })
export class CharacterService {
  private readonly storageKey = 'jdr-lanfeust-characters';
  private readonly isBrowser: boolean;
  private readonly characters = signal<Character[]>([]);
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

  add(firstName: string, lastName: string, description: string, origin: CharacterOrigin): Character {
    const character: Character = {
      id: crypto.randomUUID(), firstName, lastName, description, origin, level: 1, experience: 0,
      attributes: this.emptyAttributes(),
      otherScores: this.emptyOtherScores(),
      skills: [],
      advantages: [],
      flaws: [],
    };
    this.characters.update((characters) => [...characters, character]);
    this.saveToStorage();
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

  setAttributes(id: string, attributes: CharacterAttributes): void {
    this.characters.update((characters) => characters.map((character) =>
      character.id === id ? { ...character, attributes } : character,
    ));
    this.saveToStorage();
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
      description: typeof value.description === 'string' ? value.description : '',
      origin: this.isOrigin(value.origin) ? value.origin : 'human',
      experience,
      level: Math.floor(experience / 100) + 1,
      attributes: this.isAttributes(value.attributes) ? value.attributes : this.emptyAttributes(),
      otherScores: this.isOtherScores(value.otherScores) ? this.normalizeOtherScores(value.otherScores) : this.emptyOtherScores(),
      skills: Array.isArray(value.skills) ? value.skills : [],
      advantages: Array.isArray(value.advantages) ? value.advantages : [],
      flaws: Array.isArray(value.flaws) ? value.flaws : [],
    };
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

  private saveToStorage(): void {
    if (this.isBrowser) {
      localStorage.setItem(this.storageKey, JSON.stringify(this.characters()));
    }
  }
}
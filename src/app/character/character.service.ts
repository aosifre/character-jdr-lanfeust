import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Character, CharacterAttributes } from './character.model';

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

  add(firstName: string, lastName: string): Character {
    const character: Character = {
      id: crypto.randomUUID(), firstName, lastName, level: 1, experience: 0,
      attributes: this.emptyAttributes(),
    };
    this.characters.update((characters) => [...characters, character]);
    this.saveToStorage();
    return character;
  }

  update(id: string, firstName: string, lastName: string): void {
    this.characters.update((characters) => characters.map((character) =>
      character.id === id ? { ...character, firstName, lastName } : character,
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
      && (character['experience'] === undefined || this.isExperience(character['experience']));
  }

  private isExperience(value: unknown): value is number {
    return typeof value === 'number' && Number.isInteger(value) && value >= 0;
  }

  private normalizeCharacter(value: Character): Character {
    const experience = this.isExperience(value.experience) ? value.experience : 0;
    return {
      id: value.id,
      firstName: value.firstName,
      lastName: value.lastName,
      experience,
      level: Math.floor(experience / 100) + 1,
      attributes: this.isAttributes(value.attributes) ? value.attributes : this.emptyAttributes(),
    };
  }

  private emptyAttributes(): CharacterAttributes {
    return { force: 0, dexterite: 0, constitution: 0, sagesse: 0, intelligence: 0, charisme: 0 };
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
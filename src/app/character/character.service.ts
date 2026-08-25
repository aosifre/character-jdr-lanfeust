import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Character } from './character.model';

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
          this.characters.set(JSON.parse(savedCharacters) as Character[]);
        } catch {
          localStorage.removeItem(this.storageKey);
        }
      }
    }
  }

  add(firstName: string, lastName: string): void {
    this.characters.update((characters) => [...characters, { id: crypto.randomUUID(), firstName, lastName }]);
    this.saveToStorage();
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

  importCharacters(data: unknown): boolean {
    if (!Array.isArray(data) || data.some((character) => !this.isCharacter(character))) {
      return false;
    }

    this.characters.set(data);
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
      && typeof character['lastName'] === 'string';
  }

  private saveToStorage(): void {
    if (this.isBrowser) {
      localStorage.setItem(this.storageKey, JSON.stringify(this.characters()));
    }
  }
}
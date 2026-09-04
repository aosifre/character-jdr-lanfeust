import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Advantage, AdvantageCategory } from './advantage.model';
import { AttributeKey } from '../skill/skill.model';

const defaultAdvantages: Advantage[] = [
  { id: 'ambidextre', title: 'Ambidextre', category: 'combat', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'endurant', title: 'Endurant', category: 'heroic', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'fortune', title: 'Chanceux', category: 'social', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'vigilant', title: 'Vigilant', category: 'origin', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'robuste', title: 'Robuste', category: 'combat', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'volonte-de-fer', title: 'Volonté de fer', category: 'magic', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
];

@Injectable({ providedIn: 'root' })
export class AdvantageService {
  private readonly storageKey = 'jdr-lanfeust-advantages-v3';
  private readonly isBrowser: boolean;
  private readonly advantages = signal<Advantage[]>(defaultAdvantages);
  readonly advantageList = this.advantages.asReadonly();

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.every((advantage) => this.isAdvantage(advantage))) this.advantages.set(parsed.map((advantage) => this.normalize(advantage)));
        } catch { /* Ignore an invalid advantage catalogue. */ }
      }
    }
  }

  add(title: string, category: AdvantageCategory, description: string, conditionAttribute: AttributeKey | null, conditionMinimum: number | null, prerequisiteId: string | null): void {
    this.advantages.update((advantages) => [...advantages, { id: crypto.randomUUID(), title, category, description, conditionAttribute, conditionMinimum, prerequisiteId }]);
    this.save();
  }

  remove(id: string): void {
    this.advantages.update((advantages) => advantages.filter((advantage) => advantage.id !== id));
    this.save();
  }

  importAdvantages(data: unknown): boolean {
    if (!Array.isArray(data) || !data.every((advantage) => this.isAdvantage(advantage))) return false;
    this.advantages.set(data.map((advantage) => this.normalize(advantage)));
    this.save();
    return true;
  }

  private isAdvantage(value: unknown): value is Advantage {
    if (typeof value !== 'object' || value === null) return false;
    const advantage = value as Record<string, unknown>;
    return typeof advantage['id'] === 'string'
      && (typeof advantage['title'] === 'string' || typeof advantage['label'] === 'string')
      && (advantage['category'] === undefined || this.isCategory(advantage['category']))
      && (advantage['description'] === undefined || typeof advantage['description'] === 'string')
      && (advantage['conditionAttribute'] === null || advantage['conditionAttribute'] === undefined || this.isAttribute(advantage['conditionAttribute']))
      && (advantage['conditionMinimum'] === null || advantage['conditionMinimum'] === undefined || this.isNumber(advantage['conditionMinimum']))
      && (advantage['prerequisiteId'] === null || advantage['prerequisiteId'] === undefined || typeof advantage['prerequisiteId'] === 'string');
  }

  private normalize(value: Advantage & { label?: string }): Advantage {
    return { id: value.id, title: value.title ?? value.label ?? '', category: value.category ?? 'heroic', description: value.description ?? '', conditionAttribute: value.conditionAttribute ?? null, conditionMinimum: value.conditionMinimum ?? null, prerequisiteId: value.prerequisiteId ?? null };
  }

  private isAttribute(value: unknown): boolean { return ['force', 'dexterite', 'constitution', 'sagesse', 'intelligence', 'charisme'].includes(value as string); }
  private isCategory(value: unknown): value is AdvantageCategory { return ['combat', 'origin', 'magic', 'social', 'heroic'].includes(value as string); }
  private isNumber(value: unknown): boolean { return typeof value === 'number' && Number.isInteger(value) && value >= 0; }

  private save(): void {
    if (this.isBrowser) localStorage.setItem(this.storageKey, JSON.stringify(this.advantages()));
  }
}
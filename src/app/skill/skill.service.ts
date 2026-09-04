import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { AttributeKey, Skill } from './skill.model';

const defaultSkills: Skill[] = [
  { id: 'acrobaties', label: 'Acrobaties', attributeOne: 'dexterite', attributeTwo: 'force' },
  { id: 'bluff', label: 'Bluff', attributeOne: 'charisme', attributeTwo: 'intelligence' },
  { id: 'concentration', label: 'Concentration', attributeOne: 'sagesse', attributeTwo: 'constitution' },
  { id: 'deguisement', label: 'Déguisement', attributeOne: 'charisme', attributeTwo: 'dexterite' },
  { id: 'diplomatie', label: 'Diplomatie', attributeOne: 'charisme', attributeTwo: 'intelligence' },
  { id: 'discretion', label: 'Discrétion', attributeOne: 'dexterite', attributeTwo: 'intelligence' },
  { id: 'dressage', label: 'Dressage', attributeOne: 'charisme', attributeTwo: 'sagesse' },
  { id: 'equitation', label: 'Équitation', attributeOne: 'dexterite', attributeTwo: 'sagesse' },
  { id: 'escalade', label: 'Escalade', attributeOne: 'force', attributeTwo: 'dexterite' },
  { id: 'escamotage', label: 'Escamotage', attributeOne: 'dexterite', attributeTwo: 'intelligence' },
  { id: 'evasion', label: 'Evasion', attributeOne: 'dexterite', attributeTwo: 'force' },
  { id: 'fouille', label: 'Fouille', attributeOne: 'intelligence', attributeTwo: 'sagesse' },
  { id: 'intimidation', label: 'Intimidation', attributeOne: 'force', attributeTwo: 'charisme' },
  { id: 'natation', label: 'Natation', attributeOne: 'force', attributeTwo: 'constitution' },
  { id: 'perception', label: 'Perception', attributeOne: 'sagesse', attributeTwo: 'intelligence' },
  { id: 'psychologie', label: 'Psychologie', attributeOne: 'sagesse', attributeTwo: 'intelligence' },
  { id: 'renseignement', label: 'Renseignement', attributeOne: 'charisme', attributeTwo: 'sagesse' },
  { id: 'survie', label: 'Survie', attributeOne: 'sagesse', attributeTwo: 'constitution' },
];

@Injectable({ providedIn: 'root' })
export class SkillService {
  private readonly storageKey = 'jdr-lanfeust-skills-v4';
  private readonly isBrowser: boolean;
  private readonly skills = signal<Skill[]>(defaultSkills);
  readonly skillList = this.skills.asReadonly();

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.every((skill) => this.isSkill(skill))) this.skills.set(parsed);
        } catch { /* Ignore an invalid local catalogue. */ }
      }
    }
  }

  add(label: string, attributeOne: AttributeKey, attributeTwo: AttributeKey): void {
    this.skills.update((skills) => [...skills, { id: crypto.randomUUID(), label, attributeOne, attributeTwo }]);
    this.save();
  }

  remove(id: string): void {
    this.skills.update((skills) => skills.filter((skill) => skill.id !== id));
    this.save();
  }

  importSkills(data: unknown): boolean {
    if (!Array.isArray(data) || !data.every((skill) => this.isSkill(skill))) return false;
    this.skills.set(data);
    this.save();
    return true;
  }

  private isSkill(value: unknown): value is Skill {
    if (typeof value !== 'object' || value === null) return false;
    const skill = value as Record<string, unknown>;
    return typeof skill['id'] === 'string' && typeof skill['label'] === 'string'
      && this.isAttribute(skill['attributeOne']) && this.isAttribute(skill['attributeTwo']);
  }

  private isAttribute(value: unknown): value is AttributeKey {
    return ['force', 'dexterite', 'constitution', 'sagesse', 'intelligence', 'charisme'].includes(value as string);
  }

  private save(): void {
    if (this.isBrowser) localStorage.setItem(this.storageKey, JSON.stringify(this.skills()));
  }
}
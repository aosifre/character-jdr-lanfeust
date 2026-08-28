import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Equipment, EquipmentCategory, EquipmentType } from './equipment.model';

const defaultEquipment: Equipment[] = [
  { id: 'epee-amateur', label: 'Épée d’amateur', type: 'weapon', category: 1, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {} },
  { id: 'epee-pro', label: 'Épée de professionnel', type: 'weapon', category: 2, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {} },
  { id: 'epee-brutasse', label: 'Épée de brutasse', type: 'weapon', category: 3, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {} },
  { id: 'bouclier-amateur', label: 'Bouclier d’amateur', type: 'shield', category: 1, attackBonus: 0, defenseBonus: 1, damageReduction: 0, skillBonuses: {} },
  { id: 'bouclier-pro', label: 'Bouclier de professionnel', type: 'shield', category: 2, attackBonus: 0, defenseBonus: 2, damageReduction: 0, skillBonuses: {} },
  { id: 'bouclier-brutasse', label: 'Bouclier de brutasse', type: 'shield', category: 3, attackBonus: 0, defenseBonus: 3, damageReduction: 0, skillBonuses: {} },
  { id: 'armure-amateur', label: 'Armure d’amateur', type: 'armor', category: 1, attackBonus: 0, defenseBonus: 0, damageReduction: 2, skillBonuses: {} },
  { id: 'armure-pro', label: 'Armure de professionnel', type: 'armor', category: 2, attackBonus: 0, defenseBonus: 0, damageReduction: 4, skillBonuses: {} },
  { id: 'armure-brutasse', label: 'Armure de brutasse', type: 'armor', category: 3, attackBonus: 0, defenseBonus: 0, damageReduction: 6, skillBonuses: {} },
];

@Injectable({ providedIn: 'root' })
export class EquipmentService {
  private readonly storageKey = 'jdr-lanfeust-equipment-v1';
  private readonly isBrowser: boolean;
  private readonly equipment = signal<Equipment[]>(defaultEquipment);
  readonly equipmentList = this.equipment.asReadonly();

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.every((item) => this.isEquipment(item))) this.equipment.set(parsed);
        } catch { /* Ignore an invalid equipment catalogue. */ }
      }
    }
  }

  add(label: string, type: EquipmentType, category: EquipmentCategory | null, attackBonus: number, defenseBonus: number, damageReduction: number, skillBonuses: Record<string, number>): Equipment {
    const item = { id: crypto.randomUUID(), label, type, category, attackBonus, defenseBonus, damageReduction, skillBonuses };
    this.equipment.update((items) => [...items, item]);
    this.save();
    return item;
  }

  combatBonuses(equipmentIds: string[]): { attack: number; defense: number; damageReduction: number } {
    return this.equipment().filter((item) => equipmentIds.includes(item.id)).reduce((total, item) => ({
      attack: total.attack + item.attackBonus,
      defense: total.defense + item.defenseBonus,
      damageReduction: total.damageReduction + item.damageReduction,
    }), { attack: 0, defense: 0, damageReduction: 0 });
  }

  skillBonus(skillId: string, equipmentIds: string[]): number {
    return this.equipment().filter((item) => equipmentIds.includes(item.id)).reduce((total, item) => total + (item.skillBonuses[skillId] ?? 0), 0);
  }

  remove(id: string): void {
    this.equipment.update((items) => items.filter((item) => item.id !== id));
    this.save();
  }

  private isEquipment(value: unknown): value is Equipment {
    if (typeof value !== 'object' || value === null) return false;
    const item = value as Record<string, unknown>;
    return typeof item['id'] === 'string' && typeof item['label'] === 'string'
      && ['weapon', 'shield', 'armor', 'other'].includes(item['type'] as string)
      && (item['category'] === null || item['category'] === 1 || item['category'] === 2 || item['category'] === 3)
      && typeof item['attackBonus'] === 'number' && typeof item['defenseBonus'] === 'number'
      && typeof item['damageReduction'] === 'number' && typeof item['skillBonuses'] === 'object';
  }

  private save(): void {
    if (this.isBrowser) localStorage.setItem(this.storageKey, JSON.stringify(this.equipment()));
  }
}
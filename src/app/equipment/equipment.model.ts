export type EquipmentType = 'weapon' | 'shield' | 'armor' | 'other';
export type EquipmentCategory = 1 | 2 | 3;

export interface Equipment {
  id: string;
  label: string;
  type: EquipmentType;
  category: EquipmentCategory | null;
  attackBonus: number;
  defenseBonus: number;
  damageReduction: number;
  skillBonuses: Record<string, number>;
}
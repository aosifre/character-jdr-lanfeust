export interface CharacterAttributes {
  force: number;
  dexterite: number;
  constitution: number;
  sagesse: number;
  intelligence: number;
  charisme: number;
}

export type CombatBonus = 'attack' | 'defense' | 'save' | null;

export interface CharacterOtherScores {
  attack: number;
  defense: number;
  save: number;
  hitPoints: number;
  energyPoints: number;
  combatBonus: CombatBonus;
}

export interface Character {
  id: string;
  firstName: string;
  lastName: string;
  description: string;
  level: number;
  experience: number;
  attributes: CharacterAttributes;
  otherScores: CharacterOtherScores;
  skills: CharacterSkill[];
}

export interface CharacterSkill {
  skillId: string;
  degree: number;
}
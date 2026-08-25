export interface CharacterAttributes {
  force: number;
  dexterite: number;
  constitution: number;
  sagesse: number;
  intelligence: number;
  charisme: number;
}

export type CombatBonus = 'attack' | 'defense' | 'save' | null;
export type CharacterOrigin = 'human' | 'darshan' | 'troll' | 'eckmul';

export interface CharacterOtherScores {
  attack: number;
  defense: number;
  save: number;
  hitPoints: number;
  energyPoints: number;
  combatBonus: CombatBonus;
  combatBonusPoints: { attack: number; defense: number; save: number };
}

export interface Character {
  id: string;
  firstName: string;
  lastName: string;
  description: string;
  origin: CharacterOrigin;
  level: number;
  experience: number;
  attributes: CharacterAttributes;
  otherScores: CharacterOtherScores;
  skills: CharacterSkill[];
  advantages: CharacterAdvantage[];
  flaws: CharacterFlaw[];
}

export interface CharacterSkill {
  skillId: string;
  degree: number;
}

export interface CharacterAdvantage {
  advantageId: string;
}

export interface CharacterFlaw {
  flawId: string;
}
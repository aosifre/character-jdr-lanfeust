export interface CharacterAttributes {
  force: number;
  dexterite: number;
  constitution: number;
  sagesse: number;
  intelligence: number;
  charisme: number;
}

export interface Character {
  id: string;
  firstName: string;
  lastName: string;
  level: number;
  experience: number;
  attributes: CharacterAttributes;
}
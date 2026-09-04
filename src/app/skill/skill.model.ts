import { CharacterAttributes } from '../character/character.model';

export type AttributeKey = keyof CharacterAttributes;

export interface Skill {
  id: string;
  label: string;
  attributeOne: AttributeKey;
  attributeTwo: AttributeKey;
}
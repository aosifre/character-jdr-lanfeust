import { AttributeKey } from '../skill/skill.model';

export type AdvantageCategory = 'combat' | 'origin' | 'magic' | 'social' | 'heroic';

export interface Advantage {
  id: string;
  title: string;
  category: AdvantageCategory;
  description: string;
  conditionAttribute: AttributeKey | null;
  conditionMinimum: number | null;
  prerequisiteId: string | null;
}
export type EquipmentType = 'weapon' | 'shield' | 'armor' | 'other';
export type EquipmentCategory = 1 | 2 | 3;

export interface Equipment {
  id: string;
  label: string;
  icon?: string;
  type: EquipmentType;
  category: EquipmentCategory | null;
  attackBonus: number;
  defenseBonus: number;
  damageReduction: number;
  weight?: number;
  skillBonuses: Record<string, number>;
}

export function equipmentIcon(item: Pick<Equipment, 'label' | 'type' | 'icon'>): string {
  if (item.icon?.trim()) return item.icon.trim();

  const label = item.label.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
  if (/bouclier|pare-coup|pavois|targe|rondache|ecu/.test(label)) return '🛡️';
  if (/armure|cotte de mailles|cuirasse|plastron/.test(label)) return '🦺';
  if (/arc|arbalete|fronde|fleche/.test(label)) return '🏹';
  if (/hache|serpe|faux|vouge/.test(label)) return '🪓';
  if (/epee|dague|lance|pique|trident|fleau|masse|marteau|arme/.test(label)) return '⚔️';
  if (/dragon|dracosaure|petaure|shrink|cheval|lezard|barque|navire|galere|voilier|chariot/.test(label)) return '🐉';
  if (/boisson|alcool|biere|vin|liqueur|pichet|bouteille/.test(label)) return '🍷';
  if (/repas|festin|nourriture|ration|croquette|orgie/.test(label)) return '🍲';
  if (/vetement|habit|mode|apparat|accessoire/.test(label)) return '🧥';
  if (/maison|demeure|palais|chaumiere|habitation/.test(label)) return '🏠';
  if (/lampe|bougie|torche|brasero|encens/.test(label)) return '🕯️';
  if (/grimoire|parchemin|livre|clepsydre|loupe|longue-vue/.test(label)) return '📜';
  if (/sac|coffre|coffret|corde|grappin|echelle|tente|outil|materiel/.test(label)) return '🎒';

  return { weapon: '⚔️', shield: '🛡️', armor: '🦺', other: '🎒' }[item.type];
}
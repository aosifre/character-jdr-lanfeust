export interface MajorEnchantment {
  title: string;
  materials: string;
  energyCost: string;
  concentration: string;
  description: string;
}

// Les huit fiches sont des emplacements à compléter avec les détails fournis.
export const MAJOR_ENCHANTMENTS: MajorEnchantment[] = Array.from({ length: 8 }, (_, index) => ({
  title: `Enchantement majeur ${index + 1}`,
  materials: '',
  energyCost: '',
  concentration: '',
  description: '',
}));

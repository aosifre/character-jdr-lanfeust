import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Advantage, AdvantageCategory } from './advantage.model';
import { AttributeKey } from '../skill/skill.model';

const defaultAdvantages: Advantage[] = [
  { id: 'armes-armures-pro', title: 'Armes et armures de professionnel', category: 'combat', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'artiste-tripaille', title: 'Artiste de la tripaille', category: 'combat', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'arme-parade', title: 'Arme de parade', category: 'combat', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'armes-armures-brutasse', title: 'Armes et armures de brutasse', category: 'combat', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'arts-martiaux', title: 'Arts martiaux', category: 'combat', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'attaque-defensive', title: 'Attaque défensive', category: 'combat', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'attaque-defensive', title: 'Attaque défensive', category: 'combat', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'attaque-devastatrice', title: 'Attaque dévastatrice', category: 'combat', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'attaque-repetition', title: 'Attaque à répétition', category: 'combat', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'attaque-sournoise', title: 'Attaque sournoise', category: 'combat', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'charge-furieuse', title: 'Charge furieuse', category: 'combat', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'combat-monte', title: 'Combat monté', category: 'combat', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'combat-a-deux-armes', title: 'Combat à deux armes', category: 'combat', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'combat-en-aveugle', title: 'Combat en aveugle', category: 'combat', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'cri-de-guerre', title: 'Cri de guerre', category: 'combat', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'cri-de-ralliement', title: 'Cri de ralliement', category: 'combat', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'enchainement', title: 'Enchaînement', category: 'combat', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'gladiateur-des-tavernes', title: 'Gladiateur des tavernes', category: 'combat', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'jeu-de-jambes', title: 'Jeu de jambes', category: 'combat', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'lancer-de-gens', title: 'Lancer de gens', category: 'combat', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId:null },
  { id: 'maitre-en-arts-martiaux', title: 'Maître en arts martiaux', category: 'combat', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'parade-de-projectiles', title: 'Parade de projectiles', category: 'combat', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'pietinement', title: 'Piétinement', category: 'combat', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'provocateur', title: 'Provocateur', category: 'combat', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'science-de-l-embuscade', title: 'Science de l\'embuscade', category: 'combat', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'sous-la-ceinture', title: 'Sous la ceinture', category: 'combat', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'specialisation', title: 'Spécialisation', category: 'combat', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'surspecialisation', title: 'Surspécialisation', category: 'combat', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'tir-de-loin', title: 'Tir de loin', category: 'combat', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'tir-rapide', title: 'Tir rapide', category: 'combat', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'uppercut', title: 'Uppercut', category: 'combat', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'boussole-vivante', title: 'Boussole vivante', category: 'heroic', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'chanceux', title: 'Chanceux', category: 'heroic', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'la-musique-adoucit-les-moeurs', title: 'La musique adoucit les moeurs', category: 'heroic', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'porte-poisse', title: 'Porte poisse', category: 'heroic', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'que-d-un-oeil', title: 'Que d\'un oeil', category: 'heroic', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'qu-est-ce-que-j-ai-dans-ma-poche', title: 'Qu\'est-ce que j\'ai dans ma poche', category: 'heroic', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'resistant', title: 'Résistant', category: 'heroic', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'robustesse', title: 'Robustesse', category: 'heroic', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'sixieme-sens', title: 'Sixième sens', category: 'heroic', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'endurant', title: 'Sommeil réparateur', category: 'heroic', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'endurant', title: 'Talentueux', category: 'heroic', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'bon-sens-souard', title: 'Bon sens souard', category: 'origin', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'chouchou-d-un-dieu', title: 'Chouchou d\'un dieu', category: 'origin', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'chaman', title: 'Chaman', category: 'origin', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'fortune', title: 'Fortuné', category: 'origin', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'chevalier', title: 'Chevalier', category: 'origin', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'gnome-de-troy', title: 'Gnome de Troy', category: 'origin', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'gris-gris-qui-marchent', title: 'Gris-gris qui marchent', category: 'origin', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'nain', title: 'Nain', category: 'origin', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'pouvoir-magique', title: 'Pouvoir magique', category: 'origin', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'refractaire-a-la-magie', title: 'Réfractaire à la magie', category: 'origin', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'sage-d-eckmul', title: 'Sage d\'Eckmül', category: 'origin', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'troll', title: 'Troll', category: 'origin', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'turf-attitre', title: 'Turf attitré', category: 'origin', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'robuste', title: 'Robuste', category: 'combat', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'longue-duree', title: 'Longue durée', category: 'magic', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'longue-portee', title: 'Longue portée', category: 'magic', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'nouvelles-recettes', title: 'Nouvelles recettes', category: 'magic', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'pompe-a-energie', title: 'Pompe à énergie', category: 'magic', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'pouvoir-devastateur', title: 'Pouvoir dévastateur', category: 'magic', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'pouvoir-discret', title: 'Pouvoir discret', category: 'magic', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'pouvoir-etendu', title: 'Pouvoir étendu', category: 'magic', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'puissance-magique', title: 'Puissance magique', category: 'magic', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'reserves-d-energie', title: 'Réserves d\'énergie', category: 'magic', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'zone-etendue', title: 'Zone étendue', category: 'magic', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'allies', title: 'Alliés', category: 'social', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'ames-de-chef', title: 'Ames de chef', category: 'social', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'chevalier-blanc', title: 'Chevalier blanc', category: 'social', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'compagnon-animal', title: 'Compagnon animal', category: 'social', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'contacts', title: 'Contacts', category: 'social', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'croque-mitaine', title: 'Croque-mitaine', category: 'social', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'devoue-serviteur', title: 'Dévoué serviteur', category: 'social', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'gros-bras-a-la-pelle', title: 'Gros bras à la pelle', category: 'social', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'identite-secrete', title: 'Identité secrète', category: 'social', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'relations', title: 'Relations', category: 'social', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'sexy', title: 'Sexy', category: 'social', description: '', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
];

@Injectable({ providedIn: 'root' })
export class AdvantageService {
  private readonly storageKey = 'jdr-lanfeust-advantages-v3';
  private readonly isBrowser: boolean;
  private readonly advantages = signal<Advantage[]>(defaultAdvantages);
  readonly advantageList = this.advantages.asReadonly();

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.every((advantage) => this.isAdvantage(advantage))) this.advantages.set(parsed.map((advantage) => this.normalize(advantage)));
        } catch { /* Ignore an invalid advantage catalogue. */ }
      }
    }
  }

  add(title: string, category: AdvantageCategory, description: string, conditionAttribute: AttributeKey | null, conditionMinimum: number | null, prerequisiteId: string | null): void {
    this.advantages.update((advantages) => [...advantages, { id: crypto.randomUUID(), title, category, description, conditionAttribute, conditionMinimum, prerequisiteId }]);
    this.save();
  }

  remove(id: string): void {
    this.advantages.update((advantages) => advantages.filter((advantage) => advantage.id !== id));
    this.save();
  }

  importAdvantages(data: unknown): boolean {
    if (!Array.isArray(data) || !data.every((advantage) => this.isAdvantage(advantage))) return false;
    this.advantages.set(data.map((advantage) => this.normalize(advantage)));
    this.save();
    return true;
  }

  private isAdvantage(value: unknown): value is Advantage {
    if (typeof value !== 'object' || value === null) return false;
    const advantage = value as Record<string, unknown>;
    return typeof advantage['id'] === 'string'
      && (typeof advantage['title'] === 'string' || typeof advantage['label'] === 'string')
      && (advantage['category'] === undefined || this.isCategory(advantage['category']))
      && (advantage['description'] === undefined || typeof advantage['description'] === 'string')
      && (advantage['conditionAttribute'] === null || advantage['conditionAttribute'] === undefined || this.isAttribute(advantage['conditionAttribute']))
      && (advantage['conditionMinimum'] === null || advantage['conditionMinimum'] === undefined || this.isNumber(advantage['conditionMinimum']))
      && (advantage['prerequisiteId'] === null || advantage['prerequisiteId'] === undefined || typeof advantage['prerequisiteId'] === 'string');
  }

  private normalize(value: Advantage & { label?: string }): Advantage {
    return { id: value.id, title: value.title ?? value.label ?? '', category: value.category ?? 'heroic', description: value.description ?? '', conditionAttribute: value.conditionAttribute ?? null, conditionMinimum: value.conditionMinimum ?? null, prerequisiteId: value.prerequisiteId ?? null };
  }

  private isAttribute(value: unknown): boolean { return ['force', 'dexterite', 'constitution', 'sagesse', 'intelligence', 'charisme'].includes(value as string); }
  private isCategory(value: unknown): value is AdvantageCategory { return ['combat', 'origin', 'magic', 'social', 'heroic'].includes(value as string); }
  private isNumber(value: unknown): boolean { return typeof value === 'number' && Number.isInteger(value) && value >= 0; }

  private save(): void {
    if (this.isBrowser) localStorage.setItem(this.storageKey, JSON.stringify(this.advantages()));
  }
}
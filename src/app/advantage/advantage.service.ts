import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Advantage, AdvantageCategory } from './advantage.model';
import { AttributeKey } from '../skill/skill.model';

const defaultAdvantages: Advantage[] = [
  { id: 'armes-armures-pro', title: 'Armes et armures de professionnel', category: 'combat', description: 'Vous ne subissez aucun malus quand vous utilisez des armes, boucliers et armures de professionnel p.123, 126', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'artiste-tripaille', title: 'Artiste de la tripaille', category: 'combat', description: 'Un adversaire qui souhaite engager le combat avec vous après vous avoir vu tuer au moins un ennemi doit réussir un jet de Sauvegarde de difficulté 10+1 par adversaire tué par vos soins depuis le début du combat. En cas d\'échec, la peur et des ennuis gastriques l\'empêchent d\'agir - il ne pourra vous attaquer qu\'à son prochain tour.', conditionAttribute:  'force', conditionMinimum:  3, prerequisiteId: null },
  { id: 'arme-parade', title: 'Arme de parade', category: 'combat', description: 'Quand vous tenez une arme dans la main gauche (ou la main droite, si vous êtes gaucher), vous pouvez ajouter +2 à votre Défense. Si vous possédez l\'Atout Combat à deux armes et que vous décidez d\'attaquer avec votre deuxième arme, vous perdez le bonus de Défense jusqu\'à votre prochain tour.', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'armes-armures-brutasse', title: 'Armes et armures de brutasse', category: 'combat', description: 'Vous ne subissez aucun malus quand vous utilisez des armes, boucliers et armures de brutasse p.123', conditionAttribute: null, conditionMinimum: null, prerequisiteId: 'armes-armures-pro' },
  { id: 'arts-martiaux', title: 'Arts martiaux', category: 'combat', description: 'Vos attaques à mains nues occasionnent 2d6 points de dégâts, plus votre bonus de Force', conditionAttribute: 'dexterite', conditionMinimum: 1, prerequisiteId: null },
  { id: 'attaque-defensive', title: 'Attaque défensive', category: 'combat', description: 'Cet atout vous permet de faire une attaque défensive à votre tour. Appliquez un malus de -2 à vos jets d\'Attaque pendant votre tour. Vous recevrez un bonus de +4 à tous les jets de Défense que vous ferez jusqu\'à votre prochain tour.', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'attaque-devastatrice', title: 'Attaque dévastatrice', category: 'combat', description: 'Quand vous décidez de faire une telle attaque, vous jetez le dé d\'Attaque avec un malus de -2, mais vous ajoutez 1d6 aux dégâts si l\'attaque porte. Vous pouvez prendre cette Atout plusieurs fois, ce qui vous permer de cumuler les d6 de dégâts supplémentaires si vous acceptez de cumuler les malus à l\'attaque.', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'attaque-repetition', title: 'Attaque à répétition', category: 'combat', description: 'Quand vous maniez une arme d\'amateur ou que vous êtes à mains nues, vous pouvez faire une attaque supplémentaire à votre tour. Si vous avez plusieurs attaques, vous utiliez votre meilleur bonus. Cependant, tous vos jets d\'Attaque sont assortis d\'un malus de -2.', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'attaque-sournoise', title: 'Attaque sournoise', category: 'combat', description: 'Si vous pouvez surprendre un adversaire et l\'attaquer sans qu\'il détecte votre présence, vous pouvez ajouter 1d6 aux dégâts de toutes les atttaques de votre tour. Cet atout fonctionne au corps à corps comme à distance. Vous pouvez prendre cette atout plusieurs fois, à concurrence d\'une fois tous les 5 niveaux. A chaque nouvel Atout, ajoutez 1d6 à vos dégâts pendant une attaque sournoise.', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'charge-furieuse', title: 'Charge furieuse', category: 'combat', description: 'Si vous avez passé votre tour précédent à courir en direction de vos adversaires, les dégâts de votre première attaque sont doublés : jetez deux fois le nombre de d6 correspondant à votre arme et ajoutez votre bonus de Force.', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'combat-monte', title: 'Combat monté', category: 'combat', description: 'Cet Atout a deux effets. A chaque fois que vous ou votre monture, vous subissez des dégâts, vous pouvez faire un jet d\'Equitation opposé au jet d\'Attaque initial. Si vous réussiez, vous décidez si ces dégâts s\'appliquent à vous ou à votre monture. Vous devez annoncer ce choix avant que les dégâts ne soient résolus. Si vous avez passé votre tour précédent à galoper en direction de vos rivaux, vous doublez les dégâts de votre première attaque. Prenez deux fois le nombre de d6 correspondant à votre arme et faites donc une belle brochette d\'adversaires ! Votre bonus de Force ne s\'applique qu\'une fois.', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'combat-a-deux-armes', title: 'Combat à deux armes', category: 'combat', description: 'Vous gagnez une attaque supplémentaire avec cette deuxième arme, mais toutes vos attaques se font avec un malus de -2. Si vous avez plusieurs attaques, utilisez votre meilleur bonus.', conditionAttribute: 'dexterite', conditionMinimum: 2, prerequisiteId: null },
  { id: 'combat-en-aveugle', title: 'Combat en aveugle', category: 'combat', description: 'Vous êtes parfaitement capable de vous battre dans l\'obscurité. Vous ne subissez aucun désavantage quand vous êtes dans cette situation. Le conteur ne peut pas vous faire de Krâsses dues à l\'obscurité.', conditionAttribute: 'sagesse', conditionMinimum: 2, prerequisiteId: null },
  { id: 'cri-de-guerre', title: 'Cri de guerre', category: 'combat', description: 'Quand un nouveau combat s\'engage, vous pouvez pousser votre cri de guerre. Tous les adversaires qui vous entendent recevront un malus de -2 au premier jet de Défense qu\'ils joueront contre vous.', conditionAttribute: 'charisme', conditionMinimum: 2, prerequisiteId: null },
  { id: 'cri-de-ralliement', title: 'Cri de ralliement', category: 'combat', description: 'Une fois par combat, vous pouvez pousser un cri de ralliement. Tous les alliés qui vous entendent reçoivent  un bonus de +2 aux jets de Sauvegarde et d\'Attaque qu\'ils joueront d\'ici à votre prochain tour.', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'enchainement', title: 'Enchaînement', category: 'combat', description: 'Vous êtes spécialisé dans les combats de groupe. A chaque fois que vous mettez un adversaire hors de combat au corps à corps, vous pouvez faire une nouvelle attaque sur un autre adversaire engagé au corps à corps contre vous.', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null, minimumLevel: 5 },
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

  add(title: string, category: AdvantageCategory, description: string, conditionAttribute: AttributeKey | null, conditionMinimum: number | null, prerequisiteId: string | null, minimumLevel: number | null): void {
    this.advantages.update((advantages) => [...advantages, { id: crypto.randomUUID(), title, category, description, conditionAttribute, conditionMinimum, prerequisiteId, minimumLevel }]);
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
      && (advantage['prerequisiteId'] === null || advantage['prerequisiteId'] === undefined || typeof advantage['prerequisiteId'] === 'string')
      && (advantage['minimumLevel'] === null || advantage['minimumLevel'] === undefined || this.isNumber(advantage['minimumLevel']));
  }

  private normalize(value: Advantage & { label?: string }): Advantage {
    return { id: value.id, title: value.title ?? value.label ?? '', category: value.category ?? 'heroic', description: value.description ?? '', conditionAttribute: value.conditionAttribute ?? null, conditionMinimum: value.conditionMinimum ?? null, prerequisiteId: value.prerequisiteId ?? null, minimumLevel: value.minimumLevel === undefined && value.id === 'enchainement' ? 5 : value.minimumLevel ?? null };
  }

  private isAttribute(value: unknown): boolean { return ['force', 'dexterite', 'constitution', 'sagesse', 'intelligence', 'charisme'].includes(value as string); }
  private isCategory(value: unknown): value is AdvantageCategory { return ['combat', 'origin', 'magic', 'social', 'heroic'].includes(value as string); }
  private isNumber(value: unknown): boolean { return typeof value === 'number' && Number.isInteger(value) && value >= 0; }

  private save(): void {
    if (this.isBrowser) localStorage.setItem(this.storageKey, JSON.stringify(this.advantages()));
  }
}
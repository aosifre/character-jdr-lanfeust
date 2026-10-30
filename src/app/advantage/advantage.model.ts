import { AttributeKey } from '../skill/skill.model';
import { CharacterOrigin } from '../character/character.model';

export type AdvantageCategory = 'combat' | 'origin' | 'magic' | 'social' | 'heroic';

export interface DarshanDeity {
  name: string;
  circumstances: string;
  helpingHand: string;
}

export const DARSHAN_DEITIES: DarshanDeity[] = [
  { name: 'Anth ybhio le consulté', circumstances: 'Dans un atelier ; Pendant un processus scientifique ; en cas de maladie ou de blessure.', helpingHand: 'Apporte une idée neuve, un concept inédit, un outil inconnu ; soigne une maladie ou une blessure.' },
  { name: 'Avoghaï le double', circumstances: 'Quand le personnage est sur le point de mourir.', helpingHand: 'Le héros est ramené à 1 point de vie.' },
  { name: 'Badwäh l’humide', circumstances: 'En bateau ou sur une étendue d\'eau en général.', helpingHand: 'Apaise la mer ou au contraire apporte l\'orage ; noie des cavaliers noirs dans un petit ruisseau ridicule, nettoie les canalisations entartrées, etc.' },
  { name: 'Boudigaärd la surentraînée', circumstances: 'Dans les coulisses du pouvoir et les lieux où l\'on intrigue ; quand le personnage essaie de protéger quelqu\'un qui dépend de lui.', helpingHand: 'Eviter un coup par miracle ; entendre une conversation par hasard ; ne pas être vu, etc...' },
  { name: 'Cathe la pourpre', circumstances: 'Dans les situations qui ont dégénéré violemment; pendant l\'exercice d\'une vengeance.', helpingHand: 'Fait apparâitre une fiole de poison ou une fausse preuve incriminant un ennemi ; envoi un monstre insectoïde qui détruit tout sur son passage (utiliser les caractéristiques du Crabe Colossal, page 218).' },
  { name: 'Ghän-jaäh le ligneux', circumstances: 'Dans les forêts, les parcs impériaux et partout où la nature est prépondérante.', helpingHand: 'Offre des baies et des racines comestibles ; avale un ennemi dans un arbre creux etc...' },
  { name: 'Hanklüm gros marteau', circumstances: 'Dans un atelier ; Pendant la fabrication d\'un objet de qualité ; pendant un duel.', helpingHand: 'Répare une arme ; fournit l\'inspiration pour réaliser un chef d\'oeuvre ; fait tomber des flammes sur un ennemi, etc...' },
  { name: 'Katouhhoumane au pied léger', circumstances: 'Sur un toit ; Pendant un cambriolage ou une infiltration discrète.', helpingHand: 'Distrait un garde ; Neutralise un piège ; rend les toits glissants pour des poursuivants, etc...' },
  { name: 'Khöl-tran l’harmonieuse', circumstances: 'Pendant une représentation artistique ; un bal ou une autre manifestation festive.', helpingHand: 'Inspire une prestation miraculeuse ; envoie l\'inspiration d\'une grande oeuvre ; rend un ennemi sourd etc...' },
  { name: 'Khönoposs le piligent', circumstances: 'Quand le héros doit faire une course urgente ; quand il est perdu ; quand il est en retard.', helpingHand: 'Fait apparaître une monture ; fait trouver un raccourci ; en général facilite un voyage.' },
  { name: 'Laräkroft l’intrépide', circumstances: 'Dans un souterrain ; lors d\'une escalade périlleuse ; dans un temple maudit.', helpingHand: 'Arrête un piège au dernier moment ; fait trouver un passage secret ; fait apparaître une clé ou un onguent de soins etc...' },
  { name: 'Rkrzzzîîk la consciencieuse', circumstances: 'Pendant une séance d\'intérrogation ou de soins ; pendant une tentative d\'intimidation.', helpingHand: 'Atténue ou au contraire amplifie la douleur ; fore un trou ; fait peur à un ennemi, etc...' },
  { name: 'Röq le minéral', circumstances: 'Dans les montagnes et autres environnements rocheux ; dans les grandes constructions de pierre brute.', helpingHand: 'Fait apparaître ou disparaître de la roche ; fait parler les pierres ; anime une statue, etc...' },
  { name: 'Shlikäh la révérée', circumstances: 'Pendant une tentative de séduction ; pendant toute acte sensuel (danse, massage, etc...)', helpingHand: 'Apparaît pour réconforter un adorateur solitaire ; rend une jeune personne folle de désir etc...' },
  { name: 'Shüntem-ylion l’ébriète', circumstances: 'Dans les auberges, tavernes et autres lieux de bombance ; pendant une fête endiablée.', helpingHand: 'Remplit les tonneaux de vin ; rend un adversaire ivre ; donne envie à un groupe de gens de faire la fête, etc...' },
  { name: 'Sparshöng le terrible', circumstances: 'Pendant un combat au service d\'une bonne cause ; quand le héros est à la poursuite d\'un traître ou d\'un félon.', helpingHand: 'Envoie une de ses armes divines se battre contre l\'adversaire ; fait apparaître des chaînes et des menottes sur un fugitif ; indique la direction de la personne recherchée, etc...' },
  { name: 'Sphax le discret', circumstances: 'Les négociations, enquêtes et intrigues ; les rencontres interculturelles.', helpingHand: 'Fournit un renseignement vital ; rend le personnage mondain et raffiné ; fait apparaître un guide touristique, etc...' },
  { name: 'Sung-Haklh l’imprévisible', circumstances: 'N\'importe quand', helpingHand: 'Provoque un coup de chance inespéré ou au contraire annulé une catastrophe inattendue. Règle spéciale : les interventions de Sung-Haklh sont à double tranchant. Lors de la prière, si vous obtenez plus de 1 que de 6 sur les dK,li se produit le contraire de ce que vous avez souhaité. Ou en tous cas, il vous arrive un gros pépin. Si vous obtenez autant de 1 que de 6, le miracle a lieu normalement.' },
  { name: 'Teepie-yak au ciré doré', circumstances: 'Pendant un acte de piraterie ou de banditisme avéré ; à la pêche.', helpingHand: 'Provoque une pêche miraculeuse ; attire des "clients" dans une embuscade ; envoie une carte au trésor, etc...' },
  { name: 'Xhiatyr l’incomparable', circumstances: 'Pendant une transaction ou un autre acte commercial ; quand le personnage essaie d\'escroquer ou d\'abuser de la confiance de quelqu\'un.', helpingHand: 'Fait prendre des cailloux pour des pépites d\'or ; gâte les marchandises d\'un concurrent ; rend quelqu\'un particulièrement crédule, etc...' },
];

export interface DeityChoiceDraft {
  selection: string;
  customName: string;
  circumstances: string;
  helpingHand: string;
}

export interface AdvantageBenefit {
  title: string;
  description: string;
}

export type AdvantageAttributeBonuses = Partial<Record<AttributeKey, number>>;
export type AdvantageSkillBonuses = Record<string, number>;
export type CombatScoreKey = 'attack' | 'defense' | 'save';
export type AdvantageCombatBonuses = Partial<Record<CombatScoreKey, number>>;

export interface Advantage {
  id: string;
  title: string;
  category: AdvantageCategory;
  description: string;
  benefits?: AdvantageBenefit[];
  attributeBonuses?: AdvantageAttributeBonuses;
  attributeMinimums?: Partial<Record<AttributeKey, number>>;
  skillBonuses?: AdvantageSkillBonuses;
  combatBonuses?: AdvantageCombatBonuses;
  conditionAttribute: AttributeKey | null;
  conditionMinimum: number | null;
  conditionOrigin?: CharacterOrigin | null;
  conditionSkillId?: string | null;
  conditionSkillMinimum?: number | null;
  prerequisiteId: string | null;
  minimumLevel?: number | null;
  repeatable?: boolean;
  weaponChoice?: boolean;
  deityChoice?: boolean;
  excludedAdvantageIds?: string[];
  recipeChoice?: boolean;
  recipeCount?: number;
  evolutionOnly?: boolean;
}
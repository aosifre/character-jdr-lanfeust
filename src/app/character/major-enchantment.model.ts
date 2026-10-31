export interface MajorEnchantment {
  title: string;
  materials: string;
  energyCost: string;
  concentration: string;
  description: string;
}

// Les huit fiches sont des emplacements à compléter avec les détails fournis.
export const MAJOR_ENCHANTMENTS: MajorEnchantment[] = [
  {
    title: 'Comment enchanter un troll',
    materials: 'Un troll immobilisé, trpos braseros d\'argent ouvragé, de l\'encens d\'Ambone.',
    energyCost: '3d6',
    concentration: '10 si le troll est inconscient, autrement le jet est opposé au jet de Sauvegarde du troll.',
    description: 'Cet enchantememnt est des plus utiles pour un sage qui s\'aventure dans les régions rurales. On ne sait jamais quand on va tomber sur un troll à la recherche de son prochain repas. Notez qu\'un enchantement peut se rompre dans certaines conditions, comme le coma éthylique, un séjour dans l\'eau ou d\'autres évènements au choix du conteur. Dans une telle situation, le troll peut tenter un jet de Sauvegarde difficulté 20 pour se libérer de l\'enchantement.',
  },
  {
    title: 'Comment faire sourire un percepteur des taxes indirectes',
    materials: 'une personne immobilitée.',
    energyCost: '1 point par minute de durée souhaitée',
    concentration: "le jet est Opposé au jet de Sauvegarde de la victime.",
    description: 'Malgré son intitulé, cet enchantement a plusieurs usages. Il permet de rendre les gens heureux, qu\'ils soient percepteurs ou non. La victime de cette formule est plongée dans un état de béatitude parfaite. Elle est complètement incapable de percevoir son environnement ou de réagir à un quelconque stimulus. Il n\'y a que si elle subit des dégâts qu\'elle sort de son état.',
  },
  {
    title: "Comment créer un quignon de pain sec et un pichet d'eau fraîche",
    materials: "Un pichet d'eau, un quignon de pain sec, ou tout autre objet de taille comparable",
    energyCost: "1d6",
    concentration: "15",
    description: "Le sage est capable de cacher sur lui des objets de la taille approximative d'un pichet d'eau, ce qui n'est pas négligeable.",
  },
  {
    title: "Comment provoquer un état qui passe communément pour la mort",
    materials: "Sept mouches prélevées sur un troll vivant, puis pilées et inhalées par le sujet.",
    energyCost: "4d6",
    concentration: "20",
    description: "Le sujet peut rester en état d'animation suspendue pendant des années, voire des siècles. Et ce sans avoir besoin de se nourrir, ni même vieillir. Une fois le sujet endormi, il ne revient à lui que s'il subit plus de 5 points de dégâts d'un coup ou si un sage récite devant lui la formule à l'envers.",
  },
  {
    title: "Comment arrêter le temps",
    materials: "Une demi-écaille de dragon de mer, un sigasfrin en argent massif, un pétaure femelle gravide au pelage roux, un petit mortier en vois de vigne, une Darshanide vierge, deux mesures d'eau du lac Pelludice.",
    energyCost: "10d6",
    concentration: "25",
    description: "En une fraction de seconde, le temps s'arrête autour du sage. Tout se fige, y compris lui-même, les alentours, et le reste de Troy. Puis, au bout d'une période indeterminée, le temps reprend son vol, comme si de rien n'était.",
  },
  {
    title: "Comment marcher sur l'eau",
    materials: "Une couronne d'épines, une croix de chêne nain d'Ansacre, 4 clous à moitié rouillés, des petits pains au sésame, 12 disciples et une bonne paire de chaussres de marche.",
    energyCost: "2d6",
    concentration: "15",
    description: "L'enchantement permet au sage de marcher sur l'eau pendant une heure, après quoi il lui faut recommencer."
  },
  {
    title: "Comment apaiser un homme en colère",
    materials: "3 pétales de rose, 1 solide gourdin",
    energyCost: "1d6",
    concentration: "spécial",
    description: "Si le sage parvient à placer les trois pétales de rose dans les narines et dans la bouche de la cible, c'est que la magie a déjà fonctionné. Autrement, il peut jeter les pétales avant de passer à la phase deux de l'enchantement : mettre un grand coup de gourdin en travers de la tête de la cible. (Comme pour assomer p.113). Peut recommencer 10 minutes plus tard l'incantation."
  },
  {
    title: "Comment ne jamais se perdre dans une bibliothèque",
    materials: "Un sav de petits cailloux blancs",
    energyCost: "1d6",
    concentration: "15",
    description: "Tant que le sage ne tombe pas à court de petits cailloux, il n'a aucune chance de se perdre. Il peut même ajouter un bonus de +20 à tous ses jets de Survie, pour la peine."
  }
];
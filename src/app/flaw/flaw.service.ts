import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Flaw } from './flaw.model';

const defaultFlaws: Flaw[] = [
  { id: 'agit-avant-reflechit-trop-tard', title: 'Agit avant, réfléchit trop tard', description: "Vous êtes impulsif doté de la patience d'un trollillon de cinq ans devant un sorbet de cervelle de fermière. Pour vous, il sera toujours temps de se poser des questions quand on aura résolu le problème de la façon la plus expéditive possible. En ce qui vous concerne, la première solution que vous entrevoyez est toujours la bonne." },
  { id: 'boit-comme-un-trou', title: 'Boit comme un trou', description: "Vous adorer picoler. Dès que vous avez l'occasion (et les moyens)  de vous en jeter un derrière la cotte de mailles, vous foncez sans réfléchir aux conséquences. Besoin d'une bonne nuit de sommeil ? Deux heures sur le plancher maculé de vomi de la taverne suffiront ! Ce travers peut vous faire perdre beaucoup de temps." },
  { id: 'esprit-de-contradiction', title: 'Esprit de contradiction', description: "Ce que vous aimez par-dessus tout, ce sont les discussions interminables où personne n'est jamais d'accord avec personne. C'est pourquoi vous prenez systématiquement le contre-pied des décisions des autres, même si vous savez que vous avez tort et qu'on vous le démontrera par A+B au bout de quelques minutes. Parfois, vous ouvrez votre grande gueule quand il ne le faut pas - devant un supérieur ou quelqu'un qui réagit aux contradictions à coups de hache." },
  { id: 'estomac-sur-pattes', title: 'Estomac sur pattes', description: "Vous adorez manger et vous feriez des kilomètres pour un bon steak de pétaure. Quand vous pouvez vous payer un gueuleton, vous arrangez vos priorités en conséquence. Votre estomac d'abord, sauver le monde ensuite." },
  { id: 'fou-a-enchainer', title: 'Fou à enchaîner', description: "Vous avez de gros problèmes à distinguer la réalité du monde que vous vous êtes construit : vous êtes ce qu'on peut appeler un fou furieux. A part quelques attitudes bizarres et autres manies incompréhensibles, vous êtes parfaitement capable de fonctionner en société. Parfois, juste parfois, vous craquez et devenez complètement intenable. Vous voyez des monstres qui n'existent pas, vous prenez la femme de chambre pour le grand généralissime Gorax, vous pensez pouvoir voler etc. Ces crises durent en moyenne une heure et sont activées par le conteur." },
  { id: 'grippe-sou', title: 'Grippe-sou', description: "Selon vous, rien n'est jamais assez usé pour être remplacé. Pas moyen de vous amener à vous séparer du moindre dragon de cuivre tant que ce n'est pas absolument nécessaire. Vous préfériez aller pieds nus plutôt que d'acheter une paire de bottes, même d'occasion. Cette radinerie aigüe vous pousse parfois à partir à l'aventure sous-équipé." },
  { id: 'grosse-larve', title: 'Grosse larve', description: "Vous êtes plus flemmard qu'un dragon des roches et vos amis ont toutes les peines du monde à vous faire remuer votre armure. Dans votre conception des choses, le moindre travail est de trop. Si vous pouvez à une corvée, vous ne vous gênez jamais. Ce genre de laisser-aller peut prêter à conséquence, surtout si on vous charge d'une mission vitale, comme acheter des vivres avant un départ en bateau ou huiler les armes pendant une équipée dans la jungle." },
  { id: 'honnete-maladive', title: 'Honnêteté maladive', description: "Mentir, c'est mal. Votre père vous l'a sans doute répété en s'aidant de son ceinturon, parce que vous avez bien retenu la leçon. Trop bie, même ! Vous avez un mal fou à ne pas dire la vérité, c'est chronique chez vous. Parfois, même quand votre vie en dépend, vous ne pouvez pas tenir votre langue. Ou alors vous bafouillez tellement que vous vous sentez obligé d'avouer la vérité. Inutile de dire que dans une vie d'aventures, ce Travers peut se révéler fort handicapant !" },
  { id: 'inconscient-du-danger', title: 'Inconscient du danger', description: "Quand un danger se présente, vous avez toujours une soi-disant solution pour vous en tirer. Vous êtes un vrai casse-cou, prêt à tout et persuadé que rien ne peut vous arriver. Méfiez-vous, ce genre d'attitude pourrait vous entraîner dans des ennuis bien plus gros que prévus !" },
  { id: 'intolerant-indecrottable', title: 'Intolérant indécrottable', description: "Ce qui n'est pas comme vous vous répugne. Les ressortissants d'autres contrées, les gens de l'autre sexe, les créatures d'une autre race. Vous arrivez à les supporter la plupart du temps, mais parfois votre mépris prend le pas sur votre politesse et vous ne pouvez pas retenir une remarque acerbe ou un trait d'humour déplacé. De là, à vous retrouver au milieu d'une bagarre générale, il n'y a qu'un pas." },
  { id: 'kleptomane-compulsif', title: 'Kleptomane compulsif', description: "Vous avez les mains baladeuses. Non, pas comme un sage d'Eckmül après un séjour d'étude en forêt de trois semaines. Plutôt comme un pickpocket qui aurait besoin de beaucoup de monnaie. Vous n'arrivez pas empêcher les mains susnommées de traîner sur les étals des marchés, au milieu des étagères de bibelots du marchand qui vous reçoit, ou dans les poches de vos amis." },
  { id: 'long-a-la-detente', title: 'Long à la détente', description: "Même si vous êtes éduqué, vous n'êtes pas bien malain. Il ne s'agit pas à proprement parler d'intellect, mais plus de rapidité d'esprit. Et vous avez celle d'un escargot cacochyme. Parfois, vous ne faites pas le rapport entre deux faits, ou alors vous oubliez un détail important." },
  { id: 'loyaute-indefectible', title: 'Loyauté indéfectible', description: "Les amis, c'est sacré ! La famille, one ne la renie jamais ! Vous avez un fort sentiment d'identité avec au moins un groupe auquel vous appartenez (votre famille, vos compagnons d'aventure, vos camarades miliciens, etc.). Trahir vos pairs serait pour vous un déchirement. Vous ferez tout pour leur porter assistance, quels que soient les risques." },
  { id: 'le-monde-est-ma-scene', title: 'Le monde est ma scène', description: "Vous adorez qu'on vous regarde. Mieux encore, qu'on vous admire. Vous faites tout pour être le centre d'attention, quel qu'en soit le prix. Quand quelqu'un doit faire quelque chose de risqué ou de flamboyant, vous vous portez volontaire, même si vous n'êtes pas le plus compétent. Cela vaut surtout quand il y a un public pour vous applaudir." },
  { id: 'mortelle-curiosite', title: 'Mortelle curiosité', description: "L'inconnu revêt pour vous des attraits presque irrésistible. Vous brûlez de tout savoir et de tout voir, surtout quand c'est interdit. Qu'y a-t-il derrière cette montagne au loin ? Qu'est-ce qui se cache dans ce coffre cadenassé ? L'épouse que le bourgmestre cloître dans sa chambre est-elle aussi belle et peu fariycge qu'on le raconte ?" },
  { id: 'mythomane', title: 'Mythomane', description: "La vérité, vous la connaissez, mais vous la trouvez souvent terne et sans intérêt. C'est pourquoi vous avez pris le parti de l'embellir à chaque fois que c'est possible. Vous changez des détails, ajoutez des bouts ici et là, jusqu'à la rendre méconnaissable. Mais tellement plus intéressante. Bref, en un mot comme en cent, vous ne pouvez pas vous empêcher de raconter des salades à tout bout de champ. Et comme chacun sait, mentir est le meilleur moyen de se mettre dans les ennuis." },
  { id: 'naitive-desarmante', title: 'Naïveté désarmante', description: "C'est incroyable à quel point vous pouvez être naïf. Vous prenez des vessies pour des lanternes sans qu'on ait besoin de mettre des chandelles à l'intérieur. Il faut parfois vous secouer et vous rappeler que tout n'est pas à prendre au premier degré et que parfois les gens vous mentent pour arriver à leurs fins. Vos amis évitent de vous laisser seul, de crainte de vous voir vous embarquer sur un navire d'esclavagistes soi-disant en partance pour les Monts d'Or Pur ou quelque autre mythe du même acabit." },
  { id: 'obsede-du-sexe', title: 'Obsédé du sexe', description: "Vous ne pensez qu'à ça. Dès que vous avez l'occasion de satisfaire vos bas instincts, vous foncez tête et pantalon baissés sans réfléchir. De plus, vos propositions indécentes et vos remarques salsaces ont tendance à incommoder les personnes du sexe opposé." },
  { id: 'pas-de-tete', title: 'Pas de tête', description: "Tout le monde vous le dit : vous êtes un grand distrait. Vous avez beau faire des noeuds à votre mouchoir, prendre des notes un peu partout, rien à faire. Vous oubliez toujours les détails importants au plus mauvais moment. Sans parler des documents vitaux, de vos lunettes et de vos trousseaux de clés, que vous égarez constamment." },
  { id: 'pec-sans-manieres', title: 'Pec sans manières', description: "Les bonnes manières, vous ne connaissez pas. C'est peut-être dû à un manque d'éducation, ou au fait que vous n'aimez pas les mondanités et prenez un malin plaisir à bousculer les conventions. En tout cas, vous ne prenez jamais de gants pour vous dire ce que vous pensez, érucez dans les repas mondains, vous grattez quand ç avous démange, etc. C'est un fait, vous n'êtes pas sortable." },
  { id: 'petochard', title: 'Pétochard', description: "Vous avez peur de votre ombre. Vous sursautez au moindre bruit d'origine inconnue. Vous ne supportez pas de dormir dans le noir ou avec la fenêtre ouverte. Un vrai trouillard, quoi. Vos compagnons ont le plus grand mal à vous convaincre de les suivre dans certains endroits particulièrement impressionnants, comme la cave de l'oncle Mathurin ou la place du Vieux Marché d'Eckmül." },
  { id: 'sarcasmes-intempestifs', title: 'Sarcasmes intempestifs', description: "Vous adorez rire aux dépens des autres. Personne n'est jamais à l'abri de vos moqueries incisives, vous ne trouvez toujours quelque chose à attaquer, un trait physique, un souvenir embarassant, une maladresse en combat... C'est à tel point que vous n'arrivez pas toujorus à vous retenir de proférer une remarque vitriolée, même quand la situation ne s'y prête pas." },
  { id: 'tete-de-mule', title: 'Tête de mule', description: "Vous avez toujours raison. Enfin, pas toujours, mais ça n'empêche pas. Quand vous avez une idée en tête, vous n'en démordez pas (une image assez bizarre, convenons-en). Quand vous vous êtes forgé une opinion, elle est définitive, et il faut déployer des trésors de diplomatie pour vous convaincre ne serait-ce que de reconsidérer votre position. Pour un aventurier qui doit sans cesse s'adapter aux circonstances, être tête de mule est parfois un lourd handicap." },
  { id: 'timide-comme-pas-permis', title: 'Timide comme pas permis', description: "Vous avez du mal avec les gens, surtout les joli(e)s représentant(e)s du sexe opposé. Vous rougissez, vous vous emmêlez les pinceaux, vous bafouillez : un vrai adolescent ! Vous allez dire que vous soyez complètement bloqué au moment de plaider votre cause auprès de la resplendissante reine amazone qui vient de capturer vos amis..." },
  { id: 'trop-sur-de-lui', title: 'Trop sûr de lui', description:"Rien n'est insurmontable pour un héros comme vous. Les armées d'Averroës ? Peccadille ! Vous êtes un bretteur divin et vous allez leur en remontrer ! Le concours de poésie annuel de Xingdu ? Un lettré tel que vous l'emportera haut la main ! Vous l'avez compris, vous avez une image de vous-même quelque peu au-dessus de la réalité. Pas difficile de sauter la tête la première dans les problèmes avec un travers pareil !" },
];

@Injectable({ providedIn: 'root' })
export class FlawService {
  private readonly storageKey = 'jdr-lanfeust-flaws-v1';
  private readonly isBrowser: boolean;
  private readonly flaws = signal<Flaw[]>(defaultFlaws);
  readonly flawList = this.flaws.asReadonly();

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      const savedFlaws = localStorage.getItem(this.storageKey);
      if (savedFlaws) {
        try {
          const parsedFlaws = JSON.parse(savedFlaws);
          if (Array.isArray(parsedFlaws) && parsedFlaws.every((flaw) => this.isFlaw(flaw))) {
            this.flaws.set(this.mergeWithDefaults(parsedFlaws));
          }
        } catch { /* Ignore an invalid flaw catalogue. */ }
      }
    }
  }

  add(title: string, description: string): void {
    this.flaws.update((flaws) => [...flaws, { id: crypto.randomUUID(), title, description }]);
    this.save();
  }

  remove(id: string): void {
    this.flaws.update((flaws) => flaws.filter((flaw) => flaw.id !== id));
    this.save();
  }

  import(data: unknown): boolean {
    if (!Array.isArray(data) || !data.every((flaw) => this.isFlaw(flaw))) return false;
    this.flaws.set(this.mergeWithDefaults(data));
    this.save();
    return true;
  }

  resetToDefaults(): void {
    this.flaws.set([...defaultFlaws]);
    if (this.isBrowser) localStorage.removeItem(this.storageKey);
  }

  private mergeWithDefaults(customFlaws: Flaw[]): Flaw[] {
    const flawsById = new Map(defaultFlaws.map((flaw) => [flaw.id, flaw]));
    for (const flaw of customFlaws) flawsById.set(flaw.id, flaw);
    return [...flawsById.values()];
  }

  private isFlaw(value: unknown): value is Flaw {
    if (typeof value !== 'object' || value === null) return false;
    const flaw = value as Record<string, unknown>;
    return typeof flaw['id'] === 'string' && typeof flaw['title'] === 'string' && typeof flaw['description'] === 'string';
  }

  private save(): void {
    if (this.isBrowser) localStorage.setItem(this.storageKey, JSON.stringify(this.flaws()));
  }
}

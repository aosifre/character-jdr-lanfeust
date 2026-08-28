import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Equipment, EquipmentCategory, EquipmentType } from './equipment.model';

const defaultEquipment: Equipment[] = [
  { id: 'arbalete-legere', label: 'Arbalete légère (et arbalète de poing)', type: 'weapon', category: 1, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {} },
  { id: 'arc-court', label: 'Arc court (de chasse)', type: 'weapon', category: 1, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {} },
  { id: 'baton', label: 'Bâton (et gourdin, matraque, fémur de votre arrière-grand-tante...)', type: 'weapon', category: 1, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {} },
  { id: 'dague', label: 'Dague (et poignard, couteau à huîtres, cure-dents troll...)', type: 'weapon', category: 1, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {} },
  { id: 'epee-courte', label: 'Épée courte (et machette, épée de collection ou d’apparat...)', type: 'weapon', category: 1, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {} },
  { id: 'fronde', label: 'Fronde (et lance-pierre)', type: 'weapon', category: 1, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {} },
  { id: 'hache-outil', label: 'Hache, version outil (et hachoir, tranchoir...)', type: 'weapon', category: 1, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {} },
  { id: 'masse-outil', label: 'Masse, version outil (et marteau...)', type: 'weapon', category: 1, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {} },
  { id: 'mobilier-courant', label: 'Mobilier courant (chaise, chope, chandelier, rôti de shrink...)', type: 'weapon', category: 1, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {} },
  { id: 'naturel', label: 'Naturelle (poing, pied, front, sabot, tentacules...)', type: 'weapon', category: 1, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {} },
  { id: 'pique', label: 'Pique (et épieu, fourche ...)', type: 'weapon', category: 1, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {} },
  { id: 'serpe', label: 'Serpe (et pertuisane, vouge, faux...)', type: 'weapon', category: 1, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {} },
  { id: 'arbalete-lourde', label: 'Arbalete lourde (et arbalète à répétition)', type: 'weapon', category: 2, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {} },
  { id: 'arc-guerre', label: 'Arc de guerre (et arc long, arc composite)', type: 'weapon', category: 2, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {} },
  { id: 'arme-capture', label: 'Arme de capture (bola, boomerang, filet, fouet)', type: 'weapon', category: 2, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {} },
  { id: 'epee-longue', label: 'Épée longue (et cimeterre, épée bâtarde, sabre darshanide...)', type: 'weapon', category: 2, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {} },
  { id: 'hache-armes', label: 'Hache d\'armes', type: 'weapon', category: 2, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {} },
  { id: 'lance-fantassin', label: 'Lance de fantassin (et hallebarde, javelot, trident...)', type: 'weapon', category: 2, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {} },
  { id: 'masse-arme', label: 'Masse d\'arme (et fléau, morgenstern, marteau de guerre...)', type: 'weapon', category: 2, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {} },
  { id: 'naturelle-gros', label: 'Naturelle, gros prédateurs (troll, dragon, collecteur de taxes...)', type: 'weapon', category: 2, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {} },
  { id: 'epee-deux-mains', label: 'Épée à deux mains (espadon...)', type: 'weapon', category: 3, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {} },
  { id: 'fleau-deux-mains', label: 'Fleau à deux mains', type: 'weapon', category: 3, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {} },
  { id: 'haches-deux-mains', label: 'Haches à deux mains (et à double tranchant...)', type: 'weapon', category: 3, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {} },
  { id: 'lance-tournoi', label: 'Lance de tournoi', type: 'weapon', category: 3, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {} },
  { id: 'masse-troll', label: 'Masse de troll (et tronc d\'arbre), mât de navirre...)', type: 'weapon', category: 3, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {} },
  { id: 'mobilier-massif', label: 'Mobilier massif (table en bois de bolbolong, tonneau, nain ivre...)', type: 'weapon', category: 3, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {} },
  { id: 'bouclier-petit', label: 'Bouclier, petit (bois et/ou fer, targe, rondache...)', type: 'shield', category: 1, attackBonus: 0, defenseBonus: 1, damageReduction: 0, skillBonuses: {} },
  { id: 'pare-coup', label: 'Pare-coup (bouclier bricolé, nain attaché à un bras...)', type: 'shield', category: 1, attackBonus: 0, defenseBonus: 1, damageReduction: 0, skillBonuses: {} },
  { id: 'bouclier-grand', label: 'Bouclier, grand (en fer, écu...)', type: 'shield', category: 2, attackBonus: 0, defenseBonus: 2, damageReduction: 0, skillBonuses: {} },
  { id: 'bouclier-particulier', label: 'Bouclier, particulier (en cuir de dracosaure, en os de géant...)', type: 'shield', category: 2, attackBonus: 0, defenseBonus: 2, damageReduction: 0, skillBonuses: {} },
  { id: 'bouclier-geant', label: 'Bouclier, géant (grand pavois de fer...)', type: 'shield', category: 3, attackBonus: 0, defenseBonus: 3, damageReduction: 0, skillBonuses: {} },
  { id: 'armure-autochtone', label: 'Armure d’autochtone (en os, en carapace d\'insecte, en bois...)', type: 'armor', category: 1, attackBonus: 0, defenseBonus: 0, damageReduction: 2, skillBonuses: {} },
  { id: 'armure-cuir', label: 'Armure de cuir (et corselets, pourpoints matelassés...)', type: 'armor', category: 1, attackBonus: 0, defenseBonus: 0, damageReduction: 2, skillBonuses: {} },
  { id: 'armure-metal', label: 'Armure de métal (cotte de mailles, plastron, cuirasse, crevice...)', type: 'armor', category: 2, attackBonus: 0, defenseBonus: 0, damageReduction: 4, skillBonuses: {} },
  { id: 'armure-particuliere', label: 'Armure particulère (en écailles de dragon, en os de léviathan...)', type: 'armor', category: 2, attackBonus: 0, defenseBonus: 0, damageReduction: 4, skillBonuses: {} },
  { id: 'armure-integrale', label: 'Armure intégrale (armure de tournoi, harnois...)', type: 'armor', category: 3, attackBonus: 0, defenseBonus: 0, damageReduction: 6, skillBonuses: {} },
  { id: 'autre-boisson-alcool-fin', label: 'Alcool fin (la bouteille: liqueur de murte ou de xinabre vert)', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 6, skillBonuses: {} },
  { id: 'autre-boisson-tonnelet-biere', label: 'Tonnelet de bière', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {} },
  { id: 'autre-boisson-vin-ordinaire', label: 'Vin, ordinaire (le pichet)', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {} },
  { id: 'autre-boisson-vin-gris-klostope', label: 'Vin, gris de Klostope (le pichet)', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {} },
  { id: 'autre-habitation-ordinaire', label: 'Chaumière ordinaire', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {} },
  { id: 'autre-habitation-belle-demeure', label: 'Belle demeure', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {} },
  { id: 'autre-habitation-petit-palais', label: 'Petit palais privé sur les hauteurs d\'Eckmül', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {} },
  { id: 'autre-transport-barque', label: 'Barque à fond plat', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {} },
  { id: 'autre-transport-chariot-lezard', label: 'Chariot à lézard', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {} },
  { id: 'autre-transport-dracosaure', label: 'Dracosaure, avec selle et harnachement', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {} },
  { id: 'autre-transport-dragon-bat', label: 'Dragon de bât', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {} },
  { id: 'autre-transport-dragon-guerre', label: 'Dragon de guerre', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {} },
  { id: 'autre-transport-galere-marchande', label: 'Galère marchande', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {} },
  { id: 'autre-transport-navire-guerre', label: 'Navire de guerre, armé jusqu\'aux plats-bords', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 6, skillBonuses: {} },
  { id: 'autre-transport-petaure-seul', label: 'Pétaure seul', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {} },
  { id: 'autre-transport-petaure-palanquins', label: 'Pétaure avec palanquin et harnachement de voyage complet', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 6, skillBonuses: {} },
  { id: 'autre-transport-shrink', label: 'Shrink, vieille carne de base, avec selle', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {} },
  { id: 'autre-transport-voilier-petit', label: 'Voilier petit', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {} },
  { id: 'autre-nourriture-repas-ordinaire', label: 'Repas ordinaire', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {} },
  { id: 'autre-nourriture-repas-qualite', label: 'Repas de qualité', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {} },
  { id: 'autre-nourriture-festin', label: 'Festin', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {} },
  { id: 'autre-nourriture-orgie-troll', label: 'Orgie trolle', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {} },
  { id: 'autre-vetement-accesoire-mode', label: 'Accessoire de mode', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {} },
  { id: 'autre-vetement-vetement-douteux', label: 'Vêtements douteux', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {} },
  { id: 'autre-vetement-vetement-standard', label: 'Vêtements standards', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {} },
  { id: 'autre-vetement-vetement-citadin', label: 'Vêtements de citadin', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {} },
  { id: 'autre-vetement-vetement-noble', label: 'Vêtements de noble', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: { intimidation: 1} },
  { id: 'autre-vetement-vetement-damoiselle-echancrure', label: 'Vêtements de damoiselle avec les petites échancrures', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 6, skillBonuses: { bluff: 1} },
  { id: 'autre-vetement-vetement-apparat-pompon', label: 'Vêtements d\'apparat avec pompons, grelots etc.', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 6, skillBonuses: {} },
  { id: 'autre-vetement-materiel-bombe-fumigene', label: 'Bombe fumigène', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: { discretion: 1 } },
  { id: 'autre-vetement-materiel-bougie', label: 'Bougie, chandelle et autres trucs à tenir près des amoureux', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 6, skillBonuses: { } },
  { id: 'autre-vetement-materiel-braseror-argent', label: 'Brasero d\'argent ouvragé', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: { } },
  { id: 'autre-vetement-materiel-clepsydre-savant-eckmul', label: 'Clepsydre de savant d\'Eckmül', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {  } },
  { id: 'autre-vetement-materiel-coffre-solide', label: 'Coffre solide en bois de bolbolong', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: { } },
  { id: 'autre-vetement-materiel-coffret-standard', label: 'Coffret, standard', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: { } },
  { id: 'autre-vetement-materiel-corde-poils-petaure', label: 'Corde tressée en poils de pétaure (15m)', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: { } },
  { id: 'autre-vetement-materiel-couverture-standard', label: 'Couverture standard', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: { } },
  { id: 'autre-vetement-materiel-couverture-baronnies', label: 'Couverture des Barnonnies avec bordure en dentelle et votre nom brodé', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: { } },
  { id: 'autre-vetement-materiel-croquette-dresseur', label: 'Croquettes de dresseur, goût pétaure, le paquet', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: { dressage: 1 } },
  { id: 'autre-vetement-materiel-echelle', label: 'Échelle, 3 mètres', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {  } },
  { id: 'autre-vetement-materiel-encens-ambone', label: 'Encens d\'Ambone, la dose (pour enchantement)', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {  } },
  { id: 'autre-vetement-materiel-encre', label: 'Encre, la fiole', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {  } },
  { id: 'autre-vetement-materiel-etui-carte', label: 'Étui à carte ou à parchemin, en os poli de gramoche', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {  } },
  { id: 'autre-vetement-materiel-grappin', label: 'Grappin avec mini-arbalète pour le lancer', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: { escalade: 1 } },
  { id: 'autre-vetement-materiel-grimoire-universalis-sage-eckmul', label: 'Grimoire Universalis de sage d\'Eckmül', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: { connaissance: 1 } },
  { id: 'autre-vetement-materiel-instrument-musique-ordinaire', label: 'Instrument de musique ordinaire', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {  } },
  { id: 'autre-vetement-materiel-instrument-musique-chef-oeuvre', label: 'Instrument de musique, chef d\'œuvre', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: { metier_musique: 1 } },
  { id: 'autre-vetement-materiel-laboratoire-portatif', label: 'Laboratoire portatif du Petit Alchimiste', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: { metier_alchimie: 1  } },
  { id: 'autre-vetement-materiel-lampe', label: 'Lampe, à huile de phoque zébré (très longue durée)', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {  } },
  { id: 'autre-vetement-materiel-longue-vue', label: 'Longue-vue, modèle pirate', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {  } },
  { id: 'autre-vetement-materiel-longue-vue-precision', label: 'Longue-vue de haute précision', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: { perception: 1  } },
  { id: 'autre-vetement-materiel-loupe-enlumineur', label: 'Loupe d\'enlumineur', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: { fouille: 1 } },
  { id: 'autre-vetement-materiel-complet-escalade', label: 'Matériel complet d\'escalade', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: { escalade: 1 } },
  { id: 'autre-vetement-materiel-menotte-prisionier', label: 'Menottes de prisonnier (ou modèle Mestresse Bruzillia, plus douces)', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {  } },
  { id: 'autre-vetement-materiel-miroir-voyage', label: 'Miroir de voyage, élégant et précieux', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {  } },
  { id: 'autre-vetement-materiel-necessaire-eventration-voyage-haruspice', label: 'Nécessaire à éventration de voyage, pour haruspice itinérant', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {  } },
  { id: 'autre-vetement-materiel-onguent de guérisseur', label: 'Onguent de guérisseur, la dose', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: { metier_guerrisseur: 1 } },
  { id: 'autre-vetement-materiel-outils-cambrioleur', label: 'Outils de cambrioleur', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: { metier_serrurier: 1 } },
  { id: 'autre-vetement-materiel-outils-faussaire', label: 'Outils de faussaire, matériel de précision', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: { metier_faussaire: 1 } },
  { id: 'autre-vetement-materiel-parchemin-charme', label: 'Parchemin de charme', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {  } },
  { id: 'autre-vetement-materiel-parchemin-velin-eckmul', label: 'Parchemin en vélin d\'Eckmül', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {  } },
  { id: 'autre-vetement-materiel-parfum-exotique', label: 'Parfum exotique pour une journée', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: { diplomatie: 1 } },
  { id: 'autre-vetement-materiel-rations-survie', label: 'Rations de survie (par jour)', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {  } },
  { id: 'autre-vetement-materiel-sac-ordinaire', label: 'Sac, besace ordinaire', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {  } },
  { id: 'autre-vetement-materiel-sac-aventurier', label: 'Sac à dos d\'aventurier breveté "Guide du Baroudard"', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {  } },
  { id: 'autre-vetement-materiel-siflet-oiseau', label: 'Siflet d\'oiseau (parfaitement inutile, amuse les sages et les gamins)', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {  } },
  { id: 'autre-vetement-materiel-tente-commune', label: 'Tente, commune', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {  } },
  { id: 'autre-vetement-materiel-tente-drapeau', label: 'Tente, avec drapeau, couleurs chamarrées et votre blason doré', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {  } },
  { id: 'autre-vetement-materiel-torche', label: 'Torche (rien de spécial, une bête torche, quoi)', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: {  } },
  { id: 'autre-vetement-materiel-trousse-deguisement', label: 'Trousse de déguisement, avec postiches et maquillage', type: 'other', category: null, attackBonus: 0, defenseBonus: 0, damageReduction: 0, skillBonuses: { deguisement: 1 } },
];

@Injectable({ providedIn: 'root' })
export class EquipmentService {
  private readonly storageKey = 'jdr-lanfeust-equipment-v1';
  private readonly isBrowser: boolean;
  private readonly equipment = signal<Equipment[]>(defaultEquipment);
  readonly equipmentList = this.equipment.asReadonly();

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.every((item) => this.isEquipment(item))) this.equipment.set(parsed);
        } catch { /* Ignore an invalid equipment catalogue. */ }
      }
    }
  }

  add(label: string, type: EquipmentType, category: EquipmentCategory | null, attackBonus: number, defenseBonus: number, damageReduction: number, skillBonuses: Record<string, number>): Equipment {
    const item = { id: crypto.randomUUID(), label, type, category, attackBonus, defenseBonus, damageReduction, skillBonuses };
    this.equipment.update((items) => [...items, item]);
    this.save();
    return item;
  }

  combatBonuses(equipmentIds: string[]): { attack: number; defense: number; damageReduction: number } {
    return this.equipment().filter((item) => equipmentIds.includes(item.id)).reduce((total, item) => ({
      attack: total.attack + item.attackBonus,
      defense: total.defense + item.defenseBonus,
      damageReduction: total.damageReduction + item.damageReduction,
    }), { attack: 0, defense: 0, damageReduction: 0 });
  }

  skillBonus(skillId: string, equipmentIds: string[]): number {
    return this.equipment().filter((item) => equipmentIds.includes(item.id)).reduce((total, item) => total + (item.skillBonuses[skillId] ?? 0), 0);
  }

  remove(id: string): void {
    this.equipment.update((items) => items.filter((item) => item.id !== id));
    this.save();
  }

  private isEquipment(value: unknown): value is Equipment {
    if (typeof value !== 'object' || value === null) return false;
    const item = value as Record<string, unknown>;
    return typeof item['id'] === 'string' && typeof item['label'] === 'string'
      && ['weapon', 'shield', 'armor', 'other'].includes(item['type'] as string)
      && (item['category'] === null || item['category'] === 1 || item['category'] === 2 || item['category'] === 3)
      && typeof item['attackBonus'] === 'number' && typeof item['defenseBonus'] === 'number'
      && typeof item['damageReduction'] === 'number' && typeof item['skillBonuses'] === 'object';
  }

  private save(): void {
    if (this.isBrowser) localStorage.setItem(this.storageKey, JSON.stringify(this.equipment()));
  }
}
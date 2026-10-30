import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Advantage, AdvantageAttributeBonuses, AdvantageBenefit, AdvantageCategory } from './advantage.model';
import { AttributeKey } from '../skill/skill.model';
import { CharacterAttributes, CharacterOrigin } from '../character/character.model';

const defaultAdvantages: Advantage[] = [
  { id: 'armes-armures-pro', title: 'Armes et armures de professionnel', category: 'combat', description: 'Vous ne subissez aucun malus quand vous utilisez des armes, boucliers et armures de professionnel p.123, 126', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'artiste-tripaille', title: 'Artiste de la tripaille', category: 'combat', description: 'Un adversaire qui souhaite engager le combat avec vous après vous avoir vu tuer au moins un ennemi doit réussir un jet de Sauvegarde de difficulté 10+1 par adversaire tué par vos soins depuis le début du combat. En cas d\'échec, la peur et des ennuis gastriques l\'empêchent d\'agir - il ne pourra vous attaquer qu\'à son prochain tour.', conditionAttribute:  'force', conditionMinimum:  3, prerequisiteId: null },
  { id: 'arme-parade', title: 'Arme de parade', category: 'combat', description: 'Quand vous tenez une arme dans la main gauche (ou la main droite, si vous êtes gaucher), vous pouvez ajouter +2 à votre Défense. Si vous possédez l\'Atout Combat à deux armes et que vous décidez d\'attaquer avec votre deuxième arme, vous perdez le bonus de Défense jusqu\'à votre prochain tour.', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'armes-armures-brutasse', title: 'Armes et armures de brutasse', category: 'combat', description: 'Vous ne subissez aucun malus quand vous utilisez des armes, boucliers et armures de brutasse p.123', conditionAttribute: null, conditionMinimum: null, prerequisiteId: 'armes-armures-pro' },
  { id: 'arts-martiaux', title: 'Arts martiaux', category: 'combat', description: 'Vos attaques à mains nues occasionnent 2d6 points de dégâts, plus votre bonus de Force', conditionAttribute: 'dexterite', conditionMinimum: 1, prerequisiteId: null },
  { id: 'attaque-defensive', title: 'Attaque défensive', category: 'combat', description: 'Cet atout vous permet de faire une attaque défensive à votre tour. Appliquez un malus de -2 à vos jets d\'Attaque pendant votre tour. Vous recevrez un bonus de +4 à tous les jets de Défense que vous ferez jusqu\'à votre prochain tour.', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'attaque-devastatrice', title: 'Attaque dévastatrice', category: 'combat', description: 'Quand vous décidez de faire une telle attaque, vous jetez le dé d\'Attaque avec un malus de -2, mais vous ajoutez 1d6 aux dégâts si l\'attaque porte. Vous pouvez prendre cette Atout plusieurs fois, ce qui vous permer de cumuler les d6 de dégâts supplémentaires si vous acceptez de cumuler les malus à l\'attaque.', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null, repeatable: true },
  { id: 'attaque-repetition', title: 'Attaque à répétition', category: 'combat', description: 'Quand vous maniez une arme d\'amateur ou que vous êtes à mains nues, vous pouvez faire une attaque supplémentaire à votre tour. Si vous avez plusieurs attaques, vous utiliez votre meilleur bonus. Cependant, tous vos jets d\'Attaque sont assortis d\'un malus de -2.', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'attaque-sournoise', title: 'Attaque sournoise', category: 'combat', description: 'Si vous pouvez surprendre un adversaire et l\'attaquer sans qu\'il détecte votre présence, vous pouvez ajouter 1d6 aux dégâts de toutes les atttaques de votre tour. Cet atout fonctionne au corps à corps comme à distance. Vous pouvez prendre cette atout plusieurs fois, à concurrence d\'une fois tous les 5 niveaux. A chaque nouvel Atout, ajoutez 1d6 à vos dégâts pendant une attaque sournoise.', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null, repeatable: true },
  { id: 'charge-furieuse', title: 'Charge furieuse', category: 'combat', description: 'Si vous avez passé votre tour précédent à courir en direction de vos adversaires, les dégâts de votre première attaque sont doublés : jetez deux fois le nombre de d6 correspondant à votre arme et ajoutez votre bonus de Force.', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'combat-monte', title: 'Combat monté', category: 'combat', description: 'Cet Atout a deux effets. A chaque fois que vous ou votre monture, vous subissez des dégâts, vous pouvez faire un jet d\'Equitation opposé au jet d\'Attaque initial. Si vous réussiez, vous décidez si ces dégâts s\'appliquent à vous ou à votre monture. Vous devez annoncer ce choix avant que les dégâts ne soient résolus. Si vous avez passé votre tour précédent à galoper en direction de vos rivaux, vous doublez les dégâts de votre première attaque. Prenez deux fois le nombre de d6 correspondant à votre arme et faites donc une belle brochette d\'adversaires ! Votre bonus de Force ne s\'applique qu\'une fois.', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'combat-a-deux-armes', title: 'Combat à deux armes', category: 'combat', description: 'Vous gagnez une attaque supplémentaire avec cette deuxième arme, mais toutes vos attaques se font avec un malus de -2. Si vous avez plusieurs attaques, utilisez votre meilleur bonus.', conditionAttribute: 'dexterite', conditionMinimum: 2, prerequisiteId: null },
  { id: 'combat-en-aveugle', title: 'Combat en aveugle', category: 'combat', description: 'Vous êtes parfaitement capable de vous battre dans l\'obscurité. Vous ne subissez aucun désavantage quand vous êtes dans cette situation. Le conteur ne peut pas vous faire de Krâsses dues à l\'obscurité.', conditionAttribute: 'sagesse', conditionMinimum: 2, prerequisiteId: null },
  { id: 'cri-de-guerre', title: 'Cri de guerre', category: 'combat', description: 'Quand un nouveau combat s\'engage, vous pouvez pousser votre cri de guerre. Tous les adversaires qui vous entendent recevront un malus de -2 au premier jet de Défense qu\'ils joueront contre vous.', conditionAttribute: 'charisme', conditionMinimum: 2, prerequisiteId: null },
  { id: 'cri-de-ralliement', title: 'Cri de ralliement', category: 'combat', description: 'Une fois par combat, vous pouvez pousser un cri de ralliement. Tous les alliés qui vous entendent reçoivent  un bonus de +2 aux jets de Sauvegarde et d\'Attaque qu\'ils joueront d\'ici à votre prochain tour.', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'enchainement', title: 'Enchaînement', category: 'combat', description: 'Vous êtes spécialisé dans les combats de groupe. A chaque fois que vous mettez un adversaire hors de combat au corps à corps, vous pouvez faire une nouvelle attaque sur un autre adversaire engagé au corps à corps contre vous.', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null, minimumLevel: 5 },
  { id: 'gladiateur-des-tavernes', title: 'Gladiateur des tavernes', category: 'combat', description: 'Quand vous vous battez avec une arme improvisée (comme un tabouret, une choppe ou la serveuse), celle-ci occasionne 2d6 points de dégâts - au lieu d\'1d6 normalement.', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'jeu-de-jambes', title: 'Jeu de jambes', category: 'combat', description: 'Vous bénéficiez d\'un bonus de +2 à vos jets de Défense tant que vous ne portez pas d\'armure. En effet, une armure ralentit vos mouvements et ne vous permet pas de faire pleinement usage de votre Atout. Vous pouvez prendre Jeu de jambes plusieurs fois. Vous ajoutez +1 à vos jets de Défense pour chaque Atout supplémentaire.', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null, repeatable: true },
  { id: 'lancer-de-gens', title: 'Lancer de gens', category: 'combat', description: 'Vous êtes capable de projeter vos adversaires comme s\'il s\'agissait de vulgaires bottes de foin. Quand vous souhaitez faire subir ce traitement à quelqu\'un, vous n\'occasionnez pas vos dégâts habituels. En revanche, votre victime doit réussir un jet de Sauvegarde en opposition avec votre jet d\'Attaque. Si elle réussit, elle atterit sans dommage à quelques mètres de distance. En cas d\'échec, elle subit 2d6 points de dégâts, auxquels s\'ajoute votre bonus de Force. Si vous avez la bonne idée de lancer votre victime sur quelqu\'un d\'autre, la cible doit réussir le même jet de Sauvegarde pour s\'écraser ou bien subir les même dégâts. Vous ne pouvez prendre qu\'une seule personne pour cible avec un Lancer de gens.', conditionAttribute: null, conditionMinimum: null, prerequisiteId:null },
  { id: 'maitre-en-arts-martiaux', title: 'Maître en arts martiaux', category: 'combat', description: 'Toutes les attaques que vous faites à mains nues occasionnent 3d6 points de dégâts, plus votre bonus de Force.', conditionAttribute: null, conditionMinimum: null, prerequisiteId: 'arts-martiaux' },
  { id: 'parade-de-projectiles', title: 'Parade de projectiles', category: 'combat', description: 'Quand une attaque à distance devrait vous toucher (donc après votre jet de Défense), vous pouvez  essayer de la parer avant que le conteur n\'applique les dégâts. Pour ce faire, effectuez un jet d\'Attaque avec comme difficulté le jet d\'Attaque originel de votre adversaire. Si vous réussissez, le projectile est dévié et vous ne recevez aucun dégât. Vous pouvez utiliser cet atout deux fois à chaque tour de jeu : une fois que vous avez essayé de parer deux projectiles, vous devez attendre votre prochain tour pour recommencer. Il est possible d\'augmenter ce nombre en prenant cet atout à nouveau : vous gagnez alors deux utilisations supplémentaires.', conditionAttribute: 'dexterite', conditionMinimum: 4, prerequisiteId: null, repeatable: true },
  { id: 'pietinement', title: 'Piétinement', category: 'combat', description: 'Vous avez appris à conduire votre monture pour qu\'elle renverse vos ennemis et les piétine sauvagement. A chaque fois que vous engagez le combat avec un nouvel adversaire à pied, ajoutez aux dégâts de votre première attaque les dégâts normaux de l\'attaque principale de votre monture (généralement 2d6, voir la description de l\'animal p.214).', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'provocateur', title: 'Provocateur', category: 'combat', description: 'Si vous réussissez un jet de Bmuff opposé à sa Psychologie, celui-ci cherche à vous faire taire par tous les moyens, au mépris de toute prudence. Sous l\'effet de la colère, ses jets d\'Attaque et de Défense se font avec un malus de -4 pendant tout son prochain tour. Cet Atout fonctionne également sur les animaux et les créatures qui ne comprendraient pas votre langage.', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'science-de-l-embuscade', title: 'Science de l\'embuscade', category: 'combat', description: 'Si vous disposez d\'au moins une minute pour préparer une embuscade, vous pouvez surprendre un groupe ennemi au maximum 10 fois plus nombreux que le vôtre. Non seulement votre camp attaque le premier mais vous recevez un bonus de +2 à tous vos jets d\'Attaque et de +1d6 à tous vos dégâts du tour pour refléter l\'effet de surprise. Vos compagnons, si toutefois ils acceptent de suivre vos instructions, peuvent recevoir le même bonus. Pour cela, il faut qu\'ils parviennent à se cacher correctement en réussissant un jet de Discrétion contre une difficulté de 15.', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'sous-la-ceinture', title: 'Sous la ceinture', category: 'combat', description: 'Quand vous faites une tentative de Krâsse sur une attaque, vous ajoutez 1dK sans prélever dans le tas une Krâsse pour celui-ci. Voir les règles de Krâsses en page 94.', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'specialisation', title: 'Spécialisation', category: 'combat', description: 'Choisissez une arme. Vous recevez +2 aux jets d\'Attaque et de Dégâts avec une telle arme. Vous pouvez prendre plusieurs fois cet Atout, mais celui-ci doit s\'appliquer à une arme différente à chaque fois.', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null, repeatable: true, weaponChoice: true },
  { id: 'surspecialisation', title: 'Surspécialisation', category: 'combat', description: 'Choisissez une arme pour laquelle vous avez déjà l\'Atout Spécialisation. Votre bonus aux jets d\'Attaque et de Dégâts avec cette arme est maintenant de +4.', conditionAttribute: null, conditionMinimum: null, prerequisiteId: 'specialisation', repeatable: true, minimumLevel: 5, weaponChoice: true },
  { id: 'tir-de-loin', title: 'Tir de loin', category: 'combat', description: 'Vous êtes capable d\'atteindre une mouche à troll à 150 pas. Vous ne subissez pas de malus à l\'attaque quand votre cible est éloignée (voir page 104).', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'tir-rapide', title: 'Tir rapide', category: 'combat', description: 'Que vous lanciez des couteaux  ou que vous tiriez des carreaux d\'arbalète, la rapidité avec laquelle vous faites feu est proprement hallucinante. Vous pouvez faire une attaque à distance de plus à chacun de vos tours (en utilisant votre meilleur bonus si vous avez plusieurs attaques). Cependant, toutes vos attaques se font avec un malus de -2.', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'uppercut', title: 'Uppercut', category: 'combat', description: 'Vous pouvez décider de tenter un uppercut à votre tour, à la place de toutes vos attaques normales. Cette attaque fonctionne comme une tentative d\'assomer (voir page 113), sauf que vous n\'avez pas de malus à votre jet d\'Attaque.', conditionAttribute: null, conditionMinimum: null, prerequisiteId: 'arts-martiaux' },
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
  { id: 'bon-sens-souard', title: 'Bon sens souard', category: 'origin', description: 'Le conteur ne peut jamais faire de tentative de Krâsse quand un de ses seconds rôles essaie de vous embobiner ou de vous mentir. Votre bon sens s\'étend également aux effets magiques qui essaieraient de vous faire prendre des vessises pour des lanternes. Vous bénéficiez d\'un bonus de +4 aux jets de Sauvegarde contre de tels pouvoirs.', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null, conditionOrigin: 'souardie' },
  { id: 'chouchou-d-un-dieu', title: 'Chouchou d\'un dieu', category: 'origin', description: 'Choisissez avec le conteur dans la liste située en page 148 quel est le dieu qui vous convient le mieux à votre concept de héros. Les règles concenrant les interventions divines se trouvent également en page 148.', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null, conditionOrigin: 'darshan', deityChoice: true },
  { id: 'chaman', title: 'Chaman', category: 'origin', description: 'La magie des chamans se confine le plus souvent à créer des potions, des onguents et d\'autres concoctions peu ragoûtantes mais néanmoins efficaces. Au départ, vous connaissez deux recettes magiques. Allez voir en page 155 pour plus de détails.', conditionAttribute: null, conditionMinimum: null, conditionOrigin: 'region-primitive-reculee', conditionSkillId: 'metier-alchimiste', conditionSkillMinimum: 5, prerequisiteId: null, excludedAdvantageIds: ['pouvoir-magique', 'sage-d-eckmul'], recipeChoice: true, recipeCount: 2 },
  { id: 'nouvelle-recette-chaman', title: 'Nouvelle recette', category: 'origin', description: 'Apprenez une recette supplémentaire grâce à votre talent de Chaman.', conditionAttribute: null, conditionMinimum: null, conditionOrigin: null, conditionSkillId: null, conditionSkillMinimum: null, prerequisiteId: 'chaman', minimumLevel: 1, repeatable: true, recipeChoice: true, recipeCount: 1, evolutionOnly: true },
  { id: 'fortune', title: 'Fortuné', category: 'origin', description: 'Au début de chaque nouvelle aventure, vous pouvez disposer d\'une somme de dragons d\'argent égale à 100 fois votre niveau en monnaie ou en équipement. Ce qui n\'est pas dépensé à la fin de l\'aventure est perdu. Si vous décidez un jour d\'acheter un bien de valeur, comme une maison par exemple, le conteur peut décider que vos bienfaiteurs sont prêts à en payer une partie (de 10 à 25% de la somme totale).', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null },
  { id: 'chevalier', title: 'Chevalier', category: 'origin', description: 'Votre port altier, vos vêtements dernier cri, votre insupportable arrogance le clament au monde entier : vous êtes de noble lignée. Cet Atout vous octroie plusieurs avantages :',
    benefits: [
      {title: 'Armes, armures et tout le saint-frusquin', description: 'Même si vous n\'avez pas d\'entraînement dans leur usage, vous vous devez de posséder une armure complète, un écu portant les armes de votre famille, une lance et diverses autres armes tranchantes et contandantes. Vous disposez également d\'une monture pour vous déplacer.'},
      {title: 'Aristocrate', description: 'Vous êtes de noble extraction et les gens vous admirent ou vous craignent pour ça. Même hors de votre Hédulie natale, là  où l\'ordre social est différent et où les ge,s respectent moins la noblesse, vous recevez toujours un traitement particulier. C\'est sans doute dû à votre prestance hors du commun.'},
      {title: 'Code de l\'honneur', description: 'En tant que chevalier hédule, vous êtes tenu de respecter un code d\'honneur simple mais strict. Les détails de ce code peuvent varier d\'une famille à l\'autre, aussi ne donnenrons-nous que les principaux points. Justice : un chevalier doit être juste dans ses paroles et ses actes. Il ne peut attaquer un ennemi par surprise ou utiliser des ruses indignes d\'un noble, pas plus qu\'il ne s\'abaissera à commettre des actions illégales. - Honneur : un chevalier doit protéger son honneur, celui de son suzerain et celui des dames. Une insulte doit être punie par un duel ou par une bonne bastonnade quand l\'offenseur est un manant.'}
  ], conditionAttribute: null, conditionMinimum: null, prerequisiteId: null, conditionOrigin: 'barronies' },
  { id: 'gnome-de-troy', title: 'Gnome de Troy', category: 'origin', description: 'Vous êtes ce qu\'on appelle dans le monde de Troy un gnome : un morveux, un chiard, un gosse quoi ; vous avez entre 6 et 10 ans. Etre un gnome présente un grand nombre d\'avantages, mais aussi quelques inconvénients.',
    benefits: [
      {title: 'Caractéristiques', description: 'Soustrayez 1 à votre bonus de Force (cela peut descendre jusqu\'à -1). En revanche, vous êtes bien plus mignon et agile qu\'un adulte : ajoutez 1 à vos bonus de Charisme et de Dextérité.'},
      {title: 'Gueule d\'ange', description: 'On ne se méfie pas d\'un enfant. Vous pouvez bénéficiez d\'un bonus de +4 à tous vos jets de Bluff.'}
    ],
    attributeBonuses: { force: -1, dexterite: 1, charisme: 1 },
    attributeMinimums: { force: -1 },
    skillBonuses: { bluff: 4 },
    conditionAttribute: null, conditionMinimum: null, prerequisiteId: null, excludedAdvantageIds: ['sage-d-eckmul', 'chevalier', 'armes-armures-brutasse', 'lancer-de-gens', 'chaman'] },
  { id: 'gris-gris-qui-marchent', title: 'Gris-gris qui marchent', category: 'origin', description: 'Tant que vous portez vos gris-gris, vous bénéficiez d\'un bonus de +4 à vos jets de Sauvegarde contre les pouvoirs magiques.', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null, conditionSkillId: 'troll' },
  { id: 'nain', title: 'Nain', category: 'origin', description: 'Vous êtes plus difficile à toucher en combat, pour commencer : votre Défense reçoit un bonus permanent de +2. De plus, vous pouvez vous cacher beaucoup plus facilement : vous recevez un bonus de +4 à vos jets de Discrétion.', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null, skillBonuses: { discretion: 4 }, combatBonuses: { defense: 2 }},
  { id: 'pouvoir-magique', title: 'Pouvoir magique', category: 'origin', description: 'Vous êtes l\'heureux détenteur d\'un pouvoir magique. Reportez-vous aux règles de magie page 134 pour savoir ce que vous pouvez choisir comme pouvoir.', conditionAttribute: null, conditionMinimum: null, prerequisiteId: null, conditionOrigin: 'eckmul', excludedAdvantageIds: ['sage-d-eckmul'] },
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

  effectiveAttributes(attributes: CharacterAttributes, selectedAdvantageIds: string[]): CharacterAttributes {
    const bonuses: AdvantageAttributeBonuses = {};
    const minimums: Partial<Record<AttributeKey, number>> = {};
    for (const id of selectedAdvantageIds) {
      const advantage = this.advantages().find((item) => item.id === id);
      if (!advantage) continue;
      for (const attribute of Object.keys(attributes) as AttributeKey[]) {
        const bonus = advantage.attributeBonuses?.[attribute];
        if (bonus !== undefined) bonuses[attribute] = (bonuses[attribute] ?? 0) + bonus;
        const minimum = advantage.attributeMinimums?.[attribute];
        if (minimum !== undefined) minimums[attribute] = Math.max(minimums[attribute] ?? Number.NEGATIVE_INFINITY, minimum);
      }
    }

    const effectiveValue = (attribute: AttributeKey): number =>
      Math.max(minimums[attribute] ?? Number.NEGATIVE_INFINITY, attributes[attribute] + (bonuses[attribute] ?? 0));
    return {
      force: effectiveValue('force'),
      dexterite: effectiveValue('dexterite'),
      constitution: effectiveValue('constitution'),
      sagesse: effectiveValue('sagesse'),
      intelligence: effectiveValue('intelligence'),
      charisme: effectiveValue('charisme'),
    };
  }

  skillBonus(selectedAdvantageIds: string[], skillId: string): number {
    return selectedAdvantageIds.reduce((total, id) => {
      const advantage = this.advantages().find((item) => item.id === id);
      return total + (advantage?.skillBonuses?.[skillId] ?? 0);
    }, 0);
  }

  combatScoreBonus(selectedAdvantageIds: string[], score: 'attack' | 'defense' | 'save'): number {
    return selectedAdvantageIds.reduce((total, id) => {
      const advantage = this.advantages().find((item) => item.id === id);
      return total + (advantage?.combatBonuses?.[score] ?? 0);
    }, 0);
  }

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

  add(title: string, category: AdvantageCategory, description: string, conditionAttribute: AttributeKey | null, conditionMinimum: number | null, prerequisiteId: string | null, minimumLevel: number | null, repeatable: boolean, weaponChoice = false, conditionOrigin: CharacterOrigin | null = null, deityChoice = false, conditionSkillId: string | null = null, conditionSkillMinimum: number | null = null, excludedAdvantageIds: string[] = [], recipeChoice = false, recipeCount = 1, evolutionOnly = false): void {
    this.advantages.update((advantages) => [...advantages, { id: crypto.randomUUID(), title, category, description, conditionAttribute, conditionMinimum, prerequisiteId, minimumLevel, repeatable, weaponChoice, conditionOrigin, deityChoice, conditionSkillId, conditionSkillMinimum, excludedAdvantageIds, recipeChoice, recipeCount, evolutionOnly }]);
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
      && (advantage['minimumLevel'] === null || advantage['minimumLevel'] === undefined || this.isNumber(advantage['minimumLevel']))
      && (advantage['repeatable'] === undefined || typeof advantage['repeatable'] === 'boolean')
      && (advantage['weaponChoice'] === undefined || typeof advantage['weaponChoice'] === 'boolean')
      && (advantage['deityChoice'] === undefined || typeof advantage['deityChoice'] === 'boolean')
      && (advantage['recipeChoice'] === undefined || typeof advantage['recipeChoice'] === 'boolean')
      && (advantage['recipeCount'] === undefined || (typeof advantage['recipeCount'] === 'number' && this.isNumber(advantage['recipeCount']) && advantage['recipeCount'] > 0))
      && (advantage['evolutionOnly'] === undefined || typeof advantage['evolutionOnly'] === 'boolean')
      && (advantage['conditionOrigin'] === null || advantage['conditionOrigin'] === undefined || this.isOrigin(advantage['conditionOrigin']))
      && (advantage['conditionSkillId'] === null || advantage['conditionSkillId'] === undefined || typeof advantage['conditionSkillId'] === 'string')
      && (advantage['conditionSkillMinimum'] === null || advantage['conditionSkillMinimum'] === undefined || this.isNumber(advantage['conditionSkillMinimum']))
      && (advantage['excludedAdvantageIds'] === undefined || (Array.isArray(advantage['excludedAdvantageIds']) && advantage['excludedAdvantageIds'].every((id) => typeof id === 'string')))
      && (advantage['benefits'] === undefined || (Array.isArray(advantage['benefits']) && advantage['benefits'].every((benefit) => this.isBenefit(benefit))))
      && this.isAttributeBonusRecord(advantage['attributeBonuses'])
      && this.isAttributeBonusRecord(advantage['attributeMinimums'])
      && this.isSkillBonusRecord(advantage['skillBonuses'])
      && this.isCombatBonusRecord(advantage['combatBonuses']);
  }

  private isAttributeBonusRecord(value: unknown): boolean {
    if (value === undefined) return true;
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
    return Object.entries(value).every(([attribute, bonus]) =>
      this.isAttribute(attribute) && typeof bonus === 'number' && Number.isInteger(bonus),
    );
  }

  private isSkillBonusRecord(value: unknown): boolean {
    if (value === undefined) return true;
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
    return Object.entries(value).every(([skillId, bonus]) =>
      skillId.length > 0 && typeof bonus === 'number' && Number.isInteger(bonus),
    );
  }

  private isCombatBonusRecord(value: unknown): boolean {
    if (value === undefined) return true;
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
    return Object.entries(value).every(([score, bonus]) =>
      ['attack', 'defense', 'save'].includes(score) && typeof bonus === 'number' && Number.isInteger(bonus),
    );
  }

  private isBenefit(value: unknown): value is AdvantageBenefit {
    if (typeof value !== 'object' || value === null) return false;
    const benefit = value as Record<string, unknown>;
    return typeof benefit['title'] === 'string' && typeof benefit['description'] === 'string';
  }

  private normalize(value: Advantage & { label?: string }): Advantage {
    const defaultAdvantage = defaultAdvantages.find((advantage) => advantage.id === value.id);
    return { id: value.id, title: value.title ?? value.label ?? '', category: value.category ?? 'heroic', description: value.description ?? '', benefits: value.benefits ?? defaultAdvantage?.benefits ?? [], attributeBonuses: value.attributeBonuses ?? defaultAdvantage?.attributeBonuses ?? {}, attributeMinimums: value.attributeMinimums ?? defaultAdvantage?.attributeMinimums ?? {}, skillBonuses: value.skillBonuses ?? defaultAdvantage?.skillBonuses ?? {}, combatBonuses: value.combatBonuses ?? defaultAdvantage?.combatBonuses ?? {}, conditionAttribute: value.conditionAttribute ?? null, conditionMinimum: value.conditionMinimum ?? null, conditionOrigin: value.conditionOrigin ?? defaultAdvantage?.conditionOrigin ?? null, conditionSkillId: value.conditionSkillId ?? defaultAdvantage?.conditionSkillId ?? null, conditionSkillMinimum: value.conditionSkillMinimum ?? defaultAdvantage?.conditionSkillMinimum ?? null, excludedAdvantageIds: value.excludedAdvantageIds ?? defaultAdvantage?.excludedAdvantageIds ?? [], prerequisiteId: value.prerequisiteId ?? null, minimumLevel: value.minimumLevel === undefined ? defaultAdvantage?.minimumLevel ?? null : value.minimumLevel, repeatable: value.repeatable ?? defaultAdvantage?.repeatable ?? false, weaponChoice: value.weaponChoice ?? defaultAdvantage?.weaponChoice ?? false, deityChoice: value.deityChoice ?? defaultAdvantage?.deityChoice ?? false, recipeChoice: value.recipeChoice ?? defaultAdvantage?.recipeChoice ?? false, recipeCount: value.recipeCount ?? defaultAdvantage?.recipeCount ?? 1, evolutionOnly: value.evolutionOnly ?? defaultAdvantage?.evolutionOnly ?? false };
  }

  private isOrigin(value: unknown): value is CharacterOrigin { return ['human', 'darshan', 'troll', 'eckmul', 'souardie', 'region-primitive-reculee'].includes(value as string); }
  private isAttribute(value: unknown): boolean { return ['force', 'dexterite', 'constitution', 'sagesse', 'intelligence', 'charisme'].includes(value as string); }
  private isCategory(value: unknown): value is AdvantageCategory { return ['combat', 'origin', 'magic', 'social', 'heroic'].includes(value as string); }
  private isNumber(value: unknown): boolean { return typeof value === 'number' && Number.isInteger(value) && value >= 0; }

  private save(): void {
    if (this.isBrowser) localStorage.setItem(this.storageKey, JSON.stringify(this.advantages()));
  }
}
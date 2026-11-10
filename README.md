# ⚔️ Character JDR – Lanfeust de Troy

> Application web de création et de gestion de personnages pour le jeu de rôle papier **Lanfeust de Troy**.

🔗 **Démo en ligne : [character-jdr-lanfeust.vercel.app](https://character-jdr-lanfeust.vercel.app/)**

---

## 📖 Présentation

Ce projet personnel répond à un besoin concret de joueur : disposer d'un outil simple pour **créer un personnage** du jeu de rôle *Lanfeust de Troy*, puis le **retrouver et le consulter pendant les parties**, sans manipuler de fiches papier.

L'application guide la création du personnage, enregistre ses informations et propose une **fiche de personnage consultable en cours de jeu**.

Les personnages sont sauvegardés **localement sur l'appareil de chaque utilisateur**, avec la possibilité d'**importer / exporter** ses données.

## ✨ Fonctionnalités

- **Création de personnage** : saisie guidée des informations nécessaires à la construction d'un personnage.
- **Fiche de personnage** : affichage clair et lisible pour l'utiliser en cours de partie.
- **Gestion de plusieurs personnages** : liste, consultation, modification et suppression.
- **Sauvegarde locale** : les données restent sur l'appareil de l'utilisateur, sans compte ni serveur.
- **Import / export** : sauvegarde des personnages dans un fichier pour les transférer d'un appareil à un autre ou les archiver.
- **Accessible en ligne** : utilisable directement depuis un navigateur, sur ordinateur comme sur mobile.

## 🛠️ Technologies utilisées

| Domaine | Technologie |
| --- | --- |
| Framework front-end | [Angular](https://angular.dev/) (généré avec Angular CLI 22.1.5) |
| Langage | TypeScript, HTML, CSS |
| Tests unitaires | [Vitest](https://vitest.dev/) |
| Qualité du code | Prettier, EditorConfig |
| Déploiement | [Vercel](https://vercel.com/) |
| Versionnement | Git / GitHub |

## 🧠 Choix techniques

- **Application monopage (SPA) en Angular** : un framework structuré, adapté à une application riche en formulaires et en données, avec une architecture en composants réutilisables et un typage strict grâce à TypeScript.
- **Aucun back-end, stockage local** : chaque joueur garde la maîtrise de ses données. Cela simplifie l'architecture, supprime les coûts d'hébergement d'une base de données, évite la création de comptes et limite les enjeux liés aux données personnelles.
- **Import / export de fichiers** : pour compenser l'absence de serveur, les personnages peuvent être exportés puis réimportés. Cela garantit la portabilité des données et leur sauvegarde manuelle.
- **Déploiement continu avec Vercel** : un fichier `vercel.json` configure le déploiement du site statique ; chaque mise à jour poussée sur la branche `main` peut être publiée automatiquement.
- **Outillage de qualité** : Prettier et EditorConfig assurent un code homogène, et Vitest permet d'écrire des tests unitaires rapides.

## 🚀 Installation et lancement en local

### Prérequis

- [Node.js](https://nodejs.org/) (version LTS recommandée)
- npm

### Étapes

```bash
# 1. Cloner le dépôt
git clone https://github.com/aosifre/character-jdr-lanfeust.git
cd character-jdr-lanfeust

# 2. Installer les dépendances
npm install

# 3. Lancer le serveur de développement
ng serve
```

L'application est ensuite accessible sur `http://localhost:4200/` et se recharge automatiquement à chaque modification.

## 📜 Commandes utiles

| Commande | Description |
| --- | --- |
| `ng serve` | Lance le serveur de développement |
| `ng build` | Compile l'application pour la production (dossier `dist/`) |
| `ng test` | Exécute les tests unitaires avec Vitest |

## ☁️ Déploiement

Le projet est déployé sur **Vercel** : [character-jdr-lanfeust.vercel.app](https://character-jdr-lanfeust.vercel.app/).

Pour le déployer vous-même :

1. Importer le dépôt GitHub dans Vercel.
2. Laisser Vercel détecter le projet Angular (la configuration se trouve dans `vercel.json`).
3. Lancer le déploiement.

## 🗂️ Structure du projet

```
character-jdr-lanfeust/
├── public/          # Ressources statiques
├── src/             # Code source de l'application Angular
├── angular.json     # Configuration Angular
├── vercel.json      # Configuration du déploiement Vercel
└── package.json     # Dépendances et scripts
```

## 🔮 Pistes d'amélioration

- Ajout de nouvelles options de création et de règles du jeu
- Export de la fiche au format PDF / impression
- Mode hors-ligne (PWA)
- Synchronisation optionnelle entre appareils

## 📄 Licence et mentions

Projet personnel à but non commercial, réalisé par fan pour des parties entre amis.
*Lanfeust de Troy* est une œuvre de Christophe Arleston et Didier Tarquin ; ce projet n'est ni affilié ni approuvé par leurs ayants droit ou éditeurs.

## 👤 Auteur

**aosifre** – [github.com/aosifre](https://github.com/aosifre)

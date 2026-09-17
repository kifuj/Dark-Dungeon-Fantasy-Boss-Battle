# 🗡️ Dark Dungeon Fantasy Boss battle

Jeu **roguelike pixel-art médiéval-fantasy au tour par tour**, jouable dans le navigateur.
On peut jouer **en solo** contre des vagues de monstres contrôlés par l'IA, avec une récompense à choisir après chaque vague, ou **en duel multijoueur en ligne** contre un ami : draft des équipes, tours de 60 s, reprise de la partie après un rafraîchissement.
Inspiré de *PokeRogue*.

> Projet étudiant réalisé dans le cadre du TP Agile (BTS2). Aucun usage commercial.

---

## 🔗 Liens

| Quoi | Lien |
|---|---|
| Jeu en ligne (Render) | [`https://dark-dungeon-fantasy-boss-battle.onrender.com`](https://dark-dungeon-fantasy-boss-battle.onrender.com) |
| Dépôt GitHub (public) | [`kifuj/Dark-Dungeon-Fantasy-Boss-Battle`](https://github.com/kifuj/Dark-Dungeon-Fantasy-Boss-Battle) |
| Projet Supabase | *(privé : ne jamais publier les clés)* |
| Présentation | [Diaporama](docs/presentation/soutenance.html) (à ouvrir dans un navigateur, vidéo intégrée) · [Vidéo de secours de la démo](docs/presentation/demo-secours.mp4) |

## 🧱 Stack

| Couche | Techno |
|---|---|
| Front (menus, lobby) | React + TypeScript + Vite |
| Rendu du jeu | Phaser 4 (canvas/WebGL, `pixelArt: true`) |
| Moteur de combat | TypeScript pur, partagé entre le client et le serveur (`shared/`) |
| Serveur autoritaire | Supabase Edge Functions (`supabase/functions/`) |
| BDD / Auth / Temps réel | Supabase (Postgres + Auth anonyme + Realtime) |
| Tests | Vitest |
| Hébergement | Render (Static Site, offre gratuite) |

## 📚 Documentation

| # | Document | Contenu |
|---|---|---|
| 00 | [Projet global](docs/00-PROJET-GLOBAL.md) | Vision, périmètre, rôles, planning, risques, présentation |
| 01 | [Game design](docs/01-GAME-DESIGN.md) | Règles, éléments, monstres, compétences, boucle roguelike, modes de jeu |
| 02 | [Architecture](docs/02-ARCHITECTURE.md) | Stack, schémas, arborescence, liaison React ↔ Phaser |
| 03 | [Base de données](docs/03-BASE-DE-DONNEES.md) | Schéma SQL Supabase, RLS, Realtime |
| 04 | [Multijoueur](docs/04-MULTIJOUEUR.md) | Tour simultané, résolution serveur, synchro, timeouts, reconnexion |
| 05 | [API](docs/05-API.md) | Contrats des Edge Functions (`rooms-*`, `match-*`) |
| 06 | [Moteur de combat](docs/06-MOTEUR-DE-COMBAT.md) | Types, formules, RNG déterministe, IA, tests |
| 07 | [Installation & déploiement](docs/07-INSTALLATION-DEPLOIEMENT.md) | Installation locale, Supabase, Render, dépannage |
| 08 | [Conventions](docs/08-CONVENTIONS.md) | Git, code, revues, assets et licences |
| — | [Crédits](docs/CREDITS.md) | Auteurs et licences des assets |
| 🟦 | [Product Backlog](docs/agile/PRODUCT-BACKLOG.md) | User stories, critères d'acceptation, DoR, DoD, estimations |
| 🟩 | [Sprint 1](docs/agile/SPRINT-1.md) · [Sprint 2](docs/agile/SPRINT-2.md) · [Sprint 3](docs/agile/SPRINT-3.md) · [Sprint 4](docs/agile/SPRINT-4.md) | Sprint goal, backlog, dailies, review, rétro |

## 📋 Documentation Scrum (TP Agile)

> Tout le travail Scrum est écrit en Markdown dans [`docs/agile/`](docs/agile/). Un fichier par sprint, plus le Product Backlog.

### Product Backlog — [`docs/agile/PRODUCT-BACKLOG.md`](docs/agile/PRODUCT-BACKLOG.md)

| Élément | Lien direct |
|---|---|
| User Stories (format « En tant que… Je veux… Afin de… ») | [Vue d'ensemble](docs/agile/PRODUCT-BACKLOG.md#3-vue-densemble) · [US détaillées](docs/agile/PRODUCT-BACKLOG.md#5-user-stories-détaillées) |
| Critères d'acceptation | [US détaillées](docs/agile/PRODUCT-BACKLOG.md#5-user-stories-détaillées) |
| Definition of Ready (DoR) | [DoR](docs/agile/PRODUCT-BACKLOG.md#1-definition-of-ready-dor) |
| Definition of Done (DoD) | [DoD](docs/agile/PRODUCT-BACKLOG.md#2-definition-of-done-dod) |
| Estimation (Planning Poker, Fibonacci) | [Planning Poker](docs/agile/PRODUCT-BACKLOG.md#4-planning-poker) · [séance du sprint 2](docs/agile/SPRINT-2.md#-qui-a-fait-quoi) · [séance du sprint 3](docs/agile/SPRINT-3.md#planning-poker-rejoué-en-début-de-sprint) · [séance du sprint 4](docs/agile/SPRINT-4.md#planning-poker) |

### Sprints

| | [Sprint 1](docs/agile/SPRINT-1.md) — Le socle | [Sprint 2](docs/agile/SPRINT-2.md) — Premier combat jouable | [Sprint 3](docs/agile/SPRINT-3.md) — Multijoueur | [Sprint 4](docs/agile/SPRINT-4.md) — Roguelike et finitions |
|---|---|---|---|---|
| **État** | Terminé — 12 / 18 pts | Terminé — 18 / 18 pts | Terminé — 18 / 18 pts (+3 pts d'US-02) | Terminé — 12 / 12 pts (+5 pts bonus US-09) |
| **Sprint Goal** | [lien](docs/agile/SPRINT-1.md#-sprint-goal) | [lien](docs/agile/SPRINT-2.md#-sprint-goal) | [lien](docs/agile/SPRINT-3.md#-sprint-goal) | [lien](docs/agile/SPRINT-4.md#-sprint-goal) |
| **Sprint Backlog** | [lien](docs/agile/SPRINT-1.md#-sprint-backlog) | [lien](docs/agile/SPRINT-2.md#-sprint-backlog) | [lien](docs/agile/SPRINT-3.md#-sprint-backlog) | [lien](docs/agile/SPRINT-4.md#-sprint-backlog) |
| **Qui a fait quoi** | [lien](docs/agile/SPRINT-1.md#-répartition-des-tâches) | [lien](docs/agile/SPRINT-2.md#-qui-a-fait-quoi) | [lien](docs/agile/SPRINT-3.md#-répartition-des-tâches) | [lien](docs/agile/SPRINT-4.md#-répartition-des-tâches) |
| **Tâches terminées** | [lien](docs/agile/SPRINT-1.md#-tâches-terminées) | [lien](docs/agile/SPRINT-2.md#-tâches-terminées) | [lien](docs/agile/SPRINT-3.md#-tâches-terminées) | [lien](docs/agile/SPRINT-4.md#-tâches-terminées) |
| **Tâches non terminées** | [lien](docs/agile/SPRINT-1.md#-tâches-non-terminées) | [lien](docs/agile/SPRINT-2.md#-tâches-non-terminées) | [lien](docs/agile/SPRINT-3.md#-tâches-non-terminées) | [lien](docs/agile/SPRINT-4.md#-tâches-non-terminées) |
| **Problèmes rencontrés** | [lien](docs/agile/SPRINT-1.md#-problèmes-rencontrés) | [lien](docs/agile/SPRINT-2.md#-problèmes-rencontrés) | [lien](docs/agile/SPRINT-3.md#-problèmes-rencontrés) | [lien](docs/agile/SPRINT-4.md#-problèmes-rencontrés) |
| **Décisions prises** | [lien](docs/agile/SPRINT-1.md#-décisions-prises-pendant-le-sprint) | [lien](docs/agile/SPRINT-2.md#-décisions-prises-pendant-le-sprint) | [lien](docs/agile/SPRINT-3.md#-décisions-prises-pendant-le-sprint) | [lien](docs/agile/SPRINT-4.md#-décisions-prises-pendant-le-sprint) |
| **Daily Scrums** | [lien](docs/agile/SPRINT-1.md#-daily-scrums) | [lien](docs/agile/SPRINT-2.md#-comptes-rendus-de-daily-scrum) | [lien](docs/agile/SPRINT-3.md#-comptes-rendus-de-daily-scrum) | [lien](docs/agile/SPRINT-4.md#-comptes-rendus-de-daily-scrum) |
| **Sprint Review** | [lien](docs/agile/SPRINT-1.md#-sprint-review-t-15-min) | [lien](docs/agile/SPRINT-2.md#-sprint-review) | [lien](docs/agile/SPRINT-3.md#-sprint-review) | [lien](docs/agile/SPRINT-4.md#-sprint-review-t-15-min) |
| **Rétrospective `Keep / Drop / Try`** | [lien](docs/agile/SPRINT-1.md#-rétrospective--keep--drop--try) | [lien](docs/agile/SPRINT-2.md#-rétrospective-keep-drop-try) | [lien](docs/agile/SPRINT-3.md#-rétrospective-keep-drop-try) | [lien](docs/agile/SPRINT-4.md#-rétrospective--keep--drop--try) |

Vue d'ensemble du projet (vision, rôles, planning, vélocité, risques) : [`docs/00-PROJET-GLOBAL.md`](docs/00-PROJET-GLOBAL.md).

## 🚀 Démarrage rapide

```bash
git clone https://github.com/kifuj/Dark-Dungeon-Fantasy-Boss-Battle.git
cd Dark-Dungeon-Fantasy-Boss-Battle
npm install
cp .env.example .env.local   # renseigner l'URL et la clé publishable Supabase
npm run dev                  # front sur http://localhost:5173
```

Tests (moteur de combat `shared/` + composants React `src/tests/`) :

```bash
npm test          # mode veille
npm run test:run  # une seule passe
npm run test:multi  # scénarios multijoueur joués contre le vrai Supabase (docs/04 §11)
```

Serveur autoritaire (Supabase Edge Functions) : `shared/` est recopié dans
`supabase/functions/_shared/game/` avant chaque déploiement.

```bash
npm run functions:sync    # recopie shared/ (extensions .js → .ts pour Deno)
npm run functions:deploy  # sync + npx supabase functions deploy
```

Les images du jeu (monstres, icônes d'élément, décor) sont **dessinées par notre propre code** et commitées.
Pour les régénérer après avoir modifié `tools/art/` :

```bash
npm run assets
```

Le guide complet (dont le déploiement des Edge Functions) est dans [07-INSTALLATION-DEPLOIEMENT.md](docs/07-INSTALLATION-DEPLOIEMENT.md).

## 👥 Équipe

| Rôle | Nom | Compte GitHub |
|---|---|---|
| Product Owner | Mattéo | [`kifuj`](https://github.com/kifuj) |
| Scrum Master | Paul | [`Paul-B-O`](https://github.com/Paul-B-O) |
| Développeur | Owen | [`Owen-Cazaux`](https://github.com/Owen-Cazaux) |
| Développeur | Donovan | [`donovanmessager0-tech`](https://github.com/donovanmessager0-tech) |

> Dans une équipe de 4, le PO et le SM développent aussi (voir [00-PROJET-GLOBAL §5](docs/00-PROJET-GLOBAL.md#5-rôles-scrum)).

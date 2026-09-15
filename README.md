# 🗡️ Dark Dungeon Fantasy Boss Battle

Jeu **roguelike pixel-art médiéval-fantasy au tour par tour**, jouable dans le navigateur.
On peut jouer **en solo** contre des vagues de monstres contrôlés par l'IA, ou **en duel multijoueur en ligne** contre un ami.
Inspiré de *PokeRogue*.

> Projet étudiant réalisé dans le cadre du TP Agile (BTS2). Aucun usage commercial.

---

## 🔗 Liens

| Quoi | Lien |
|---|---|
| Jeu en ligne (Vercel) | `https://<à-compléter>.vercel.app` |
| Dépôt GitHub (public) | `https://github.com/<à-compléter>/rogue-arena` |
| Projet Supabase | *(privé : ne jamais publier les clés)* |

## 🧱 Stack

| Couche | Techno |
|---|---|
| Front (menus, lobby) | React + TypeScript + Vite |
| Rendu du jeu | Phaser 4 (canvas/WebGL, `pixelArt: true`) |
| Moteur de combat | TypeScript pur, partagé entre le client et le serveur (`shared/`) |
| Serveur autoritaire | Vercel Functions (`api/`) |
| BDD / Auth / Temps réel | Supabase (Postgres + Auth anonyme + Realtime) |
| Tests | Vitest |
| Hébergement | Vercel (plan Hobby gratuit) |

## 📚 Documentation

| # | Document | Contenu |
|---|---|---|
| 00 | [Projet global](docs/00-PROJET-GLOBAL.md) | Vision, périmètre, rôles, planning, risques, présentation |
| 01 | [Game design](docs/01-GAME-DESIGN.md) | Règles, éléments, monstres, compétences, boucle roguelike, modes de jeu |
| 02 | [Architecture](docs/02-ARCHITECTURE.md) | Stack, schémas, arborescence, liaison React ↔ Phaser |
| 03 | [Base de données](docs/03-BASE-DE-DONNEES.md) | Schéma SQL Supabase, RLS, Realtime |
| 04 | [Multijoueur](docs/04-MULTIJOUEUR.md) | Tour simultané, résolution serveur, synchro, timeouts, reconnexion |
| 05 | [API](docs/05-API.md) | Contrats des endpoints `/api/*` |
| 06 | [Moteur de combat](docs/06-MOTEUR-DE-COMBAT.md) | Types, formules, RNG déterministe, IA, tests |
| 07 | [Installation & déploiement](docs/07-INSTALLATION-DEPLOIEMENT.md) | Installation locale, Supabase, Vercel, dépannage |
| 08 | [Conventions](docs/08-CONVENTIONS.md) | Git, code, revues, assets et licences |
| — | [Crédits](docs/CREDITS.md) | Auteurs et licences des assets |
| 🟦 | [Product Backlog](docs/agile/PRODUCT-BACKLOG.md) | User stories, critères d'acceptation, DoR, DoD, estimations |
| 🟩 | [Sprint 1](docs/agile/SPRINT-1.md) · [Sprint 2](docs/agile/SPRINT-2.md) · [Sprint 3](docs/agile/SPRINT-3.md) · [Sprint 4](docs/agile/SPRINT-4.md) | Sprint goal, backlog, dailies, review, rétro |

## 🚀 Démarrage rapide

```bash
git clone https://github.com/<à-compléter>/rogue-arena.git
cd rogue-arena
npm install
npx vercel link              # lier le dossier au projet Vercel
npx vercel env pull .env.local
npx vercel dev               # front + API sur http://localhost:3000
```

Tests du moteur de combat :

```bash
npm test
```

Le guide complet est dans [07-INSTALLATION-DEPLOIEMENT.md](docs/07-INSTALLATION-DEPLOIEMENT.md).

## 👥 Équipe

| Rôle | Nom |
|---|---|
| Product Owner | *à compléter* |
| Scrum Master | *à compléter* |
| Développeur·se | *à compléter* |
| Développeur·se | *à compléter* |

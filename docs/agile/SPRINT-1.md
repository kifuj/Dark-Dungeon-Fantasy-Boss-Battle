# Sprint 1 — Le socle

| | |
|---|---|
| **Créneau** | *à compléter* (0,5 jour) |
| **Product Owner** | |
| **Scrum Master** | |
| **Développeurs** | |
| **Capacité** | *nb personnes × nb heures* = |

## 🎯 Sprint Goal

> **Le squelette du jeu est en ligne sur Render, relié à Supabase, et un combat 1v1 se résout correctement dans les tests automatisés.**
>
> *Goal initialement formulé avec Vercel ; l'hébergement a été migré sur Render pendant le sprint (voir [journal des décisions](../08-CONVENTIONS.md#journal-des-décisions)). Les dailies ci-dessous gardent la mention de Vercel, qui était exacte à leur date.*

## 📋 Sprint Backlog

| US | Points | Tâche | Responsable | Statut |
|---|---|---|---|---|
| **US-01** Projet en ligne | 3 | Créer le repo GitHub public + protection de `main` | Mattéo | 🟡 Repo public créé ; protection de `main` à faire (non activée) |
| | | Scaffold Vite React-TS, installer Phaser, Supabase, Vitest | Mattéo | ✅ Fait ([PR #29](https://github.com/kifuj/Dark-Dungeon-Fantasy-Boss-Battle/pull/29) fusionnée) |
| | | Réécriture SPA + import sur Render + 1er déploiement | Mattéo | 🟡 Migré de Vercel vers Render : Static Site en ligne ([dark-dungeon-fantasy-boss-battle.onrender.com](https://dark-dungeon-fantasy-boss-battle.onrender.com)) ; `vercel.json` supprimé ; **règle de réécriture `/*` → `/index.html` à ajouter sur Render** (`/menu` renvoie 404, CA3 non validé) |
| | | Composant `PhaserGame` avec canvas 480×270 `pixelArt` | Mattéo | ✅ Fait (#29) |
| **US-02** Supabase | 3 | Créer le projet (région Paris) + exécuter `001_init.sql` | Owen | ❌ `001_init.sql` fusionné ([PR #31](https://github.com/kifuj/Dark-Dungeon-Fantasy-Boss-Battle/pull/31)) mais **absent de `main`** (perdu lors du déplacement de `rogue-arena/`) ; fichier à restaurer, création du projet et exécution à faire |
| | | Activer l'auth anonyme + vérifier la publication Realtime | Owen | ☐ À faire (dashboard) |
| | | Variables d'environnement sur Render + `.env.example` | Owen | ❌ `.env.example` fusionné (#31) mais absent de `main` ; aucune URL `*.supabase.co` dans le bundle déployé → variables Render non configurées |
| | | Tester la RLS (select interdit sur le match d'un autre joueur) | Owen | ☐ À faire |
| **US-03** Compétences | 5 | `shared/types.ts` + `data/` (éléments, compétences, monstres) | Paul | ✅ Fait ([PR #30](https://github.com/kifuj/Dark-Dungeon-Fantasy-Boss-Battle/pull/30) fusionnée) |
| | | `rng.ts`, `stats.ts`, `damage.ts` | Paul | ✅ Fait (#30) |
| | | Tests éléments + déterminisme + PP | Paul | ✅ Fait (#30), tests verts |
| **US-05** Ordre | 2 | `getActionOrder` + tests | Donovan | ✅ Fait (#30), tests verts |
| **US-06** KO / fin | 3 | `resolveTurn` (KO, remplacement auto, victoire) + `validateAction` + tests | Donovan | ✅ Fait (#30), tests verts |
| **US-24** Titre / menu | 2 | Maquette Lovable (optionnel) + pages Titre et Menu + routes | Owen | 🟡 Pages et routes fusionnées ([PR #32](https://github.com/kifuj/Dark-Dungeon-Fantasy-Boss-Battle/pull/32)) ; écran titre en ligne sur Render, navigation directe vers `/menu` en 404 tant que la réécriture n'est pas configurée ; maquette Lovable non utilisée |
| | **18** | | | |

**Avancement (mer. 16/09, 09h05 — vérification de fin de sprint)** : **12 / 18 points réellement terminés** (US-03 5, US-05 2, US-06 3, US-24 2). Sur `main` : `npm run build` passe, `npx vitest run` → **71 tests verts**.

Les issues US-01 et US-02 avaient été fermées à 15h18 sans que la DoD soit atteinte ; conformément à la décision du daily n°2, elles sont **rouvertes et repassées en `In progress`** sur le GitHub Project :

| US | Vérification du 16/09 | Reste à faire |
|---|---|---|
| **US-01** | `/` → 200, mais `/menu` et `/solo` → **404** (CA3 non validé) ; `branches/main.protected = false` | Règle de réécriture `/*` → `/index.html` sur Render ; protection de `main` |
| **US-02** | Aucun fichier Supabase ni `.env.example` dans `git ls-files` ; aucun `createClient` / `VITE_SUPABASE_*` dans le code ; aucune URL `*.supabase.co` dans le bundle déployé | Restaurer `001_init.sql` et `.env.example` sur `main`, créer le projet Supabase, auth anonyme, Realtime, variables Render, test RLS |

US-24 reste terminée : l'écran titre est en ligne sur `/` et la navigation interne (SPA) atteint les pages du menu ; le 404 sur URL directe relève de CA3 de US-01.

**Migration vers Render** : le projet a ensuite été migré de Vercel vers **Render** (Static Site), où il tourne : https://dark-dungeon-fantasy-boss-battle.onrender.com. Le serveur autoritaire prévu en Vercel Functions passe en **Supabase Edge Functions** (décisions dans [08 §5](../08-CONVENTIONS.md#journal-des-décisions)). `vercel.json`, le script `dev:full` et `@vercel/node` sont retirés. Vérification du 15/09 : `/` répond 200, `/menu` et `/solo` répondent 404 → règle de réécriture à ajouter sur Render.

📸 **Capture du board au début du sprint** : `![Sprint backlog sprint 1](./captures/sprint-1-backlog.png)`

### 👥 Répartition des tâches

Tâches réparties entre les 4 membres du repo, équilibrées en points. Le responsable de chaque US est assigné sur l'issue GitHub (milestone `Sprint 1`).

| Membre | Compte GitHub | US / tâches | Points |
|---|---|---|---|
| Mattéo | `kifuj` | US-01 | 3 |
| Owen | `Owen-Cazaux` | US-02, US-24 | 5 |
| Paul | `Paul-B-O` | US-03 | 5 |
| Donovan | `donovanmessager0-tech` | US-05, US-06 | 5 |

### ⚠️ Points d'attention techniques
- **20 premières minutes** : Paul et Donovan écrivent `shared/types.ts` ensemble (pair programming) avant de se séparer sur US-03 et US-05/US-06. Sans ces types, Donovan est bloqué.
- Choisir **dès maintenant** le pack de sprites principal et la taille de cadre (voir 08 §3), puis vérifier sa licence.
- Faire valider `shared/types.ts` par toute l'équipe tôt : tout le monde en dépend.
- Pas de `Math.random` dans `shared/`.

## ✅ Tâches terminées

| US | Points | Preuve |
|---|---|---|
| **US-03** Attaquer avec des compétences et des éléments | 5 | [PR #30](https://github.com/kifuj/Dark-Dungeon-Fantasy-Boss-Battle/pull/30), tests `damage.test.ts` et `elements.test.ts` |
| **US-05** Ordre d'action par priorité et vitesse | 2 | PR #30, tests `battle.test.ts` |
| **US-06** KO, remplacement automatique, victoire | 3 | PR #30, tests `battle.test.ts` |
| **US-24** Écran titre et menu principal | 2 | [PR #32](https://github.com/kifuj/Dark-Dungeon-Fantasy-Boss-Battle/pull/32), écran titre en ligne sur Render |
| | **12** | **Vélocité du sprint 1 : 12 points sur 18 engagés** |

## ⏳ Tâches non terminées

| US | Points | Ce qui manque | Suite |
|---|---|---|---|
| **US-01** Projet en ligne | 3 | Réécriture SPA (`/menu` et `/solo` en 404 sur URL directe) et protection de `main` | Issue rouverte, reprise au sprint 2 puis reportée au sprint 3 |
| **US-02** Supabase configuré | 3 | `001_init.sql` et `.env.example` perdus lors du déplacement de `rogue-arena/`, projet Supabase non créé, auth anonyme, Realtime, variables Render, test RLS | Issue rouverte, **bloquante pour le sprint 3** |

## ⚠️ Problèmes rencontrés

- **Fichiers perdus lors d'un déplacement de dossier** : `001_init.sql` et `.env.example`, fusionnés par la [PR #31](https://github.com/kifuj/Dark-Dungeon-Fantasy-Boss-Battle/pull/31), ne sont plus sur `main` après le déplacement de `rogue-arena/` à la racine.
- **Issues fermées trop tôt** : US-01 et US-02 ont été fermées à 15h18 alors que leur DoD n'était pas atteinte ; elles ont été rouvertes le 16/09 après vérification de la version en ligne.
- **Dépendance à des comptes externes** (Vercel puis Render, Supabase) : une partie des points engagés ne dépendait pas du code.
- **Changement d'hébergeur en cours de sprint** (Vercel → Render), qui a invalidé une partie du travail de déploiement et de la documentation.

## 🧭 Décisions prises pendant le sprint

| Décision | Raison |
|---|---|
| Temps réel via **Supabase Realtime** plutôt que des WebSockets maison | Ni le front statique ni les fonctions serveur ne gardent de connexion ouverte |
| **Moteur de combat partagé et déterministe** (`shared/`) | Même code en solo et en multi, testable, empêche la triche |
| Hébergement migré de **Vercel vers Render** (Static Site) | Choix de l'équipe ; le projet tourne sur Render |
| Serveur autoritaire en **Supabase Edge Functions** | Un Static Site Render n'exécute pas de code serveur |
| Renommage du jeu en **Dark Dungeon Fantasy Boss battle** | Décision d'équipe, appliquée partout au fil de l'eau |
| **Ne fermer une issue qu'après vérification en ligne** (action de fin de sprint) | Les US-01 et US-02 avaient été fermées sans DoD |

---

## 🗣️ Daily Scrums

> Toutes les heures, 5 minutes debout. Une ligne par personne.

### Daily n°1 — ⏰ 15h

| Membre | Ce que j'ai fait depuis le dernier point | Ce que je fais maintenant | Blocages |
|---|---|---|---|
| Mattéo | Scaffold Vite React-TS + Phaser + Vitest et `vercel.json` ([PR #29](https://github.com/kifuj/Dark-Dungeon-Fantasy-Boss-Battle/pull/29), fusionnée à 14h29) ; déplacement de `rogue-arena/` à la racine du dépôt ; fusion de la PR #31 (14h32) | Import du projet sur Vercel + 1er déploiement ; protection de `main` | Aucun |
| Owen | Pages Titre et Menu + routes ([PR #32](https://github.com/kifuj/Dark-Dungeon-Fantasy-Boss-Battle/pull/32), fusionnée à 14h31) ; `001_init.sql` et `.env.example` ([PR #31](https://github.com/kifuj/Dark-Dungeon-Fantasy-Boss-Battle/pull/31)) | Changement du nom du jeu sur l'écran titre et partout où il apparaît | Vérification de US-24 en ligne dépendante du déploiement Vercel (US-01) |
| Paul | `shared/types.ts`, `data/`, `rng.ts`, `stats.ts`, `damage.ts` + tests ([PR #30](https://github.com/kifuj/Dark-Dungeon-Fantasy-Boss-Battle/pull/30), fusionnée à 14h34) | Vérification de la DoD du moteur sur `main` (build + tests) puis fermeture des issues US-03, US-05, US-06 | Aucun |
| Donovan | `getActionOrder`, `resolveTurn`, `validateAction` + tests (PR #30) | Vérification de la DoD du moteur avec Paul ; lecture de US-04 (sprint 2), qui s'appuie sur `resolveTurn` | Aucun |

**Décisions / actions :**
- Moteur de combat validé : `npm run build` passe et `npx vitest run` donne 71 tests verts sur `main`. Les issues US-03, US-05 et US-06 sont fermées (15h02) : **10 / 18 points terminés**.
- Priorité à Mattéo sur le déploiement Vercel, qui débloque la vérification de US-24 et les variables d'environnement de US-02.
- Mise à jour des statuts sur le GitHub Project (fait à 15h10).

### Daily n°2 — ⏰ 16h

| Membre | Ce que j'ai fait depuis le dernier point | Ce que je fais maintenant | Blocages |
|---|---|---|---|
| Mattéo | Statuts du board mis à jour (15h10) ; issues US-01 et US-02 fermées (15h18) | Reporter l'URL Vercel dans le `README` (encore `<à-compléter>`) ; activer la protection de `main` (toujours désactivée) | Aucun |
| Owen | Nouveau nom du jeu « Dark Dungeon Fantasy Boss battle » dans l'écran titre, le menu, `index.html`, `package.json` et la doc (commit `56aabd4`, 15h18) ; issue US-24 fermée (16h05) | Vérifier l'écran titre renommé sur la version en ligne ; tester la RLS Supabase (select interdit sur le match d'un autre joueur) | Aucun |
| Paul | Issues du moteur fermées, DoD vérifiée | Préparation de US-11 (sprint 2) : lecture de la doc IA et des vagues (06) | Aucun |
| Donovan | Relecture du moteur avec Paul | Préparation de US-04 (sprint 2) : événement `switch` dans le moteur | Aucun |

**Décisions / actions :**
- Toutes les issues du sprint 1 sont fermées, mais `SPRINT-1.md` indique encore des tâches non faites sur US-01 et US-02 (déploiement, auth anonyme, variables Vercel, RLS). **Avant la review**, Mattéo et Owen confirment ces tâches et alignent les statuts du tableau avec les issues ; sinon les US repassent en cours.
- L'URL de déploiement doit être renseignée dans le `README` et dans la review : c'est la preuve du Sprint Goal.
- Le renommage du jeu est acté ; les références restantes à « Rogue Arena » seront corrigées au fil de l'eau.
- Paul et Donovan, en avance, préparent le sprint 2 sans ouvrir de nouvelle US dans le sprint 1.

### Daily n°3 — ⏰ 17h

| Membre | Ce que j'ai fait depuis le dernier point | Ce que je fais maintenant | Blocages |
|---|---|---|---|
| | | | |
| | | | |
| | | | |
| | | | |

**Décisions / actions :**

---

## 🎬 Sprint Review *(T-15 min)*

**Présentée par (PO) :**
**URL démontrée :**

| US | Terminée (DoD) ? | Démontrée ? | Commentaire du PO |
|---|---|---|---|
| US-01 | ☐ | ☐ | |
| US-02 | ☐ | ☐ | |
| US-03 | ☐ | ☐ | |
| US-05 | ☐ | ☐ | |
| US-06 | ☐ | ☐ | |
| US-24 | ☐ | ☐ | |

- **Points engagés** : 18 — **Points terminés** : __
- **Sprint Goal atteint ?** ☐ Oui ☐ Partiellement ☐ Non
- **US non terminées → retour au Product Backlog :**
- **Retours / nouvelles idées pour le backlog :**

📸 `![Review sprint 1](./captures/sprint-1-review.png)`

---

## 🔁 Rétrospective — Keep / Drop / Try

| ✅ Keep (à garder) | ❌ Drop (à arrêter) | 🧪 Try (à essayer au sprint 2) |
|---|---|---|
| | | |
| | | |
| | | |

**Action d'amélioration retenue pour le sprint 2 :**

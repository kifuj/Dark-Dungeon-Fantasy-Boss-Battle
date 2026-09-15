# Sprint 1 — Le socle

| | |
|---|---|
| **Créneau** | *à compléter* (0,5 jour) |
| **Product Owner** | |
| **Scrum Master** | |
| **Développeurs** | |
| **Capacité** | *nb personnes × nb heures* = |

## 🎯 Sprint Goal

> **Le squelette du jeu est en ligne sur Vercel, relié à Supabase, et un combat 1v1 se résout correctement dans les tests automatisés.**

## 📋 Sprint Backlog

| US | Points | Tâche | Responsable | Statut |
|---|---|---|---|---|
| **US-01** Projet en ligne | 3 | Créer le repo GitHub public + protection de `main` | Mattéo | 🟡 Repo public créé ; protection de `main` à faire (non activée) |
| | | Scaffold Vite React-TS, installer Phaser, Supabase, Vitest | Mattéo | ✅ Fait ([PR #29](https://github.com/kifuj/Dark-Dungeon-Fantasy-Boss-Battle/pull/29) fusionnée) |
| | | `vercel.json` (rewrites) + import sur Vercel + 1er déploiement | Mattéo | 🟡 `vercel.json` fusionné (#29) ; import sur Vercel et 1er déploiement à faire (aucun déploiement) |
| | | Composant `PhaserGame` avec canvas 480×270 `pixelArt` | Mattéo | ✅ Fait (#29) |
| **US-02** Supabase | 3 | Créer le projet (région Paris) + exécuter `001_init.sql` | Owen | 🟡 `001_init.sql` fusionné ([PR #31](https://github.com/kifuj/Dark-Dungeon-Fantasy-Boss-Battle/pull/31)) ; création du projet et exécution à faire |
| | | Activer l'auth anonyme + vérifier la publication Realtime | Owen | ☐ À faire (dashboard) |
| | | Variables d'environnement sur Vercel + `.env.example` | Owen | 🟡 `.env.example` fusionné (#31) ; variables Vercel à faire |
| | | Tester la RLS (select interdit sur le match d'un autre joueur) | Owen | ☐ À faire |
| **US-03** Compétences | 5 | `shared/types.ts` + `data/` (éléments, compétences, monstres) | Paul | ✅ Fait ([PR #30](https://github.com/kifuj/Dark-Dungeon-Fantasy-Boss-Battle/pull/30) fusionnée) |
| | | `rng.ts`, `stats.ts`, `damage.ts` | Paul | ✅ Fait (#30) |
| | | Tests éléments + déterminisme + PP | Paul | ✅ Fait (#30), tests verts |
| **US-05** Ordre | 2 | `getActionOrder` + tests | Donovan | ✅ Fait (#30), tests verts |
| **US-06** KO / fin | 3 | `resolveTurn` (KO, remplacement auto, victoire) + `validateAction` + tests | Donovan | ✅ Fait (#30), tests verts |
| **US-24** Titre / menu | 2 | Maquette Lovable (optionnel) + pages Titre et Menu + routes | Owen | 🟡 Pages et routes fusionnées ([PR #32](https://github.com/kifuj/Dark-Dungeon-Fantasy-Boss-Battle/pull/32)) ; à vérifier sur Vercel (bloqué par US-01) ; maquette Lovable non utilisée |
| | **18** | | | |

**Avancement (mar. 15/09, 14h40)** : **10 / 18 points terminés** (US-03, US-05, US-06 : issues fermées). Sur `main` : `npm run build` passe, `npx vitest run` → 71 tests verts. En cours : US-01 (import Vercel, protection de `main`), US-02 (dashboard Supabase), US-24 (vérification sur Vercel, bloquée par US-01).

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

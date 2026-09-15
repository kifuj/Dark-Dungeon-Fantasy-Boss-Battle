# Sprint 2 — Premier combat jouable

| | |
|---|---|
| **Créneau** | *à compléter* (0,5 jour) |
| **Product Owner** | |
| **Scrum Master** | |
| **Développeurs** | |
| **Capacité** | |
| **Vélocité du sprint 1** | __ points |
| **Action de la rétro précédente** | |

## 🎯 Sprint Goal

> **Un joueur peut choisir un starter et enchaîner des combats contre l'IA dans le navigateur, avec de vrais sprites, sur la version en ligne.**

## 📋 Sprint Backlog

| US | Points | Tâche | Responsable | Statut |
|---|---|---|---|---|
| **US-07** Scène de combat | 5 | `PreloadScene` : chargement des spritesheets + animations idle | | ☐ À faire |
| | | `BattleScene` : placement face à face (`flipX` si besoin) + fond | | ☐ |
| | | Encadrés nom / niveau / élément + barre de PV colorée | | ☐ |
| | | `EventBus` : `scene-ready`, `battle-init` | | ☐ |
| **US-08** Menu d'actions | 3 | Composant React `ActionMenu` (compétences, PP, couleurs) | | ☐ |
| | | Griser via `validateAction` + navigation clavier | | ☐ |
| | | Masquer pendant la résolution (`play-events` / `events-played`) | | ☐ |
| **US-04** Changer | 3 | Sous-menu « Changer » + événement `switch` dans Phaser | | ☐ |
| **US-10** Starter | 2 | Page de choix du starter (3 cartes) + création de la run (seed) | | ☐ |
| **US-11** Vagues IA | 5 | `chooseAiAction` + tests | | ☐ |
| | | Génération d'ennemi par vague (`shared/engine/run.ts`) + tests | | ☐ |
| | | Page `SoloRun` : boucle tour → vague suivante → fin de run | | ☐ |
| | **18** | | | |

📸 **Capture du board** : `![Sprint backlog sprint 2](./captures/sprint-2-backlog.png)`

### ⚠️ Points d'attention techniques
- Première version sans animation : Phaser applique directement les PV finaux. Les animations complètes arrivent avec US-09 au sprint 4.
- Tester sur l'**URL Vercel**, pas seulement en local (chemins des assets dans `public/`).
- En parallèle, le pôle Backend peut **préparer** `api/_lib/` pour le sprint 3.

---

## 🗣️ Daily Scrums

### Daily n°1 — ⏰ __h__

| Membre | Ce que j'ai fait depuis le dernier point | Ce que je fais maintenant | Blocages |
|---|---|---|---|
| | | | |
| | | | |
| | | | |
| | | | |

**Décisions / actions :**

### Daily n°2 — ⏰ __h__

| Membre | Ce que j'ai fait depuis le dernier point | Ce que je fais maintenant | Blocages |
|---|---|---|---|
| | | | |
| | | | |
| | | | |
| | | | |

**Décisions / actions :**

### Daily n°3 — ⏰ __h__

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
| US-07 | ☐ | ☐ | |
| US-08 | ☐ | ☐ | |
| US-04 | ☐ | ☐ | |
| US-10 | ☐ | ☐ | |
| US-11 | ☐ | ☐ | |

- **Points engagés** : 18 — **Points terminés** : __
- **Sprint Goal atteint ?** ☐ Oui ☐ Partiellement ☐ Non
- **US non terminées → retour au Product Backlog :**
- **Retours / nouvelles idées :**

📸 `![Review sprint 2](./captures/sprint-2-review.png)`

---

## 🔁 Rétrospective — Keep / Drop / Try

| ✅ Keep | ❌ Drop | 🧪 Try |
|---|---|---|
| | | |
| | | |
| | | |

**Action d'amélioration retenue pour le sprint 3 :**

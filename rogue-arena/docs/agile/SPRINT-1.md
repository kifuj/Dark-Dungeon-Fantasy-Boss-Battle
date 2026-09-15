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
| **US-01** Projet en ligne | 3 | Créer le repo GitHub public + protection de `main` | Mattéo | ☐ À faire |
| | | Scaffold Vite React-TS, installer Phaser, Supabase, Vitest | Mattéo | ☐ |
| | | `vercel.json` (rewrites) + import sur Vercel + 1er déploiement | Mattéo | ☐ |
| | | Composant `PhaserGame` avec canvas 480×270 `pixelArt` | Mattéo | ☐ |
| **US-02** Supabase | 3 | Créer le projet (région Paris) + exécuter `001_init.sql` | Owen | ☐ |
| | | Activer l'auth anonyme + vérifier la publication Realtime | Owen | ☐ |
| | | Variables d'environnement sur Vercel + `.env.example` | Owen | ☐ |
| | | Tester la RLS (select interdit sur le match d'un autre joueur) | Owen | ☐ |
| **US-03** Compétences | 5 | `shared/types.ts` + `data/` (éléments, compétences, monstres) | Paul | ☐ |
| | | `rng.ts`, `stats.ts`, `damage.ts` | Paul | ☐ |
| | | Tests éléments + déterminisme + PP | Paul | ☐ |
| **US-05** Ordre | 2 | `getActionOrder` + tests | Donovan | ☐ |
| **US-06** KO / fin | 3 | `resolveTurn` (KO, remplacement auto, victoire) + `validateAction` + tests | Donovan | ☐ |
| **US-24** Titre / menu | 2 | Maquette Lovable (optionnel) + pages Titre et Menu + routes | Owen | ☐ |
| | **18** | | | |

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

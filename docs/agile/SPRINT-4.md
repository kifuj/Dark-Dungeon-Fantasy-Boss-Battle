# Sprint 4 — Boucle roguelike et finitions

| | |
|---|---|
| **Créneau** | *à compléter* (0,5 jour), **avant le rendu de 13h30** |
| **Product Owner** | |
| **Scrum Master** | |
| **Développeurs** | |
| **Capacité** | *réduite : prévoir ~45 min pour la présentation et le rendu* |
| **Vélocité des sprints précédents** | S1 : __ · S2 : __ · S3 : __ |
| **Action de la rétro précédente** | |

## 🎯 Sprint Goal

> **La boucle roguelike solo est complète (récompenses), le duel en ligne résiste aux rafraîchissements et aux absences, et le jeu est prêt à être présenté.**

## 📋 Sprint Backlog

> Engagement réduit à **12 points** : le sprint 4 est plus court (préparation du rendu + gel du code 30 min avant 13h30). US-09 passe en **objectif bonus**. Si la vélocité réelle des sprints 1 à 3 est encore plus faible, retirer US-20.

| US | Points | Tâche | Responsable | Statut |
|---|---|---|---|---|
| **US-12** Récompenses | 5 | `shared/data/rewards.ts` + tirage pondéré avec la seed + tests | Owen | ☐ À faire |
| | | Application des effets (potion, élixir, entraînement, recrutement, parchemin) + tests | Owen | ☐ |
| | | Écran de choix (3 cartes) + remplacement si équipe pleine | Owen | ☐ |
| **US-21** Reconnexion | 3 | Chargement initial sans animation + détection « déjà joué » | Paul | ☐ |
| | | Bouton « Reprendre la partie » dans le menu | Paul | ☐ |
| **US-20** Timeout | 3 | Edge Function `match-timeout` (action par défaut, `is_auto`) | Donovan | ☐ |
| | | Compte à rebours côté client + appel automatique | Donovan | ☐ |
| **US-26** Crédits | 1 | Page Crédits reprenant `CREDITS.md` | Donovan | ☐ |
| *(hors US)* | — | Enregistrer une **vidéo de secours** de la démo | Mattéo | ☐ |
| *(hors US)* | — | Mettre à jour README (URL prod, équipe) + vérifier que tous les `.md` sont remplis | Donovan | ☐ |
| *(hors US)* | — | Slides de présentation (plan dans 00-PROJET-GLOBAL §9) | Mattéo | ☐ |
| | **12** | | | |

#### 🎁 Objectif bonus (hors engagement)

À commencer **seulement** si US-12, US-20, US-21 et US-26 sont terminées et qu'il reste au moins 1h avant le gel du code. Sinon, US-09 reste dans la réserve.

| US | Points | Tâche | Responsable | Statut |
|---|---|---|---|---|
| **US-09** Animations | 5 | File d'événements avec attente (`wait`, tweens de PV, flash, KO) | Mattéo | ☐ |
| | | Textes d'efficacité et de critique | Mattéo | ☐ |

📸 **Capture du board** : `![Sprint backlog sprint 4](./captures/sprint-4-backlog.png)`

### 👥 Répartition des tâches

Tâches réparties entre les 4 membres du repo, équilibrées en points. Le responsable de chaque US est assigné sur l'issue GitHub (milestone `Sprint 4`).

| Membre | Compte GitHub | US / tâches | Points |
|---|---|---|---|
| Mattéo | `kifuj` | Vidéo de secours + slides (+ US-09 en bonus) | hors US (+ 5 bonus) |
| Owen | `Owen-Cazaux` | US-12 | 5 |
| Paul | `Paul-B-O` | US-21 + relecture des PR et test sur la production | 3 + hors US |
| Donovan | `donovanmessager0-tech` | US-20, US-26 + README | 4 + hors US |

### ⚠️ Points d'attention techniques
- **Gel du code 30 min avant le rendu** : plus de nouvelle fonctionnalité, seulement des corrections.
- Vérifier le déploiement de production sur un PC qui n'a jamais ouvert le jeu (cache vide).
- Ouvrir le dashboard Supabase le matin (projet non mis en pause).
- Vérifier que le repo GitHub est bien **public** et que le lien fonctionne en navigation privée.

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
| US-12 | ☐ | ☐ | |
| US-21 | ☐ | ☐ | |
| US-20 | ☐ | ☐ | |
| US-09 *(bonus)* | ☐ | ☐ | |
| US-26 | ☐ | ☐ | |

- **Points engagés** : 12 (+ 5 bonus) — **Points terminés** : __
- **Sprint Goal atteint ?** ☐ Oui ☐ Partiellement ☐ Non
- **Reste dans le Product Backlog (pistes pour la suite) :**

📸 `![Review sprint 4](./captures/sprint-4-review.png)`

---

## 🔁 Rétrospective — Keep / Drop / Try

| ✅ Keep | ❌ Drop | 🧪 Try |
|---|---|---|
| | | |
| | | |
| | | |

## 📦 Checklist de rendu (jeudi 13h30)

- [ ] Lien GitHub public qui fonctionne en navigation privée
- [ ] URL Render de production dans le README (fait : https://dark-dungeon-fantasy-boss-battle.onrender.com)
- [ ] `PRODUCT-BACKLOG.md` : estimations d'équipe remplies, journal du Planning Poker
- [ ] `SPRINT-1.md` à `SPRINT-4.md` : goal, backlog, dailies, review, rétro remplis + captures
- [ ] `00-PROJET-GLOBAL.md` : tableau de vélocité rempli
- [ ] `CREDITS.md` complet
- [ ] Mail envoyé avec les liens et les fichiers `.md`

## 📊 Bilan global du projet

| Sprint | Engagés | Terminés | Sprint Goal atteint |
|---|---|---|---|
| 1 | 18 | | |
| 2 | 18 | | |
| 3 | 18 | | |
| 4 | 12 | | |
| **Total** | **71** | | |

**Ce que l'équipe retient du projet :**

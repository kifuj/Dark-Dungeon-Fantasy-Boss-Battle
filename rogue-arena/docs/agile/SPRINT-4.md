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

> Ajuster selon la vélocité réelle des sprints 1 à 3. Si elle est plus faible, retirer d'abord US-09 puis US-20.

| US | Points | Tâche | Responsable | Statut |
|---|---|---|---|---|
| **US-12** Récompenses | 5 | `shared/data/rewards.ts` + tirage pondéré avec la seed + tests | | ☐ À faire |
| | | Application des effets (potion, élixir, entraînement, recrutement, parchemin) + tests | | ☐ |
| | | Écran de choix (3 cartes) + remplacement si équipe pleine | | ☐ |
| **US-21** Reconnexion | 3 | Chargement initial sans animation + détection « déjà joué » | | ☐ |
| | | Bouton « Reprendre la partie » dans le menu | | ☐ |
| **US-20** Timeout | 3 | `api/match/timeout.ts` (action par défaut, `is_auto`) | | ☐ |
| | | Compte à rebours côté client + appel automatique | | ☐ |
| **US-09** Animations | 5 | File d'événements avec attente (`wait`, tweens de PV, flash, KO) | | ☐ |
| | | Textes d'efficacité et de critique | | ☐ |
| **US-26** Crédits | 1 | Page Crédits reprenant `CREDITS.md` | | ☐ |
| *(hors US)* | — | Enregistrer une **vidéo de secours** de la démo | | ☐ |
| *(hors US)* | — | Mettre à jour README (URL prod, équipe) + vérifier que tous les `.md` sont remplis | | ☐ |
| *(hors US)* | — | Slides de présentation (plan dans 00-PROJET-GLOBAL §9) | | ☐ |
| | **17** | | | |

📸 **Capture du board** : `![Sprint backlog sprint 4](./captures/sprint-4-backlog.png)`

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
| US-09 | ☐ | ☐ | |
| US-26 | ☐ | ☐ | |

- **Points engagés** : 17 — **Points terminés** : __
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
- [ ] URL Vercel de production dans le README
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
| 4 | 17 | | |
| **Total** | **71** | | |

**Ce que l'équipe retient du projet :**

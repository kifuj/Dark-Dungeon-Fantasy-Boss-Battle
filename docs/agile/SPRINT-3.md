# Sprint 3 — Le multijoueur

| | |
|---|---|
| **Créneau** | *à compléter* (0,5 jour) |
| **Product Owner** | |
| **Scrum Master** | |
| **Développeurs** | |
| **Capacité** | |
| **Vélocité des sprints précédents** | S1 : __ · S2 : __ |
| **Action de la rétro précédente** | |

## 🎯 Sprint Goal

> **Deux joueurs sur deux navigateurs différents peuvent créer ou rejoindre un salon et s'affronter en ligne, tour par tour, jusqu'à la victoire, sur la version déployée.**

## 📋 Sprint Backlog

| US | Points | Tâche | Responsable | Statut |
|---|---|---|---|---|
| **US-15** Pseudo | 3 | Page Login : `signInAnonymously` + `upsert` du profil | Owen | ☐ À faire |
| | | Garde de route (redirection si pas de profil) + gestion du pseudo déjà pris | Owen | ☐ |
| **US-16** Créer un salon | 3 | `supabase/functions/_shared/` (supabaseAdmin, auth, http) | Paul | ☐ |
| | | Edge Function `rooms-create` + page Salon (code, copier) | Mattéo | ☐ |
| | | Abonnement Realtime `rooms` (arrivée de l'invité) | Mattéo | ☐ |
| **US-17** Rejoindre | 3 | Edge Function `rooms-join` (course sur `guest_id`) + formulaire de code | Donovan | ☐ |
| **US-19** Combat en ligne | 8 | Edge Function `match-start` (seed, équipes aléatoires, `current_match_id`) | Paul | ☐ |
| | | `_shared/turns.ts` : `tryResolveBattleTurn` (verrou `version`) | Paul | ☐ |
| | | Edge Function `match-action` (validations + codes d'erreur) | Paul | ☐ |
| | | `src/lib/realtime.ts` + page `OnlineMatch` (états choosing / waiting / animating / finished) | Mattéo | ☐ |
| | | Tests manuels M1, M2, M5, M6, M7 (doc 04 §11) sur 2 navigateurs **en preview Render** | Donovan | ☐ |
| **US-23** Abandon | 1 | Edge Function `match-forfeit` + bouton avec confirmation | Donovan | ☐ |
| | **18** | | | |

📸 **Capture du board** : `![Sprint backlog sprint 3](./captures/sprint-3-backlog.png)`

### 👥 Répartition des tâches

Tâches réparties entre les 4 membres du repo, équilibrées en points. Le responsable de chaque US est assigné sur l'issue GitHub (milestone `Sprint 3`).

| Membre | Compte GitHub | US / tâches | Points |
|---|---|---|---|
| Mattéo | `kifuj` | US-16 (`create.ts`, page Salon, Realtime) + front de US-19 (`realtime.ts`, `OnlineMatch`) | ~2 + ~2 |
| Owen | `Owen-Cazaux` | US-15 | 3 |
| Paul | `Paul-B-O` | `supabase/functions/_shared` (US-16) + back de US-19 (`match-start`, `turns`, `match-action`) | ~1 + ~5 |
| Donovan | `donovanmessager0-tech` | US-17, US-23 + tests multi de US-19 | 3 + 1 + ~1 |

### ⚠️ Points d'attention techniques
- **Premier daily** : vérifier que le Realtime passe sur le réseau de l'école. Sinon, activer tout de suite le plan B polling (doc 04 §10).
- US-19 dépend d'US-15 et US-16. Pour ne pas attendre : **Paul commence par `supabase/functions/_shared` puis `match-start`**, qui ne dépendent ni du login ni du salon, pendant qu'Owen fait le Login et Mattéo le salon. `match-action` et `OnlineMatch` démarrent une fois US-15 et US-16 mergées.
- Tester avec **deux profils de navigateur** (deux sessions anonymes différentes).
- Réutiliser la `BattleScene` du sprint 2 : seule la source des événements change (Realtime au lieu du calcul local).

---

## 🗣️ Daily Scrums

### Daily n°1 — ⏰ __h__

| Membre | Ce que j'ai fait depuis le dernier point | Ce que je fais maintenant | Blocages |
|---|---|---|---|
| | | | |
| | | | |
| | | | |
| | | | |

**Test Realtime sur le réseau de l'école :** ☐ OK ☐ KO → plan B
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
**Démo** : duel complet entre deux PC ☐

| US | Terminée (DoD) ? | Démontrée ? | Commentaire du PO |
|---|---|---|---|
| US-15 | ☐ | ☐ | |
| US-16 | ☐ | ☐ | |
| US-17 | ☐ | ☐ | |
| US-19 | ☐ | ☐ | |
| US-23 | ☐ | ☐ | |

- **Points engagés** : 18 — **Points terminés** : __
- **Sprint Goal atteint ?** ☐ Oui ☐ Partiellement ☐ Non
- **US non terminées → retour au Product Backlog :**
- **Retours / nouvelles idées :**

📸 `![Review sprint 3](./captures/sprint-3-review.png)`

---

## 🔁 Rétrospective — Keep / Drop / Try

| ✅ Keep | ❌ Drop | 🧪 Try |
|---|---|---|
| | | |
| | | |
| | | |

**Action d'amélioration retenue pour le sprint 4 :**

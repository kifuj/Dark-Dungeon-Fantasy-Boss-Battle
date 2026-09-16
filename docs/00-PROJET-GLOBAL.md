# 00 — Projet global

## 1. Vision

> **Pour** les joueurs qui aiment les RPG rétro et les parties courtes,
> **Dark Dungeon Fantasy Boss battle** est un jeu web roguelike au tour par tour
> **qui** permet de constituer une équipe de monstres médiévaux-fantastiques et de survivre à des vagues d'ennemis, ou d'affronter un ami en ligne.
> **Contrairement à** un RPG classique, chaque partie est différente (tirages aléatoires, récompenses à choisir) et on joue sans rien installer, directement dans le navigateur.

## 2. Objectifs

1. Livrer un jeu **jouable en ligne** sur Render avant la présentation.
2. Proposer un **mode multijoueur au tour par tour** fonctionnel entre deux navigateurs.
3. Appliquer Scrum sur **4 sprints** et documenter tout le processus en Markdown.

## 3. Périmètre

### ✅ Dans le MVP (Must)
- Moteur de combat : compétences, éléments, vitesse, KO, victoire/défaite.
- Scène de combat Phaser avec sprites pixel-art et barres de PV.
- Mode solo : choix d'un starter, vagues d'ennemis IA, récompenses entre les vagues.
- Connexion par pseudo (auth anonyme Supabase).
- Multijoueur : créer ou rejoindre un salon par code, duel 1v1 avec choix simultanés et résolution côté serveur.
- Écran titre, menu et écran des crédits.
- Déploiement Render (front) + Supabase Edge Functions (serveur), et repo GitHub public.

### 🟡 Si on a le temps (Should / Could)
- Draft d'équipe en duel, format en 3 manches (BO3), récompenses entre les manches.
- Timeout de tour, reconnexion après un rafraîchissement, abandon.
- Boss, classement, statuts (brûlure, poison), sons, version mobile.

### ❌ Hors périmètre
- Matchmaking automatique, chat, comptes avec e-mail et mot de passe, boutique, plus de 2 joueurs.

## 4. Contraintes

| Contrainte | Conséquence |
|---|---|
| 4 sprints de **0,5 jour** chacun | MVP très resserré, US de 8 points maximum |
| Présentation **jeudi après-midi** (~30 min), rendu **jeudi 13h30** par mail | Le sprint 4 se termine par la préparation de la démo |
| Supabase **gratuit** : 200 connexions Realtime simultanées, 2 M messages/mois, projet mis en pause après 7 jours d'inactivité | Largement suffisant pour une démo ; se reconnecter au dashboard la veille |
| Render **Static Site** gratuit : aucun code serveur exécuté | Serveur autoritaire en **Supabase Edge Functions** (voir [05-API](05-API.md)) |
| Pas de WebSocket maison (ni Static Site ni Edge Function ne gardent de connexion ouverte) | Temps réel délégué à **Supabase Realtime** (voir [04-MULTIJOUEUR](04-MULTIJOUEUR.md)) |
| Repo GitHub **public** | Ne commiter que des assets dont la licence autorise la redistribution (voir [08-CONVENTIONS](08-CONVENTIONS.md#4-assets-et-licences)) |
| Documentation en `.md` : **1 fichier par sprint** + 1 global | Dossier `docs/agile/` |

## 5. Rôles Scrum

| Rôle | Responsabilités | Nom |
|---|---|---|
| **Product Owner** | Tient le Product Backlog, priorise, valide les critères d'acceptation, présente la Sprint Review | |
| **Scrum Master** | Anime le Planning Poker, les dailies (toutes les heures), la rétro ; lève les blocages ; vérifie que la doc est à jour | |
| **Développeurs** | Découpent les US en tâches, développent, testent, se relisent entre eux | |

> Dans une équipe de 3 ou 4 personnes, le PO et le SM développent aussi.

### Répartition technique suggérée

| Pôle | Périmètre | Docs de référence |
|---|---|---|
| 🧠 Moteur | `shared/` : règles, formules, IA, tests Vitest | 01, 06 |
| 🎮 Jeu | `src/game/` : scènes Phaser, sprites, animations | 01, 02 |
| 🔌 Backend | `supabase/functions/`, Supabase, RLS, Realtime | 03, 04, 05 |
| 🖥️ UI | `src/pages/` : menus, lobby, crédits (maquettes Lovable possibles) | 02 |

## 6. Planning

| Sprint | Créneau *(à ajuster)* | Sprint Goal proposé | Doc |
|---|---|---|---|
| 1 ⚠️ | Mar. 15/09 après-midi | Le squelette est en ligne sur Render et un combat 1v1 se résout correctement dans les tests — **partiellement atteint** (Supabase non configuré) | [SPRINT-1](agile/SPRINT-1.md) |
| 2 ✅ | Mer. 16/09 matin | Un joueur peut faire un combat solo contre l'IA dans le navigateur, avec de vrais sprites — **atteint** | [SPRINT-2](agile/SPRINT-2.md) |
| 3 | Mer. 16/09 après-midi | Deux joueurs sur deux navigateurs peuvent s'affronter en ligne jusqu'à la victoire | [SPRINT-3](agile/SPRINT-3.md) |
| 4 | Jeu. 17/09 matin, **gel du code à 13h** | La boucle roguelike est complète et le jeu est présentable (US-09 en bonus) | [SPRINT-4](agile/SPRINT-4.md) |
| — | Jeu. 17/09 13h30 | 📧 Rendu : lien GitHub + fichiers `.md` | |
| — | Jeu. 17/09 après-midi | 🎤 Présentation | |

### Déroulé type d'un sprint (~3h30)

| Temps | Cérémonie |
|---|---|
| 0:00 – 0:20 | Sprint Planning : Sprint Goal, choix des US, découpage en tâches, capture du board |
| toutes les heures | Daily Scrum de 5 min (fait / à faire / blocages) avec compte rendu écrit |
| … | Développement |
| T-15 min | Sprint Review : le PO présente le travail réalisé, avec trace écrite et capture |
| T-7 min | Rétrospective Keep / Drop / Try |

## 7. Suivi de la vélocité

> À la fin de chaque sprint, calculer la vélocité réelle (points terminés, DoD respectée) et réajuster l'engagement des sprints suivants sur la moyenne des sprints terminés. Répercuter le changement dans les `SPRINT-N.md`, les milestones et le GitHub Project.

| Sprint | Points engagés | Points terminés (DoD respectée) | Commentaire |
|---|---|---|---|
| 1 | 18 | **12** | US-01 et US-02 non terminées : elles dépendaient de comptes externes (Render, Supabase) plutôt que de code |
| 2 | 18 | **18** | Sprint Goal atteint ; mode solo jouable en ligne. Les 2 US du sprint 1 restent ouvertes |
| 3 | 18 | | Les 30 premières minutes sont réservées à US-01 et US-02 (reste du sprint 1) |
| 4 | 12 | | Engagement réduit : sprint court (gel du code + rendu), US-09 en bonus |

**Vélocité moyenne après 2 sprints : 15 points.** L'engagement du sprint 3 est maintenu à 18 points car les 6 points manquants du sprint 1 correspondaient à de la configuration de services externes, pas à de la charge de développement — mais US-01 et US-02 doivent être fermées en premier.

## 8. Risques

| Risque | Probabilité | Impact | Parade |
|---|---|---|---|
| Le multijoueur prend plus de temps que prévu | Haute | Haut | Moteur partagé testé dès le sprint 1 ; plan B par polling (voir 04) ; le solo reste livrable seul |
| Conflits Git dans une petite équipe | Moyenne | Moyen | Branches courtes, PR petites, un pôle par dossier |
| Assets de styles ou de tailles hétérogènes | Moyenne | Moyen | Choisir **un** pack de base au sprint 1 et fixer une taille de sprite |
| Variables d'environnement oubliées sur Render, ou Edge Functions non redéployées | Moyenne | Haut | Checklist de déploiement (doc 07 §6), `.env.example` à jour |
| Projet Supabase en pause le jour J | Faible | Haut | Ouvrir le dashboard la veille et le matin |
| Sprint 4 trop court pour tout finir | Haute | Haut | Engagement réduit à 12 pts, US-09 en objectif bonus, gel du code à 13h |
| Démo qui plante en direct | Moyenne | Haut | Vidéo de secours enregistrée au sprint 4, deux navigateurs préparés |

## 9. Plan de la présentation (≈ 30 min)

1. **Pitch et démo** (8 min) : partie solo, puis duel en direct sur deux PC.
2. **Organisation Scrum** (8 min) : rôles, backlog, Planning Poker, vélocité par sprint.
3. **Sprints** (8 min) : un slide par sprint avec goal, résultat, Keep / Drop / Try marquant.
4. **Technique** (4 min) : schéma d'architecture et solution retenue pour le tour par tour en ligne.
5. **Bilan et questions** (2 min + questions).

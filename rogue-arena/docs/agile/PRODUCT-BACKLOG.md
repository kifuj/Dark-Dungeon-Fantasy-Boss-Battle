# 🟦 Product Backlog — Rogue Arena

> Tenu par le **Product Owner**. Les user stories (US) viennent du [Projet global](../00-PROJET-GLOBAL.md), du [Game design](../01-GAME-DESIGN.md), de l'[Architecture](../02-ARCHITECTURE.md) et de la [Base de données](../03-BASE-DE-DONNEES.md).
> Les estimations ci-dessous sont une **proposition de départ**. L'équipe les confirme ou les corrige en Planning Poker, puis reporte le résultat dans la colonne « Pts ».

## 1. Légende

| Champ | Valeurs |
|---|---|
| **Priorité** (MoSCoW) | **M** = Must (MVP) · **S** = Should · **C** = Could |
| **Pts** | Suite de Fibonacci : 1, 2, 3, 5, 8, 13, 21. **Maximum 8 par US** : au-delà, on découpe l'US (un sprint ne dure que 0,5 jour) |
| **Statut** | À faire · En cours · Terminé (DoD respectée) |

### Épopées

| Code | Épopée | Pôle principal |
|---|---|---|
| 🧱 SOC | Socle technique et déploiement | Backend / UI |
| 🧠 MOT | Moteur de combat (`shared/`) | Moteur |
| 🎮 COM | Combat dans le navigateur (Phaser) | Jeu |
| 👤 CPT | Compte joueur | Backend |
| 🗺️ SOL | Mode solo « La Descente » | Moteur / Jeu |
| ⚔️ MUL | Multijoueur « Duel Rogue » | Backend |
| 🖥️ UI | Écrans et menus | UI |

## 2. Definition of Ready (DoR)

Une US peut entrer dans un Sprint Backlog seulement si :

- [ ] Elle suit le format **« En tant que… Je veux… Afin de… »** et apporte une valeur claire.
- [ ] Ses **critères d'acceptation** sont écrits et testables (format Étant donné / Quand / Alors).
- [ ] Elle est **estimée** en Planning Poker par toute l'équipe, à **8 points maximum**.
- [ ] Ses **dépendances** sont terminées ou prévues plus tôt dans le même sprint.
- [ ] Les **règles et valeurs** nécessaires sont écrites dans la doc (formules, stats, tables SQL…).
- [ ] Les **assets** nécessaires sont identifiés, avec une licence compatible avec un repo public (CC0 / CC-BY / OFL).
- [ ] Le **PO** l'a validée et priorisée.

## 3. Definition of Done (DoD)

Une US est terminée seulement si :

- [ ] Tous les **critères d'acceptation** sont vérifiés par une autre personne que l'auteur.
- [ ] Le code est sur `main` via une **Pull Request relue** par au moins un·e coéquipier·e.
- [ ] Le build passe (`npm run build`) et **`npm test` est vert**.
- [ ] Toute règle ajoutée dans `shared/` a **au moins un test Vitest**.
- [ ] La fonctionnalité marche sur la **version déployée sur Vercel**, pas seulement en local.
- [ ] Aucune clé secrète dans le code ni dans un fichier commité ; `.env.example` est à jour.
- [ ] Les nouveaux assets sont listés dans [CREDITS.md](../CREDITS.md) avec leur licence.
- [ ] La **doc** concernée (`docs/`) et le fichier du sprint sont à jour.
- [ ] Le **PO a accepté** l'US lors de la Sprint Review.

## 4. Vue d'ensemble

| ID | User story | Épopée | Prio | Pts | Sprint | Dépend de | Statut |
|---|---|---|---|---|---|---|---|
| US-01 | Accéder au jeu en ligne | SOC | M | 3 | 1 | — | À faire |
| US-02 | Données du jeu (monstres, compétences, éléments) | MOT | M | 2 | 1 | US-01 | À faire |
| US-03 | Calcul des dégâts | MOT | M | 5 | 1 | US-02 | À faire |
| US-04 | Résolution d'un tour de combat | MOT | M | 8 | 1 | US-03 | À faire |
| US-05 | Se connecter avec un pseudo | CPT | M | 3 | 2 | US-01 | À faire |
| US-06 | Voir le combat en pixel-art | COM | M | 5 | 2 | US-04 | À faire |
| US-07 | Choisir son action et voir le tour animé | COM | M | 5 | 2 | US-06 | À faire |
| US-08 | Affronter une IA | MOT | M | 2 | 2 | US-04 | À faire |
| US-09 | Écran titre et menu principal | UI | M | 3 | 2 | US-05 | À faire |
| US-10 | Créer un salon | MUL | M | 3 | 3 | US-05 | À faire |
| US-11 | Rejoindre un salon avec un code | MUL | M | 3 | 3 | US-10 | À faire |
| US-12 | Lancer le duel | MUL | M | 3 | 3 | US-11 | À faire |
| US-13 | Jouer un tour en ligne | MUL | M | 8 | 3 | US-12, US-07 | À faire |
| US-14 | Voir le résultat du duel | MUL | M | 1 | 3 | US-13 | À faire |
| US-15 | Choisir un starter | SOL | M | 2 | 4 | US-07 | À faire |
| US-16 | Enchaîner les vagues | SOL | M | 3 | 4 | US-15, US-08 | À faire |
| US-17 | Choisir une récompense | SOL | M | 5 | 4 | US-16 | À faire |
| US-18 | Fin de run et score | SOL | M | 3 | 4 | US-16 | À faire |
| US-19 | Écran des crédits | UI | M | 2 | 4 | US-09 | À faire |
| US-20 | Abandonner un duel | MUL | S | 2 | 4 | US-13 | À faire |
| US-21 | Draft de l'équipe en duel | MUL | S | 5 | — | US-12 | À faire |
| US-22 | Timeout de tour | MUL | S | 5 | — | US-13 | À faire |
| US-23 | Reconnexion après un rafraîchissement | MUL | S | 3 | — | US-13 | À faire |
| US-24 | Duel en 3 manches (BO3) | MUL | C | 8 | — | US-14 | À faire |
| US-25 | Affronter un boss | SOL | C | 3 | — | US-16 | À faire |
| US-26 | Consulter le classement | SOL | C | 3 | — | US-18 | À faire |
| US-27 | Choisir le remplaçant après un KO | MOT | C | 3 | — | US-07 | À faire |
| US-28 | Statuts brûlure et poison | MOT | C | 5 | — | US-04 | À faire |
| US-29 | Musique et effets sonores | COM | C | 3 | — | US-07 | À faire |
| US-30 | Jouer sur mobile | UI | C | 5 | — | US-09 | À faire |

### Charge par sprint

| Sprint | Sprint Goal proposé | US | Points |
|---|---|---|---|
| 1 | Le squelette est en ligne sur Vercel et un combat 1v1 se résout correctement dans les tests | US-01 → US-04 | **18** |
| 2 | Un joueur peut faire un combat solo contre l'IA dans le navigateur, avec de vrais sprites | US-05 → US-09 | **18** |
| 3 | Deux joueurs sur deux navigateurs peuvent s'affronter en ligne jusqu'à la victoire | US-10 → US-14 | **18** |
| 4 | La boucle roguelike est complète et le jeu est présentable | US-15 → US-20 | **17** |
| Réserve | Should / Could, à tirer si un sprint finit en avance | US-21 → US-30 | 43 |

> Si le multijoueur prend du retard (risque n°1), le PO peut repousser US-20 et garder le solo (US-15 à US-18) comme livrable prioritaire du sprint 4.

---

## 5. User stories détaillées

### 🧱 Sprint 1 — Socle et moteur

#### US-01 — Accéder au jeu en ligne · M · 3 pts
**En tant que** joueur,
**je veux** ouvrir le jeu depuis une simple URL,
**afin de** jouer sans rien installer.

**Critères d'acceptation**
1. **Étant donné** le repo GitHub public, **quand** un commit est poussé sur `main`, **alors** Vercel déploie automatiquement le site.
2. **Étant donné** l'URL Vercel, **quand** je l'ouvre dans un navigateur, **alors** une page React (Vite + TypeScript) s'affiche sans erreur dans la console.
3. **Étant donné** le projet cloné, **quand** je lance `npm install` puis `npm test`, **alors** Vitest s'exécute (au moins un test d'exemple vert).
4. L'arborescence `api/`, `shared/`, `src/` suit [02-ARCHITECTURE §3](../02-ARCHITECTURE.md#3-arborescence) et un `.env.example` liste les variables sans valeur secrète.

#### US-02 — Données du jeu · M · 2 pts
**En tant que** game designer,
**je veux** que les éléments, compétences et monstres soient décrits dans des fichiers de données,
**afin de** pouvoir rééquilibrer le jeu sans toucher au moteur.

**Critères d'acceptation**
1. `shared/data/elements.ts` contient la table des 6 éléments de [01 §3.4](../01-GAME-DESIGN.md#34-éléments).
2. `shared/data/skills.ts` contient les 12 compétences de [01 §4](../01-GAME-DESIGN.md#4-compétences) (élément, puissance, PP, priorité, effet).
3. `shared/data/monsters.ts` contient les 10 monstres de [01 §5](../01-GAME-DESIGN.md#5-bestiaire) avec leur rôle (starter, commun, rare, boss).
4. Un test vérifie que chaque compétence référencée par un monstre existe.
5. Chaque monstre possède au moins une compétence à PP infinis (`strike`, ou équivalent).

#### US-03 — Calcul des dégâts · M · 5 pts
**En tant que** joueur,
**je veux** que les dégâts dépendent des stats, du niveau et des éléments,
**afin que** mes choix de compétences aient un vrai impact.

**Critères d'acceptation**
1. **Étant donné** un monstre de niveau `N`, **alors** chaque stat vaut `floor(base × (1 + (N − 1) × 0,08))`.
2. Les dégâts suivent la formule de [01 §3.3](../01-GAME-DESIGN.md#33-formule-de-dégâts) : multiplicateur d'élément (×2 / ×1 / ×0,5), bonus même élément ×1,25 (sauf Neutre), aléa entre 0,90 et 1,00, critique ×1,5 avec 1 chance sur 16, minimum 1.
3. Tout l'aléatoire passe par un générateur `rng` créé depuis une **seed** : **même seed = mêmes dégâts** (test à l'appui).
4. **Étant donné** Boule de feu sur un monstre Nature, **alors** l'efficacité renvoyée est 2 ; sur un monstre Eau, 0,5.
5. Les tests couvrent : formule de stat, efficacité, bonus d'élément, critique forcé, dégâts minimum de 1.

#### US-04 — Résolution d'un tour de combat · M · 8 pts
**En tant que** joueur,
**je veux** que chaque tour se déroule selon des règles claires et identiques pour tous,
**afin que** le combat soit juste et prévisible.

**Critères d'acceptation**
1. `resolveTurn(état, actions, rng)` est une fonction **pure** qui renvoie un nouvel état JSON et une liste `events[]` (`skill_used`, `damage`, `heal`, `faint`, `switch`, `battle_end`…).
2. Ordre de résolution : abandons, puis changements, puis compétences par **priorité** décroissante, puis **VIT** décroissante, puis au hasard (via `rng`).
3. Un monstre mis KO avant d'avoir agi **n'agit pas**.
4. Utiliser une compétence retire 1 PP ; une compétence à 0 PP est refusée par `validate.ts`.
5. Les effets Régénération (30 % PV max), Drain vital (50 % des dégâts) et Bénédiction (DEF ×1,25) sont appliqués.
6. En fin de tour, un monstre actif KO est remplacé par le premier monstre en vie ; si toute l'équipe est KO, le joueur **perd** et un événement `battle_end` indique le vainqueur.
7. Un test simule un combat complet 1v1 jusqu'à la victoire, et rejouer la même seed avec les mêmes actions donne exactement le même résultat.

---

### 🎮 Sprint 2 — Combat solo dans le navigateur

#### US-05 — Se connecter avec un pseudo · M · 3 pts
**En tant que** joueur,
**je veux** entrer un simple pseudo pour jouer,
**afin de** ne pas avoir à créer de compte avec e-mail et mot de passe.

**Critères d'acceptation**
1. La migration `001_init.sql` de [03](../03-BASE-DE-DONNEES.md#2-migration-sql) est exécutée et l'auth anonyme est activée sur Supabase.
2. **Étant donné** un nouveau visiteur, **quand** il valide un pseudo de 3 à 20 caractères, **alors** une session anonyme est créée (`signInAnonymously`) et une ligne `profiles` est enregistrée.
3. **Étant donné** un pseudo déjà pris ou hors limites, **alors** un message d'erreur clair s'affiche et rien n'est enregistré.
4. **Étant donné** un joueur déjà connecté, **quand** il recharge la page, **alors** il retrouve son pseudo sans le ressaisir.
5. Un joueur ne peut modifier que **sa propre** ligne `profiles` (RLS vérifiée).

#### US-06 — Voir le combat en pixel-art · M · 5 pts
**En tant que** joueur,
**je veux** voir mon monstre et l'ennemi avec leurs barres de PV,
**afin de** suivre le combat d'un coup d'œil.

**Critères d'acceptation**
1. Le composant `PhaserGame` monte le jeu dans React et le détruit proprement en quittant la page (pas de double canvas).
2. La scène est rendue en 480 × 270, mise à l'échelle `FIT`, sans flou (`pixelArt: true`).
3. **Quand** React émet `battle-init`, **alors** mon monstre s'affiche en bas à gauche, l'ennemi en haut à droite, face à face (`flipX` si besoin).
4. Chaque monstre affiche son nom, son niveau et une barre de PV aux couleurs lisibles.
5. Les sprites viennent d'**un seul pack** en licence redistribuable, crédité dans `CREDITS.md`.

#### US-07 — Choisir son action et voir le tour animé · M · 5 pts
**En tant que** joueur,
**je veux** choisir une compétence ou changer de monstre, puis voir le tour se jouer,
**afin de** comprendre ce qui s'est passé.

**Critères d'acceptation**
1. Le menu d'actions (React, par-dessus le canvas) affiche les compétences du monstre actif avec leurs PP restants et la couleur de leur élément ; les compétences à 0 PP sont désactivées.
2. Le bouton **Changer** propose uniquement les monstres encore en vie et différents du monstre actif.
3. **Quand** je valide une action, **alors** le menu se masque et Phaser rejoue les `events[]` : texte « X utilise Y ! », flash, barre de PV animée, « C'est super efficace ! », « Coup critique ! », animation de KO.
4. **Quand** Phaser émet `events-played`, **alors** le menu réapparaît.
5. **Quand** Phaser émet `battle-end`, **alors** un écran de victoire ou de défaite s'affiche.

#### US-08 — Affronter une IA · M · 2 pts
**En tant que** joueur solo,
**je veux** que l'ennemi choisisse ses actions tout seul,
**afin de** pouvoir jouer sans adversaire humain.

**Critères d'acceptation**
1. `chooseAiAction(état, rng)` renvoie toujours une action **valide** (jamais une compétence à 0 PP).
2. L'IA privilégie la compétence qui inflige le plus de dégâts estimés (efficacité d'élément comprise).
3. Le choix est déterministe pour une même seed (test Vitest).
4. En solo, `resolveTurn` tourne dans le navigateur avec l'action du joueur et celle de l'IA.

#### US-09 — Écran titre et menu principal · M · 3 pts
**En tant que** joueur,
**je veux** un écran titre puis un menu clair,
**afin de** choisir facilement ce que je veux faire.

**Critères d'acceptation**
1. L'écran titre affiche le nom du jeu et un bouton « Jouer » qui mène au choix du pseudo (ou au menu si déjà connecté).
2. Le menu principal propose **Solo**, **Multijoueur** et **Crédits**, et affiche le pseudo du joueur.
3. Les routes suivent le parcours de [01 §7](../01-GAME-DESIGN.md#7-écrans-et-parcours) ; le bouton retour du navigateur ne casse pas l'application.
4. L'interface utilise la police pixel et la palette de [01 §8](../01-GAME-DESIGN.md#8-direction-artistique-et-interface).

---

### ⚔️ Sprint 3 — Duel en ligne

#### US-10 — Créer un salon · M · 3 pts
**En tant que** joueur,
**je veux** créer un salon et obtenir un code,
**afin de** le transmettre à un ami pour qu'il me rejoigne.

**Critères d'acceptation**
1. **Quand** je clique sur « Créer un salon », **alors** `POST /api/rooms/create` (JWT obligatoire) crée une ligne `rooms` au statut `waiting` avec un **code unique de 6 caractères** `[A-Z0-9]`.
2. La page du salon affiche le code en grand, avec un bouton pour le copier.
3. Sans JWT valide, l'API répond **401** et ne crée rien.
4. Le client ne peut pas écrire directement dans `rooms` (aucune policy d'écriture).

#### US-11 — Rejoindre un salon avec un code · M · 3 pts
**En tant que** joueur,
**je veux** saisir le code d'un ami,
**afin de** rejoindre son salon.

**Critères d'acceptation**
1. **Étant donné** un code valide d'un salon `waiting` sans invité, **quand** je le saisis, **alors** `POST /api/rooms/join` m'enregistre comme `guest_id`.
2. **Étant donné** un code inexistant, un salon plein ou mon propre salon, **alors** un message d'erreur explicite s'affiche.
3. La saisie accepte les minuscules (converties en majuscules).
4. **Quand** l'invité rejoint, **alors** l'hôte voit son pseudo apparaître **sans recharger** (Supabase Realtime sur `rooms`).

#### US-12 — Lancer le duel · M · 3 pts
**En tant qu'**hôte du salon,
**je veux** lancer la partie quand mon adversaire est là,
**afin que** le combat commence pour nous deux en même temps.

**Critères d'acceptation**
1. Le bouton « Lancer » n'est actif **que pour l'hôte** et **que si** un invité est présent.
2. `POST /api/match/start` crée un `matches` avec une seed, deux **équipes de 3 monstres tirées au hasard** et `phase = 'battle'`, puis passe le salon en `playing`.
3. **Quand** le match est créé, **alors** les deux navigateurs basculent automatiquement sur l'écran de combat en ligne (Realtime).
4. Chaque joueur voit **sa** propre équipe en bas à gauche.

#### US-13 — Jouer un tour en ligne · M · 8 pts
**En tant que** joueur en duel,
**je veux** choisir mon action en secret en même temps que mon adversaire,
**afin que** personne ne puisse réagir au choix de l'autre ni tricher.

**Critères d'acceptation**
1. **Quand** je valide une action, **alors** `POST /api/match/action` vérifie le JWT, que je joue ce match, la phase, le numéro de tour et la validité de l'action, puis l'enregistre dans `match_actions`.
2. Une deuxième action pour le même tour est refusée ; une action invalide renvoie **400** sans rien enregistrer.
3. Après mon choix, j'affiche « En attente de l'adversaire… » ; je **ne peux pas** lire l'action de l'adversaire (RLS + `match_actions` hors Realtime).
4. **Quand** les deux actions sont reçues, **alors** le serveur exécute `resolveTurn`, met à jour `matches.state`, `last_events`, `turn`, `version`, et archive le tour dans `match_turns`.
5. **Quand** `matches` est mis à jour, **alors** les deux clients reçoivent l'événement Realtime et rejouent les **mêmes** animations.
6. Deux envois simultanés ne résolvent jamais le même tour deux fois (contrôle par `version` ou `turn`).

#### US-14 — Voir le résultat du duel · M · 1 pt
**En tant que** joueur en duel,
**je veux** savoir clairement qui a gagné,
**afin de** terminer la partie proprement.

**Critères d'acceptation**
1. **Quand** une équipe est entièrement KO, **alors** le serveur passe le match en `finished`, renseigne `winner_id` et passe le salon en `finished`.
2. Chaque joueur voit « Victoire » ou « Défaite » avec le pseudo de l'adversaire.
3. Un bouton ramène au menu principal.

---

### 🗺️ Sprint 4 — Boucle roguelike et finitions

#### US-15 — Choisir un starter · M · 2 pts
**En tant que** joueur solo,
**je veux** choisir mon premier monstre parmi 3,
**afin de** commencer la run avec le style de jeu qui me plaît.

**Critères d'acceptation**
1. L'écran propose Salamandre, Ondine et Champignon avec sprite, élément et stats.
2. **Quand** je valide un starter, **alors** une run démarre avec une nouvelle seed et ce monstre comme seul membre de l'équipe.
3. Je ne peux pas lancer la run sans avoir choisi.

#### US-16 — Enchaîner les vagues · M · 3 pts
**En tant que** joueur solo,
**je veux** affronter des vagues d'ennemis de plus en plus fortes,
**afin de** voir jusqu'où je peux descendre.

**Critères d'acceptation**
1. Les vagues suivent [01 §6.1](../01-GAME-DESIGN.md#61-vagues) : 1 commun (niveau `3 + vague`) jusqu'à la vague 4, puis 2 monstres à partir de la vague 6 ; sans boss, la vague 5 (et 10, 15…) oppose 2 communs de niveau `4 + vague`.
2. Le tirage des ennemis utilise la seed de la run (même seed = mêmes ennemis).
3. Entre deux vagues, toute l'équipe récupère **20 % de ses PV max** (sans dépasser le max).
4. Le numéro de vague est affiché pendant le combat.

#### US-17 — Choisir une récompense · M · 5 pts
**En tant que** joueur solo,
**je veux** choisir une récompense parmi 3 après chaque vague gagnée,
**afin de** renforcer mon équipe à ma façon.

**Critères d'acceptation**
1. Après une victoire, 3 récompenses **différentes** sont tirées selon les poids de [01 §6.2](../01-GAME-DESIGN.md#62-récompenses-1-au-choix-parmi-3), avec la seed de la run.
2. Potion (+50 % PV max à toute l'équipe) et Élixir (recharge tous les PP) s'appliquent immédiatement.
3. Entraînement et Parchemin demandent de choisir le monstre concerné (et, pour le Parchemin, la compétence remplacée).
4. Recrutement ajoute un monstre de l'espèce vaincue ; si l'équipe compte déjà **4** monstres, je choisis celui qu'il remplace.
5. Chaque effet est couvert par un test Vitest dans `shared/engine/run.ts`.

#### US-18 — Fin de run et score · M · 3 pts
**En tant que** joueur solo,
**je veux** voir mon score quand mon équipe est vaincue,
**afin de** mesurer ma progression et essayer de faire mieux.

**Critères d'acceptation**
1. **Quand** toute l'équipe est KO, **alors** l'écran de fin affiche la vague atteinte et le score `vague × 100 + PV restants`.
2. Le score est enregistré dans `solo_runs` avec `user_id`, `wave_reached`, `score` et `team`.
3. Les boutons « Rejouer » et « Menu » fonctionnent.
4. Un joueur ne peut pas insérer une run au nom d'un autre (RLS).

#### US-19 — Écran des crédits · M · 2 pts
**En tant que** joueur ou enseignant,
**je veux** voir qui a fait le jeu et d'où viennent les assets,
**afin de** respecter les auteurs et les licences.

**Critères d'acceptation**
1. L'écran liste les membres de l'équipe et leur rôle Scrum.
2. Chaque pack d'assets et la police sont cités avec auteur, lien et licence, comme dans `CREDITS.md`.
3. L'écran est accessible depuis le menu principal et propose un retour.

#### US-20 — Abandonner un duel · S · 2 pts
**En tant que** joueur en duel,
**je veux** pouvoir abandonner,
**afin de** quitter une partie perdue sans bloquer mon adversaire.

**Critères d'acceptation**
1. Le bouton « Abandonner » demande une confirmation.
2. `POST /api/match/forfeit` termine le match et désigne l'adversaire comme vainqueur.
3. L'adversaire voit « Victoire par abandon » via Realtime.

---

### 📦 Réserve (Should / Could, non planifiées)

#### US-21 — Draft de l'équipe en duel · S · 5 pts
**En tant que** joueur en duel, **je veux** choisir 3 monstres parmi 6 tirés au hasard, **afin de** composer une équipe qui me ressemble.
1. Chaque joueur reçoit 6 propositions (`draftOffers`) et en garde exactement 3.
2. Les deux joueurs choisissent en même temps ; ils ne voient pas le choix de l'autre avant la fin du draft.
3. **Quand** les deux drafts sont reçus, **alors** `POST /api/match/draft` crée les équipes et passe en `battle`.

#### US-22 — Timeout de tour · S · 5 pts
**En tant que** joueur en duel, **je veux** qu'un tour ne puisse pas durer indéfiniment, **afin de** ne pas être bloqué par un adversaire absent.
1. Un compte à rebours visible (basé sur `turn_deadline`) s'affiche pendant le choix.
2. À l'expiration, `POST /api/match/timeout` joue une action automatique (`is_auto = true`) pour le joueur absent.
3. Après plusieurs timeouts consécutifs (nombre à fixer), le joueur absent perd par forfait.

#### US-23 — Reconnexion après un rafraîchissement · S · 3 pts
**En tant que** joueur en duel, **je veux** retrouver mon match si je recharge la page, **afin de** ne pas perdre la partie à cause d'une fausse manipulation.
1. Au chargement, le client cherche un match non terminé dont je suis joueur et me propose de le reprendre.
2. L'état affiché est celui de `matches.state`, sans rejouer les anciennes animations.
3. Si j'avais déjà choisi mon action pour le tour en cours, l'écran d'attente s'affiche.

#### US-24 — Duel en 3 manches (BO3) · C · 8 pts
**En tant que** joueur en duel, **je veux** jouer en 2 manches gagnantes avec des récompenses entre les manches, **afin de** pouvoir renverser la partie.
1. `roundWins` est affiché ; le premier à 2 manches gagne le match.
2. Entre les manches, les équipes sont soignées et chaque joueur choisit une récompense (le perdant de la manche choisit parmi 4 au lieu de 3).

#### US-25 — Affronter un boss · C · 3 pts
**En tant que** joueur solo, **je veux** affronter un boss toutes les 5 vagues, **afin de** vivre des moments forts dans la run.
1. Les vagues 5, 10, 15… opposent un boss (Démon mineur ou Liche) de niveau `4 + vague`.
2. Le boss est signalé à l'écran avant le combat.

#### US-26 — Consulter le classement · C · 3 pts
**En tant que** joueur, **je veux** voir les meilleurs scores, **afin de** me comparer aux autres.
1. La page Classement lit la vue `leaderboard` (top 20 : pseudo, meilleur score, meilleure vague).
2. Ma ligne est mise en évidence si j'y figure.

#### US-27 — Choisir le remplaçant après un KO · C · 3 pts
**En tant que** joueur, **je veux** choisir quel monstre remplace celui qui est KO, **afin de** profiter des avantages d'élément.
1. Après un KO, une sélection des monstres en vie s'affiche au lieu du remplacement automatique.
2. En duel, le choix passe par l'API, en secret comme une action normale.

#### US-28 — Statuts brûlure et poison · C · 5 pts
**En tant que** joueur, **je veux** des effets de statut, **afin que** les combats soient plus tactiques.
1. La brûlure et le poison infligent des dégâts en fin de tour (valeurs à définir dans `shared/data/`).
2. Le statut est visible à côté de la barre de PV et testé dans Vitest.

#### US-29 — Musique et effets sonores · C · 3 pts
**En tant que** joueur, **je veux** entendre une musique et des sons d'attaque, **afin d'**être plus immergé.
1. Musique de menu et de combat, sons de coup et de KO, en licence redistribuable créditée.
2. Un bouton coupe le son et le réglage est mémorisé.

#### US-30 — Jouer sur mobile · C · 5 pts
**En tant que** joueur sur téléphone, **je veux** une interface utilisable au doigt, **afin de** jouer n'importe où.
1. Les menus et le menu d'actions sont lisibles et cliquables à partir de 360 px de large.
2. Le canvas s'adapte à l'écran en mode paysage.

---

## 6. Planning Poker *(à compléter par l'équipe)*

| ID | Proposition | Votes du 1er tour | Votes du 2e tour | Estimation retenue | Remarque |
|---|---|---|---|---|---|
| US-01 | 3 | | | | |
| US-02 | 2 | | | | |
| US-03 | 5 | | | | |
| US-04 | 8 | | | | |
| US-05 | 3 | | | | |
| US-06 | 5 | | | | |
| US-07 | 5 | | | | |
| US-08 | 2 | | | | |
| US-09 | 3 | | | | |
| US-10 | 3 | | | | |
| US-11 | 3 | | | | |
| US-12 | 3 | | | | |
| US-13 | 8 | | | | |
| US-14 | 1 | | | | |
| US-15 | 2 | | | | |
| US-16 | 3 | | | | |
| US-17 | 5 | | | | |
| US-18 | 3 | | | | |
| US-19 | 2 | | | | |
| US-20 | 2 | | | | |
| US-21 → US-30 | voir tableau §4 | | | | |

> Règle : chacun révèle sa carte en même temps. En cas d'écart, le vote le plus bas et le plus haut s'expliquent, puis on revote. Si une US dépasse 8 points, on la découpe.

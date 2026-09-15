# Product Backlog — Rogue Arena

> Tenu par le **Product Owner**. Priorités **MoSCoW** (Must / Should / Could / Won't).
> Les estimations indiquées sont une **proposition de départ** : l'équipe doit les **rejouer en Planning Poker** (§4) et remplacer la colonne par ses propres valeurs.

## 1. Definition of Ready (DoR)

Une user story peut entrer dans un sprint si :

- [ ] Elle est rédigée au format **« En tant que… Je veux… Afin de… »**.
- [ ] Ses **critères d'acceptation** sont écrits et compris par toute l'équipe.
- [ ] Elle est **estimée** en Planning Poker (Fibonacci).
- [ ] Elle fait **8 points maximum** ; sinon elle est découpée.
- [ ] Ses **dépendances** sont terminées ou prévues dans le même sprint.
- [ ] Les **assets** nécessaires (sprites, sons) sont identifiés, avec une licence vérifiée.
- [ ] Le PO sait comment la **démontrer** en Sprint Review.

## 2. Definition of Done (DoD)

Une user story est terminée si :

- [ ] Tous ses **critères d'acceptation** sont vérifiés et **validés par le PO**.
- [ ] Le code est sur `main` via une **PR relue** par au moins 1 autre personne.
- [ ] `npm run build` passe, sans erreur TypeScript.
- [ ] `npx vitest run` passe ; toute nouvelle règle de `shared/` a son test.
- [ ] La fonctionnalité est **testée sur le déploiement Vercel** (preview ou production), pas seulement en local.
- [ ] Le multijoueur (s'il est concerné) est testé sur **2 navigateurs** distincts.
- [ ] Aucun secret commité ; `.env.example` est à jour.
- [ ] `CREDITS.md` est à jour si un asset a été ajouté.
- [ ] Le fichier `SPRINT-N.md` mentionne l'US comme terminée.

## 3. Vue d'ensemble

| ID | Epic | User story (résumé) | MoSCoW | Estim. proposée | Estim. équipe | Sprint |
|---|---|---|---|---|---|---|
| US-01 | Socle | Projet en ligne sur Vercel | Must | 3 | | 1 |
| US-02 | Socle | Supabase configuré (schéma + RLS) | Must | 3 | | 1 |
| US-03 | Moteur | Attaquer avec des compétences et des éléments | Must | 5 | | 1 |
| US-05 | Moteur | Ordre d'action par priorité et vitesse | Must | 2 | | 1 |
| US-06 | Moteur | KO, remplacement, victoire/défaite | Must | 3 | | 1 |
| US-24 | Contenu | Écran titre et menu principal | Must | 2 | | 1 |
| US-07 | Interface combat | Scène de combat avec sprites et barres de PV | Must | 5 | | 2 |
| US-08 | Interface combat | Menu de choix d'action | Must | 3 | | 2 |
| US-04 | Moteur | Changer de monstre actif | Should | 3 | | 2 |
| US-10 | Solo | Choisir un starter | Must | 2 | | 2 |
| US-11 | Solo | Enchaîner des vagues contre l'IA | Must | 5 | | 2 |
| US-15 | Comptes | Se connecter avec un pseudo | Must | 3 | | 3 |
| US-16 | Multijoueur | Créer un salon avec un code | Must | 3 | | 3 |
| US-17 | Multijoueur | Rejoindre un salon avec un code | Must | 3 | | 3 |
| US-19 | Multijoueur | Jouer un combat en ligne tour par tour | Must | 8 | | 3 |
| US-23 | Multijoueur | Abandonner un duel | Should | 1 | | 3 |
| US-12 | Solo | Choisir une récompense après chaque vague | Must | 5 | | 4 |
| US-09 | Interface combat | Animations et textes de combat | Should | 5 | | *backlog* (bonus S4) |
| US-20 | Multijoueur | Timeout de tour | Should | 3 | | 4 |
| US-21 | Multijoueur | Reprendre une partie après un rafraîchissement | Should | 3 | | 4 |
| US-26 | Contenu | Écran des crédits | Must | 1 | | 4 |
| US-14 | Solo | Score et classement | Should | 3 | | *backlog* |
| US-18 | Multijoueur | Draft d'équipe en duel | Should | 5 | | *backlog* |
| US-13 | Solo | Boss toutes les 5 vagues | Could | 3 | | *backlog* |
| US-22 | Multijoueur | Duel en 3 manches avec récompenses | Could | 5 | | *backlog* |
| US-25 | Contenu | Musique, sons et volume | Could | 3 | | *backlog* |
| US-27 | Contenu | Jouable sur mobile | Could | 3 | | *backlog* |
| US-28 | Moteur | Statuts (brûlure, poison) | Could | 5 | | *backlog* |
| — | — | Matchmaking automatique, chat, 3+ joueurs | Won't | — | — | — |

**Total proposé** : 98 points, dont 56 en Must. Engagement prévu : 18, 18, 18 puis 12 points (sprint 4 raccourci par le rendu de 13h30 ; US-09 en objectif bonus).

## 4. Planning Poker

### Règles
1. Le PO lit l'US et ses critères ; l'équipe pose ses questions (2 min max).
2. Chacun choisit une carte **en secret** : `1, 2, 3, 5, 8, 13, 21` (+ `?` et ☕).
3. Tout le monde révèle en même temps.
4. Si les écarts sont grands, **la personne la plus basse et la plus haute s'expliquent**, puis on revote (2 tours max).
5. Pas de consensus au 3ᵉ vote → on retient la valeur la plus fréquente. **13 ou 21 → découper l'US.**
6. Référence : **US-05 (ordre d'action) = 2 points**.

### Journal des votes *(à compléter pendant la séance)*

| US | Tour 1 (votes) | Tour 2 (votes) | Estimation retenue | Remarque |
|---|---|---|---|---|
| US-01 | | | | |
| US-02 | | | | |
| US-03 | | | | |
| … | | | | |

📸 `![Planning Poker](./captures/planning-poker.png)`

## 5. User stories détaillées

Format des critères : **Étant donné** (contexte) / **Quand** (action) / **Alors** (résultat).

---

### Epic 1 — Socle technique

#### US-01 — Projet en ligne sur Vercel · Must · 3 pts
**En tant que** membre de l'équipe, **je veux** un projet React + TypeScript + Phaser déployé automatiquement sur Vercel **afin de** pouvoir tester chaque changement en ligne et le montrer au PO.

- **CA1** : Étant donné un push sur `main`, quand le build Vercel se termine, alors l'URL de production affiche la page d'accueil.
- **CA2** : Étant donné une PR ouverte, quand Vercel la construit, alors une URL de preview est commentée sur la PR.
- **CA3** : Étant donné l'URL `/n-importe-quelle-route`, quand je rafraîchis la page, alors l'application se charge (pas de 404).
- **CA4** : Un canvas Phaser de 480×270 s'affiche, mis à l'échelle sans flou.

#### US-02 — Supabase configuré · Must · 3 pts
**En tant que** développeur, **je veux** une base Supabase avec le schéma, la RLS et le Realtime **afin de** stocker les joueurs et les parties de façon sécurisée.

- **CA1** : La migration `001_init.sql` s'exécute sans erreur sur un projet vide.
- **CA2** : Étant donné un utilisateur A, quand il fait `select` sur `matches`, alors il ne voit que les matchs dont il est joueur.
- **CA3** : Étant donné un client connecté, quand il tente un `insert` dans `matches`, alors la requête est refusée.
- **CA4** : Les variables d'environnement sont configurées sur Vercel et documentées dans `.env.example`.

---

### Epic 2 — Moteur de combat

#### US-03 — Attaquer avec des compétences · Must · 5 pts
**En tant que** joueur, **je veux** que mon monstre utilise une compétence qui inflige des dégâts selon les stats et les éléments **afin de** rendre mes choix tactiques décisifs.

- **CA1** : Étant donné une Salamandre (feu) contre un Champignon (nature), quand elle utilise Boule de feu, alors l'événement `damage` indique `effectiveness = 2`.
- **CA2** : Les dégâts suivent la formule de [06 §5](../06-MOTEUR-DE-COMBAT.md#5-dégâts) et valent au minimum 1.
- **CA3** : Étant donné une compétence avec des PP limités, quand elle est utilisée, alors ses PP baissent de 1 ; à 0 PP elle est refusée par `validateAction`.
- **CA4** : Étant donné la même seed et les mêmes actions, quand on résout deux fois le tour, alors le résultat est identique (test Vitest).

#### US-05 — Ordre d'action · Must · 2 pts
**En tant que** joueur, **je veux** que le monstre le plus rapide agisse en premier **afin de** faire de la vitesse une vraie statistique stratégique.

- **CA1** : Changement de monstre > compétence prioritaire > compétence normale.
- **CA2** : À priorité égale, la VIT la plus haute agit en premier.
- **CA3** : À VIT égale, l'ordre est tiré au hasard avec le RNG du tour.
- **CA4** : Un monstre mis KO avant son action n'agit pas.

#### US-06 — KO et fin de combat · Must · 3 pts
**En tant que** joueur, **je veux** que mes monstres KO soient remplacés et que le combat se termine quand une équipe est vaincue **afin de** savoir clairement qui a gagné chaque combat.

- **CA1** : Étant donné un monstre à 0 PV, alors un événement `faint` est émis.
- **CA2** : En fin de tour, le monstre actif KO est remplacé par le premier monstre en vie (`switch` avec `forced: true`).
- **CA3** : Quand tous les monstres d'une équipe sont KO, alors `winnerSeat` désigne l'autre joueur et un événement `battle_end` termine la liste.

#### US-04 — Changer de monstre · Should · 3 pts
**En tant que** joueur, **je veux** remplacer mon monstre actif pendant mon tour **afin d'**éviter un désavantage d'élément.

- **CA1** : Le bouton « Changer » liste les monstres en vie autres que le monstre actif.
- **CA2** : Le changement a lieu avant les compétences de l'adversaire, qui touchent donc le nouveau monstre.
- **CA3** : Un changement vers un monstre KO ou déjà actif est refusé.

#### US-28 — Statuts · Could · 5 pts
**En tant que** joueur, **je veux** des effets de statut (brûlure, poison) **afin d'**avoir plus de profondeur tactique.

- **CA1** : Un monstre brûlé perd 1/16 de ses PV max en fin de tour et son ATQ est réduite de moitié.
- **CA2** : Un monstre empoisonné perd 1/8 de ses PV max en fin de tour.
- **CA3** : Le statut est affiché à côté de la barre de PV.

---

### Epic 3 — Interface de combat

#### US-07 — Scène de combat · Must · 5 pts
**En tant que** joueur, **je veux** voir mon monstre et celui de l'ennemi avec leurs barres de PV **afin de** comprendre la situation du combat.

- **CA1** : Le monstre ennemi est affiché en haut à droite et le mien en bas à gauche, face à face.
- **CA2** : Chaque monstre a un encadré : nom, niveau, icône d'élément, barre de PV (verte > 50 %, jaune > 20 %, rouge sinon).
- **CA3** : Les sprites sont nets (`pixelArt: true`) sur un écran 1080p.
- **CA4** : Un fond de décor est affiché.

#### US-08 — Menu d'actions · Must · 3 pts
**En tant que** joueur, **je veux** choisir une compétence ou un changement dans un menu **afin de** jouer mon tour.

- **CA1** : Le menu affiche les compétences du monstre actif avec leur élément (couleur) et leurs PP.
- **CA2** : Les actions impossibles (0 PP) sont grisées.
- **CA3** : Le menu est masqué pendant la résolution et réapparaît après l'animation.
- **CA4** : Le menu est utilisable à la souris et au clavier (flèches + Entrée).

#### US-09 — Animations et textes · Should · 5 pts
**En tant que** joueur, **je veux** voir les attaques animées et lire ce qui se passe **afin de** suivre un combat vivant et compréhensible.

- **CA1** : Chaque événement est rejoué dans l'ordre : texte « X utilise Y ! », flash du monstre touché, barre de PV qui descend progressivement.
- **CA2** : « C'est super efficace ! », « Ce n'est pas très efficace… » et « Coup critique ! » s'affichent quand c'est le cas.
- **CA3** : Un monstre KO disparaît avec une animation (fondu + descente).
- **CA4** : L'animation complète d'un tour dure moins de 4 secondes.

---

### Epic 4 — Mode solo roguelike

#### US-10 — Choisir un starter · Must · 2 pts
**En tant que** joueur solo, **je veux** choisir mon premier monstre parmi 3 **afin de** commencer ma run avec une stratégie.

- **CA1** : Salamandre, Ondine et Champignon sont proposés avec sprite, élément et stats.
- **CA2** : Quand je valide, une run démarre avec ce monstre au niveau 5.

#### US-11 — Vagues contre l'IA · Must · 5 pts
**En tant que** joueur solo, **je veux** affronter des vagues d'ennemis de plus en plus forts **afin de** progresser dans la run.

- **CA1** : La vague N oppose un ennemi de niveau `3 + N`, tiré avec la seed de la run.
- **CA2** : L'IA choisit ses actions avec `chooseAiAction` ; elle ne joue jamais une action invalide.
- **CA3** : Quand je gagne, le numéro de vague augmente et mon équipe récupère 20 % de ses PV max.
- **CA4** : Quand toute mon équipe est KO, l'écran « Fin de run » affiche la vague atteinte.

#### US-12 — Récompenses · Must · 5 pts
**En tant que** joueur solo, **je veux** choisir une récompense parmi 3 après chaque vague **afin de** renforcer mon équipe à ma façon.

- **CA1** : 3 récompenses différentes sont tirées selon les poids de [01 §6.2](../01-GAME-DESIGN.md#62-récompenses-1-au-choix-parmi-3).
- **CA2** : L'effet de la récompense choisie est appliqué et visible (PV, niveau, nouveau monstre…).
- **CA3** : « Recrutement » avec une équipe de 4 demande quel monstre remplacer.
- **CA4** : Une même seed de run donne les mêmes propositions.

#### US-13 — Boss · Could · 3 pts
**En tant que** joueur solo, **je veux** affronter un boss toutes les 5 vagues **afin d'**avoir des moments forts dans la run.

- **CA1** : Aux vagues 5, 10, 15…, l'ennemi est un Démon mineur ou une Liche, au niveau `4 + N`.
- **CA2** : Une bannière « BOSS » s'affiche avant le combat.

#### US-14 — Score et classement · Should · 3 pts
**En tant que** joueur, **je veux** voir mon score et le top 20 **afin de** me comparer aux autres.

- **CA1** : En fin de run, le score est calculé et enregistré dans `solo_runs`.
- **CA2** : La page Classement affiche le meilleur score et la meilleure vague de chaque pseudo, triés par score.

---

### Epic 5 — Comptes

#### US-15 — Pseudo · Must · 3 pts
**En tant que** joueur, **je veux** entrer seulement un pseudo pour jouer **afin de** commencer sans créer de compte.

- **CA1** : Quand je saisis un pseudo de 3 à 20 caractères et valide, une session anonyme Supabase est créée et mon profil enregistré.
- **CA2** : Un pseudo déjà pris affiche « Ce pseudo est déjà utilisé ».
- **CA3** : Quand je rafraîchis la page, je suis toujours connecté avec le même pseudo.

---

### Epic 6 — Multijoueur

#### US-16 — Créer un salon · Must · 3 pts
**En tant que** joueur, **je veux** créer un salon et obtenir un code **afin d'**inviter un ami.

- **CA1** : Quand je clique sur « Créer un salon », un code de 6 caractères s'affiche avec un bouton « Copier ».
- **CA2** : Quand un joueur rejoint, son pseudo apparaît en moins de 2 secondes, sans rafraîchir.
- **CA3** : Le bouton « Lancer le duel » n'est actif que pour l'hôte, quand 2 joueurs sont présents.

#### US-17 — Rejoindre un salon · Must · 3 pts
**En tant que** joueur, **je veux** rejoindre un salon avec un code **afin de** jouer contre mon ami.

- **CA1** : Un code valide me fait entrer dans le salon, où je vois le pseudo de l'hôte.
- **CA2** : Un code inconnu affiche « Aucun salon avec ce code ».
- **CA3** : Un salon complet affiche « Ce salon est déjà complet ».
- **CA4** : La saisie ignore la casse et les espaces.

#### US-19 — Combat en ligne · Must · 8 pts
**En tant que** joueur, **je veux** affronter un autre joueur au tour par tour en temps réel **afin de** jouer à deux à distance.

- **CA1** : Étant donné un duel lancé, alors les 2 joueurs voient les 2 équipes (3 monstres de niveau 10 tirés au hasard) et le même état.
- **CA2** : Quand je choisis une action, elle est envoyée à `/api/match/action`, et « En attente de l'adversaire… » s'affiche.
- **CA3** : Quand les 2 actions sont reçues, le serveur résout le tour et les 2 écrans rejouent **les mêmes événements** en moins de 2 secondes.
- **CA4** : Une action invalide, pour un tour dépassé, ou envoyée par un non-joueur est refusée avec le bon code d'erreur ([doc 05](../05-API.md#2-codes-derreur)).
- **CA5** : Un double-clic n'enregistre qu'une seule action.
- **CA6** : À la fin, un écran Victoire ou Défaite s'affiche pour chaque joueur, avec un bouton « Retour au menu ».

#### US-23 — Abandonner · Should · 1 pt
**En tant que** joueur, **je veux** abandonner un duel **afin de** quitter proprement une partie perdue.

- **CA1** : Le bouton « Abandonner » demande une confirmation.
- **CA2** : Après confirmation, l'adversaire voit « Victoire par abandon ».

#### US-20 — Timeout de tour · Should · 3 pts
**En tant que** joueur, **je veux** que le tour se joue automatiquement si mon adversaire ne répond pas **afin de** ne pas rester bloqué.

- **CA1** : Un compte à rebours de 60 s est visible pendant le choix.
- **CA2** : À 0, l'action par défaut est jouée pour le joueur absent et le tour est résolu.
- **CA3** : Un appel à `/api/match/timeout` avant la deadline renvoie `409 TOO_EARLY`.

#### US-21 — Reconnexion · Should · 3 pts
**En tant que** joueur, **je veux** retrouver ma partie après un rafraîchissement **afin de** ne pas perdre un duel à cause d'une erreur de manipulation.

- **CA1** : Quand je rafraîchis la page du match, l'état actuel s'affiche (bons PV, bon tour), sans rejouer d'animation.
- **CA2** : Si j'avais déjà joué ce tour, je vois « En attente de l'adversaire… ».
- **CA3** : Depuis le menu, un bouton « Reprendre la partie » apparaît si j'ai un match non terminé.

#### US-18 — Draft · Should · 5 pts
**En tant que** joueur, **je veux** choisir 3 monstres parmi 6 avant le duel **afin de** construire mon équipe.

- **CA1** : Chaque joueur voit 6 propositions (tirées avec la seed du match) et en sélectionne exactement 3.
- **CA2** : Le choix de l'adversaire n'est révélé qu'au début du combat.
- **CA3** : Quand les 2 drafts sont validés, le combat démarre automatiquement.

#### US-22 — Duel en 3 manches · Could · 5 pts
**En tant que** joueur, **je veux** un duel en 2 manches gagnantes avec des récompenses entre les manches **afin de** retrouver la progression roguelike en multijoueur.

- **CA1** : Le score de manches (ex. 1–0) est affiché.
- **CA2** : Entre deux manches, chacun choisit une récompense (4 choix pour le perdant, 3 pour le gagnant) et les équipes sont soignées.
- **CA3** : Le premier à 2 manches gagne le duel.

---

### Epic 7 — Contenu et finitions

#### US-24 — Écran titre et menu · Must · 2 pts
**En tant que** joueur, **je veux** un écran titre et un menu clair **afin d'**accéder facilement aux modes de jeu.

- **CA1** : L'écran titre affiche le logo et « Appuyer pour commencer ».
- **CA2** : Le menu propose Solo, Multijoueur, Classement et Crédits ; chaque bouton mène à sa page (même vide).

#### US-26 — Crédits · Must · 1 pt
**En tant qu'**artiste dont les assets sont utilisés, **je veux** être crédité dans le jeu **afin de** voir mon travail reconnu et ma licence respectée.

- **CA1** : La page Crédits reprend tout le contenu de `docs/CREDITS.md` (auteur, lien, licence).

#### US-25 — Audio · Could · 3 pts
**En tant que** joueur, **je veux** de la musique et des effets sonores réglables **afin d'**être plus immergé.

- **CA1** : Une musique de menu et une musique de combat tournent en boucle.
- **CA2** : Un son est joué à chaque coup reçu et à chaque KO.
- **CA3** : Un réglage de volume (0–100 %) est mémorisé dans le `localStorage`.

#### US-27 — Mobile · Could · 3 pts
**En tant que** joueur sur téléphone, **je veux** jouer en mode paysage **afin de** jouer n'importe où.

- **CA1** : Le canvas et le menu d'actions tiennent sur un écran de 390×844 en paysage.
- **CA2** : Les boutons font au moins 44 px de haut.

# Product Backlog — Dark Dungeon Fantasy Boss battle

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
- [ ] La fonctionnalité est **testée sur le déploiement Render** (preview ou production), pas seulement en local.
- [ ] Le multijoueur (s'il est concerné) est testé sur **2 navigateurs** distincts.
- [ ] Aucun secret commité ; `.env.example` est à jour.
- [ ] `CREDITS.md` est à jour si un asset a été ajouté.
- [ ] Le fichier `SPRINT-N.md` mentionne l'US comme terminée.

## 3. Vue d'ensemble

| ID | Epic | User story (résumé) | MoSCoW | Estim. proposée | Estim. équipe | Sprint |
|---|---|---|---|---|---|---|
| US-01 | Socle | Projet en ligne sur Render | Must | 3 | **3** | 1 |
| US-02 | Socle | Supabase configuré (schéma + RLS) | Must | 3 | **3** | 1 |
| US-03 | Moteur | Attaquer avec des compétences et des éléments | Must | 5 | **5** | 1 |
| US-05 | Moteur | Ordre d'action par priorité et vitesse | Must | 2 | **2** | 1 |
| US-06 | Moteur | KO, remplacement, victoire/défaite | Must | 3 | **3** | 1 |
| US-24 | Contenu | Écran titre et menu principal | Must | 2 | **2** | 1 |
| US-07 | Interface combat | Scène de combat avec sprites et barres de PV | Must | 5 | **5** | 2 |
| US-08 | Interface combat | Menu de choix d'action | Must | 3 | **3** | 2 |
| US-04 | Moteur | Changer de monstre actif | Should | 3 | **3** | 2 |
| US-10 | Solo | Choisir un starter | Must | 2 | **2** | 2 |
| US-11 | Solo | Enchaîner des vagues contre l'IA | Must | 5 | **5** | 2 |
| US-15 | Comptes | Se connecter avec un pseudo | Must | 3 | **3** | 3 |
| US-16 | Multijoueur | Créer un salon avec un code | Must | 3 | **3** | 3 |
| US-17 | Multijoueur | Rejoindre un salon avec un code | Must | 3 | **3** | 3 |
| US-19 | Multijoueur | Jouer un combat en ligne tour par tour | Must | 8 | **8** | 3 |
| US-23 | Multijoueur | Abandonner un duel | Should | 1 | **1** | 3 |
| US-12 | Solo | Choisir une récompense après chaque vague | Must | 5 | **5** | 4 |
| US-09 | Interface combat | Animations et textes de combat | Should | 5 | **5** | 4 (bonus, ✅ livré pendant le sprint) |
| US-20 | Multijoueur | Timeout de tour | Should | 3 | **3** | 4 |
| US-21 | Multijoueur | Reprendre une partie après un rafraîchissement | Should | 3 | **3** | 4 |
| US-26 | Contenu | Écran des crédits | Must | 1 | **1** | 4 |
| US-14 | Solo | Score et classement | Should | 3 | *3 (à rejouer)* | *backlog* (bonus hors sprint, ✅ livré le 17/09 après le rendu) |
| US-18 | Multijoueur | Draft d'équipe en duel | Should | 5 | **5** | *backlog* (bonus S4, ✅ livré le 16/09) |
| US-13 | Solo | Boss toutes les 5 vagues, avec butin de boss | Could | 3 | *3 (à rejouer)* | 4 (bonus, ✅ livré le 17/09) |
| US-22 | Multijoueur | Duel en 3 manches avec récompenses | Could | 5 | | *backlog* |
| US-25 | Contenu | Musique, sons et volume | Could | 3 | *3 (à rejouer)* | *backlog* (bonus hors sprint, 🟡 musique de combat livrée le 17/09 ; sons et volume restants) |
| US-27 | Contenu | Jouable sur mobile | Could | 3 | | *backlog* |
| US-28 | Moteur | Statuts (brûlure, poison) | Could | 5 | | *backlog* |
| US-29 | Contenu | Bestiaire étendu (20 espèces) | Could | 3 | **3** | *backlog* (bonus S4, ✅ livré le 16/09) |
| US-30 | Moteur | Choisir le monstre qui remplace un KO (solo et duel) | Should | 5 | *5 (à rejouer)* | 4 (bonus, ✅ livré le 17/09) |
| US-31 | Solo | Rareté des monstres selon leur puissance (apparition et butin) | Should | 5 | *5 (à rejouer)* | 4 (bonus, ✅ livré le 17/09) |
| US-32 | Contenu | 5 nouveaux monstres (25 espèces) | Could | 3 | *3 (à rejouer)* | 4 (bonus, ✅ livré le 17/09) |
| US-33 | Solo | Abandonner une run solo | Should | 1 | *1 (à rejouer)* | 4 (bonus, ✅ livré le 17/09) |
| US-34 | Solo | Garder l'ordre de l'équipe d'une vague à l'autre | Should | 1 | *1 (à rejouer)* | 4 (bonus, ✅ livré le 17/09) |
| US-35 | Moteur | 3 compétences et la Frappe pour chaque monstre | Should | 2 | *2 (à rejouer)* | *backlog* (bonus hors sprint, ✅ livré le 17/09 après le rendu) |
| US-36 | Solo | Gagner un niveau en mettant un ennemi KO | Should | 3 | *3 (à rejouer)* | *backlog* (bonus hors sprint, ✅ livré le 17/09 après le rendu) |
| US-37 | Solo | Parchemin : voir la compétence et choisir celle à oublier | Should | 2 | *2 (à rejouer)* | *backlog* (bonus hors sprint, ✅ livré le 17/09 après le rendu) |
| US-38 | Moteur | Rééquilibrer la DEF du Golem de pierre | Could | 1 | *1 (à rejouer)* | *backlog* (bonus hors sprint, ✅ livré le 17/09 après le rendu) |
| US-39 | Moteur | +25 % de PP sur les attaques | Could | 1 | *1 (à rejouer)* | *backlog* (bonus hors sprint, ✅ livré le 17/09 après le rendu) |
| US-40 | Moteur | Compétences de boost d'attaque | Should | 3 | *3 (à rejouer)* | *backlog* (bonus hors sprint, ✅ livré le 17/09 après le rendu) |
| US-41 | Contenu | Évolutions des starters et des monstres communs | Could | 5 | *5 (à rejouer)* | *backlog* (bonus hors sprint, ✅ livré le 17/09 après le rendu) |
| US-42 | Solo | Recrutement plus fréquent, garanti une vague sur deux | Should | 1 | *1 (à rejouer)* | *backlog* (bonus hors sprint, ✅ livré le 17/09 après le rendu) |
| US-43 | Contenu | Jouer entièrement au clavier | Should | 3 | *3 (à rejouer)* | *backlog* (bonus hors sprint, ✅ livré le 17/09 après le rendu) |
| US-44 | Multijoueur | Revanche sans recréer de salon | Should | 3 | *3 (à rejouer)* | *backlog* (bonus hors sprint, ✅ livré le 17/09 après le rendu) |
| — | — | Matchmaking automatique, chat, 3+ joueurs | Won't | — | — | — |

**Total proposé** : 140 points, dont 56 en Must (US-30 à US-34 ajoutées le 17/09 par le PO, 15 points ; US-35 à US-44 ajoutées le 17/09 après le rendu, 24 points, hors vélocité). Engagement prévu : 18, 18, 18 puis 12 points (sprint 4 raccourci par le rendu de 13h30 ; US-09 en objectif bonus).

## 4. Planning Poker

### Règles
1. Le PO lit l'US et ses critères ; l'équipe pose ses questions (2 min max).
2. Chacun choisit une carte **en secret** : `1, 2, 3, 5, 8, 13, 21` (+ `?` et ☕).
3. Tout le monde révèle en même temps.
4. Si les écarts sont grands, **la personne la plus basse et la plus haute s'expliquent**, puis on revote (2 tours max).
5. Pas de consensus au 3ᵉ vote → on retient la valeur la plus fréquente. **13 ou 21 → découper l'US.**
6. Référence : **US-05 (ordre d'action) = 2 points**.

### Journal des votes

Les US d'un sprint sont **rejouées en Planning Poker au début de ce sprint**, avec le détail du vote dans le fichier du sprint. La colonne « Estim. équipe » du tableau ci-dessus est remplie au fur et à mesure ; tant qu'elle est vide, c'est l'estimation proposée qui fait foi.

| US | Tour 1 (Mattéo / Owen / Paul / Donovan) | Tour 2 | Estimation retenue | Remarque |
|---|---|---|---|---|
| **Sprint 1** | | | | |
| US-01 Projet en ligne | 2 / 3 / 3 / 3 | — | **3** | Le déploiement et la réécriture SPA s'ajoutent au scaffold |
| US-02 Supabase | 3 / 3 / 5 / 3 | — | **3** | Le schéma est déjà rédigé dans la doc 03 |
| US-03 Compétences | 5 / 5 / 5 / 8 | 5 / 5 / 5 / 5 | **5** | Les tests de déterminisme font partie des 5 points |
| US-05 Ordre d'action | — | — | **2** | Référence, non votée |
| US-06 KO / fin | 3 / 2 / 3 / 3 | — | **3** | Le remplacement automatique demande plusieurs cas de test |
| US-24 Titre / menu | 2 / 3 / 2 / 2 | — | **2** | La maquette Lovable est optionnelle |
| **Sprint 2** | | | | |
| US-07 Scène de combat | 5 / 8 / 5 / 3 | 5 / 5 / 5 / 5 | **5** | Owen comptait les animations : elles sont dans l'US-09 |
| US-08 Menu d'actions | 3 / 3 / 5 / 2 | — | **3** | `validateAction` existe déjà, il ne reste que l'affichage |
| US-04 Changer de monstre | 3 / 2 / 3 / 3 | — | **3** | Le moteur gère déjà le changement depuis le sprint 1 |
| US-10 Choisir un starter | 2 / 2 / 1 / 2 | — | **2** | Trois cartes et une création de run |
| US-11 Vagues contre l'IA | 5 / 8 / 5 / 5 | 5 / 5 / 5 / 5 | **5** | Owen comptait les récompenses : elles sont dans l'US-12 |
| **Sprint 3** | | | | |
| US-15 Pseudo | 3 / 2 / 3 / 5 | — | **3** | Donovan comptait la garde de route et la reprise de session, Owen ne voyait qu'un formulaire |
| US-16 Créer un salon | 3 / 3 / 2 / 3 | — | **3** | Paul n'estimait que la fonction ; le Realtime et la page de salon font le reste |
| US-17 Rejoindre un salon | 2 / 3 / 3 / 3 | — | **3** | La course entre deux joueurs qui entrent le code en même temps justifie 3 |
| US-19 Combat en ligne | 8 / 13 / 8 / 8 | 8 / 8 / 8 / 8 | **8** | Owen à 13 (donc à découper) : le moteur existe depuis le sprint 1, il ne reste que le transport |
| US-23 Abandonner | 1 / 1 / 2 / 1 | — | **1** | Une fonction courte et un bouton avec confirmation |
| **Sprint 4** | | | | |
| US-12 Récompenses | 5 / 5 / 3 / 5 | — | **5** | Paul ne voyait qu'un tirage ; les cinq effets et l'écran en deux étapes font 5 |
| US-20 Timeout | 3 / 2 / 3 / 3 | — | **3** | `turn_deadline` existait déjà ; reste une fonction serveur et un minuteur |
| US-21 Reconnexion | 3 / 3 / 2 / 3 | — | **3** | CA1 et CA2 étaient déjà tenus depuis le sprint 3 : la review reconnaît que 2 suffisait |
| US-26 Crédits | 1 / 1 / 1 / 1 | — | **1** | Une page de contenu |
| US-09 Animations *(bonus)* | 5 / 8 / 5 / 3 | 5 / 5 / 5 / 5 | **5** | La file d'événements existe depuis le sprint 2, le calibrage reste à faire |
| US-18 Draft *(rejouée après coup)* | 5 / 5 / 8 / 5 | 5 / 5 / 5 / 5 | **5** | L'Edge Function réutilise le verrou du sprint 3 |
| US-29 Bestiaire *(rejouée après coup)* | 3 / 2 / 3 / 3 | — | **3** | Les sprites sont générés par le code existant |
| US-35 à US-44, US-25 *(bonus hors sprint, 17/09 après le rendu)* | à voter | — | *2, 3, 2, 1, 1, 3, 5, 1, 3, 3 et 3 proposés* | Demandées par le PO après le rendu (liste `TODO.md`) ; estimation proposée, à rejouer en Planning Poker |
| US-13, US-30 à US-34 *(bonus, ajoutées le 17/09)* | à voter | — | *3, 5, 5, 3, 1, 1 proposés* | Demandées par le PO pendant le sprint 4 et livrées en bonus ; estimation proposée, à rejouer en Planning Poker |
Détail des séances : [Sprint 1 — Planning Poker](SPRINT-1.md#planning-poker), [Sprint 2 — Qui a fait quoi](SPRINT-2.md#-qui-a-fait-quoi) et [Sprint 3 — Planning Poker](SPRINT-3.md#planning-poker-rejoué-en-début-de-sprint). Les votes du sprint 4 sont à reporter dans [Sprint 4 — Planning Poker](SPRINT-4.md#planning-poker).

## 5. User stories détaillées

Format des critères : **Étant donné** (contexte) / **Quand** (action) / **Alors** (résultat).

---

### Epic 1 — Socle technique

#### US-01 — Projet en ligne sur Render · Must · 3 pts
**En tant que** membre de l'équipe, **je veux** un projet React + TypeScript + Phaser déployé automatiquement sur Render **afin de** pouvoir tester chaque changement en ligne et le montrer au PO.

- **CA1** : Étant donné un push sur `main`, quand le build Render se termine, alors l'URL de production (https://dark-dungeon-fantasy-boss-battle.onrender.com) affiche la page d'accueil.
- **CA2** : Étant donné une PR ouverte, quand Render la construit (Pull Request Previews), alors une URL de preview est disponible sur la PR.
- **CA3** : Étant donné l'URL `/n-importe-quelle-route`, quand je rafraîchis la page, alors l'application se charge (pas de 404).
- **CA4** : Un canvas Phaser de 480×270 s'affiche, mis à l'échelle sans flou.

#### US-02 — Supabase configuré · Must · 3 pts
**En tant que** développeur, **je veux** une base Supabase avec le schéma, la RLS et le Realtime **afin de** stocker les joueurs et les parties de façon sécurisée.

- **CA1** : La migration `001_init.sql` s'exécute sans erreur sur un projet vide.
- **CA2** : Étant donné un utilisateur A, quand il fait `select` sur `matches`, alors il ne voit que les matchs dont il est joueur.
- **CA3** : Étant donné un client connecté, quand il tente un `insert` dans `matches`, alors la requête est refusée.
- **CA4** : Les variables d'environnement sont configurées sur Render et documentées dans `.env.example`.

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
- **CA2** : En fin de tour, le monstre actif KO est remplacé par le premier monstre en vie (`switch` avec `forced: true`). *Remplacé le 17/09 par US-30 : le joueur choisit le remplaçant.*
- **CA3** : Quand tous les monstres d'une équipe sont KO, alors `winnerSeat` désigne l'autre joueur et un événement `battle_end` termine la liste.

#### US-04 — Changer de monstre · Should · 3 pts
**En tant que** joueur, **je veux** remplacer mon monstre actif pendant mon tour **afin d'**éviter un désavantage d'élément.

- **CA1** : Le bouton « Changer » liste les monstres en vie autres que le monstre actif.
- **CA2** : Le changement a lieu avant les compétences de l'adversaire, qui touchent donc le nouveau monstre.
- **CA3** : Un changement vers un monstre KO ou déjà actif est refusé.

#### US-30 — Choisir le remplaçant d'un monstre KO · Should · 5 pts
**En tant que** joueur, **je veux** choisir quel monstre remplace mon monstre KO **afin de** garder le contrôle de ma stratégie au lieu de subir un choix arbitraire.

- **CA1** : Étant donné que mon monstre actif tombe KO et qu'il me reste un monstre en vie, alors le menu n'affiche plus que mon équipe (« X est K.O. ! Choisissez le monstre qui prend sa place. »), sans compétence ni retour possible.
- **CA2** : Quand je choisis un monstre, alors c'est lui qui entre en combat (pas forcément le premier de la liste), sans que l'adversaire joue pendant ce choix.
- **CA3** : En solo, l'IA choisit elle-même son remplaçant (le monstre qui a l'avantage d'élément).
- **CA4** : En duel, l'adversaire voit « l'adversaire choisit son remplaçant… » et ses actions sont refusées par le serveur ; une compétence du joueur KO est refusée aussi (`400 INVALID_ACTION`).
- **CA5** : En duel, si le joueur KO ne choisit pas avant la fin du compte à rebours, son premier monstre en vie entre en combat.

#### US-35 — 3 compétences et la Frappe · Should · 2 pts
**En tant que** joueur, **je veux** que chaque monstre ait 3 compétences et la Frappe à PP illimités **afin de** toujours pouvoir agir et de comparer les monstres à armes égales.

- **CA1** : Chaque espèce du bestiaire a exactement 4 compétences : 3 compétences et `strike` (Frappe, PP ∞).
- **CA2** : La Frappe est la seule compétence à PP illimités.
- **CA3** : Un duel enregistré avant ce changement (monstre sans Frappe) ne se bloque pas : le timeout joue toujours une action valide.

> ✅ Livrée le 17/09 après le rendu, hors sprint.

#### US-38 — Rééquilibrer le Golem · Could · 1 pt
**En tant que** joueur, **je veux** que le Golem de pierre ne soit plus un mur imbattable **afin que** les combats contre lui restent jouables.

- **CA1** : Le Golem (neutre, donc faible à aucun élément) a une DEF de base plus basse que celle du Crabe des abysses (55 au lieu de 75).
- **CA2** : Sa rareté est recalculée par la puissance (peu commun).
- **CA3** : Les boosts d'ATQ et de DEF ne durent qu'un combat : en solo, ils sont remis à zéro entre deux vagues.

> ✅ Livrée le 17/09 après le rendu, hors sprint.

#### US-39 — +25 % de PP · Could · 1 pt
**En tant que** joueur, **je veux** plus de PP sur les attaques **afin de** moins tomber à court pendant une run.

- **CA1** : Les PP de toutes les attaques sont augmentés de 25 %, arrondis (10 → 13, 8 → 10, 5 → 6, 4 → 5, 3 → 4).
- **CA2** : Les PP des soins (Régénération, Chant apaisant) et des boosts ne changent pas.

> ✅ Livrée le 17/09 après le rendu, hors sprint.

#### US-40 — Boosts d'attaque · Should · 3 pts
**En tant que** joueur, **je veux** des compétences qui augmentent l'attaque **afin de** préparer un gros coup.

- **CA1** : Une compétence `atkUp` multiplie l'ATQ du lanceur par 1,15 jusqu'à la fin du combat (cumulable) ; le journal affiche « Votre monstre augmente son attaque ! ».
- **CA2** : Chaque boost a l'élément du monstre ou l'élément Neutre, avec un nom cohérent (Embrasement pour le feu, Pacte ténébreux pour l'ombre, Hurlement pour le loup…).
- **CA3** : Le moteur partagé gère le boost en solo comme en duel ; un duel enregistré sans multiplicateur d'ATQ se lit avec ×1.

> ✅ Livrée le 17/09 après le rendu, hors sprint : 9 boosts, portés par 25 espèces (évolutions comprises).

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

- **CA1** : Aux vagues 5, 10, 15…, l'ennemi est un boss seul (Démon mineur, Liche, Hydre ou Dragon ancien), au niveau `N + 1`. *(Précisé le 17/09 : les ennemis sont désormais au niveau `N`, plus `4 + N`.)*
- **CA2** : Une bannière « BOSS » s'affiche avant le combat.
- **CA3** : Après un boss, le butin est meilleur : la Relique du boss (+3 niveaux et soin complet pour l'équipe) est toujours proposée, les 2 autres cartes sont des butins rares ou le recrutement du boss.

#### US-31 — Rareté des monstres · Should · 5 pts
**En tant que** joueur solo, **je veux** que les monstres aient une rareté liée à leur puissance **afin de** rencontrer des adversaires plus forts au fil de la run et d'être mieux récompensé quand je les bats.

- **CA1** : Chaque espèce a une rareté (Commun, Peu commun, Rare, Épique, Boss) calculée depuis sa puissance (somme des stats de base), affichée dans le Guide.
- **CA2** : Les raretés se débloquent au fil des vagues (peu commun dès la 3, rare dès la 5, épique dès la 8) ; une même seed donne les mêmes ennemis.
- **CA3** : Battre un monstre plus rare débloque de meilleures récompenses (Potion royale, Entraînement intensif, Camp d'entraînement), mises en valeur par la couleur de leur rareté.

#### US-33 — Abandonner une run · Should · 1 pt
**En tant que** joueur solo, **je veux** pouvoir abandonner ma run **afin de** recommencer sans attendre que mon équipe soit KO.

- **CA1** : Un bouton « Abandonner » est visible pendant un combat solo et demande une confirmation.
- **CA2** : Après confirmation, l'écran « Run abandonnée » affiche la vague atteinte et propose une nouvelle run ou le retour au menu.

#### US-34 — Ordre de l'équipe entre les vagues · Should · 1 pt
**En tant que** joueur solo, **je veux** que mon équipe garde son ordre et son monstre actif d'une vague à l'autre **afin de** ne pas voir mon monstre remplacé sans l'avoir décidé.

- **CA1** : Le monstre sur le terrain à la fin d'une vague commence la vague suivante ; l'ordre de l'équipe ne change pas.
- **CA2** : S'il est KO, le premier monstre en vie commence.

#### US-36 — Gagner un niveau en mettant un ennemi KO · Should · 3 pts
**En tant que** joueur solo, **je veux** que mes monstres montent de niveau en combattant **afin de** ne plus avoir à choisir entre me soigner et progresser.

- **CA1** : Quand mon monstre met un ennemi KO, il gagne 1 niveau (stats et PV max recalculés, PV perdus conservés) ; le texte « X passe au niveau N ! » s'affiche pendant le combat et reste lisible sur l'écran de récompense.
- **CA2** : Les ennemis ne gagnent jamais de niveau, et le duel en ligne n'est pas concerné.
- **CA3** : Les récompenses de niveaux sont réduites : Entraînement +1, Entraînement intensif +2, Camp d'entraînement +1, Relique +2.

> ✅ Livrée le 17/09 après le rendu, hors sprint.

#### US-37 — Parchemin : choisir la compétence oubliée · Should · 2 pts
**En tant que** joueur solo, **je veux** voir la compétence qu'apprend le parchemin et choisir celle qu'il remplace **afin de** ne pas perdre ma meilleure attaque au hasard.

- **CA1** : Au choix du monstre, chaque carte indique la compétence qu'il apprendrait.
- **CA2** : Pour un monstre qui a déjà 4 compétences, l'écran suivant affiche la compétence apprise (élément, puissance ou effet, PP) et la liste des compétences à oublier ; la Frappe est grisée (« gardée »).
- **CA3** : Échap ou « Choisir un autre monstre » revient au choix du monstre.

> ✅ Livrée le 17/09 après le rendu, hors sprint.

#### US-42 — Recrutement plus fréquent · Should · 1 pt
**En tant que** joueur solo, **je veux** tomber plus souvent sur le recrutement **afin de** pouvoir agrandir mon équipe à coup sûr.

- **CA1** : Le recrutement pèse 35 dans le tirage (au lieu de 20).
- **CA2** : Il est toujours proposé après les vagues paires, même quand le tirage ne l'a pas sorti.

> ✅ Livrée le 17/09 après le rendu, hors sprint.

#### US-14 — Score et classement · Should · 3 pts
**En tant que** joueur, **je veux** voir mon score et le top 20 **afin de** me comparer aux autres.

- **CA1** : En fin de run, le score est calculé et enregistré dans `solo_runs`.
- **CA2** : La page Classement affiche le meilleur score et la meilleure vague de chaque pseudo, triés par score.

> ✅ Livrée le 17/09 après le rendu, hors sprint (jalon `Réserve`). Score = `vague atteinte × 100 + PV restants` ([01 §6.3](../01-GAME-DESIGN.md#63-score)) ; il n'est enregistré que si le joueur a un pseudo, et la page Classement demande de se connecter (la RLS réserve la lecture aux joueurs connectés).

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
- **CA2** : Quand je choisis une action, elle est envoyée à la fonction `match-action`, et « En attente de l'adversaire… » s'affiche.
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
- **CA3** : Un appel à la fonction `match-timeout` avant la deadline renvoie `409 TOO_EARLY`.

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

#### US-44 — Revanche sans recréer de salon · Should · 3 pts
**En tant que** joueur en duel, **je veux** relancer un match tout de suite avec le même adversaire **afin de** ne pas recréer de salon ni repartager de code.

- **CA1** : L'écran de fin de duel propose « Revanche » (touche R) aux deux joueurs.
- **CA2** : Un clic crée un nouveau match (nouveau draft) dans le même salon ; l'autre joueur, resté sur l'écran de fin, y est emmené automatiquement.
- **CA3** : Si les deux joueurs cliquent en même temps, un seul match est créé (verrou sur `rooms.current_match_id`) ; un double-clic renvoie le match en cours.
- **CA4** : Un joueur qui n'appartient pas au salon reçoit `403 NOT_A_PLAYER`.

> ✅ Livrée le 17/09 après le rendu, hors sprint. La fonction `match-start` doit être redéployée après la fusion.

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

> 🟡 17/09 après le rendu, hors sprint : musique de combat (`public/assets/musics/`) en boucle pendant les combats solo et les duels, avec un bouton son (touche M) mémorisé par le navigateur. Restent : musique de menu, effets sonores, curseur de volume. Source et licence de la piste à renseigner dans [CREDITS](../CREDITS.md).

#### US-43 — Jouer entièrement au clavier · Should · 3 pts
**En tant que** joueur, **je veux** contrôler tout le jeu au clavier **afin de** jouer sans souris.

- **CA1** : Sur chaque page, le premier bouton a le focus ; les flèches passent d'un bouton ou d'un lien à l'autre ; Entrée ou Espace valide ; Échap revient en arrière.
- **CA2** : Les cartes et compétences numérotées se choisissent avec les touches 1 à 6 (starter, draft, compétences, remplaçant, récompenses, parchemin) ; V valide, C ouvre « Changer », M coupe la musique, R lance la revanche. Le numéro est affiché sur le bouton.
- **CA3** : Dans un champ texte, les touches servent à écrire.
- **CA4** : Le Guide liste les contrôles.

> ✅ Livrée le 17/09 après le rendu, hors sprint.

#### US-41 — Évolutions · Could · 5 pts
**En tant que** joueur solo, **je veux** voir mes monstres évoluer **afin de** sentir ma progression et affronter des ennemis plus forts en fin de run.

- **CA1** : Les 3 starters évoluent au niveau 12 et les 7 monstres communs au niveau 10, en une espèce plus puissante du même élément (jamais boss), avec son propre sprite.
- **CA2** : Le monstre qui évolue garde ses compétences, ses PP et ses PV perdus ; le journal affiche « X évolue en Y ! ».
- **CA3** : Les évolutions ne sont jamais tirées directement : un ennemi commun de niveau suffisant arrive évolué (à partir de la vague 11).
- **CA4** : Les évolutions ne sont pas proposées au draft du duel ; le Guide indique pour chacune l'espèce et le niveau d'origine.

> ✅ Livrée le 17/09 après le rendu, hors sprint : Drakéide, Naïade, Myconide, Chef gobelin, Seigneur squelette, Œil tyran, Roi slime, Crabe titan, Banshee, Seigneur vampire.

#### US-27 — Mobile · Could · 3 pts
**En tant que** joueur sur téléphone, **je veux** jouer en mode paysage **afin de** jouer n'importe où.

- **CA1** : Le canvas et le menu d'actions tiennent sur un écran de 390×844 en paysage.
- **CA2** : Les boutons font au moins 44 px de haut.

#### US-29 — Bestiaire étendu · Could · 3 pts
**En tant que** joueur, **je veux** rencontrer plus de monstres différents **afin de** varier mes runs et mes équipes en duel.

- **CA1** : Le bestiaire compte 20 espèces, chacune avec un sprite pixel-art généré par `npm run assets`.
- **CA2** : Chaque élément compte au moins 2 espèces non-boss, pour que le draft (US-18) propose des choix variés.
- **CA3** : Les nouvelles espèces communes et rares apparaissent dans les vagues solo ; les nouveaux boss restent réservés au solo.
- **CA4** : Les nouvelles compétences n'utilisent que les effets existants (soin, drain, DEF+) et sont documentées dans [01 §4](../01-GAME-DESIGN.md#4-compétences).

#### US-32 — 5 nouveaux monstres · Could · 3 pts
**En tant que** joueur, **je veux** 5 monstres de plus **afin de** remplir toutes les raretés et varier encore les runs et les drafts.

- **CA1** : Le bestiaire compte 25 espèces : Chauve-souris vampire (commune), Licorne (rare), Kraken et Phénix (épiques), Hydre (boss), chacune avec son sprite généré par `npm run assets`.
- **CA2** : Chaque rareté compte au moins une espèce ; les nouveaux non-boss sont proposés au draft du duel.
- **CA3** : Documentation : la doc indique partout une équipe de **4 monstres au maximum** en solo.

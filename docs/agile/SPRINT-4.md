# Sprint 4 — Boucle roguelike et finitions

| | |
|---|---|
| **Créneau** | Jeudi 17/09, matin (9h00 → gel du code à 13h00, rendu à 13h30) |
| **Product Owner** | Mattéo |
| **Scrum Master** | Paul |
| **Développeurs** | Mattéo, Owen, Paul, Donovan |
| **Capacité** | Réduite : ~45 min réservées à la présentation et au rendu |
| **Vélocité des sprints précédents** | S1 : **12** · S2 : **18** · S3 : **18** (moyenne 16) |
| **Action de la rétro précédente** | Commencer par la configuration Render (US-01) ; aucune US annoncée terminée sans vérification **en jouant sur la production** |

## 📊 Bilan : ce qui a été fait

**Sprint Goal atteint.** La boucle roguelike solo est complète (une récompense au choix entre deux vagues). Le duel en ligne tient les rafraîchissements et les absences (reprise depuis le menu, timeout de 60 s). Le jeu a ses crédits et ses animations finies. Tout a été vérifié **en jouant sur la production** : <https://dark-dungeon-fantasy-boss-battle.onrender.com>.

- **12 / 12 points engagés terminés** : US-12 (5), US-20 (3), US-21 (3), US-26 (1).
- **+ 5 points bonus** : US-09 (animations et textes de combat) terminée pendant le sprint. Elle était en objectif bonus, hors engagement.
- **+ 18 points bonus ajoutés par le PO en cours de sprint** (17/09 au matin), hors engagement comme US-09 : choix du remplaçant après un KO en solo **et en duel** (US-30), rareté des monstres selon leur puissance avec un meilleur butin (US-31), boss toutes les 5 vagues avec butin de boss (US-13), 5 nouveaux monstres (US-32), abandon d'une run solo (US-33), ordre de l'équipe conservé entre les vagues (US-34). La doc indique partout une équipe de 4 monstres au maximum. Voir [Ajouts du PO](#-ajouts-du-po-pendant-le-sprint-bonus).
- **Bug bloquant trouvé en vérifiant la production, puis corrigé** : la run solo se figeait dès le premier tour sur Render (voir [Problèmes rencontrés](#-problèmes-rencontrés)).
- **US-01 avance mais reste ouverte** : la protection de `main` est activée (PR obligatoire) ; il manque la règle de réécriture du dashboard Render, faute d'accès depuis le poste de développement (voir [Tâches non terminées](#-tâches-non-terminées)).
- **Préparation du rendu faite** : vidéo de secours ([`docs/presentation/demo-secours.mp4`](../presentation/demo-secours.mp4)), diaporama ([`docs/presentation/soutenance.html`](../presentation/soutenance.html)), base Supabase remise à zéro pour la démo.
- 6 pull requests : [#50](https://github.com/kifuj/Dark-Dungeon-Fantasy-Boss-Battle/pull/50) (US-12), [#51](https://github.com/kifuj/Dark-Dungeon-Fantasy-Boss-Battle/pull/51) (US-26), [#52](https://github.com/kifuj/Dark-Dungeon-Fantasy-Boss-Battle/pull/52) (US-21), [#53](https://github.com/kifuj/Dark-Dungeon-Fantasy-Boss-Battle/pull/53) (US-20), [#54](https://github.com/kifuj/Dark-Dungeon-Fantasy-Boss-Battle/pull/54) (correctif solo), [#55](https://github.com/kifuj/Dark-Dungeon-Fantasy-Boss-Battle/pull/55) (US-09).
- Tests : **147 → 224** (Vitest, dont 29 pour les ajouts du PO). `npm run test:multi` passe de 42 à **63 vérifications** contre le vrai Supabase, avec les scénarios M3 (timeout), M8 et M9 (remplacement après un KO).
- Nouvelle Edge Function déployée : `match-timeout` (7 fonctions en ligne en tout). `match-action`, `match-timeout`, `match-draft` et `match-start` redéployées le 17/09 à 10h55 pour la phase de remplacement et le bestiaire à 25 espèces.

![Choix d'une récompense après la vague 1](./captures/sprint-4-recompense.png)

## 🎯 Sprint Goal

> **La boucle roguelike solo est complète (récompenses), le duel en ligne résiste aux rafraîchissements et aux absences, et le jeu est prêt à être présenté.**

## 📋 Sprint Backlog

> Engagement réduit à **12 points** : le sprint 4 est plus court (préparation du rendu, gel du code à 13h). US-09 est en **objectif bonus**, à commencer seulement si les 4 US engagées sont terminées et qu'il reste au moins 1h avant le gel.

| US | Points | Tâche | Responsable | Statut |
|---|---|---|---|---|
| *(reste S3)* **US-01** | 3 | Protection de `main` | Mattéo | ✅ Fait à 9h58 (PR obligatoire, force-push et suppression interdits) |
| | | Règle Redirects/Rewrites du dashboard Render | Mattéo | ❌ Non fait (pas d'accès au dashboard depuis le poste de développement) |
| **US-12** Récompenses | 5 | `shared/data/rewards.ts` + tirage pondéré avec la seed + tests | Owen | ✅ Fait ([#50](https://github.com/kifuj/Dark-Dungeon-Fantasy-Boss-Battle/pull/50)) |
| | | Application des effets (potion, élixir, entraînement, recrutement, parchemin) + tests | Owen | ✅ Fait |
| | | Écran de choix (3 cartes) + remplacement si équipe pleine | Owen | ✅ Fait |
| **US-21** Reconnexion | 3 | Chargement initial sans animation + détection « déjà joué » | Paul | ✅ Déjà en place depuis le sprint 3, test CA1 ajouté ([#52](https://github.com/kifuj/Dark-Dungeon-Fantasy-Boss-Battle/pull/52)) |
| | | Bouton « Reprendre la partie » dans le menu | Paul | ✅ Fait |
| **US-20** Timeout | 3 | Edge Function `match-timeout` (action par défaut, `is_auto`) | Donovan | ✅ Fait ([#53](https://github.com/kifuj/Dark-Dungeon-Fantasy-Boss-Battle/pull/53)), déployée |
| | | Compte à rebours côté client + appel automatique | Donovan | ✅ Fait |
| **US-26** Crédits | 1 | Page Crédits reprenant `CREDITS.md` | Donovan | ✅ Fait ([#51](https://github.com/kifuj/Dark-Dungeon-Fantasy-Boss-Battle/pull/51)) |
| *(hors US)* | — | Enregistrer une **vidéo de secours** de la démo | Mattéo | ✅ Fait : 2 min 30, solo + crédits + duel à deux fenêtres, jouée sur la production ([`demo-secours.mp4`](../presentation/demo-secours.mp4)) |
| *(hors US)* | — | Mettre à jour le README (URL prod, équipe, état des sprints) + vérifier que tous les `.md` sont remplis | Donovan | ✅ Fait : README, docs techniques et comptes rendus des sprints 1 à 4 complets |
| *(hors US)* | — | Slides de présentation (plan dans [00-PROJET-GLOBAL §9](../00-PROJET-GLOBAL.md#9-plan-de-la-présentation--30-min)) | Mattéo | ✅ Fait : 12 slides, vidéo intégrée ([`soutenance.html`](../presentation/soutenance.html)) |
| *(hors US)* | — | Remise à zéro de la base avant la démo ([03 §6](../03-BASE-DE-DONNEES.md#6-réinitialiser-la-base-en-développement)) | Paul | ✅ Fait à 9h59 : profils, comptes anonymes, salons et matchs supprimés |
| | **12** | | | **12 points terminés** |

#### 🎁 Objectif bonus (hors engagement)

| US | Points | Tâche | Responsable | Statut |
|---|---|---|---|---|
| **US-09** Animations | 5 | File d'événements avec attente (tweens de PV, flash, KO) | Mattéo | ✅ Fait ([#55](https://github.com/kifuj/Dark-Dungeon-Fantasy-Boss-Battle/pull/55)) : la base datait du sprint 2 (ba09168), durées recalibrées pour tenir les 4 s |
| | | Textes d'efficacité et de critique | Mattéo | ✅ Fait : les deux textes se cumulent |
| **US-18** Draft en duel | 5 | Moteur, Edge Function `match-draft`, écran de draft | Mattéo | ✅ Livrée le 16/09, hors sprint |
| **US-29** Bestiaire étendu | 3 | 10 espèces (dont 1 boss) et 8 compétences + sprites générés + tests | Mattéo | ✅ Livrée le 16/09, hors sprint |

#### ➕ Ajouts du PO pendant le sprint (bonus)

Demandés par le PO le 17/09 au matin, après les 12 points engagés. Rangés dans le jalon `Sprint 4` en bonus, comme US-09 : ils ne changent pas l'engagement.

| US | Points *(proposés)* | Tâche | Responsable | Statut |
|---|---|---|---|---|
| **US-30** Choix du remplaçant après un KO | 5 | Moteur : plus de remplacement automatique, phase de remplacement (`shared/engine/replace.ts`), validation, IA qui choisit son remplaçant + tests | Paul | ✅ Fait |
| | | Menu « X est K.O. ! Choisissez le monstre qui prend sa place » (solo et duel) | Paul | ✅ Fait |
| | | Duel : `tryResolveBattleTurn` et `match-timeout` n'attendent que le joueur KO, fonctions redéployées, scénarios M8 et M9 dans `test:multi` | Paul | ✅ Fait, déployé |
| **US-31** Raretés | 5 | `shared/data/rarities.ts` : rareté calculée depuis la puissance, apparition par vague, niveau de butin + tests | Owen | ✅ Fait |
| | | Butins rares (Potion royale, Entraînement intensif, Camp d'entraînement) et cartes colorées | Owen | ✅ Fait |
| | | Guide : colonnes Rareté et Puissance, table des raretés | Owen | ✅ Fait |
| **US-13** Boss | 3 | Boss seul aux vagues 5, 10, 15… (niveau N + 1), bannière « BOSS » | Donovan | ✅ Fait |
| | | Butin de boss : Relique garantie, recrutement du boss | Donovan | ✅ Fait |
| **US-33** Abandon en solo | 1 | Bouton « Abandonner » avec confirmation, écran « Run abandonnée » | Donovan | ✅ Fait |
| **US-32** 5 nouveaux monstres | 3 | Chauve-souris vampire, Licorne, Kraken, Phénix, Hydre : données + sprites (`tools/art/monsters.mjs`) | Mattéo | ✅ Fait |
| | | Doc : équipe de **4 monstres au maximum** en solo (01, README, Guide) | Mattéo | ✅ Fait |
| **US-34** Ordre de l'équipe | 1 | `RunState.activeIndex` : le monstre actif en fin de vague ouvre la suivante | Mattéo | ✅ Fait |
| | **18** | | | **18 points bonus terminés** |

> Répartition proposée pour équilibrer les points (Paul 5, Owen 5, Donovan 4, Mattéo 4), reportée comme assignés sur les issues. Estimations proposées, **à rejouer en Planning Poker** ; US-13 (3 points) était déjà au backlog, les 15 autres points sont de nouvelles US.

> US-09 a été commencée à 9h20, une fois les 4 US engagées fusionnées, soit bien plus d'1h avant le gel : la condition du bonus est remplie. Elle passe du jalon `Réserve` au jalon `Sprint 4` dans le GitHub Project et compte à part, en bonus.
>
> US-18 et US-29 ont été réalisées le **16/09 après la review du sprint 3**, hors créneau de sprint : elles restent en **Réserve** dans le GitHub Project et ne comptent pas dans la vélocité. Estimations proposées (5 et 3), à rejouer en Planning Poker. Écart de DoD : PR fusionnée sans relecture d'un autre membre.

📸 **Capture du board en début de sprint** (jalon `Sprint 4` : 5 issues ouvertes, 0 % terminé) :

![Sprint backlog sprint 4](./captures/sprint-4-backlog.png)

### 👥 Répartition des tâches

#### Planning Poker

Cartes : `1, 2, 3, 5, 8, 13, 21`. Référence : **US-05 = 2 points**.

| US | Tour 1 (Mattéo / Owen / Paul / Donovan) | Tour 2 | Retenu | Remarque |
|---|---|---|---|---|
| US-12 Récompenses | 5 / 5 / 3 / 5 | — | **5** | Paul ne voyait qu'un tirage ; Owen rappelle les cinq effets et l'écran en deux étapes (choix, puis monstre visé) |
| US-20 Timeout | 3 / 2 / 3 / 3 | — | **3** | Owen : « `turn_deadline` est déjà écrit ». Reste une fonction serveur et un minuteur, d'où 3 |
| US-21 Reconnexion | 3 / 3 / 2 / 3 | — | **3** | Paul savait que CA1 et CA2 étaient déjà tenus. Gardé à 3 par prudence ; à la review, l'équipe reconnaît que 2 suffisait |
| US-26 Crédits | 1 / 1 / 1 / 1 | — | **1** | Une page de contenu |
| US-09 Animations *(bonus)* | 5 / 8 / 5 / 3 | 5 / 5 / 5 / 5 | **5** | Owen comptait toute l'US, Donovan seulement les finitions ; la file d'événements existe depuis le sprint 2 mais le calibrage reste à faire |
| US-18 Draft *(livrée le 16/09)* | 5 / 5 / 8 / 5 | 5 / 5 / 5 / 5 | **5** | Rejouée après coup : Paul comptait l'Edge Function, qui réutilise le verrou du sprint 3 |
| US-29 Bestiaire *(livrée le 16/09)* | 3 / 2 / 3 / 3 | — | **3** | Les sprites sont générés par le code existant |
| US-30, US-31, US-13, US-32, US-33, US-34 *(ajouts du PO)* | à voter | — | *5, 5, 3, 3, 1, 1 proposés* | Ajoutées pendant le sprint : estimation proposée, à rejouer |

**Total engagé : 12 points** (+ 5 points bonus avec US-09, + 18 points bonus avec les ajouts du PO).

#### Affectation

Tâches réparties entre les 4 membres du repo. Le responsable de chaque US est assigné sur l'issue GitHub (jalon `Sprint 4`).

| Membre | Compte GitHub | US / tâches | Points |
|---|---|---|---|
| Mattéo | `kifuj` | US-01 (Render) + vidéo de secours + slides ; US-09 en bonus | hors US (+ 5 bonus) |
| Owen | `Owen-Cazaux` | US-12 | 5 |
| Paul | `Paul-B-O` | US-21 + relecture des PR et test sur la production | 3 + hors US |
| Donovan | `donovanmessager0-tech` | US-20, US-26 + README | 4 + hors US |
| *Ajouts du PO (bonus)* | | Paul : US-30 · Owen : US-31 · Donovan : US-13, US-33 · Mattéo : US-32, US-34 | +5 / +5 / +4 / +4 |

> **Traçabilité des commits** : comme aux sprints 2 et 3, tout a été poussé depuis le poste de Mattéo (compte `kifuj`). Chaque commit porte un `Co-authored-by` pour le responsable de l'US décidé ici, et les issues GitHub ont les mêmes assignés.

## ✅ Tâches terminées

| US | Critères d'acceptation | Preuve |
|---|---|---|
| **US-12** | CA1 3 récompenses différentes tirées selon les poids de la doc 01 §6.2 · CA2 effet appliqué et visible · CA3 « Recrutement » avec 4 monstres demande lequel remplacer · CA4 même seed → mêmes propositions | `shared/tests/rewards.test.ts` (13 tests, dont un tirage sur 2 000 seeds pour les poids), `src/tests/RewardPanel.test.tsx` (4), run jouée dans le navigateur jusqu'à la vague 3 avec une potion puis un entraînement (« Salamandre passe au niveau 7 ! ») |
| **US-20** | CA1 compte à rebours de 60 s visible · CA2 à 0, action par défaut jouée pour l'absent et tour résolu · CA3 `match-timeout` avant la deadline → `409 TOO_EARLY` | `shared/tests/online.test.ts` (5 tests), `src/tests/OnlineMatch.test.tsx` (6), `npm run test:multi` (13 vérifications M3), **duel sur deux navigateurs sur la production** : l'invité ne joue pas, le tour est résolu 8,9 s après la deadline avancée, son action est enregistrée avec `is_auto = true` |
| **US-21** | CA1 état actuel affiché sans rejouer d'animation · CA2 « En attente de l'adversaire… » si déjà joué · CA3 bouton « Reprendre la partie » dans le menu | `src/tests/Menu.test.tsx` (4), `src/tests/OnlineMatch.test.tsx` (2), sur la production : l'invité rafraîchit en plein tour 1 et retrouve « Tour 1 », minuteur à 58 s ; le bouton du menu le ramène au bon match |
| **US-26** | CA1 la page Crédits reprend tout `docs/CREDITS.md` | La page importe le fichier au build : une seule source. `src/tests/Credits.test.tsx` (4), [capture](./captures/sprint-4-credits.png) |
| **US-09** *(bonus)* | CA1 texte, flash, PV progressifs · CA2 textes d'efficacité et de critique · CA3 KO en fondu + descente · CA4 un tour < 4 s | `src/tests/timing.test.ts` : pire tour théorique à 3,55 s, et 600 tours de vrais duels tous sous 4 s ; images prises pendant l'animation dans Chromium |

| **US-30** *(bonus)* | CA1 menu réduit à l'équipe · CA2 le monstre choisi entre, l'adversaire ne joue pas · CA3 l'IA choisit son remplaçant · CA4 duel : attente affichée, actions refusées · CA5 timeout → premier monstre en vie | `shared/tests/replace.test.ts` (8), `ActionMenu.test.tsx` (2), `OnlineMatch.test.tsx` (2), `test:multi` M8 et M9 (8 vérifications, fonctions déployées), **duel à deux navigateurs** : l'hôte choisit la Chauve-souris au lieu du Squelette, l'invité voit « l'adversaire choisit son remplaçant… » |
| **US-31** *(bonus)* | CA1 rareté calculée et affichée · CA2 raretés débloquées par vague · CA3 meilleur butin | `monsters.test.ts`, `run.test.ts`, `rewards.test.ts` (tirages sur 200 à 1 500 seeds), `Guide.test.tsx` ; « Butin peu commun » vu en jeu après un Chevalier déchu à la vague 3 |
| **US-13** *(bonus)* | CA1 boss seul au niveau N + 1 · CA2 bannière · CA3 butin de boss | `run.test.ts`, `rewards.test.ts` ; 7 runs jouées par un robot dans Chromium : bannière « Vague 5 · BOSS », une run a battu 4 boss jusqu'à la vague 25, la Relique est toujours proposée |
| **US-32** *(bonus)* | CA1 25 espèces avec sprite · CA2 toutes les raretés remplies, nouveaux monstres au draft · CA3 équipe de 4 dans la doc | `monsters.test.ts` ; Kraken et Phénix vus au draft du duel |
| **US-33** *(bonus)* | CA1 bouton avec confirmation · CA2 écran « Run abandonnée » | `SoloRun.test.tsx` (2) |
| **US-34** *(bonus)* | CA1 monstre actif conservé · CA2 premier en vie s'il est KO | `run.test.ts` ; en jeu, l'Œil volant qui finit la vague 4 ouvre la vague 5 |

Hors sprint backlog : correctif de la run solo figée ([#54](https://github.com/kifuj/Dark-Dungeon-Fantasy-Boss-Battle/pull/54)), `docs/CREDITS.md` complété (polices réellement utilisées, pas de son), docs 04, 05 et README mis à jour.

### Le sprint en images

| Récompense ciblée (US-12) | Duel : minuteur pendant l'attente (US-20) | Minuteur sous 10 s (US-20) |
|---|---|---|
| ![Choix du monstre](./captures/sprint-4-recompense-cible.png) | ![Minuteur](./captures/sprint-4-minuteur-attente.png) | ![Minuteur urgent](./captures/sprint-4-minuteur-urgent.png) |

| Tour résolu par le timeout (US-20) | Après un rafraîchissement (US-21) | Reprendre la partie (US-21) |
|---|---|---|
| ![Après timeout](./captures/sprint-4-apres-timeout.png) | ![Reprise](./captures/sprint-4-reprise-apres-rafraichissement.png) | ![Menu](./captures/sprint-4-menu-reprendre.png) |

| Draft avec minuteur | Page Crédits (US-26) |
|---|---|
| ![Draft](./captures/sprint-4-draft-minuteur.png) | ![Crédits](./captures/sprint-4-credits.png) |

| Solo : choix du remplaçant (US-30) | Duel : le joueur KO choisit (US-30) | Duel : l'adversaire attend (US-30) |
|---|---|---|
| ![Remplaçant solo](./captures/sprint-4-solo-choix-remplacant.png) | ![Remplaçant duel](./captures/sprint-4-duel-choix-remplacant.png) | ![Attente duel](./captures/sprint-4-duel-attente-remplacant.png) |

| Vague de boss (US-13) | Butin de boss (US-13) | Butin peu commun (US-31) |
|---|---|---|
| ![Boss](./captures/sprint-4-vague-boss.png) | ![Butin de boss](./captures/sprint-4-butin-boss.png) | ![Butin rare](./captures/sprint-4-butin-rare.png) |

## ⏳ Tâches non terminées

| Élément | État | Décision |
|---|---|---|
| **US-01 CA3** (routes profondes sur Render) | ⚠️ Toujours contourné : `/menu`, `/solo`, `/match/<id>` répondent **404** au sens HTTP, mais `404.html` charge l'application. Le jeu fonctionne, vérifié sur la production. | À faire par Mattéo dans le dashboard Render : **Redirects/Rewrites → `/*` → `/index.html` (Rewrite)**. 2 minutes, aucun code. |
| **US-01 CA2** (preview des PR) | Non vérifié : aucune URL de preview Render n'apparaît sur les PR #50 à #55. | À activer dans le dashboard Render si l'équipe le souhaite. Sans impact sur la démo. |
| **Relance de `npm run test:multi`** | ⚠️ Le script crée des profils et des matchs de test. Relancé le 17/09 vers 10h55 pour valider US-30. | Données de test supprimées juste après (voir Décisions). Ne plus le lancer d'ici la démo. |
| **Planning Poker des ajouts du PO** | Estimations proposées seulement (US-13, US-30 à US-34). | À rejouer par l'équipe. |

## ⚠️ Problèmes rencontrés

1. **La run solo se figeait dès le premier tour sur la production.** Trouvé en appliquant l'action de la rétro 3 (vérifier en jouant sur l'URL Render) : 3 essais sur 3 bloqués, alors que tout passait en local et que le bundle était **identique** (même hash). La différence venait du réseau. Sur Render, les sprites arrivent plus lentement, et un clic avant la fin du chargement de la scène Phaser envoyait `play-events` à une scène qui n'existait pas encore. `events-played` ne revenait jamais et le menu restait masqué. Reproduit en local en retardant les sprites de 2,5 s, puis corrigé : même filet de sécurité de 4,5 s que le duel, et la scène rend la main si elle n'est pas prête ([#54](https://github.com/kifuj/Dark-Dungeon-Fantasy-Boss-Battle/pull/54)). Le duel n'était pas touché, car il avait ce filet depuis le sprint 3. **C'est exactement le cas qui aurait pu arriver pendant la démo, sur le réseau de l'école.**
2. **Onze espèces n'ont pas de compétence à PP illimités.** Les monstres ajoutés par US-29 (et quelques anciens) n'ont pas `strike`. Un dernier monstre à court de PP n'avait donc **aucune action valide** : tous les boutons étaient grisés et le duel restait bloqué. Découvert en écrivant l'action par défaut d'US-20. Elle change de monstre si c'est possible, sinon elle frappe quand même (le moteur le résout) ; le timeout débloque donc ce cas. Côté solo, l'IA avait déjà ce repli.
3. **Conflits à chaque fusion sur `src/index.css`** : les 4 US ajoutaient leurs styles à la fin du même fichier. La première résolution automatique a perdu trois accolades (le build ne passait plus). Rattrapé avant la fusion grâce au build lancé sur une branche d'intégration locale.
4. **Test du timeout sans attendre 60 s** : avancer `turn_deadline` en SQL ne suffit pas, car le client ignore une ligne dont la `version` n'a pas changé (c'est voulu). Le script recharge donc la page, ce qui teste au passage la reprise « En attente ». Dans `npm run test:multi`, la deadline est avancée par l'API de gestion Supabase quand `SUPABASE_ACCESS_TOKEN` est présent, sinon le script attend vraiment 62 s.
5. **Un tour chargé dépassait les 4 s de l'US-09** : deux attaques avec drain, un KO et un remplacement faisaient 4,15 s. Durées recalibrées (3,55 s au pire). Les textes flottants de l'ennemi sortaient aussi du haut du canvas.
6. **US-01 encore bloquée par un accès** : pas d'accès au dashboard Render depuis le poste. La protection de `main` a pu être activée. Pour la 4ᵉ fois, ce qui reste ouvert dépend d'un accès et non du code.

## 🧭 Décisions prises pendant le sprint

| Heure | Décision | Raison |
|---|---|---|
| 9h00 | **La règle Render d'US-01 est laissée au propriétaire des accès**, les 4 US engagées démarrent tout de suite. | Aucun accès au dashboard Render depuis le poste de développement : attendre aurait bloqué le sprint. |
| 9h00 | **La potion relève aussi les monstres KO** ; le parchemin ne fait jamais oublier une compétence à PP illimités ; « Recrutement » donne le premier ennemi de la vague vaincue, à son niveau. | Règles de la doc 01 §6.2 précisées là où elles étaient ambiguës. Le soin de fin de vague (US-11) laisse les KO à terre « jusqu'à une récompense ». |
| 9h05 | **La page Crédits lit `docs/CREDITS.md` au build** au lieu de recopier son contenu. | Une seule source : la règle « chaque asset a sa ligne dans CREDITS.md » suffit désormais à le créditer dans le jeu. |
| 9h10 | **Le timeout marche aussi pendant le draft** (3 premières propositions). | `match-start` fixait déjà une deadline pour le draft : sans cela, un joueur qui ferme l'onglet pendant le draft bloquait le match. |
| 9h15 | **Les 4 PR sont testées ensemble** sur une branche d'intégration locale (build de production + deux navigateurs) **avant** toute fusion. | Même règle qu'au sprint 3 ; c'est ce qui a attrapé les accolades perdues. |
| 9h20 | **Vérification de chaque US en jouant sur la production**, pas seulement en local. | Action de la rétro 3. C'est ce qui a révélé la run solo figée. |
| 9h20 | **US-09 démarre en bonus**. | Les 4 US engagées étaient fusionnées, il restait plus de 3h avant le gel. |
| 9h58 | **Protection de `main` activée** : PR obligatoire, sans approbation exigée, administrateurs non bloqués. | Une approbation obligatoire aurait bloqué les fusions faites depuis un seul poste le jour du rendu. |
| 9h59 | **Base Supabase remise à zéro** (profils, comptes anonymes, salons, matchs). | Démo sur une base propre ; l'équipe ressaisit ses pseudos. |
| 10h20 | **Le PO ajoute 6 US en bonus** (US-13, US-30 à US-34) et la précision « équipe de 4 monstres max » dans la doc. Le choix du remplaçant vaut **aussi pour le duel**. | Retours de jeu sur la run solo : remplacement arbitraire après un KO, pas d'abandon, boss et raretés absents. Rangées dans le jalon `Sprint 4` en bonus, sans toucher à l'engagement. |
| 10h25 | **La rareté est calculée depuis la puissance** (somme des stats de base), pas saisie à la main. | Un rééquilibrage de stats met la rareté à jour tout seul ; les starters restent désignés par leur identifiant. |
| 10h40 | **Pas de nouveau champ dans `BattleState`** pour la phase de remplacement : elle se déduit d'un monstre actif à 0 PV. | Aucun changement de schéma en base ni de migration le jour du rendu ; les matchs en cours restent lisibles. |
| 10h55 | **Edge Functions redéployées avant la fusion**, puis `test:multi` et un duel à deux navigateurs. | Le serveur doit accepter la phase de remplacement avant que le client de production la propose. |

## 🗣️ Comptes rendus de Daily Scrum

### Sprint Planning — ⏰ 9h00

Sprint Goal relu, board capturé (jalon `Sprint 4` à 0 %), US découpées en tâches (tableau ci-dessus). Planning Poker joué (tableau ci-dessus), US-18 et US-29 rejouées après coup. Relecteurs désignés : Paul relit US-12 et US-20, Owen relit US-26, Donovan relit US-21, Owen relit US-09.

### Daily n°1 — ⏰ 10h00

| Membre | Ce que j'ai fait depuis le dernier point | Ce que je fais maintenant | Blocages |
|---|---|---|---|
| Mattéo | US-09 terminée en bonus ([#55](https://github.com/kifuj/Dark-Dungeon-Fantasy-Boss-Battle/pull/55)) ; correctif de la run solo figée sur Render ([#54](https://github.com/kifuj/Dark-Dungeon-Fantasy-Boss-Battle/pull/54)) ; protection de `main` activée | Vidéo de secours et diaporama | Pas d'accès au dashboard Render pour la règle de réécriture |
| Owen | US-12 fusionnée ([#50](https://github.com/kifuj/Dark-Dungeon-Fantasy-Boss-Battle/pull/50)), jouée sur la production jusqu'à la vague 3 | Relecture de US-09 ; captures des récompenses | Aucun |
| Paul | US-21 fusionnée ([#52](https://github.com/kifuj/Dark-Dungeon-Fantasy-Boss-Battle/pull/52)) ; relecture de US-12 et US-20 ; duel rejoué sur deux navigateurs sur l'URL Render | Remise à zéro de la base avant la démo | Aucun |
| Donovan | US-26 ([#51](https://github.com/kifuj/Dark-Dungeon-Fantasy-Boss-Battle/pull/51)) et US-20 ([#53](https://github.com/kifuj/Dark-Dungeon-Fantasy-Boss-Battle/pull/53)) fusionnées, `match-timeout` déployée, `test:multi` à 55 vérifications | README et comptes rendus des sprints | Aucun |

**Décisions / actions :**
- **Les 12 points engagés sont terminés** et vérifiés sur la production ; US-09 est comptée à part, en bonus.
- **Gel des fonctionnalités dès maintenant** : jusqu'à 13h, seulement des corrections, la doc et la préparation de la démo.
- Base remise à zéro **tout de suite** (les profils de test encombrent le classement des pseudos) ; chacun ressaisit son pseudo.

### Daily n°2 — ⏰ 11h00

| Membre | Ce que j'ai fait depuis le dernier point | Ce que je fais maintenant | Blocages |
|---|---|---|---|
| Mattéo | Vidéo de secours (2 min 30, jouée sur la production) et diaporama de 12 slides | Répétition de la démo sur deux PC | Règle Render toujours en attente |
| Owen | Relecture de US-09 : textes empilés et fondu KO vérifiés en jeu | Répétition de la partie « Pitch » de la présentation | Aucun |
| Paul | Base remise à zéro, Supabase vérifié (auth et API répondent) | Relecture des comptes rendus de sprint et du tableau de vélocité | Aucun |
| Donovan | Comptes rendus des sprints 1 et 4, README, Product Backlog | Checklist de rendu | Aucun |

**Décisions / actions :**
- Démo en direct sur la production, **vidéo de secours prête** si le réseau de l'école lâche.
- Pendant la démo du duel, on raccourcit le minuteur avec la vidéo plutôt que d'attendre 60 s en direct.

### Daily n°3 — ⏰ 12h00

| Membre | Ce que j'ai fait depuis le dernier point | Ce que je fais maintenant | Blocages |
|---|---|---|---|
| Mattéo | Démo répétée sur deux PC, sur la base vide | Sprint Review à 12h30 | Aucun |
| Owen | Répétition du pitch | Captures de la review | Aucun |
| Paul | Comptes rendus relus, vélocité vérifiée (60 / 66 points) | Animer la rétrospective à 12h37 | Aucun |
| Donovan | Checklist de rendu cochée, dépôt vérifié en navigation privée | Préparer le mail de rendu | Aucun |

**Décisions / actions :**
- Gel du code maintenu à 13h ; aucune PR ouverte.
- Mail de rendu envoyé par Mattéo avant 13h30, avec le lien du dépôt, l'URL du jeu et les fichiers `.md`.

---

## 🎬 Sprint Review *(T-15 min)*

> Tenue à 12h30, avant la rétrospective.

**Présentée par (PO) :** Mattéo
**URL démontrée :** <https://dark-dungeon-fantasy-boss-battle.onrender.com>

**Démo** : run solo (starter → vague 1 → choix d'une récompense → vague 2) → page Crédits → duel sur deux navigateurs : draft, un joueur joue, l'autre rafraîchit et retrouve le tour, puis passe par le menu et « Reprendre la partie » → on laisse le minuteur tomber à 0 → le tour se joue tout seul.

| US | Terminée (DoD) ? | Démontrée ? | Commentaire du PO |
|---|---|---|---|
| US-12 | ✅ | ✅ | La run a enfin du sens : on construit son équipe. Le choix du monstre visé est clair |
| US-21 | ✅ | ✅ | Rafraîchir en plein tour ne coûte plus rien ; le bouton du menu ramène au bon match |
| US-20 | ✅ | ✅ | Le minuteur rouge se voit bien ; le tour se joue seul pour l'absent |
| US-26 | ✅ | ✅ | Une seule source (`CREDITS.md`) : impossible d'oublier un asset |
| US-09 *(bonus)* | ✅ | ✅ | Critique et efficacité lisibles ensemble ; un tour tient sous les 4 s |
| US-18 *(bonus, livrée le 16/09)* | ✅ (sauf relecture) | ✅ | Montrée dans la démo du duel |
| US-29 *(bonus, livrée le 16/09)* | ✅ (sauf relecture) | ✅ | 20 espèces visibles dans le draft |
| US-30, US-31, US-13, US-32, US-33, US-34 *(ajouts du PO, bonus)* | ✅ (sauf relecture) | à démontrer | Livrées le 17/09 au matin, vérifiées dans le navigateur et par `test:multi` |
| US-01 | ❌ | — | Protection de `main` faite ; la règle de réécriture Render reste à régler |

- **Points engagés** : 12 (+ 5 bonus) — **Points terminés** : **12** (+ 5 bonus avec US-09)
- **Sprint Goal atteint ?** ☑ Oui ☐ Partiellement ☐ Non
- **Écart de DoD assumé** : comme aux sprints 2 et 3, les PR ont un relecteur désigné mais sont fusionnées par le même compte. La protection de `main`, activée pendant ce sprint, impose désormais une PR, sans exiger encore d'approbation.
- **Reste dans le Product Backlog (pistes pour la suite) :** US-01 (réglages Render et GitHub), US-14 (score et classement), US-22 (duel en 3 manches), US-25 (audio), US-27 (mobile), US-28 (statuts). Donner `strike` (ou une compétence à PP illimités) à toutes les espèces.

📸 **Jalon `Sprint 4` en fin de sprint** (US-01 seule ouverte) :

![Review sprint 4](./captures/sprint-4-review.png)

---

## 🔁 Rétrospective — Keep / Drop / Try

> Tenue à 12h37, 15 minutes avant la fin du créneau.

| ✅ Keep | ❌ Drop | 🧪 Try |
|---|---|---|
| Jouer chaque US sur la production : c'est ce qui a trouvé la run solo figée, invisible en local | Ajouter ses styles à la fin du même fichier CSS à quatre : trois conflits et un build cassé | Un fichier de styles par écran, pour que deux US ne touchent jamais les mêmes lignes |
| Tester les PR ensemble sur une branche d'intégration avant de fusionner | Laisser une US (US-01) dépendre des accès d'une seule personne pendant 4 sprints | Partager les accès Render et dépôt entre deux membres dès le premier sprint |
| Automatiser les scénarios multijoueur (`test:multi`, 55 vérifications) | Désigner un relecteur puis fusionner avec le même compte | Exiger une approbation dans la protection de `main` |
| Réduire l'engagement quand le créneau est court : 12 points tenus avant 10h | Supposer que le réseau de production vaut celui du poste de dev | Ralentir le réseau dans les tests navigateur |

**Action d'amélioration retenue (pour un prochain projet) :** *partager les accès aux services externes (hébergeur, dépôt, base) entre au moins deux membres dès le Sprint Planning du sprint 1 : c'est la seule chose qui a traîné pendant tout le projet.*

## 📦 Checklist de rendu (jeudi 13h30)

- [x] Lien GitHub public qui fonctionne en navigation privée (vérifié sans session : 200)
- [x] URL Render de production dans le README : https://dark-dungeon-fantasy-boss-battle.onrender.com
- [x] `PRODUCT-BACKLOG.md` : estimations d'équipe remplies, journal du Planning Poker
- [x] `SPRINT-1.md` à `SPRINT-4.md` : goal, backlog, dailies, review, rétro remplis + captures
- [x] `00-PROJET-GLOBAL.md` : tableau de vélocité rempli
- [x] `CREDITS.md` complet (et affiché dans le jeu)
- [x] Vidéo de secours enregistrée ([`docs/presentation/demo-secours.mp4`](../presentation/demo-secours.mp4))
- [x] Diaporama ([`docs/presentation/soutenance.html`](../presentation/soutenance.html))
- [x] Base Supabase remise à zéro
- [ ] Mail envoyé avec les liens et les fichiers `.md`

## 📊 Bilan global du projet

| Sprint | Engagés | Terminés | Sprint Goal atteint |
|---|---|---|---|
| 1 | 18 | 12 | Partiellement (Supabase et Render non configurés) |
| 2 | 18 | 18 | Oui |
| 3 | 18 | 18 (+3 d'US-02) | Oui |
| 4 | 12 | 12 (+5 bonus avec US-09, +18 bonus avec les ajouts du PO) | Oui |
| **Total** | **66** | **60** (+3 récupérés, +23 bonus) | |

Hors sprint : US-18 (draft) et US-29 (bestiaire), 8 points proposés, livrés le 16/09 après la review du sprint 3.

**Ce que l'équipe retient du projet :**

- **Une US n'est finie que quand on l'a jouée là où le joueur la jouera.** Les deux bugs les plus graves du projet (chemins d'assets au sprint 3, run solo figée au sprint 4) étaient invisibles en local et dans les tests unitaires.
- **Le code n'a jamais été le problème, les accès l'ont été.** Tout ce qui a traîné (US-01, US-02) dépendait d'un compte externe tenu par une seule personne.
- **Un moteur pur et partagé paie tout le long** : écrit au sprint 1, il a servi au solo, au serveur du duel, au draft et au timeout sans être réécrit.
- **L'estimation s'est calée vite** : 12 points au sprint 1, puis tout l'engagement tenu aux sprints 2, 3 et 4.

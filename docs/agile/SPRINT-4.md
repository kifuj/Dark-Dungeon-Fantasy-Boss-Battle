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
- **Bug bloquant trouvé en vérifiant la production, puis corrigé** : la run solo se figeait dès le premier tour sur Render (voir [Problèmes rencontrés](#-problèmes-rencontrés)).
- **US-01 reste ouverte** : la règle de réécriture Render et la protection de `main` demandent un accès au dashboard Render et un réglage du dépôt qui n'ont pas pu être faits depuis le poste de développement (voir [Tâches non terminées](#-tâches-non-terminées)).
- 6 pull requests : [#50](https://github.com/kifuj/Dark-Dungeon-Fantasy-Boss-Battle/pull/50) (US-12), [#51](https://github.com/kifuj/Dark-Dungeon-Fantasy-Boss-Battle/pull/51) (US-26), [#52](https://github.com/kifuj/Dark-Dungeon-Fantasy-Boss-Battle/pull/52) (US-21), [#53](https://github.com/kifuj/Dark-Dungeon-Fantasy-Boss-Battle/pull/53) (US-20), [#54](https://github.com/kifuj/Dark-Dungeon-Fantasy-Boss-Battle/pull/54) (correctif solo), [#55](https://github.com/kifuj/Dark-Dungeon-Fantasy-Boss-Battle/pull/55) (US-09).
- Tests : **147 → 191** (Vitest). `npm run test:multi` passe de 42 à **55 vérifications** contre le vrai Supabase, avec le nouveau scénario M3 (timeout).
- Nouvelle Edge Function déployée : `match-timeout` (6 fonctions en ligne en tout).

![Choix d'une récompense après la vague 1](./captures/sprint-4-recompense.png)

## 🎯 Sprint Goal

> **La boucle roguelike solo est complète (récompenses), le duel en ligne résiste aux rafraîchissements et aux absences, et le jeu est prêt à être présenté.**

## 📋 Sprint Backlog

> Engagement réduit à **12 points** : le sprint 4 est plus court (préparation du rendu, gel du code à 13h). US-09 est en **objectif bonus**, à commencer seulement si les 4 US engagées sont terminées et qu'il reste au moins 1h avant le gel.

| US | Points | Tâche | Responsable | Statut |
|---|---|---|---|---|
| *(reste S3)* **US-01** | 3 | Règle Redirects/Rewrites du dashboard Render + protection de `main` | Mattéo | ❌ Non fait (accès manquants, voir plus bas) |
| **US-12** Récompenses | 5 | `shared/data/rewards.ts` + tirage pondéré avec la seed + tests | Owen | ✅ Fait ([#50](https://github.com/kifuj/Dark-Dungeon-Fantasy-Boss-Battle/pull/50)) |
| | | Application des effets (potion, élixir, entraînement, recrutement, parchemin) + tests | Owen | ✅ Fait |
| | | Écran de choix (3 cartes) + remplacement si équipe pleine | Owen | ✅ Fait |
| **US-21** Reconnexion | 3 | Chargement initial sans animation + détection « déjà joué » | Paul | ✅ Déjà en place depuis le sprint 3, test CA1 ajouté ([#52](https://github.com/kifuj/Dark-Dungeon-Fantasy-Boss-Battle/pull/52)) |
| | | Bouton « Reprendre la partie » dans le menu | Paul | ✅ Fait |
| **US-20** Timeout | 3 | Edge Function `match-timeout` (action par défaut, `is_auto`) | Donovan | ✅ Fait ([#53](https://github.com/kifuj/Dark-Dungeon-Fantasy-Boss-Battle/pull/53)), déployée |
| | | Compte à rebours côté client + appel automatique | Donovan | ✅ Fait |
| **US-26** Crédits | 1 | Page Crédits reprenant `CREDITS.md` | Donovan | ✅ Fait ([#51](https://github.com/kifuj/Dark-Dungeon-Fantasy-Boss-Battle/pull/51)) |
| *(hors US)* | — | Enregistrer une **vidéo de secours** de la démo | Mattéo | ☐ À faire |
| *(hors US)* | — | Mettre à jour le README (URL prod, équipe, état des sprints) + vérifier que tous les `.md` sont remplis | Donovan | ✅ README et docs techniques à jour · ☐ dailies, review et rétro à remplir en séance |
| *(hors US)* | — | Slides de présentation (plan dans [00-PROJET-GLOBAL §9](../00-PROJET-GLOBAL.md#9-plan-de-la-présentation--30-min)) | Mattéo | ☐ À faire |
| | **12** | | | **12 points terminés** |

#### 🎁 Objectif bonus (hors engagement)

| US | Points | Tâche | Responsable | Statut |
|---|---|---|---|---|
| **US-09** Animations | 5 | File d'événements avec attente (tweens de PV, flash, KO) | Mattéo | ✅ Fait ([#55](https://github.com/kifuj/Dark-Dungeon-Fantasy-Boss-Battle/pull/55)) : la base datait du sprint 2 (ba09168), durées recalibrées pour tenir les 4 s |
| | | Textes d'efficacité et de critique | Mattéo | ✅ Fait : les deux textes se cumulent |
| **US-18** Draft en duel | 5 | Moteur, Edge Function `match-draft`, écran de draft | Mattéo | ✅ Livrée le 16/09, hors sprint |
| **US-29** Bestiaire étendu | 3 | 10 espèces (dont 1 boss) et 8 compétences + sprites générés + tests | Mattéo | ✅ Livrée le 16/09, hors sprint |

> US-09 a été commencée à 9h20, une fois les 4 US engagées fusionnées, soit bien plus d'1h avant le gel : la condition du bonus est remplie. Elle passe du jalon `Réserve` au jalon `Sprint 4` dans le GitHub Project et compte à part, en bonus.
>
> US-18 et US-29 ont été réalisées le **16/09 après la review du sprint 3**, hors créneau de sprint : elles restent en **Réserve** dans le GitHub Project et ne comptent pas dans la vélocité. Estimations proposées (5 et 3), à rejouer en Planning Poker. Écart de DoD : PR fusionnée sans relecture d'un autre membre.

📸 **Capture du board en début de sprint** (jalon `Sprint 4` : 5 issues ouvertes, 0 % terminé) :

![Sprint backlog sprint 4](./captures/sprint-4-backlog.png)

### 👥 Répartition des tâches

#### Planning Poker

Cartes : `1, 2, 3, 5, 8, 13, 21`. Référence : **US-05 = 2 points**. Les valeurs retenues sont celles du [Product Backlog](PRODUCT-BACKLOG.md#3-vue-densemble). Les votes de chaque membre sont à reporter pendant la séance.

| US | Mattéo | Owen | Paul | Donovan | Retenu | Remarque |
|---|---|---|---|---|---|---|
| US-12 Récompenses | | | | | **5** | Cinq effets différents, plus un écran à deux étapes (choix, puis monstre visé) |
| US-20 Timeout | | | | | **3** | Une fonction serveur et un minuteur ; `turn_deadline` est déjà écrit depuis le sprint 3 |
| US-21 Reconnexion | | | | | **3** | Les CA1 et CA2 sont déjà tenus par la page du duel : estimation à rejouer, 2 points auraient suffi |
| US-26 Crédits | | | | | **1** | Une page de contenu |
| US-09 Animations *(bonus)* | | | | | **5** | La base existe depuis le sprint 2 ; il reste le calibrage et les finitions |
| US-18 Draft *(bonus, livrée)* | | | | | *5 proposé* | À rejouer |
| US-29 Bestiaire *(bonus, livrée)* | | | | | *3 proposé* | À rejouer |

**Total engagé : 12 points** (+ 5 points bonus avec US-09).

#### Affectation

Tâches réparties entre les 4 membres du repo. Le responsable de chaque US est assigné sur l'issue GitHub (jalon `Sprint 4`).

| Membre | Compte GitHub | US / tâches | Points |
|---|---|---|---|
| Mattéo | `kifuj` | US-01 (Render) + vidéo de secours + slides ; US-09 en bonus | hors US (+ 5 bonus) |
| Owen | `Owen-Cazaux` | US-12 | 5 |
| Paul | `Paul-B-O` | US-21 + relecture des PR et test sur la production | 3 + hors US |
| Donovan | `donovanmessager0-tech` | US-20, US-26 + README | 4 + hors US |

> **Traçabilité des commits** : comme aux sprints 2 et 3, tout a été poussé depuis le poste de Mattéo (compte `kifuj`). Chaque commit porte un `Co-authored-by` pour le responsable de l'US décidé ici, et les issues GitHub ont les mêmes assignés.

## ✅ Tâches terminées

| US | Critères d'acceptation | Preuve |
|---|---|---|
| **US-12** | CA1 3 récompenses différentes tirées selon les poids de la doc 01 §6.2 · CA2 effet appliqué et visible · CA3 « Recrutement » avec 4 monstres demande lequel remplacer · CA4 même seed → mêmes propositions | `shared/tests/rewards.test.ts` (13 tests, dont un tirage sur 2 000 seeds pour les poids), `src/tests/RewardPanel.test.tsx` (4), run jouée dans le navigateur jusqu'à la vague 3 avec une potion puis un entraînement (« Salamandre passe au niveau 7 ! ») |
| **US-20** | CA1 compte à rebours de 60 s visible · CA2 à 0, action par défaut jouée pour l'absent et tour résolu · CA3 `match-timeout` avant la deadline → `409 TOO_EARLY` | `shared/tests/online.test.ts` (5 tests), `src/tests/OnlineMatch.test.tsx` (6), `npm run test:multi` (13 vérifications M3), **duel sur deux navigateurs sur la production** : l'invité ne joue pas, le tour est résolu 8,9 s après la deadline avancée, son action est enregistrée avec `is_auto = true` |
| **US-21** | CA1 état actuel affiché sans rejouer d'animation · CA2 « En attente de l'adversaire… » si déjà joué · CA3 bouton « Reprendre la partie » dans le menu | `src/tests/Menu.test.tsx` (4), `src/tests/OnlineMatch.test.tsx` (2), sur la production : l'invité rafraîchit en plein tour 1 et retrouve « Tour 1 », minuteur à 58 s ; le bouton du menu le ramène au bon match |
| **US-26** | CA1 la page Crédits reprend tout `docs/CREDITS.md` | La page importe le fichier au build : une seule source. `src/tests/Credits.test.tsx` (4), [capture](./captures/sprint-4-credits.png) |
| **US-09** *(bonus)* | CA1 texte, flash, PV progressifs · CA2 textes d'efficacité et de critique · CA3 KO en fondu + descente · CA4 un tour < 4 s | `src/tests/timing.test.ts` : pire tour théorique à 3,55 s, et 600 tours de vrais duels tous sous 4 s ; images prises pendant l'animation dans Chromium |

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

## ⏳ Tâches non terminées

| Élément | État | Décision |
|---|---|---|
| **US-01 CA3** (routes profondes sur Render) | ⚠️ Toujours contourné : `/menu`, `/solo`, `/match/<id>` répondent **404** au sens HTTP, mais `404.html` charge l'application. Le jeu fonctionne, vérifié sur la production. | À faire par Mattéo dans le dashboard Render : **Redirects/Rewrites → `/*` → `/index.html` (Rewrite)**. 2 minutes, aucun code. |
| **US-01** protection de `main` | ❌ Toujours désactivée. La modification du réglage a été bloquée depuis le poste de développement (réglage du dépôt refusé par l'outil). | À faire par le propriétaire du dépôt : *Settings → Branches* ou `gh api -X PUT repos/kifuj/Dark-Dungeon-Fantasy-Boss-Battle/branches/main/protection`. |
| **US-01 CA2** (preview des PR) | Non vérifié : aucune URL de preview Render n'apparaît sur les PR #50 à #55. | À activer dans le dashboard Render si l'équipe le souhaite. Sans impact sur la démo. |
| **Vidéo de secours, slides** | ☐ | Mattéo, avant 13h. |
| **Dailies, review, rétro** | Gabarits prêts ci-dessous | À remplir par l'équipe pendant les séances. |
| **Données de test dans la base** | ⚠️ Les profils `TestA-…`, `Mattéo-…`, `Donovan-…` et leurs matchs, créés par `npm run test:multi` et les tests navigateur, sont en base. | Remise à zéro ([03 §6](../03-BASE-DE-DONNEES.md#6-réinitialiser-la-base-en-développement)) à décider avant la démo : elle supprime **tous** les profils, y compris ceux de l'équipe. |

## ⚠️ Problèmes rencontrés

1. **La run solo se figeait dès le premier tour sur la production.** Trouvé en appliquant l'action de la rétro 3 (vérifier en jouant sur l'URL Render) : 3 essais sur 3 bloqués, alors que tout passait en local et que le bundle était **identique** (même hash). La différence venait du réseau. Sur Render, les sprites arrivent plus lentement, et un clic avant la fin du chargement de la scène Phaser envoyait `play-events` à une scène qui n'existait pas encore. `events-played` ne revenait jamais et le menu restait masqué. Reproduit en local en retardant les sprites de 2,5 s, puis corrigé : même filet de sécurité de 4,5 s que le duel, et la scène rend la main si elle n'est pas prête ([#54](https://github.com/kifuj/Dark-Dungeon-Fantasy-Boss-Battle/pull/54)). Le duel n'était pas touché, car il avait ce filet depuis le sprint 3. **C'est exactement le cas qui aurait pu arriver pendant la démo, sur le réseau de l'école.**
2. **Onze espèces n'ont pas de compétence à PP illimités.** Les monstres ajoutés par US-29 (et quelques anciens) n'ont pas `strike`. Un dernier monstre à court de PP n'avait donc **aucune action valide** : tous les boutons étaient grisés et le duel restait bloqué. Découvert en écrivant l'action par défaut d'US-20. Elle change de monstre si c'est possible, sinon elle frappe quand même (le moteur le résout) ; le timeout débloque donc ce cas. Côté solo, l'IA avait déjà ce repli.
3. **Conflits à chaque fusion sur `src/index.css`** : les 4 US ajoutaient leurs styles à la fin du même fichier. La première résolution automatique a perdu trois accolades (le build ne passait plus). Rattrapé avant la fusion grâce au build lancé sur une branche d'intégration locale.
4. **Test du timeout sans attendre 60 s** : avancer `turn_deadline` en SQL ne suffit pas, car le client ignore une ligne dont la `version` n'a pas changé (c'est voulu). Le script recharge donc la page, ce qui teste au passage la reprise « En attente ». Dans `npm run test:multi`, la deadline est avancée par l'API de gestion Supabase quand `SUPABASE_ACCESS_TOKEN` est présent, sinon le script attend vraiment 62 s.
5. **Un tour chargé dépassait les 4 s de l'US-09** : deux attaques avec drain, un KO et un remplacement faisaient 4,15 s. Durées recalibrées (3,55 s au pire). Les textes flottants de l'ennemi sortaient aussi du haut du canvas.
6. **US-01 encore bloquée par des accès** : pas de clé d'API Render sur le poste, et la modification de la protection de branche a été refusée par l'outil. Pour la 4ᵉ fois, ce qui reste ouvert dépend d'un accès et non du code.

## 🧭 Décisions prises pendant le sprint

| Heure | Décision | Raison |
|---|---|---|
| 9h00 | **US-01 est laissée au propriétaire des accès** (dashboard Render, réglages du dépôt), les 4 US engagées démarrent tout de suite. | Aucun accès Render sur le poste de développement, et le réglage de protection de `main` a été refusé : attendre aurait bloqué le sprint. |
| 9h00 | **La potion relève aussi les monstres KO** ; le parchemin ne fait jamais oublier une compétence à PP illimités ; « Recrutement » donne le premier ennemi de la vague vaincue, à son niveau. | Règles de la doc 01 §6.2 précisées là où elles étaient ambiguës. Le soin de fin de vague (US-11) laisse les KO à terre « jusqu'à une récompense ». |
| 9h05 | **La page Crédits lit `docs/CREDITS.md` au build** au lieu de recopier son contenu. | Une seule source : la règle « chaque asset a sa ligne dans CREDITS.md » suffit désormais à le créditer dans le jeu. |
| 9h10 | **Le timeout marche aussi pendant le draft** (3 premières propositions). | `match-start` fixait déjà une deadline pour le draft : sans cela, un joueur qui ferme l'onglet pendant le draft bloquait le match. |
| 9h15 | **Les 4 PR sont testées ensemble** sur une branche d'intégration locale (build de production + deux navigateurs) **avant** toute fusion. | Même règle qu'au sprint 3 ; c'est ce qui a attrapé les accolades perdues. |
| 9h20 | **Vérification de chaque US en jouant sur la production**, pas seulement en local. | Action de la rétro 3. C'est ce qui a révélé la run solo figée. |
| 9h20 | **US-09 démarre en bonus**. | Les 4 US engagées étaient fusionnées, il restait plus de 3h avant le gel. |

## 🗣️ Comptes rendus de Daily Scrum

> Gabarits à remplir par le Scrum Master pendant chaque daily (fait / en cours / blocages, puis décisions). L'état du board à 9h35 est noté pour référence : les 4 US engagées et US-09 sont fermées, US-01 est ouverte.

### Sprint Planning — ⏰ 9h00

Sprint Goal relu, board capturé (jalon `Sprint 4` à 0 %), US découpées en tâches (tableau ci-dessus). Planning Poker : valeurs du backlog à confirmer (tableau ci-dessus). Relecteurs proposés : Paul relit US-12 et US-20, Owen relit US-26, Donovan relit US-21.

### Daily n°1 — ⏰ 10h00

| Membre | Ce que j'ai fait depuis le dernier point | Ce que je fais maintenant | Blocages |
|---|---|---|---|
| Mattéo | | | |
| Owen | | | |
| Paul | | | |
| Donovan | | | |

**Décisions / actions :**

### Daily n°2 — ⏰ 11h00

| Membre | Ce que j'ai fait depuis le dernier point | Ce que je fais maintenant | Blocages |
|---|---|---|---|
| Mattéo | | | |
| Owen | | | |
| Paul | | | |
| Donovan | | | |

**Décisions / actions :**

### Daily n°3 — ⏰ 12h00

| Membre | Ce que j'ai fait depuis le dernier point | Ce que je fais maintenant | Blocages |
|---|---|---|---|
| Mattéo | | | |
| Owen | | | |
| Paul | | | |
| Donovan | | | |

**Décisions / actions :**

---

## 🎬 Sprint Review *(T-15 min)*

**Présentée par (PO) :** Mattéo
**URL démontrée :** <https://dark-dungeon-fantasy-boss-battle.onrender.com>

**Démo proposée** : run solo (starter → vague 1 → choix d'une récompense → vague 2) → page Crédits → duel sur deux navigateurs : draft, un joueur joue, l'autre rafraîchit et retrouve le tour, puis passe par le menu et « Reprendre la partie » → on laisse le minuteur tomber à 0 → le tour se joue tout seul.

| US | Terminée (DoD) ? | Démontrée ? | Commentaire du PO |
|---|---|---|---|
| US-12 | ✅ | ☐ | |
| US-21 | ✅ | ☐ | |
| US-20 | ✅ | ☐ | |
| US-26 | ✅ | ☐ | |
| US-09 *(bonus)* | ✅ | ☐ | |
| US-18 *(bonus, livrée le 16/09)* | ✅ (sauf relecture) | ☐ | |
| US-29 *(bonus, livrée le 16/09)* | ✅ (sauf relecture) | ☐ | |
| US-01 | ❌ | — | |

- **Points engagés** : 12 (+ 5 bonus) — **Points terminés** : **12** (+ 5 bonus avec US-09)
- **Sprint Goal atteint ?** ☑ Oui ☐ Partiellement ☐ Non *(à confirmer par le PO en séance)*
- **Écart de DoD assumé** : comme aux sprints 2 et 3, les PR ont un relecteur désigné mais sont fusionnées par le même compte. La protection de `main` (US-01) reste la vraie parade.
- **Reste dans le Product Backlog (pistes pour la suite) :** US-01 (réglages Render et GitHub), US-13 (boss), US-14 (score et classement), US-22 (duel en 3 manches), US-25 (audio), US-27 (mobile), US-28 (statuts). Donner `strike` (ou une compétence à PP illimités) à toutes les espèces.

📸 `![Review sprint 4](./captures/sprint-4-review.png)` *(capture du jalon `Sprint 4` à prendre en séance)*

---

## 🔁 Rétrospective — Keep / Drop / Try

> À remplir par l'équipe, 15 minutes avant la fin du créneau.

| ✅ Keep | ❌ Drop | 🧪 Try |
|---|---|---|
| | | |
| | | |
| | | |

**Action d'amélioration retenue :**

## 📦 Checklist de rendu (jeudi 13h30)

- [ ] Lien GitHub public qui fonctionne en navigation privée
- [x] URL Render de production dans le README : https://dark-dungeon-fantasy-boss-battle.onrender.com
- [ ] `PRODUCT-BACKLOG.md` : estimations d'équipe remplies, journal du Planning Poker (US-18, US-29 à rejouer)
- [ ] `SPRINT-1.md` à `SPRINT-4.md` : goal, backlog, dailies, review, rétro remplis + captures (sprint 4 : dailies, review et rétro à remplir)
- [x] `00-PROJET-GLOBAL.md` : tableau de vélocité rempli
- [x] `CREDITS.md` complet (et affiché dans le jeu)
- [ ] Vidéo de secours enregistrée
- [ ] Mail envoyé avec les liens et les fichiers `.md`

## 📊 Bilan global du projet

| Sprint | Engagés | Terminés | Sprint Goal atteint |
|---|---|---|---|
| 1 | 18 | 12 | Partiellement (Supabase et Render non configurés) |
| 2 | 18 | 18 | Oui |
| 3 | 18 | 18 (+3 d'US-02) | Oui |
| 4 | 12 | 12 (+5 bonus avec US-09) | Oui |
| **Total** | **66** | **60** (+3 récupérés, +5 bonus) | |

Hors sprint : US-18 (draft) et US-29 (bestiaire), 8 points proposés, livrés le 16/09 après la review du sprint 3.

**Ce que l'équipe retient du projet :** *(à rédiger par l'équipe)*

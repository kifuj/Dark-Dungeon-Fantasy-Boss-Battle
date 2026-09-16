# 02 — Architecture technique

## 1. Choix de la stack

| Besoin | Choix | Pourquoi |
|---|---|---|
| Menus, formulaires, lobby | **React + TypeScript + Vite** | Stack JS recommandée par le TP ; compatible avec les maquettes exportées depuis Lovable (React + Tailwind) |
| Rendu du combat | **Phaser 4** | Moteur 2D mature (sprites, tweens, spritesheets, mise à l'échelle pixel-art). La plupart des tutos Phaser 3 restent valables |
| Règles du jeu | **TypeScript pur** dans `shared/` | Le même code tourne dans le navigateur (solo) et sur le serveur (multi) |
| Hébergement du front | **Render** (Static Site) | Gratuit, déploiement automatique depuis GitHub, previews de PR |
| Serveur autoritaire | **Supabase Edge Functions** (`supabase/functions/`) | Un Static Site n'exécute pas de code serveur ; les Edge Functions sont gratuites, sans mise en veille, et au plus près de la BDD |
| Données + auth | **Supabase** Postgres + Auth anonyme | Recommandé par le TP, gratuit, sécurité par RLS |
| Temps réel | **Supabase Realtime** (`postgres_changes`) | Ni un Static Site ni une Edge Function ne gardent de WebSocket ouverte : la diffusion est déléguée à Supabase |
| Tests | **Vitest** | Intégré à Vite, rapide |

> **Pourquoi pas Socket.io ou un serveur Node permanent ?** Il faudrait un Web Service Render en plus du Static Site ; sur l'offre gratuite, il se met en veille après 15 min d'inactivité et met près d'une minute à se réveiller, ce qui est risqué en démo. Les Edge Functions sont éphémères : elles traitent une requête puis s'arrêtent. Pour du **tour par tour**, « requête HTTP pour jouer + notification temps réel pour recevoir » est plus simple et plus robuste.

## 2. Vue d'ensemble

```mermaid
flowchart TB
  subgraph Navigateur["Navigateur (x2 en multi)"]
    R[React : pages, lobby, HUD]
    P[Phaser : BattleScene]
    SH1[shared/ moteur]
    R <-- EventBus --> P
    R --> SH1
  end

  subgraph Render["Render (Static Site)"]
    ST[Fichiers statiques Vite /dist]
  end

  subgraph Supabase
    API[Edge Functions rooms-* / match-*]
    SH2[shared/ moteur]
    API --> SH2
    AUTH[Auth anonyme]
    DB[(Postgres + RLS)]
    RT[Realtime]
    DB --> RT
  end

  R -- "chargement" --> ST
  R -- "LECTURES (select)" --> DB
  R -- "ÉCRITURES (functions.invoke + JWT)" --> API
  API -- "clé secrète" --> DB
  RT -- "UPDATE matches / rooms" --> R
  R -- "signInAnonymously" --> AUTH
```

### 🔑 La règle d'or

| Opération | Passe par | Pourquoi |
|---|---|---|
| **Lire** (profil, salon, état du match, classement) | Client → Supabase directement | Simple et rapide, protégé par la RLS |
| **Écrire une action de jeu** (créer ou rejoindre un salon, jouer un tour) | Client → **Edge Function** → Supabase | Le serveur **valide** l'action et **calcule** le résultat : impossible de tricher en modifiant le JS |
| **Écrire des données non critiques** (pseudo, score solo) | Client → Supabase directement | Autorisé par une RLS stricte (on ne peut écrire que ses propres lignes) |

## 3. Arborescence

```
.                                 # racine du dépôt
├─ supabase/
│  ├─ config.toml                #   généré par `supabase init`
│  ├─ migrations/001_init.sql
│  └─ functions/                 # ⚙️ Supabase Edge Functions (Deno, serveur autoritaire)
│     ├─ deno.json
│     ├─ _shared/                #   "_" : pas déployé comme fonction
│     │  ├─ supabaseAdmin.ts     #   client Supabase avec la clé secrète
│     │  ├─ auth.ts              #   getUser() : vérifie le JWT
│     │  ├─ http.ts              #   CORS, helpers de réponse / erreurs
│     │  └─ turns.ts             #   tryResolve() : résolution des tours
│     ├─ rooms-create/index.ts
│     ├─ rooms-join/index.ts
│     ├─ match-start/index.ts
│     ├─ match-draft/index.ts
│     ├─ match-action/index.ts
│     ├─ match-timeout/index.ts
│     └─ match-forfeit/index.ts
├─ shared/                       # 🧠 Code PUR partagé (ni React, ni Phaser, ni Supabase)
│  ├─ types.ts
│  ├─ data/  elements.ts · skills.ts · monsters.ts · rewards.ts
│  ├─ engine/ rng.ts · stats.ts · damage.ts · battle.ts · validate.ts · ai.ts · run.ts
│  └─ tests/  *.test.ts
├─ src/                          # 🖥️ Client
│  ├─ main.tsx · App.tsx (routes)
│  ├─ pages/ Title · Login · Menu · SoloRun · Lobby · Room · OnlineMatch · Leaderboard · Credits
│  ├─ game/
│  │  ├─ PhaserGame.tsx          #   monte/démonte le jeu Phaser dans React
│  │  ├─ EventBus.ts
│  │  ├─ config.ts
│  │  └─ scenes/ BootScene.ts · PreloadScene.ts · BattleScene.ts
│  ├─ lib/ supabase.ts · api.ts · realtime.ts
│  └─ components/                #   boutons, barre d'actions, modales (Lovable)
├─ public/assets/ sprites/ · ui/ · fonts/ · audio/
├─ docs/
├─ .env.example
├─ vite.config.ts
└─ package.json
```

> **Imports** : dans `shared/`, imports **relatifs avec extension `.js`** (`import { computeDamage } from './damage.js'`), compris par Vite et TypeScript. Dans `supabase/functions/`, imports **relatifs avec extension `.ts`** (Deno) et paquets npm avec le préfixe `npm:`. Pas d'alias `@/` dans ces dossiers. L'import de `shared/` depuis une Edge Function est détaillé en [07 §1](07-INSTALLATION-DEPLOIEMENT.md#supabasefunctionsdenojson).

## 4. Principes du moteur partagé (`shared/`)

1. **Pur** : `nouvelÉtat = f(ancienÉtat, actions, rng)`, sans effet de bord, sans DOM, sans réseau.
2. **Déterministe** : tout l'aléatoire passe par un générateur `rng` créé à partir d'une seed. Même seed + mêmes actions = même résultat.
3. **Sérialisable** : l'état est un simple objet JSON, stocké tel quel dans la colonne `matches.state` (jsonb).
4. **Produit des événements** : `resolveTurn` renvoie la liste `events[]` (dégâts, KO, changement…) que Phaser **rejoue** pour animer le tour. Le client n'a jamais à recalculer le combat.
5. **Testé** : chaque règle a au moins un test Vitest.

Les détails sont dans [06-MOTEUR-DE-COMBAT](06-MOTEUR-DE-COMBAT.md).

## 5. Liaison React ↔ Phaser

React gère les écrans et les boutons ; Phaser dessine le combat. Les deux communiquent par un **EventBus**, sur le modèle du template officiel Phaser + React.

```ts
// src/game/EventBus.ts
import { Events } from 'phaser';
export const EventBus = new Events.EventEmitter();
```

```ts
// src/game/config.ts
import { AUTO, Scale, type Types } from 'phaser';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { BattleScene } from './scenes/BattleScene';

export const gameConfig: Types.Core.GameConfig = {
  type: AUTO,
  width: 480,
  height: 270,
  pixelArt: true,                 // pas de lissage des pixels
  backgroundColor: '#1a1423',
  scale: { mode: Scale.FIT, autoCenter: Scale.CENTER_BOTH },
  scene: [BootScene, PreloadScene, BattleScene],
};
```

```tsx
// src/game/PhaserGame.tsx
import { useLayoutEffect, useRef } from 'react';
import { Game } from 'phaser';
import { gameConfig } from './config';

export function PhaserGame() {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const game = new Game({ ...gameConfig, parent: containerRef.current! });
    return () => game.destroy(true); // indispensable (StrictMode monte 2 fois en dev)
  }, []);

  return <div ref={containerRef} className="game-container" />;
}
```

### Événements échangés

| Événement | Sens | Données | Usage |
|---|---|---|---|
| `scene-ready` | Phaser → React | — | La scène est prête à recevoir un état |
| `battle-init` | React → Phaser | `{ state, playerSeat }` | Afficher les monstres et les PV |
| `battle-update` | React → Phaser | `BattleState` | Rafraîchir sprites, noms et barres de PV après un tour |
| `battle-banner` | React → Phaser | `string \| null` | Bandeau « Vague N » au début d'une vague |
| `play-events` | React → Phaser | `BattleEvent[]` | Rejouer un tour résolu |
| `events-played` | — | — | Le menu d'actions peut réapparaître |
| `battle-end` | Phaser → React | `winnerSeat` | Afficher l'écran de fin ou de récompense |

> **État au sprint 2** : `battle-init`, `battle-update`, `battle-banner` et `scene-ready` sont implémentés.
> `play-events` est bien émis, mais la scène **n'anime pas encore** les événements : React applique l'état final
> et rend la main après un court délai (`events-played`). Les animations et les textes dans le canvas sont l'**US-09**.

Le **menu d'actions** (4 compétences, Changer, Abandonner) peut être en React par-dessus le canvas (plus rapide à coder, compatible avec Lovable) ou dans Phaser. **Recommandation : React.**

### Rejouer les événements dans Phaser

```ts
// src/game/scenes/BattleScene.ts (extrait)
async playEvents(events: BattleEvent[]) {
  for (const e of events) {
    switch (e.type) {
      case 'skill_used':
        this.showText(`${e.actorName} utilise ${e.skillName} !`);
        await this.wait(700);
        break;
      case 'damage':
        await this.flash(e.targetSeat);
        await this.tweenHpBar(e.targetSeat, e.hpAfter, e.maxHp);
        if (e.effectiveness > 1) { this.showText("C'est super efficace !"); await this.wait(600); }
        if (e.crit) { this.showText('Coup critique !'); await this.wait(600); }
        break;
      case 'faint':
        await this.playFaint(e.seat);
        break;
      case 'switch':
        await this.swapSprite(e.seat, e.toIndex);
        break;
    }
  }
  EventBus.emit('events-played');
}

private wait(ms: number) {
  return new Promise<void>((resolve) => this.time.delayedCall(ms, resolve));
}
```

## 6. Flux solo et flux multijoueur

| Étape | Solo | Multijoueur |
|---|---|---|
| Où tourne `resolveTurn` | Dans le **navigateur** | Dans une **Supabase Edge Function** |
| Action de l'adversaire | `chooseAiAction()` en local | Envoyée par l'autre joueur à l'API |
| Réception du résultat | Retour direct de la fonction | **Supabase Realtime** (UPDATE sur `matches`) |
| Sauvegarde | Score en fin de run (`solo_runs`) | État à chaque tour (`matches.state`) |
| Triche possible | Oui (score modifiable), sans gravité | Non : le serveur fait autorité |

Le détail du flux multijoueur est dans [04-MULTIJOUEUR](04-MULTIJOUEUR.md).

## 7. Sécurité

- **Clé secrète Supabase** (`service_role`) : **uniquement** dans les Edge Functions, où Supabase l'injecte automatiquement (`SUPABASE_SERVICE_ROLE_KEY`). Jamais sur Render, jamais dans du code préfixé `VITE_`, jamais commitée.
- **Clé publishable** (anciennement `anon`) : peut être exposée côté client (variable Render `VITE_SUPABASE_PUBLISHABLE_KEY`) ; la sécurité repose sur la **RLS**.
- Chaque Edge Function vérifie le **JWT** de l'utilisateur, que le joueur **appartient au match**, la **phase**, le **numéro de tour** et la **validité de l'action**.
- Aucune policy RLS n'autorise un client à modifier `matches`, `match_actions` ou `rooms` : seule l'API écrit dans ces tables.

## 8. Limites des offres gratuites

| Service | Limite utile | Impact pour nous |
|---|---|---|
| Supabase Free | 500 Mo de BDD, 200 connexions Realtime simultanées, 2 M messages/mois, 500 000 appels d'Edge Functions/mois, pause après 7 jours d'inactivité | Aucun pour une démo |
| Render Static Site (gratuit) | Bande passante mensuelle limitée ; pas de mise en veille pour un site statique | Aucun |

> Astuce latence : créer le projet Supabase en région **Paris (eu-west-3)**, pour que la BDD soit proche des joueurs et des Edge Functions.

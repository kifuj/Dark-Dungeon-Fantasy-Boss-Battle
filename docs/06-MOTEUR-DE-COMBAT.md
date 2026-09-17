# 06 — Moteur de combat (`shared/`)

> Le moteur est la **pièce centrale** : le mode solo (dans le navigateur) et le multijoueur (dans l'API) utilisent exactement le même code. Il doit être **pur, déterministe et testé**. Les règles sont décrites dans [01-GAME-DESIGN](01-GAME-DESIGN.md).

## 1. Types

```ts
// shared/types.ts
export type Element = 'feu' | 'eau' | 'nature' | 'lumiere' | 'ombre' | 'neutre';
export type Seat = 0 | 1;

export interface BaseStats { hp: number; atk: number; def: number; spd: number }

export interface SkillDef {
  id: string;
  name: string;
  element: Element;
  power: number;            // 0 pour les compétences sans dégâts
  pp: number | null;        // null = illimité
  priority?: number;        // défaut 0
  effect?: 'heal30' | 'drain50' | 'defUp';
}

/** Déduite de la puissance (somme des stats de base), voir §2 et 01-GAME-DESIGN §5.1. */
export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'boss';

export interface SpeciesDef {
  id: string;
  name: string;
  element: Element;
  base: BaseStats;
  skills: string[];
  rarity: Rarity;
  sprite: string;           // clé de texture Phaser
}

export interface MonsterInstance {
  uid: string;
  speciesId: string;
  name: string;
  element: Element;
  level: number;
  hp: number;
  maxHp: number;
  stats: { atk: number; def: number; spd: number };
  skills: { id: string; ppLeft: number | null }[];
  modifiers: { defMult: number };
}

export interface PlayerState {
  userId: string | null;    // null pour l'IA
  team: MonsterInstance[];
  activeIndex: number;
}

export interface BattleState {
  round: number;
  turn: number;
  players: [PlayerState, PlayerState];
  /** Phase `draft` (US-18) : espèces proposées à chaque siège ; `null` une fois le combat lancé. */
  draftOffers?: [string[], string[]] | null;
}

export type Action =
  | { type: 'skill'; skillId: string }
  | { type: 'switch'; toIndex: number }
  | { type: 'forfeit' };

export type BattleEvent =
  | { type: 'switch'; seat: Seat; fromIndex: number; toIndex: number; forced: boolean; name: string }
  | { type: 'skill_used'; seat: Seat; actorName: string; skillName: string; skillId: string }
  | { type: 'damage'; targetSeat: Seat; amount: number; hpAfter: number; maxHp: number; effectiveness: number; crit: boolean }
  | { type: 'heal'; seat: Seat; amount: number; hpAfter: number; maxHp: number }
  | { type: 'buff'; seat: Seat; stat: 'def'; mult: number }
  | { type: 'faint'; seat: Seat; index: number; name: string }
  | { type: 'forfeit'; seat: Seat }
  | { type: 'battle_end'; winnerSeat: Seat };

export interface TurnResult {
  state: BattleState;
  events: BattleEvent[];
  winnerSeat: Seat | null;
}

export type Rng = () => number; // renvoie un nombre dans [0, 1[
```

## 2. Données

```ts
// shared/data/elements.ts
import type { Element } from '../types.js';

const STRONG_AGAINST: Record<Element, Element[]> = {
  feu: ['nature'],
  nature: ['eau'],
  eau: ['feu'],
  lumiere: ['ombre'],
  ombre: ['lumiere'],
  neutre: [],
};

export function elementMultiplier(attack: Element, defense: Element): number {
  if (STRONG_AGAINST[attack].includes(defense)) return 2;
  if (STRONG_AGAINST[defense].includes(attack)) return 0.5;
  return 1;
}
```

```ts
// shared/data/skills.ts (extrait)
import type { SkillDef } from '../types.js';

export const SKILLS: Record<string, SkillDef> = {
  strike:       { id: 'strike',       name: 'Frappe',        element: 'neutre', power: 40, pp: null },
  quick_strike: { id: 'quick_strike', name: 'Frappe rapide', element: 'neutre', power: 25, pp: 10, priority: 1 },
  fireball:     { id: 'fireball',     name: 'Boule de feu',  element: 'feu',    power: 50, pp: 10 },
  regrowth:     { id: 'regrowth',     name: 'Régénération',  element: 'nature', power: 0,  pp: 3, effect: 'heal30' },
  life_drain:   { id: 'life_drain',   name: 'Drain vital',   element: 'ombre',  power: 40, pp: 5, effect: 'drain50' },
  // … voir la liste complète dans 01-GAME-DESIGN
};
```

```ts
// shared/data/monsters.ts (extrait)
import type { SpeciesDef } from '../types.js';
import { rarityForPower, speciesPower } from './rarities.js';

const BESTIARY: Record<string, Omit<SpeciesDef, 'rarity'>> = {
  salamander: {
    id: 'salamander', name: 'Salamandre', element: 'feu',
    base: { hp: 55, atk: 70, def: 45, spd: 60 },
    skills: ['fireball', 'inferno', 'strike'], sprite: 'salamander',
  },
  // …
};

// La rareté n'est jamais saisie : elle suit la puissance de l'espèce.
export const SPECIES: Record<string, SpeciesDef> = Object.fromEntries(
  Object.entries(BESTIARY).map(([id, species]) => [id, { ...species, rarity: rarityForPower(speciesPower(species.base)) }]),
);
```

```ts
// shared/data/rarities.ts (extrait)
export const RARITIES: Record<Rarity, RarityDef> = {
  common:   { minPower: 0,   firstWave: 1, weight: 50, loot: 0, … },
  uncommon: { minPower: 215, firstWave: 3, weight: 30, loot: 1, … },
  rare:     { minPower: 230, firstWave: 5, weight: 20, loot: 2, … },
  epic:     { minPower: 245, firstWave: 8, weight: 12, loot: 3, … },
  boss:     { minPower: 265, firstWave: 5, weight: 0,  loot: 4, … }, // vagues de boss uniquement
};
export const speciesPower = (base: BaseStats) => base.hp + base.atk + base.def + base.spd;
```

Les starters sont désignés par `STARTER_IDS` (`shared/engine/run.ts`), pas par leur rareté : ils ont une rareté comme les autres, mais n'apparaissent jamais dans les vagues.

## 3. Aléatoire déterministe

`Math.random()` est **interdit** dans `shared/`. On utilise `mulberry32`, un petit générateur pseudo-aléatoire rapide et reproductible.

```ts
// shared/engine/rng.ts
import type { Rng } from '../types.js';

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** RNG propre à un tour : même seed de match + même tour = mêmes tirages. */
export function createTurnRng(seed: number, round: number, turn: number): Rng {
  return mulberry32((seed ^ Math.imul(round, 0x9e3779b1) ^ Math.imul(turn, 0x85ebca6b)) >>> 0);
}

export const randInt = (rng: Rng, min: number, max: number) => min + Math.floor(rng() * (max - min + 1));
export const pick = <T>(rng: Rng, items: readonly T[]): T => items[Math.floor(rng() * items.length)];
```

> **Seed d'une run solo** : `Math.floor(Math.random() * 2 ** 31)` est tiré **une seule fois** au début de la run (dans `src/`, pas dans `shared/`) et stocké avec la run.

## 4. Stats et création d'un monstre

```ts
// shared/engine/stats.ts
import { SPECIES } from '../data/monsters.js';
import { SKILLS } from '../data/skills.js';
import type { MonsterInstance } from '../types.js';

export const statAtLevel = (base: number, level: number) => Math.floor(base * (1 + (level - 1) * 0.08));

export function createMonster(speciesId: string, level: number, uid: string): MonsterInstance {
  const s = SPECIES[speciesId];
  const maxHp = statAtLevel(s.base.hp, level);
  return {
    uid, speciesId, name: s.name, element: s.element, level,
    hp: maxHp, maxHp,
    stats: {
      atk: statAtLevel(s.base.atk, level),
      def: statAtLevel(s.base.def, level),
      spd: statAtLevel(s.base.spd, level),
    },
    skills: s.skills.map((id) => ({ id, ppLeft: SKILLS[id].pp })),
    modifiers: { defMult: 1 },
  };
}
```

## 5. Dégâts

```ts
// shared/engine/damage.ts
import { elementMultiplier } from '../data/elements.js';
import type { MonsterInstance, Rng, SkillDef } from '../types.js';

export const CRIT_CHANCE = 1 / 16;

export function computeDamage(attacker: MonsterInstance, defender: MonsterInstance, skill: SkillDef, rng: Rng) {
  const levelFactor = (attacker.level + 10) / 60;
  const ratio = attacker.stats.atk / (defender.stats.def * defender.modifiers.defMult);
  const effectiveness = elementMultiplier(skill.element, defender.element);
  const stab = skill.element !== 'neutre' && skill.element === attacker.element ? 1.25 : 1;
  const crit = rng() < CRIT_CHANCE;
  const roll = 0.9 + rng() * 0.1;

  const raw = skill.power * ratio * levelFactor * effectiveness * stab * roll * (crit ? 1.5 : 1);
  return { amount: Math.max(1, Math.floor(raw)), effectiveness, crit };
}
```

> ⚠️ **L'ordre des appels à `rng()` fait partie des règles.** Si on ajoute un tirage (précision, statut…), les résultats changent pour une même seed. Ce n'est pas grave, à condition que client et serveur soient déployés avec la même version.

## 6. Résolution d'un tour

```ts
// shared/engine/battle.ts
import { SKILLS } from '../data/skills.js';
import { computeDamage } from './damage.js';
import type { Action, BattleEvent, BattleState, Rng, Seat, TurnResult } from '../types.js';

const other = (seat: Seat): Seat => (seat === 0 ? 1 : 0);
const active = (s: BattleState, seat: Seat) => s.players[seat].team[s.players[seat].activeIndex];
const isDefeated = (s: BattleState, seat: Seat) => s.players[seat].team.every((m) => m.hp <= 0);

function actionPriority(state: BattleState, seat: Seat, action: Action): number {
  if (action.type === 'forfeit') return 100;
  if (action.type === 'switch') return 10;
  return SKILLS[action.skillId].priority ?? 0;
}

export function getActionOrder(state: BattleState, actions: [Action, Action], rng: Rng): Seat[] {
  const p0 = actionPriority(state, 0, actions[0]);
  const p1 = actionPriority(state, 1, actions[1]);
  if (p0 !== p1) return p0 > p1 ? [0, 1] : [1, 0];
  const s0 = active(state, 0).stats.spd;
  const s1 = active(state, 1).stats.spd;
  if (s0 !== s1) return s0 > s1 ? [0, 1] : [1, 0];
  return rng() < 0.5 ? [0, 1] : [1, 0];
}

export function resolveTurn(input: BattleState, actions: [Action, Action], rng: Rng): TurnResult {
  const state: BattleState = structuredClone(input); // ne jamais modifier l'entrée
  const events: BattleEvent[] = [];
  const end = (winnerSeat: Seat): TurnResult => {
    events.push({ type: 'battle_end', winnerSeat });
    return { state, events, winnerSeat };
  };

  for (const seat of getActionOrder(state, actions, rng)) {
    const action = actions[seat];
    const actor = active(state, seat);

    if (action.type === 'forfeit') {
      events.push({ type: 'forfeit', seat });
      return end(other(seat));
    }
    if (actor.hp <= 0) continue; // KO avant d'agir

    if (action.type === 'switch') {
      const player = state.players[seat];
      const fromIndex = player.activeIndex;
      player.activeIndex = action.toIndex;
      events.push({ type: 'switch', seat, fromIndex, toIndex: action.toIndex, forced: false, name: active(state, seat).name });
      continue;
    }

    const skill = SKILLS[action.skillId];
    const slot = actor.skills.find((s) => s.id === skill.id)!;
    if (slot.ppLeft !== null) slot.ppLeft -= 1;
    events.push({ type: 'skill_used', seat, actorName: actor.name, skillName: skill.name, skillId: skill.id });

    if (skill.effect === 'heal30') {
      const amount = Math.min(Math.floor(actor.maxHp * 0.3), actor.maxHp - actor.hp);
      actor.hp += amount;
      events.push({ type: 'heal', seat, amount, hpAfter: actor.hp, maxHp: actor.maxHp });
      continue;
    }
    if (skill.effect === 'defUp') {
      actor.modifiers.defMult *= 1.25;
      events.push({ type: 'buff', seat, stat: 'def', mult: 1.25 });
      continue;
    }

    const targetSeat = other(seat);
    const target = active(state, targetSeat);
    const { amount, effectiveness, crit } = computeDamage(actor, target, skill, rng);
    const dealt = Math.min(amount, target.hp);
    target.hp -= dealt;
    events.push({ type: 'damage', targetSeat, amount: dealt, hpAfter: target.hp, maxHp: target.maxHp, effectiveness, crit });

    if (skill.effect === 'drain50' && dealt > 0) {
      const heal = Math.min(Math.floor(dealt / 2), actor.maxHp - actor.hp);
      actor.hp += heal;
      events.push({ type: 'heal', seat, amount: heal, hpAfter: actor.hp, maxHp: actor.maxHp });
    }
    if (target.hp <= 0) {
      events.push({ type: 'faint', seat: targetSeat, index: state.players[targetSeat].activeIndex, name: target.name });
      if (isDefeated(state, targetSeat)) return end(seat);
    }
  }

  // Un monstre actif KO n'est pas remplacé ici : son joueur choisit le remplaçant
  // pendant la phase de remplacement qui suit (§6.1).
  state.turn += 1;
  return { state, events, winnerSeat: null };
}
```

### 6.1 Phase de remplacement après un KO

Depuis le sprint 4, le moteur ne choisit plus le remplaçant d'un monstre KO. Après un tour où un monstre actif tombe KO (et s'il reste un monstre en vie), l'état « attend » un choix :

```ts
// shared/engine/replace.ts
export function needsReplacement(state: BattleState, seat: Seat): boolean;   // actif KO + un monstre en vie
export const replacementSeats = (state: BattleState): Seat[] => …;          // sièges qui doivent choisir
export function resolveReplacement(state: BattleState, choices: Partial<Record<Seat, number>>): TurnResult;
```

- Aucun champ n'est ajouté à `BattleState` : la phase se déduit de l'état (monstre actif à 0 PV).
- `resolveReplacement` émet un `switch` avec `forced: true` par siège concerné et **avance `turn`** (en ligne, c'est le numéro de tour qui identifie les actions attendues). Un choix absent ou invalide retombe sur le premier monstre en vie : un duel ne peut pas rester bloqué.
- Pendant cette phase, `validateAction` (§7) n'accepte qu'un `switch` du joueur concerné et refuse toute action de l'autre joueur.
- Solo : le joueur choisit dans le menu ; l'IA choisit aussitôt avec `chooseAiReplacement` (§8). Duel : voir [04 §5](04-MULTIJOUEUR.md#5-résolution-côté-serveur).

## 7. Validation d'une action (serveur **et** client)

```ts
// shared/engine/validate.ts
import { SKILLS } from '../data/skills.js';
import type { BattleState, Seat } from '../types.js';

export function validateAction(state: BattleState, seat: Seat, action: unknown): { ok: true } | { ok: false; reason: string } {
  if (typeof action !== 'object' || action === null) return { ok: false, reason: 'not_an_object' };
  const a = action as Record<string, unknown>;
  const player = state.players[seat];
  const current = player.team[player.activeIndex];

  // Phase de remplacement (§6.1) : seuls les joueurs dont le monstre est KO jouent, et uniquement un changement.
  const replacing = replacementSeats(state);
  if (replacing.length > 0 && !replacing.includes(seat)) return { ok: false, reason: 'opponent_replacing' };
  if (replacing.includes(seat) && a.type !== 'switch') return { ok: false, reason: 'must_replace' };

  if (a.type === 'skill') {
    const slot = current.skills.find((s) => s.id === a.skillId);
    if (!slot || !SKILLS[slot.id]) return { ok: false, reason: 'unknown_skill' };
    if (slot.ppLeft !== null && slot.ppLeft <= 0) return { ok: false, reason: 'no_pp' };
    return { ok: true };
  }
  if (a.type === 'switch') {
    const i = a.toIndex;
    if (!Number.isInteger(i) || (i as number) < 0 || (i as number) >= player.team.length) return { ok: false, reason: 'bad_index' };
    if (i === player.activeIndex) return { ok: false, reason: 'already_active' };
    if (player.team[i as number].hp <= 0) return { ok: false, reason: 'fainted' };
    return { ok: true };
  }
  return { ok: false, reason: 'unknown_type' };
}
```

> Côté client, `validateAction` sert à **griser** les boutons impossibles. Côté serveur, il **bloque** les requêtes trafiquées. L'abandon passe par la fonction `match-forfeit`, pas par `match-action`.

## 8. IA (mode solo)

```ts
// shared/engine/ai.ts
import { SKILLS } from '../data/skills.js';
import { elementMultiplier } from '../data/elements.js';
import { pick } from './rng.js';
import type { Action, BattleState, Rng, Seat } from '../types.js';

export function chooseAiAction(state: BattleState, seat: Seat, rng: Rng): Action {
  const me = state.players[seat].team[state.players[seat].activeIndex];
  const foeSeat: Seat = seat === 0 ? 1 : 0;
  const foe = state.players[foeSeat].team[state.players[foeSeat].activeIndex];
  const usable = me.skills.filter((s) => s.ppLeft === null || s.ppLeft > 0).map((s) => SKILLS[s.id]);

  // 30 % du temps : coup au hasard (l'IA reste battable)
  if (rng() < 0.3) return { type: 'skill', skillId: pick(rng, usable).id };

  // Se soigner si PV bas
  const heal = usable.find((s) => s.effect === 'heal30');
  if (heal && me.hp / me.maxHp < 0.35) return { type: 'skill', skillId: heal.id };

  // Sinon : dégâts attendus maximaux
  const score = (s: (typeof usable)[number]) =>
    s.power * elementMultiplier(s.element, foe.element) * (s.element === me.element && s.element !== 'neutre' ? 1.25 : 1);
  const best = usable.reduce((a, b) => (score(b) > score(a) ? b : a));
  return { type: 'skill', skillId: best.id };
}
```

Quand son monstre tombe KO, l'IA appelle `chooseAiReplacement(state, seat)` : elle prend le monstre en vie qui a le meilleur rapport d'élément contre le monstre actif du joueur (le premier dans l'ordre de l'équipe en cas d'égalité).

## 9. Boucle solo (côté client)

```ts
// src/pages/SoloRun.tsx (logique simplifiée)
const runRng = mulberry32(runSeed);

function onPlayerAction(action: Action) {
  if (needsReplacement(battle, 0)) return animate(resolveReplacement(battle, { 0: action.toIndex })); // choix du remplaçant
  const rng = createTurnRng(runSeed, wave, battle.turn);
  const aiAction = chooseAiAction(battle, 1, rng);
  let result = resolveTurn(battle, [action, aiAction], rng);
  if (needsReplacement(result.state, 1)) result = merge(result, resolveReplacement(result.state, { 1: chooseAiReplacement(result.state, 1) }));
  animate(result);                                   // l'état est appliqué à la fin de l'animation
  if (result.winnerSeat === 0) goToRewards();        // nextWave(run, team, activeIndex) puis drawRewards(seed, wave)
  if (result.winnerSeat === 1) endRun();
}
```

- **Vagues** (`shared/engine/run.ts`) : `enemiesForWave(seed, wave)` renvoie un boss seul si `isBossWave(wave)` (vagues 5, 10…), sinon tire la rareté de chaque ennemi parmi `raritiesForWave(wave)` puis l'espèce. `lootLevelForWave` donne le niveau de butin de la vague.
- **Ordre de l'équipe** : `RunState.activeIndex` garde le monstre actif d'une vague à l'autre ; `battleForWave` le remet en jeu s'il est en vie.
- **Récompenses** (`shared/engine/rewards.ts`) : `rewardPool(seed, wave)` filtre les récompenses selon le niveau de butin ; `drawRewards` place la Relique en tête après un boss.
- **Abandon** : bouton « Abandonner » avec confirmation ; la run s'arrête sur l'écran « Run abandonnée » (pas d'appel serveur, le solo est local).

## 10. Tests (Vitest)

```ts
// shared/tests/battle.test.ts
import { describe, expect, it } from 'vitest';
import { elementMultiplier } from '../data/elements.js';
import { createMonster } from '../engine/stats.js';
import { mulberry32, createTurnRng } from '../engine/rng.js';
import { resolveTurn, getActionOrder } from '../engine/battle.js';
import { validateAction } from '../engine/validate.js';
import type { BattleState } from '../types.js';

const makeState = (a: string, b: string, level = 10): BattleState => ({
  round: 1, turn: 1,
  players: [
    { userId: 'p1', activeIndex: 0, team: [createMonster(a, level, 'p1-0'), createMonster('goblin', level, 'p1-1')] },
    { userId: 'p2', activeIndex: 0, team: [createMonster(b, level, 'p2-0')] },
  ],
});

describe('éléments', () => {
  it('feu est super efficace contre nature', () => expect(elementMultiplier('feu', 'nature')).toBe(2));
  it('feu est peu efficace contre eau', () => expect(elementMultiplier('feu', 'eau')).toBe(0.5));
  it('lumière et ombre se font ×2', () => {
    expect(elementMultiplier('lumiere', 'ombre')).toBe(2);
    expect(elementMultiplier('ombre', 'lumiere')).toBe(2);
  });
});

describe('rng', () => {
  it('même seed → même suite', () => {
    const a = mulberry32(42), b = mulberry32(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
});

describe('resolveTurn', () => {
  it('est déterministe', () => {
    const s = makeState('salamander', 'mushroom');
    const acts = [{ type: 'skill', skillId: 'fireball' }, { type: 'skill', skillId: 'vine' }] as const;
    const r1 = resolveTurn(s, [...acts], createTurnRng(123, 1, 1));
    const r2 = resolveTurn(s, [...acts], createTurnRng(123, 1, 1));
    expect(r1).toEqual(r2);
  });

  it("ne modifie pas l'état d'entrée", () => {
    const s = makeState('salamander', 'mushroom');
    const copy = structuredClone(s);
    resolveTurn(s, [{ type: 'skill', skillId: 'fireball' }, { type: 'skill', skillId: 'vine' }], mulberry32(1));
    expect(s).toEqual(copy);
  });

  it('le changement de monstre passe avant les compétences', () => {
    const s = makeState('salamander', 'flying_eye');
    const order = getActionOrder(s, [{ type: 'switch', toIndex: 1 }, { type: 'skill', skillId: 'quick_strike' }], mulberry32(1));
    expect(order).toEqual([0, 1]);
  });

  it('déclare la victoire quand toute l\'équipe adverse est KO', () => {
    const s = makeState('salamander', 'mushroom');
    s.players[1].team[0].hp = 1;
    const r = resolveTurn(s, [{ type: 'skill', skillId: 'fireball' }, { type: 'skill', skillId: 'vine' }], mulberry32(7));
    expect(r.winnerSeat).toBe(0);
    expect(r.events.at(-1)).toEqual({ type: 'battle_end', winnerSeat: 0 });
  });
});

describe('validateAction', () => {
  it('refuse une compétence que le monstre ne connaît pas', () => {
    expect(validateAction(makeState('salamander', 'slime'), 0, { type: 'skill', skillId: 'deluge' }).ok).toBe(false);
  });
  it('refuse de changer vers un monstre KO', () => {
    const s = makeState('salamander', 'slime');
    s.players[0].team[1].hp = 0;
    expect(validateAction(s, 0, { type: 'switch', toIndex: 1 }).ok).toBe(false);
  });
});
```

Script `package.json` : `"test": "vitest"` (en CI ou avant une PR : `npx vitest run`).

### Couverture de tests minimale (DoD)

- [ ] Table des éléments (6 cas minimum)
- [ ] Déterminisme de `resolveTurn`
- [ ] Immutabilité de l'entrée
- [ ] Ordre : abandon > changement > priorité > vitesse
- [ ] KO avant d'agir → pas d'action
- [ ] Pas de remplacement automatique : phase de remplacement au choix du joueur (`replace.test.ts`)
- [ ] Victoire et défaite
- [ ] Consommation des PP et refus à 0 PP
- [ ] `validateAction` : chaque cas de refus

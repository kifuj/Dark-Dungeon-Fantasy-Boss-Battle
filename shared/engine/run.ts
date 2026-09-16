import { SPECIES } from '../data/monsters.js';
import { mulberry32, pick } from './rng.js';
import { createMonster } from './stats.js';
import type { BattleState, MonsterInstance } from '../types.js';

/** Run solo (US-10 et US-11, docs/01-GAME-DESIGN.md §6). */
export interface RunState {
  seed: number;
  /** Numéro de la vague en cours, à partir de 1. */
  wave: number;
  team: MonsterInstance[];
}

export const STARTER_IDS = ['salamander', 'undine', 'mushroom'] as const;
export const STARTER_LEVEL = 5;
/** Part des PV max récupérée après chaque vague gagnée (US-11 CA3). */
export const WAVE_HEAL = 0.2;

/** Espèces pouvant apparaître dans une vague : ni starters, ni boss (les boss sont l'US-13). */
export const WAVE_POOL = Object.values(SPECIES)
  .filter((s) => s.rarity === 'common' || s.rarity === 'rare')
  .map((s) => s.id)
  .sort();

export function createRun(starterId: string, seed: number): RunState {
  if (!STARTER_IDS.includes(starterId as (typeof STARTER_IDS)[number])) throw new Error(`Starter inconnu : ${starterId}`);
  return { seed, wave: 1, team: [createMonster(starterId, STARTER_LEVEL, `${seed}-p0`)] };
}

/** RNG propre à une vague : même seed de run + même vague = même ennemi. */
export const waveRng = (seed: number, wave: number) => mulberry32((seed ^ Math.imul(wave, 0x27d4eb2d)) >>> 0);

/** Ennemi de la vague N : niveau `3 + N`, espèce tirée avec la seed de la run (US-11 CA1). */
export function enemyForWave(seed: number, wave: number): MonsterInstance {
  return enemiesForWave(seed, wave)[0];
}

/** À partir de la vague 6, la vague compte 2 monstres (docs/01-GAME-DESIGN.md §6.1). */
export const WAVE_WITH_TWO_ENEMIES = 6;

export function enemiesForWave(seed: number, wave: number): MonsterInstance[] {
  const rng = waveRng(seed, wave);
  const count = wave >= WAVE_WITH_TWO_ENEMIES ? 2 : 1;
  return Array.from({ length: count }, (_, i) => createMonster(pick(rng, WAVE_POOL), 3 + wave, `${seed}-e${wave}-${i}`));
}

/** Combat de la vague en cours : le joueur occupe le siège 0, l'IA le siège 1. */
export function battleForWave(run: RunState): BattleState {
  const team = structuredClone(run.team);
  const activeIndex = Math.max(0, team.findIndex((m) => m.hp > 0));
  return {
    round: run.wave,
    turn: 1,
    players: [
      { userId: 'solo', team, activeIndex },
      { userId: null, team: enemiesForWave(run.seed, run.wave), activeIndex: 0 },
    ],
  };
}

/** Soin de fin de vague : les monstres KO le restent jusqu'à une récompense (US-12). */
export function healTeam(team: MonsterInstance[], fraction = WAVE_HEAL): MonsterInstance[] {
  return team.map((m) => (m.hp <= 0 ? m : { ...m, hp: Math.min(m.maxHp, m.hp + Math.floor(m.maxHp * fraction)) }));
}

/** Vague suivante : on garde les PV et les PP du combat, puis on soigne (US-11 CA3). */
export function nextWave(run: RunState, teamAfterBattle: MonsterInstance[]): RunState {
  return { seed: run.seed, wave: run.wave + 1, team: healTeam(teamAfterBattle) };
}

export const isRunOver = (team: MonsterInstance[]) => team.every((m) => m.hp <= 0);

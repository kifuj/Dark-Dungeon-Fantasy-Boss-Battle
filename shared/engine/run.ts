import { EVOLVED_IDS, SPECIES, speciesAtLevel } from '../data/monsters.js';
import { RARITIES, RARITY_ORDER } from '../data/rarities.js';
import { mulberry32, pick } from './rng.js';
import { createMonster } from './stats.js';
import type { BattleState, MonsterInstance, Rarity, Rng } from '../types.js';

/** Run solo (US-10 et US-11, docs/01-GAME-DESIGN.md §6). */
export interface RunState {
  seed: number;
  /** Numéro de la vague en cours, à partir de 1. */
  wave: number;
  team: MonsterInstance[];
  /** Monstre sur le terrain à la fin de la vague précédente : il ouvre la suivante (l'ordre de l'équipe ne bouge pas). */
  activeIndex: number;
}

export const STARTER_IDS = ['salamander', 'undine', 'mushroom'] as const;
export const STARTER_LEVEL = 5;
/** Part des PV max récupérée après chaque vague gagnée (US-11 CA3). */
export const WAVE_HEAL = 0.2;
/** Un boss toutes les 5 vagues (US-13), un niveau au-dessus des ennemis de la vague. */
export const BOSS_WAVE_EVERY = 5;
export const BOSS_LEVEL_BONUS = 1;

const isStarter = (id: string) => (STARTER_IDS as readonly string[]).includes(id);

/** Espèces pouvant être tirées dans une vague normale : ni starters, ni boss, ni évolutions (elles viennent avec le niveau). */
export const WAVE_POOL = Object.values(SPECIES)
  .filter((s) => s.rarity !== 'boss' && !isStarter(s.id) && !EVOLVED_IDS.has(s.id))
  .map((s) => s.id)
  .sort();

/** Boss des vagues 5, 10, 15… (US-13). */
export const BOSS_POOL = Object.values(SPECIES)
  .filter((s) => s.rarity === 'boss' && !EVOLVED_IDS.has(s.id))
  .map((s) => s.id)
  .sort();

export const isBossWave = (wave: number) => wave % BOSS_WAVE_EVERY === 0;

export function createRun(starterId: string, seed: number): RunState {
  if (!isStarter(starterId)) throw new Error(`Starter inconnu : ${starterId}`);
  return { seed, wave: 1, team: [createMonster(starterId, STARTER_LEVEL, `${seed}-p0`)], activeIndex: 0 };
}

/** RNG propre à une vague : même seed de run + même vague = même ennemi. */
export const waveRng = (seed: number, wave: number) => mulberry32((seed ^ Math.imul(wave, 0x27d4eb2d)) >>> 0);

/** Niveau des ennemis de la vague N : 1 à la vague 1, puis +1 par vague. */
export const enemyLevelForWave = (wave: number) => wave;

/** Ennemi de la vague N : niveau `enemyLevelForWave(N)`, espèce tirée avec la seed de la run (US-11 CA1). */
export function enemyForWave(seed: number, wave: number): MonsterInstance {
  return enemiesForWave(seed, wave)[0];
}

/** À partir de la vague 6, la vague compte 2 monstres (docs/01-GAME-DESIGN.md §6.1). */
export const WAVE_WITH_TWO_ENEMIES = 6;

/** Raretés pouvant sortir à la vague N : les plus rares se débloquent plus tard (§5.1). */
export const raritiesForWave = (wave: number): Rarity[] =>
  RARITY_ORDER.filter((id) => RARITIES[id].weight > 0 && RARITIES[id].firstWave <= wave && WAVE_POOL.some((s) => SPECIES[s].rarity === id));

/** Tirage d'une espèce : d'abord la rareté (selon les poids), puis l'espèce au hasard dans cette rareté. */
function drawSpecies(rng: Rng, wave: number): string {
  const rarities = raritiesForWave(wave);
  let roll = rng() * rarities.reduce((sum, id) => sum + RARITIES[id].weight, 0);
  const rarity = rarities.find((id) => (roll -= RARITIES[id].weight) < 0) ?? rarities[rarities.length - 1];
  return pick(rng, WAVE_POOL.filter((id) => SPECIES[id].rarity === rarity));
}

export function enemiesForWave(seed: number, wave: number): MonsterInstance[] {
  const rng = waveRng(seed, wave);
  if (isBossWave(wave)) {
    return [createMonster(pick(rng, BOSS_POOL), enemyLevelForWave(wave) + BOSS_LEVEL_BONUS, `${seed}-e${wave}-0`)];
  }
  const count = wave >= WAVE_WITH_TWO_ENEMIES ? 2 : 1;
  const level = enemyLevelForWave(wave);
  // Un monstre commun tiré assez tard arrive déjà évolué.
  return Array.from({ length: count }, (_, i) => createMonster(speciesAtLevel(drawSpecies(rng, wave), level), level, `${seed}-e${wave}-${i}`));
}

/** Niveau de butin d'une vague : celui de l'ennemi le plus rare (docs/01-GAME-DESIGN.md §6.2). */
export const lootLevelForWave = (seed: number, wave: number) =>
  Math.max(...enemiesForWave(seed, wave).map((m) => RARITIES[SPECIES[m.speciesId].rarity].loot));

/** Premier monstre en vie à partir de `preferred` : le monstre actif reste le même s'il tient encore debout. */
function aliveIndex(team: MonsterInstance[], preferred: number): number {
  if (team[preferred]?.hp > 0) return preferred;
  return Math.max(0, team.findIndex((m) => m.hp > 0));
}

/** Combat de la vague en cours : le joueur occupe le siège 0, l'IA le siège 1. */
export function battleForWave(run: RunState): BattleState {
  const team = structuredClone(run.team);
  return {
    round: run.wave,
    turn: 1,
    players: [
      { userId: 'solo', team, activeIndex: aliveIndex(team, run.activeIndex) },
      { userId: null, team: enemiesForWave(run.seed, run.wave), activeIndex: 0 },
    ],
  };
}

/** Soin de fin de vague : les monstres KO le restent jusqu'à une récompense (US-12). */
export function healTeam(team: MonsterInstance[], fraction = WAVE_HEAL): MonsterInstance[] {
  return team.map((m) => (m.hp <= 0 ? m : { ...m, hp: Math.min(m.maxHp, m.hp + Math.floor(m.maxHp * fraction)) }));
}

/**
 * Vague suivante : on garde les PV et les PP du combat, puis on soigne (US-11 CA3).
 * Les boosts d'ATK et de DEF ne durent qu'un combat.
 * Le monstre qui a fini la vague sur le terrain commence la suivante.
 */
export function nextWave(run: RunState, teamAfterBattle: MonsterInstance[], activeIndex = run.activeIndex): RunState {
  const team = healTeam(teamAfterBattle).map((m) => ({ ...m, modifiers: { defMult: 1, atkMult: 1 } }));
  return { seed: run.seed, wave: run.wave + 1, team, activeIndex };
}

export const isRunOver = (team: MonsterInstance[]) => team.every((m) => m.hp <= 0);

// ⚠️ Fichier généré par `npm run functions:sync` — ne pas modifier : éditer shared/ puis relancer la commande.
import { elementMultiplier } from '../data/elements.ts';
import { EVOLVED_IDS, SPECIES, speciesAtLevel } from '../data/monsters.ts';
import { RARITIES, RARITY_ORDER } from '../data/rarities.ts';
import { mulberry32, pick } from './rng.ts';
import { createMonster } from './stats.ts';
import type { BattleState, MonsterInstance, Rarity, Rng } from '../types.ts';

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
/** Un boss toutes les 5 vagues (US-13), un niveau au-dessus des ennemis de la vague… */
export const BOSS_WAVE_EVERY = 5;
export const BOSS_LEVEL_BONUS = 1;
/** … sauf le premier, un niveau en dessous : c'est le premier vrai mur de la run. */
export const FIRST_BOSS_LEVEL_BONUS = -1;

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

/** Niveau de l'équipe : moyenne des niveaux de ses monstres (KO compris), arrondie. */
export function teamLevel(team: MonsterInstance[]): number {
  if (team.length === 0) return 0;
  return Math.round(team.reduce((sum, m) => sum + m.level, 0) / team.length);
}

/** Les ennemis ne restent jamais plus de `TEAM_LEVEL_GAP` niveaux sous le niveau de l'équipe : pas d'emballement. */
export const TEAM_LEVEL_GAP = 3;
/**
 * Jusqu'à la vague `LATE_WAVE`, les ennemis gagnent 7 niveaux toutes les 10 vagues (0,7 par vague)…
 * Les pentes sont données pour 10 vagues pour ne calculer qu'avec des entiers (20 × 0,7 ≠ 14 en flottant).
 */
export const EARLY_LEVELS_PER_10_WAVES = 7;
/** … puis 15 toutes les 10 vagues (1,5 par vague) : la fin de run se durcit nettement. */
export const LATE_WAVE = 20;
export const LATE_LEVELS_PER_10_WAVES = 15;

/**
 * Niveau des ennemis de la vague N : une montée douce jusqu'à la vague
 * `LATE_WAVE` et plus raide ensuite, sans jamais rester plus de `TEAM_LEVEL_GAP` niveaux sous l'équipe.
 */
export function enemyLevelForWave(wave: number, level = 0): number {
  const early = Math.min(wave, LATE_WAVE) * EARLY_LEVELS_PER_10_WAVES;
  const late = Math.max(0, wave - LATE_WAVE) * LATE_LEVELS_PER_10_WAVES;
  return Math.max(1, Math.ceil((early + late) / 10), level - TEAM_LEVEL_GAP);
}

/** Ennemi de la vague N : niveau `enemyLevelForWave(N)`, espèce tirée avec la seed de la run (US-11 CA1). */
export function enemyForWave(seed: number, wave: number, level = 0): MonsterInstance {
  return enemiesForWave(seed, wave, level)[0];
}

/** À partir de la vague 6, la vague compte 2 monstres (docs/01-GAME-DESIGN.md §6.1). */
export const WAVE_WITH_TWO_ENEMIES = 6;

/** Raretés pouvant sortir à la vague N : les plus rares se débloquent plus tard (§5.1). */
export const raritiesForWave = (wave: number): Rarity[] =>
  RARITY_ORDER.filter((id) => RARITIES[id].weight > 0 && RARITIES[id].firstWave <= wave && WAVE_POOL.some((s) => SPECIES[s].rarity === id));

/**
 * Espèces de la vague 1 : aucune qui ait l'avantage d'élément sur l'un des starters (ni ne lui résiste),
 * pour qu'aucun starter ne perde son premier combat sur un mauvais tirage.
 */
export const FIRST_WAVE_POOL = WAVE_POOL.filter((id) =>
  STARTER_IDS.every((starter) => {
    const [mine, theirs] = [SPECIES[starter].element, SPECIES[id].element];
    return elementMultiplier(theirs, mine) <= 1 && elementMultiplier(mine, theirs) >= 1;
  }),
);

/** Tirage d'une espèce : d'abord la rareté (selon les poids), puis l'espèce au hasard dans cette rareté. */
function drawSpecies(rng: Rng, wave: number): string {
  const rarities = raritiesForWave(wave);
  let roll = rng() * rarities.reduce((sum, id) => sum + RARITIES[id].weight, 0);
  const rarity = rarities.find((id) => (roll -= RARITIES[id].weight) < 0) ?? rarities[rarities.length - 1];
  const pool = wave === 1 ? FIRST_WAVE_POOL : WAVE_POOL;
  return pick(rng, pool.filter((id) => SPECIES[id].rarity === rarity));
}

/** Ennemis de la vague N ; `level` est le niveau de l'équipe (`teamLevel`), qui relève celui des ennemis. */
export function enemiesForWave(seed: number, wave: number, level = 0): MonsterInstance[] {
  const rng = waveRng(seed, wave);
  if (isBossWave(wave)) {
    const bonus = wave === BOSS_WAVE_EVERY ? FIRST_BOSS_LEVEL_BONUS : BOSS_LEVEL_BONUS;
    return [createMonster(pick(rng, BOSS_POOL), enemyLevelForWave(wave, level) + bonus, `${seed}-e${wave}-0`)];
  }
  const count = wave >= WAVE_WITH_TWO_ENEMIES ? 2 : 1;
  const enemyLevel = enemyLevelForWave(wave, level);
  // Un monstre commun tiré assez tard arrive déjà évolué.
  return Array.from({ length: count }, (_, i) =>
    createMonster(speciesAtLevel(drawSpecies(rng, wave), enemyLevel), enemyLevel, `${seed}-e${wave}-${i}`),
  );
}

/** Niveau de butin d'une vague : celui de l'ennemi le plus rare (docs/01-GAME-DESIGN.md §6.2). Le niveau des ennemis n'y change rien. */
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
      { userId: null, team: enemiesForWave(run.seed, run.wave, teamLevel(run.team)), activeIndex: 0 },
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

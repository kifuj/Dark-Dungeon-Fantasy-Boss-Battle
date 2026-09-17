import { speciesAtLevel } from '../data/monsters.js';
import { REWARDS, type RewardId } from '../data/rewards.js';
import { SKILLS } from '../data/skills.js';
import { mulberry32, pick } from './rng.js';
import { levelUp, levelUpMessage } from './level.js';
import { enemiesForWave, isBossWave, lootLevelForWave, teamLevel } from './run.js';
import { createMonster } from './stats.js';
import type { MonsterInstance, Rng } from '../types.js';

/** Récompenses de fin de vague (US-12, docs/01-GAME-DESIGN.md §6.2). */
export const REWARD_CHOICES = 3;
export const MAX_TEAM_SIZE = 4;
export const POTION_HEAL = 0.5;
export const TRAINING_LEVELS = 1;
export const INTENSIVE_TRAINING_LEVELS = 1;
export const WAR_CAMP_LEVELS = 2;
export const RELIC_LEVELS = 2;
/** Le recrutement est proposé au moins une vague sur `RECRUIT_EVERY` : on ne peut plus ne jamais le voir. */
export const RECRUIT_EVERY = 2;

/** RNG des récompenses de la vague N : distincte de celle des ennemis, mais tirée de la même seed (CA4). */
export const rewardRng = (seed: number, wave: number): Rng => mulberry32((seed ^ Math.imul(wave, 0x165667b1) ^ 0x5bd1e995) >>> 0);

/**
 * Récompenses accessibles après la vague N : celles que le niveau de butin débloque.
 * Une récompense rare pèse plus lourd quand l'ennemi vaincu dépasse son niveau minimal.
 * Après un boss, seules les récompenses rares et le recrutement (du boss) restent en jeu.
 */
export function rewardPool(seed: number, wave: number): { id: RewardId; weight: number }[] {
  const loot = lootLevelForWave(seed, wave);
  const boss = isBossWave(wave);
  return Object.values(REWARDS)
    .filter((r) => r.minLoot <= loot && r.weight > 0 && (!boss || r.minLoot > 0 || r.id === 'recruit'))
    .map((r) => ({ id: r.id, weight: r.minLoot > 0 ? r.weight * (1 + loot - r.minLoot) : r.weight }));
}

/**
 * 3 récompenses différentes, tirées selon leurs poids, sans remise (CA1). Un boss garantit sa relique (US-13),
 * et le recrutement est garanti une vague sur `RECRUIT_EVERY` s'il n'est pas sorti tout seul.
 */
export function drawRewards(seed: number, wave: number): RewardId[] {
  const rng = rewardRng(seed, wave);
  const pool = rewardPool(seed, wave);
  const drawn: RewardId[] = isBossWave(wave) ? ['relic'] : [];
  if (wave % RECRUIT_EVERY === 0 && !drawn.includes('recruit')) {
    drawn.push('recruit');
    pool.splice(pool.findIndex((r) => r.id === 'recruit'), 1);
  }
  while (drawn.length < REWARD_CHOICES && pool.length > 0) {
    const total = pool.reduce((sum, r) => sum + r.weight, 0);
    let roll = rng() * total;
    const index = pool.findIndex((r) => (roll -= r.weight) < 0);
    drawn.push(pool.splice(index === -1 ? pool.length - 1 : index, 1)[0].id);
  }
  return drawn;
}

/**
 * Monstre qui rejoint l'équipe avec « Recrutement » : le premier ennemi de la vague vaincue, remonté
 * au niveau de l'équipe (`teamLevel`) pour qu'il soit tout de suite utile. Il évolue si ce niveau le permet.
 */
export function recruitFor(seed: number, wave: number, team: MonsterInstance[]): MonsterInstance {
  const level = teamLevel(team);
  const [enemy] = enemiesForWave(seed, wave, level);
  const recruitLevel = Math.max(enemy.level, level);
  return createMonster(speciesAtLevel(enemy.speciesId, recruitLevel), recruitLevel, `${seed}-r${wave}`);
}

/** Vrai si le joueur doit désigner un monstre avant d'appliquer la récompense (CA3). */
export function needsTarget(reward: RewardId, team: MonsterInstance[]): boolean {
  if (reward === 'training' || reward === 'scroll') return true;
  return reward === 'recruit' && team.length >= MAX_TEAM_SIZE;
}

/** Nombre maximal de compétences : au-delà, le parchemin en fait oublier une. */
export const MAX_SKILLS = 4;

const scrollRng = (seed: number, wave: number) => mulberry32((seed ^ Math.imul(wave, 0x2c1b3c6d) ^ 0x297a2d39) >>> 0);

/** Compétence qu'un parchemin apprendrait à ce monstre : une compétence à PP limités qu'il ne connaît pas encore. */
export function scrollSkillFor(seed: number, wave: number, monster: MonsterInstance): string {
  const known = new Set(monster.skills.map((s) => s.id));
  return pick(scrollRng(seed, wave), Object.keys(SKILLS).filter((id) => SKILLS[id].pp !== null && !known.has(id)).sort());
}

/** Compétences que le parchemin peut faire oublier : toutes sauf la Frappe, à PP illimités, gardée par défaut. */
export const forgettableSkills = (monster: MonsterInstance): string[] =>
  monster.skills.filter((s) => SKILLS[s.id].pp !== null).map((s) => s.id);

/** Vrai si le monstre doit oublier une compétence pour apprendre celle du parchemin. */
export const scrollNeedsForget = (monster: MonsterInstance) => monster.skills.length >= MAX_SKILLS && forgettableSkills(monster).length > 0;

/**
 * Parchemin : la compétence apprise prend la place de `forget`, choisie par le joueur. Sans choix,
 * une compétence à PP limités est tirée au hasard. La Frappe n'est jamais oubliée.
 */
function learnScroll(
  seed: number,
  wave: number,
  monster: MonsterInstance,
  forget?: string,
): { skills: MonsterInstance['skills']; learned: string; forgotten: string | null } {
  const learned = scrollSkillFor(seed, wave, monster);
  const slot = { id: learned, ppLeft: SKILLS[learned].pp };
  if (!scrollNeedsForget(monster)) return { skills: [...monster.skills, slot], learned, forgotten: null };
  const forgettable = forgettableSkills(monster);
  if (forget !== undefined && !forgettable.includes(forget)) throw new Error(`Compétence impossible à oublier : ${forget}`);
  const forgotten = forget ?? pick(mulberry32(seed ^ wave ^ 0x7f4a7c15), forgettable);
  return { skills: monster.skills.map((s) => (s.id === forgotten ? slot : s)), learned, forgotten };
}

/** Évolutions déclenchées par un gain de niveaux de toute l'équipe, pour le journal. */
function evolutions(team: MonsterInstance[], levels: number): string {
  return team
    .map((m) => [m, levelUp(m, levels)] as const)
    .filter(([before, after]) => before.speciesId !== after.speciesId)
    .map(([before, after]) => ` ${before.name} évolue en ${after.name} !`)
    .join('');
}

export interface RewardOutcome {
  team: MonsterInstance[];
  /** Phrase affichée dans le journal pour rendre l'effet visible (CA2). */
  message: string;
}

/**
 * Applique la récompense choisie à l'équipe, sans la modifier en place.
 * `targetUid` désigne le monstre visé (entraînement, parchemin) ou remplacé (recrutement, équipe pleine) ;
 * `forgetSkillId` est la compétence que le parchemin fait oublier.
 */
export function applyReward(
  team: MonsterInstance[],
  reward: RewardId,
  context: { seed: number; wave: number; targetUid?: string; forgetSkillId?: string },
): RewardOutcome {
  const { seed, wave, targetUid, forgetSkillId } = context;
  const target = team.find((m) => m.uid === targetUid);
  if (needsTarget(reward, team) && !target) throw new Error(`La récompense ${reward} demande un monstre`);

  switch (reward) {
    case 'potion':
      return {
        team: team.map((m) => ({ ...m, hp: Math.min(m.maxHp, Math.max(0, m.hp) + Math.floor(m.maxHp * POTION_HEAL)) })),
        message: 'L’équipe récupère 50 % de ses PV.',
      };
    case 'elixir':
      return {
        team: team.map((m) => ({ ...m, skills: m.skills.map((s) => ({ id: s.id, ppLeft: SKILLS[s.id].pp })) })),
        message: 'Tous les PP sont rechargés.',
      };
    case 'training': {
      const trained = levelUp(target!, TRAINING_LEVELS);
      return {
        team: team.map((m) => (m.uid === trained.uid ? trained : m)),
        message: levelUpMessage(target!, trained),
      };
    }
    case 'royal_potion':
      return {
        team: team.map((m) => ({ ...m, hp: m.maxHp, skills: m.skills.map((s) => ({ id: s.id, ppLeft: SKILLS[s.id].pp })) })),
        message: 'L’équipe est entièrement soignée et ses PP sont rechargés.',
      };
    case 'intensive_training':
      return {
        team: team.map((m) => levelUp(m, INTENSIVE_TRAINING_LEVELS)),
        message: `Toute l’équipe gagne ${INTENSIVE_TRAINING_LEVELS} niveau !${evolutions(team, INTENSIVE_TRAINING_LEVELS)}`,
      };
    case 'war_camp':
      return {
        team: team.map((m) => levelUp(m, WAR_CAMP_LEVELS)),
        message: `Toute l’équipe gagne ${WAR_CAMP_LEVELS} niveaux !${evolutions(team, WAR_CAMP_LEVELS)}`,
      };
    case 'relic':
      return {
        team: team.map((m) => {
          const leveled = levelUp(m, RELIC_LEVELS);
          return { ...leveled, hp: leveled.maxHp };
        }),
        message: `La relique donne ${RELIC_LEVELS} niveaux à toute l’équipe et la soigne entièrement !${evolutions(team, RELIC_LEVELS)}`,
      };
    case 'recruit': {
      const recruit = recruitFor(seed, wave, team);
      if (!target) return { team: [...team, recruit], message: `${recruit.name} rejoint l’équipe !` };
      return {
        team: team.map((m) => (m.uid === target.uid ? recruit : m)),
        message: `${recruit.name} remplace ${target.name} dans l’équipe.`,
      };
    }
    case 'scroll': {
      const { skills, learned, forgotten } = learnScroll(seed, wave, target!, forgetSkillId);
      return {
        team: team.map((m) => (m.uid === target!.uid ? { ...m, skills } : m)),
        message: forgotten
          ? `${target!.name} oublie ${SKILLS[forgotten].name} et apprend ${SKILLS[learned].name} !`
          : `${target!.name} apprend ${SKILLS[learned].name} !`,
      };
    }
  }
}

import { REWARDS, type RewardId } from '../data/rewards.js';
import { SKILLS } from '../data/skills.js';
import { mulberry32, pick } from './rng.js';
import { enemiesForWave } from './run.js';
import { createMonster } from './stats.js';
import type { MonsterInstance, Rng } from '../types.js';

/** Récompenses de fin de vague (US-12, docs/01-GAME-DESIGN.md §6.2). */
export const REWARD_CHOICES = 3;
export const MAX_TEAM_SIZE = 4;
export const POTION_HEAL = 0.5;
export const TRAINING_LEVELS = 2;

/** RNG des récompenses de la vague N : distincte de celle des ennemis, mais tirée de la même seed (CA4). */
export const rewardRng = (seed: number, wave: number): Rng => mulberry32((seed ^ Math.imul(wave, 0x165667b1) ^ 0x5bd1e995) >>> 0);

/** 3 récompenses différentes, tirées selon leurs poids, sans remise (CA1). */
export function drawRewards(seed: number, wave: number): RewardId[] {
  const rng = rewardRng(seed, wave);
  const pool = Object.values(REWARDS);
  const drawn: RewardId[] = [];
  while (drawn.length < REWARD_CHOICES) {
    const total = pool.reduce((sum, r) => sum + r.weight, 0);
    let roll = rng() * total;
    const index = pool.findIndex((r) => (roll -= r.weight) < 0);
    drawn.push(pool.splice(index === -1 ? pool.length - 1 : index, 1)[0].id);
  }
  return drawn;
}

/** Monstre qui rejoint l'équipe avec « Recrutement » : le premier ennemi de la vague vaincue. */
export function recruitFor(seed: number, wave: number): MonsterInstance {
  const [enemy] = enemiesForWave(seed, wave);
  return createMonster(enemy.speciesId, enemy.level, `${seed}-r${wave}`);
}

/** Vrai si le joueur doit désigner un monstre avant d'appliquer la récompense (CA3). */
export function needsTarget(reward: RewardId, team: MonsterInstance[]): boolean {
  if (reward === 'training' || reward === 'scroll') return true;
  return reward === 'recruit' && team.length >= MAX_TEAM_SIZE;
}

/**
 * Parchemin : une compétence que le monstre ne connaît pas encore remplace une de ses compétences à PP limités.
 * La frappe à PP illimités n'est jamais oubliée : le monstre a toujours une action possible.
 */
function learnScroll(seed: number, wave: number, monster: MonsterInstance): { skills: MonsterInstance['skills']; learned: string; forgotten: string | null } {
  const rng = mulberry32((seed ^ Math.imul(wave, 0x2c1b3c6d) ^ 0x297a2d39) >>> 0);
  const known = new Set(monster.skills.map((s) => s.id));
  const learned = pick(rng, Object.keys(SKILLS).filter((id) => SKILLS[id].pp !== null && !known.has(id)).sort());
  const slot = { id: learned, ppLeft: SKILLS[learned].pp };
  const replaceable = monster.skills.map((s, i) => (SKILLS[s.id].pp === null ? -1 : i)).filter((i) => i !== -1);
  if (replaceable.length === 0) return { skills: [...monster.skills, slot], learned, forgotten: null };
  const index = pick(rng, replaceable);
  return {
    skills: monster.skills.map((s, i) => (i === index ? slot : s)),
    learned,
    forgotten: monster.skills[index].id,
  };
}

/** Gain de niveaux : stats recalculées depuis l'espèce, PV gagnés ajoutés aux PV actuels (un KO reste KO). */
function levelUp(monster: MonsterInstance, levels: number): MonsterInstance {
  const next = createMonster(monster.speciesId, monster.level + levels, monster.uid);
  const hp = monster.hp > 0 ? Math.min(next.maxHp, monster.hp + next.maxHp - monster.maxHp) : 0;
  return { ...monster, level: next.level, maxHp: next.maxHp, hp, stats: next.stats };
}

export interface RewardOutcome {
  team: MonsterInstance[];
  /** Phrase affichée dans le journal pour rendre l'effet visible (CA2). */
  message: string;
}

/**
 * Applique la récompense choisie à l'équipe, sans la modifier en place.
 * `targetUid` désigne le monstre visé (entraînement, parchemin) ou remplacé (recrutement, équipe pleine).
 */
export function applyReward(
  team: MonsterInstance[],
  reward: RewardId,
  context: { seed: number; wave: number; targetUid?: string },
): RewardOutcome {
  const { seed, wave, targetUid } = context;
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
        message: `${trained.name} passe au niveau ${trained.level} !`,
      };
    }
    case 'recruit': {
      const recruit = recruitFor(seed, wave);
      if (!target) return { team: [...team, recruit], message: `${recruit.name} rejoint l’équipe !` };
      return {
        team: team.map((m) => (m.uid === target.uid ? recruit : m)),
        message: `${recruit.name} remplace ${target.name} dans l’équipe.`,
      };
    }
    case 'scroll': {
      const { skills, learned, forgotten } = learnScroll(seed, wave, target!);
      return {
        team: team.map((m) => (m.uid === target!.uid ? { ...m, skills } : m)),
        message: forgotten
          ? `${target!.name} oublie ${SKILLS[forgotten].name} et apprend ${SKILLS[learned].name} !`
          : `${target!.name} apprend ${SKILLS[learned].name} !`,
      };
    }
  }
}

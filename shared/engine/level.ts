import { SPECIES, speciesAtLevel } from '../data/monsters.js';
import { createMonster } from './stats.js';
import type { BattleEvent, MonsterInstance, TurnResult } from '../types.js';

/** Niveaux gagnés par le monstre du joueur pour chaque ennemi qu'il met K.O. (solo). */
export const KILL_LEVELS = 1;

/**
 * Gain de niveaux (solo) : stats recalculées depuis l'espèce, PV gagnés ajoutés aux PV actuels
 * (un KO reste KO). Le monstre évolue s'il atteint le niveau de son évolution ; il garde ses
 * compétences, ses PP et ses boosts de combat.
 */
export function levelUp(monster: MonsterInstance, levels: number): MonsterInstance {
  const level = monster.level + levels;
  const speciesId = speciesAtLevel(monster.speciesId, level);
  const next = createMonster(speciesId, level, monster.uid);
  const hp = monster.hp > 0 ? Math.min(next.maxHp, monster.hp + next.maxHp - monster.maxHp) : 0;
  return { ...monster, speciesId, name: next.name, element: next.element, level, maxHp: next.maxHp, hp, stats: next.stats };
}

/** Phrase de journal d'un gain de niveaux, avec l'évolution s'il y en a une. */
export function levelUpMessage(before: MonsterInstance, after: MonsterInstance): string {
  const evolved = before.speciesId !== after.speciesId ? `${before.name} évolue en ${after.name} ! ` : '';
  return `${evolved}${after.name} passe au niveau ${after.level} !`;
}

/**
 * Expérience de combat (solo, joueur au siège 0) : chaque ennemi mis K.O. pendant le tour fait
 * gagner un niveau au monstre du joueur qui l'a abattu. Le monstre actif en fin de tour est le
 * tireur : un joueur ne change jamais de monstre après avoir attaqué dans le même tour.
 */
export function grantKillLevels(result: TurnResult): TurnResult {
  const kills = result.events.filter((event) => event.type === 'faint' && event.seat === 1).length;
  if (kills === 0) return result;
  const state = structuredClone(result.state);
  const player = state.players[0];
  const killer = player.team[player.activeIndex];
  if (!killer || killer.hp <= 0) return result;

  const leveled = levelUp(killer, kills * KILL_LEVELS);
  player.team[player.activeIndex] = leveled;
  const event: BattleEvent = {
    type: 'level_up',
    seat: 0,
    speciesId: leveled.speciesId,
    name: leveled.name,
    level: leveled.level,
    evolvedFrom: leveled.speciesId !== killer.speciesId ? SPECIES[killer.speciesId].name : null,
  };
  // Le gain s'affiche juste après le dernier K.O. ennemi, avant la fin du combat et les remplacements.
  const lastKill = result.events.findLastIndex((e) => e.type === 'faint' && e.seat === 1);
  const events = [...result.events.slice(0, lastKill + 1), event, ...result.events.slice(lastKill + 1)];
  return { ...result, state, events };
}

import { SPECIES } from '../data/monsters.js';
import { SKILLS } from '../data/skills.js';
import type { MonsterInstance } from '../types.js';

export const statAtLevel = (base: number, level: number) => Math.floor(base * (1 + (level - 1) * 0.08));

export function createMonster(speciesId: string, level: number, uid: string): MonsterInstance {
  const s = SPECIES[speciesId];
  if (!s) throw new Error(`Espèce inconnue : ${speciesId}`);
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
    modifiers: { defMult: 1, atkMult: 1 },
  };
}

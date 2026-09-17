// ⚠️ Fichier généré par `npm run functions:sync` — ne pas modifier : éditer shared/ puis relancer la commande.
import { elementMultiplier } from '../data/elements.ts';
import type { MonsterInstance, Rng, SkillDef } from '../types.ts';

export const CRIT_CHANCE = 1 / 16;

/**
 * Formule de docs/01-GAME-DESIGN.md §3.3.
 * ⚠️ L'ordre des appels à `rng()` fait partie des règles (critique, puis aléa).
 */
export function computeDamage(attacker: MonsterInstance, defender: MonsterInstance, skill: SkillDef, rng: Rng) {
  const levelFactor = (attacker.level + 10) / 60;
  const ratio = (attacker.stats.atk * (attacker.modifiers.atkMult ?? 1)) / (defender.stats.def * defender.modifiers.defMult);
  const effectiveness = elementMultiplier(skill.element, defender.element);
  const stab = skill.element !== 'neutre' && skill.element === attacker.element ? 1.25 : 1;
  const crit = rng() < CRIT_CHANCE;
  const roll = 0.9 + rng() * 0.1;

  const raw = skill.power * ratio * levelFactor * effectiveness * stab * roll * (crit ? 1.5 : 1);
  return { amount: Math.max(1, Math.floor(raw)), effectiveness, crit };
}

// ⚠️ Fichier généré par `npm run functions:sync` — ne pas modifier : éditer shared/ puis relancer la commande.
import { elementMultiplier } from '../data/elements.ts';
import { SKILLS } from '../data/skills.ts';
import { pick } from './rng.ts';
import { validateAction } from './validate.ts';
import type { Action, BattleState, Rng, Seat, SkillDef } from '../types.ts';

/**
 * IA du mode solo (US-11 CA2, docs/06-MOTEUR-DE-COMBAT.md §8).
 * Elle ne renvoie **jamais** une action refusée par `validateAction` : on ne garde
 * que les compétences réellement utilisables, et on retombe sur `strike` (PP illimités)
 * si le monstre n'a plus rien d'autre.
 */
export function chooseAiAction(state: BattleState, seat: Seat, rng: Rng): Action {
  const me = state.players[seat].team[state.players[seat].activeIndex];
  const foeSeat: Seat = seat === 0 ? 1 : 0;
  const foe = state.players[foeSeat].team[state.players[foeSeat].activeIndex];

  const usable: SkillDef[] = me.skills
    .filter((s) => validateAction(state, seat, { type: 'skill', skillId: s.id }).ok)
    .map((s) => SKILLS[s.id]);
  if (usable.length === 0) {
    // Impasse (plus aucun PP) : on change de monstre si c'est possible, sinon on frappe.
    const relay = state.players[seat].team.findIndex((m, i) => i !== state.players[seat].activeIndex && m.hp > 0);
    if (relay !== -1) return { type: 'switch', toIndex: relay };
    return { type: 'skill', skillId: me.skills.find((s) => SKILLS[s.id].pp === null)?.id ?? me.skills[0].id };
  }

  // 30 % du temps : coup au hasard, pour que l'IA reste battable.
  if (rng() < 0.3) return { type: 'skill', skillId: pick(rng, usable).id };

  // Se soigner quand les PV sont bas.
  const heal = usable.find((s) => s.effect === 'heal30');
  if (heal && me.hp / me.maxHp < 0.35) return { type: 'skill', skillId: heal.id };

  // Sinon : dégâts attendus maximaux (élément + STAB).
  const score = (s: SkillDef) =>
    s.power * elementMultiplier(s.element, foe.element) * (s.element === me.element && s.element !== 'neutre' ? 1.25 : 1);
  const best = usable.reduce((a, b) => (score(b) > score(a) ? b : a));
  return { type: 'skill', skillId: best.id };
}

import { SKILLS } from '../data/skills.js';
import type { BattleState, Seat } from '../types.js';

/**
 * Côté client : griser les boutons impossibles. Côté serveur : bloquer les requêtes trafiquées.
 * L'abandon passe par `/api/match/forfeit`, pas par cette validation.
 */
export function validateAction(state: BattleState, seat: Seat, action: unknown): { ok: true } | { ok: false; reason: string } {
  if (typeof action !== 'object' || action === null) return { ok: false, reason: 'not_an_object' };
  const a = action as Record<string, unknown>;
  const player = state.players[seat];
  const current = player.team[player.activeIndex];

  if (a.type === 'skill') {
    const slot = current.skills.find((s) => s.id === a.skillId);
    if (!slot || !SKILLS[slot.id]) return { ok: false, reason: 'unknown_skill' };
    if (slot.ppLeft !== null && slot.ppLeft <= 0) return { ok: false, reason: 'no_pp' };
    return { ok: true };
  }
  if (a.type === 'switch') {
    const i = a.toIndex;
    if (typeof i !== 'number' || !Number.isInteger(i) || i < 0 || i >= player.team.length) return { ok: false, reason: 'bad_index' };
    if (i === player.activeIndex) return { ok: false, reason: 'already_active' };
    if (player.team[i].hp <= 0) return { ok: false, reason: 'fainted' };
    return { ok: true };
  }
  return { ok: false, reason: 'unknown_type' };
}

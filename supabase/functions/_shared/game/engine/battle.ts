// ⚠️ Fichier généré par `npm run functions:sync` — ne pas modifier : éditer shared/ puis relancer la commande.
import { SKILLS } from '../data/skills.ts';
import { computeDamage } from './damage.ts';
import type { Action, BattleEvent, BattleState, Rng, Seat, TurnResult } from '../types.ts';

/** Multiplicateur de DEF des compétences `defUp` (Bénédiction, Durcissement, Carapace). */
export const DEF_UP_MULT = 1.15;

const other = (seat: Seat): Seat => (seat === 0 ? 1 : 0);
const active = (s: BattleState, seat: Seat) => s.players[seat].team[s.players[seat].activeIndex];
const isDefeated = (s: BattleState, seat: Seat) => s.players[seat].team.every((m) => m.hp <= 0);

/** Abandon > changement > priorité de la compétence (US-05 CA1). */
function actionPriority(action: Action): number {
  if (action.type === 'forfeit') return 100;
  if (action.type === 'switch') return 10;
  return SKILLS[action.skillId].priority ?? 0;
}

export function getActionOrder(state: BattleState, actions: [Action, Action], rng: Rng): Seat[] {
  const p0 = actionPriority(actions[0]);
  const p1 = actionPriority(actions[1]);
  if (p0 !== p1) return p0 > p1 ? [0, 1] : [1, 0];
  const s0 = active(state, 0).stats.spd;
  const s1 = active(state, 1).stats.spd;
  if (s0 !== s1) return s0 > s1 ? [0, 1] : [1, 0];
  return rng() < 0.5 ? [0, 1] : [1, 0];
}

export function resolveTurn(input: BattleState, actions: [Action, Action], rng: Rng): TurnResult {
  const state: BattleState = structuredClone(input); // ne jamais modifier l'entrée
  const events: BattleEvent[] = [];
  const end = (winnerSeat: Seat): TurnResult => {
    events.push({ type: 'battle_end', winnerSeat });
    return { state, events, winnerSeat };
  };

  for (const seat of getActionOrder(state, actions, rng)) {
    const action = actions[seat];
    const actor = active(state, seat);

    if (action.type === 'forfeit') {
      events.push({ type: 'forfeit', seat });
      return end(other(seat));
    }
    if (actor.hp <= 0) continue; // KO avant d'agir

    if (action.type === 'switch') {
      const player = state.players[seat];
      const fromIndex = player.activeIndex;
      player.activeIndex = action.toIndex;
      events.push({ type: 'switch', seat, fromIndex, toIndex: action.toIndex, forced: false, name: active(state, seat).name });
      continue;
    }

    const skill = SKILLS[action.skillId];
    const slot = actor.skills.find((s) => s.id === skill.id)!;
    if (slot.ppLeft !== null) slot.ppLeft -= 1;
    events.push({ type: 'skill_used', seat, actorName: actor.name, skillName: skill.name, skillId: skill.id });

    if (skill.effect === 'heal30') {
      const amount = Math.min(Math.floor(actor.maxHp * 0.3), actor.maxHp - actor.hp);
      actor.hp += amount;
      events.push({ type: 'heal', seat, amount, hpAfter: actor.hp, maxHp: actor.maxHp });
      continue;
    }
    if (skill.effect === 'defUp') {
      actor.modifiers.defMult *= DEF_UP_MULT;
      events.push({ type: 'buff', seat, stat: 'def', mult: DEF_UP_MULT });
      continue;
    }

    const targetSeat = other(seat);
    const target = active(state, targetSeat);
    const { amount, effectiveness, crit } = computeDamage(actor, target, skill, rng);
    const dealt = Math.min(amount, target.hp);
    target.hp -= dealt;
    events.push({ type: 'damage', targetSeat, amount: dealt, hpAfter: target.hp, maxHp: target.maxHp, effectiveness, crit });

    if (skill.effect === 'drain50' && dealt > 0) {
      const heal = Math.min(Math.floor(dealt / 2), actor.maxHp - actor.hp);
      actor.hp += heal;
      events.push({ type: 'heal', seat, amount: heal, hpAfter: actor.hp, maxHp: actor.maxHp });
    }
    if (target.hp <= 0) {
      events.push({ type: 'faint', seat: targetSeat, index: state.players[targetSeat].activeIndex, name: target.name });
      if (isDefeated(state, targetSeat)) return end(seat);
    }
  }

  // Un monstre actif KO n'est pas remplacé ici : son joueur choisit le remplaçant
  // pendant la phase de remplacement qui suit (shared/engine/replace.ts).
  state.turn += 1;
  return { state, events, winnerSeat: null };
}

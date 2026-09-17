import { describe, expect, it } from 'vitest';
import { chooseAiAction } from '../../shared/engine/ai.js';
import { resolveTurn } from '../../shared/engine/battle.js';
import { createOnlineBattle } from '../../shared/engine/online.js';
import { createTurnRng } from '../../shared/engine/rng.js';
import type { BattleEvent } from '../../shared/types.js';
import { ANIMATION_TIMEOUT_MS, TURN_ANIMATION_BUDGET_MS, turnAnimationDuration } from '../game/timing.ts';

describe('US-09 CA4 — un tour animé dure moins de 4 s', () => {
  it('tient le budget sur le pire tour possible : deux attaques avec drain, un KO et un remplacement', () => {
    const worst: BattleEvent[] = [
      { type: 'skill_used', seat: 0, actorName: 'A', skillName: 'Drain vital', skillId: 'life_drain' },
      { type: 'damage', targetSeat: 1, amount: 10, hpAfter: 5, maxHp: 50, effectiveness: 2, crit: true },
      { type: 'heal', seat: 0, amount: 5, hpAfter: 40, maxHp: 50 },
      { type: 'skill_used', seat: 1, actorName: 'B', skillName: "Siphon d'âme", skillId: 'soul_leech' },
      { type: 'damage', targetSeat: 0, amount: 40, hpAfter: 0, maxHp: 50, effectiveness: 1, crit: false },
      { type: 'heal', seat: 1, amount: 20, hpAfter: 25, maxHp: 50 },
      { type: 'faint', seat: 0, index: 0, name: 'A' },
      { type: 'switch', seat: 0, fromIndex: 0, toIndex: 1, forced: true, name: 'C' },
    ];
    expect(turnAnimationDuration(worst)).toBeLessThan(TURN_ANIMATION_BUDGET_MS);
  });

  it('tient le budget sur 600 tours de vrais duels joués par l’IA', () => {
    let longest = 0;
    for (let seed = 1; seed <= 40; seed++) {
      let state = createOnlineBattle(seed, 'a', 'b');
      for (let turn = 1; turn <= 15; turn++) {
        const rng = createTurnRng(seed, 1, turn);
        const result = resolveTurn(state, [chooseAiAction(state, 0, rng), chooseAiAction(state, 1, rng)], rng);
        longest = Math.max(longest, turnAnimationDuration(result.events));
        if (result.winnerSeat !== null) break;
        state = result.state;
      }
    }
    expect(longest).toBeGreaterThan(0);
    expect(longest).toBeLessThan(TURN_ANIMATION_BUDGET_MS);
  });

  it('laisse le filet de sécurité de la page au-delà du budget', () => {
    expect(ANIMATION_TIMEOUT_MS).toBeGreaterThan(TURN_ANIMATION_BUDGET_MS);
  });
});

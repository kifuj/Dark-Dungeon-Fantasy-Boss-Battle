import { describe, expect, it } from 'vitest';
import { chooseAiAction } from '../engine/ai.js';
import { createTurnRng, mulberry32 } from '../engine/rng.js';
import { validateAction } from '../engine/validate.js';
import { fixedRng, makeBattle } from './helpers.js';

describe("US-11 — IA du mode solo", () => {
  it('ne propose jamais une action invalide, même après 200 tirages', () => {
    const state = makeBattle(['salamander'], ['skeleton']);
    for (let i = 0; i < 200; i++) {
      const action = chooseAiAction(state, 1, mulberry32(i));
      expect(validateAction(state, 1, action)).toEqual({ ok: true });
    }
  });

  it("n'utilise pas une compétence sans PP", () => {
    const state = makeBattle(['salamander'], ['skeleton']);
    const ai = state.players[1].team[0];
    for (const slot of ai.skills) if (slot.ppLeft !== null) slot.ppLeft = 0;
    for (let i = 0; i < 50; i++) {
      const action = chooseAiAction(state, 1, mulberry32(i));
      expect(action).toEqual({ type: 'skill', skillId: 'strike' });
    }
  });

  it('change de monstre plutôt que de jouer une action invalide quand elle n’a plus de PP', () => {
    const state = makeBattle(['salamander'], ['flying_eye', 'goblin']); // l'œil volant ne connaît pas Frappe
    for (const slot of state.players[1].team[0].skills) slot.ppLeft = 0;
    const action = chooseAiAction(state, 1, mulberry32(3));
    expect(action).toEqual({ type: 'switch', toIndex: 1 });
    expect(validateAction(state, 1, action)).toEqual({ ok: true });
  });

  it('choisit la compétence la plus efficace face à un désavantage élémentaire', () => {
    const state = makeBattle(['mushroom'], ['salamander']); // feu contre nature
    const action = chooseAiAction(state, 1, fixedRng(0.9)); // > 0.3 : pas de coup au hasard
    expect(action).toEqual({ type: 'skill', skillId: 'inferno' });
  });

  it('se soigne quand ses PV passent sous 35 %', () => {
    const state = makeBattle(['salamander'], ['mushroom']);
    const ai = state.players[1].team[0];
    ai.hp = Math.floor(ai.maxHp * 0.3);
    expect(chooseAiAction(state, 1, fixedRng(0.9))).toEqual({ type: 'skill', skillId: 'regrowth' });
  });

  it('est déterministe : même seed = même action', () => {
    const state = makeBattle(['salamander'], ['goblin']);
    const a = chooseAiAction(state, 1, createTurnRng(7, 1, 3));
    const b = chooseAiAction(state, 1, createTurnRng(7, 1, 3));
    expect(a).toEqual(b);
  });
});

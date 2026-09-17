import { describe, expect, it } from 'vitest';
import { resolveTurn } from '../engine/battle.js';
import { chooseAiAction, chooseAiReplacement } from '../engine/ai.js';
import { defaultAction } from '../engine/online.js';
import { firstAliveIndex, needsReplacement, replacementSeats, resolveReplacement } from '../engine/replace.js';
import { mulberry32 } from '../engine/rng.js';
import { validateAction } from '../engine/validate.js';
import { makeBattle } from './helpers.js';

const reason = (r: ReturnType<typeof validateAction>) => (r.ok ? 'ok' : r.reason);

/** Combat où le monstre actif du siège 1 vient de tomber KO. */
function afterKo() {
  const s = makeBattle(['flying_eye'], ['slime', 'goblin', 'wisp']);
  s.players[1].team[0].hp = 1;
  return resolveTurn(s, [{ type: 'skill', skillId: 'shadow_claw' }, { type: 'skill', skillId: 'vine' }], mulberry32(1)).state;
}

describe('Remplacement d’un monstre KO au choix du joueur', () => {
  it('détecte le siège qui doit choisir un remplaçant', () => {
    const state = afterKo();
    expect(needsReplacement(state, 1)).toBe(true);
    expect(needsReplacement(state, 0)).toBe(false);
    expect(replacementSeats(state)).toEqual([1]);
  });

  it('ne demande rien quand toute l’équipe est KO (le combat est fini)', () => {
    const s = makeBattle(['goblin'], ['slime']);
    s.players[1].team[0].hp = 0;
    expect(needsReplacement(s, 1)).toBe(false);
  });

  it('applique le monstre choisi, pas le premier de la liste', () => {
    const state = afterKo();
    const r = resolveReplacement(state, { 1: 2 });
    expect(r.state.players[1].activeIndex).toBe(2);
    expect(r.events).toEqual([{ type: 'switch', seat: 1, fromIndex: 0, toIndex: 2, forced: true, name: 'Feu follet' }]);
    expect(r.state.turn).toBe(state.turn + 1);
    expect(r.winnerSeat).toBeNull();
    expect(state.players[1].activeIndex).toBe(0); // entrée non modifiée
  });

  it('retombe sur le premier monstre en vie si le choix est absent ou invalide', () => {
    const state = afterKo();
    state.players[1].team[1].hp = 0;
    expect(firstAliveIndex(state, 1)).toBe(2);
    expect(resolveReplacement(state, {}).state.players[1].activeIndex).toBe(2);
    expect(resolveReplacement(state, { 1: 1 }).state.players[1].activeIndex).toBe(2);
    expect(resolveReplacement(state, { 1: 9 }).state.players[1].activeIndex).toBe(2);
  });

  it('n’accepte qu’un changement du joueur concerné, et bloque l’adversaire', () => {
    const state = afterKo();
    expect(reason(validateAction(state, 1, { type: 'switch', toIndex: 1 }))).toBe('ok');
    expect(reason(validateAction(state, 1, { type: 'skill', skillId: 'vine' }))).toBe('must_replace');
    expect(reason(validateAction(state, 1, { type: 'switch', toIndex: 0 }))).toBe('already_active');
    expect(reason(validateAction(state, 0, { type: 'skill', skillId: 'shadow_claw' }))).toBe('opponent_replacing');
  });

  it('l’action par défaut d’un joueur absent est un remplacement valide (timeout en ligne)', () => {
    const state = afterKo();
    const action = defaultAction(state, 1);
    expect(action).toEqual({ type: 'switch', toIndex: 1 });
    expect(validateAction(state, 1, action).ok).toBe(true);
  });

  it('l’IA choisit le remplaçant avec l’avantage d’élément', () => {
    const s = makeBattle(['salamander'], ['slime', 'goblin', 'crab']);
    s.players[1].team[0].hp = 0;
    expect(chooseAiReplacement(s, 1)).toBe(2); // Eau contre Feu
    s.players[1].team[2].hp = 0;
    expect(chooseAiReplacement(s, 1)).toBe(1);
  });

  it('reprend le combat normalement après le remplacement', () => {
    const replaced = resolveReplacement(afterKo(), { 1: 1 }).state;
    expect(replacementSeats(replaced)).toEqual([]);
    const action = chooseAiAction(replaced, 1, mulberry32(3));
    expect(validateAction(replaced, 1, action).ok).toBe(true);
    const next = resolveTurn(replaced, [{ type: 'skill', skillId: 'shadow_claw' }, action], mulberry32(4));
    expect(next.events.some((e) => e.type === 'damage')).toBe(true);
  });
});

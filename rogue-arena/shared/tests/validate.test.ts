import { describe, expect, it } from 'vitest';
import { validateAction } from '../engine/validate.js';
import { makeBattle } from './helpers.js';

const reason = (r: ReturnType<typeof validateAction>) => (r.ok ? 'ok' : r.reason);

describe('validateAction', () => {
  const s = makeBattle(['salamander', 'goblin'], ['slime']);

  it('accepte une compétence connue avec des PP', () => {
    expect(reason(validateAction(s, 0, { type: 'skill', skillId: 'fireball' }))).toBe('ok');
  });

  it("refuse ce qui n'est pas un objet", () => {
    expect(reason(validateAction(s, 0, null))).toBe('not_an_object');
    expect(reason(validateAction(s, 0, 'strike'))).toBe('not_an_object');
  });

  it('refuse une compétence que le monstre ne connaît pas', () => {
    expect(reason(validateAction(s, 0, { type: 'skill', skillId: 'deluge' }))).toBe('unknown_skill');
  });

  it('refuse une compétence à 0 PP', () => {
    const t = structuredClone(s);
    t.players[0].team[0].skills[0].ppLeft = 0;
    expect(reason(validateAction(t, 0, { type: 'skill', skillId: 'fireball' }))).toBe('no_pp');
  });

  it('accepte un changement vers un monstre en vie', () => {
    expect(reason(validateAction(s, 0, { type: 'switch', toIndex: 1 }))).toBe('ok');
  });

  it('refuse un index invalide', () => {
    for (const toIndex of [-1, 2, 1.5, '1']) {
      expect(reason(validateAction(s, 0, { type: 'switch', toIndex }))).toBe('bad_index');
    }
  });

  it('refuse de changer vers le monstre déjà actif', () => {
    expect(reason(validateAction(s, 0, { type: 'switch', toIndex: 0 }))).toBe('already_active');
  });

  it('refuse de changer vers un monstre KO', () => {
    const t = structuredClone(s);
    t.players[0].team[1].hp = 0;
    expect(reason(validateAction(t, 0, { type: 'switch', toIndex: 1 }))).toBe('fainted');
  });

  it("refuse un type d'action inconnu (dont l'abandon, qui a son endpoint)", () => {
    expect(reason(validateAction(s, 0, { type: 'forfeit' }))).toBe('unknown_type');
  });
});

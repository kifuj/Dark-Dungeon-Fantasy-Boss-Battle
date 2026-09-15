import { describe, expect, it } from 'vitest';
import { createTurnRng, mulberry32 } from '../engine/rng.js';
import { getActionOrder, resolveTurn } from '../engine/battle.js';
import type { Action } from '../types.js';
import { fixedRng, makeBattle } from './helpers.js';

const skill = (skillId: string): Action => ({ type: 'skill', skillId });

describe('US-03 — compétences', () => {
  it('Boule de feu contre Champignon est super efficace', () => {
    const s = makeBattle(['salamander'], ['mushroom']);
    const r = resolveTurn(s, [skill('fireball'), skill('strike')], mulberry32(1));
    const hit = r.events.find((e) => e.type === 'damage' && e.targetSeat === 1);
    expect(hit).toMatchObject({ type: 'damage', effectiveness: 2 });
  });

  it('consomme 1 PP, sauf pour les compétences illimitées', () => {
    const s = makeBattle(['salamander'], ['knight']);
    const r = resolveTurn(s, [skill('fireball'), skill('strike')], mulberry32(1));
    expect(r.state.players[0].team[0].skills.find((k) => k.id === 'fireball')?.ppLeft).toBe(9);
    expect(r.state.players[1].team[0].skills.find((k) => k.id === 'strike')?.ppLeft).toBeNull();
  });

  it('est déterministe : même seed + mêmes actions = même résultat', () => {
    const s = makeBattle(['salamander'], ['mushroom']);
    const r1 = resolveTurn(s, [skill('fireball'), skill('vine')], createTurnRng(123, 1, 1));
    const r2 = resolveTurn(s, [skill('fireball'), skill('vine')], createTurnRng(123, 1, 1));
    expect(r1).toEqual(r2);
  });

  it("ne modifie pas l'état d'entrée", () => {
    const s = makeBattle(['salamander'], ['mushroom']);
    const copy = structuredClone(s);
    resolveTurn(s, [skill('fireball'), skill('vine')], mulberry32(1));
    expect(s).toEqual(copy);
  });

  it('Régénération soigne 30 % des PV max, sans dépasser le maximum', () => {
    const s = makeBattle(['mushroom'], ['slime']);
    const me = s.players[0].team[0];
    me.hp = me.maxHp - 2;
    const r = resolveTurn(s, [skill('regrowth'), skill('regrowth')], mulberry32(1));
    expect(r.events).toContainEqual({ type: 'heal', seat: 0, amount: 2, hpAfter: me.maxHp, maxHp: me.maxHp });
  });

  it('Bénédiction augmente la DEF de 25 %', () => {
    const s = makeBattle(['knight'], ['knight']);
    const r = resolveTurn(s, [skill('blessing'), skill('blessing')], mulberry32(1));
    expect(r.state.players[0].team[0].modifiers.defMult).toBe(1.25);
    expect(r.events).toContainEqual({ type: 'buff', seat: 0, stat: 'def', mult: 1.25 });
  });

  it('Drain vital soigne 50 % des dégâts infligés', () => {
    const s = makeBattle(['skeleton'], ['knight']);
    s.players[0].team[0].hp = 1;
    const r = resolveTurn(s, [skill('life_drain'), skill('blessing')], mulberry32(1));
    const [damage] = r.events.flatMap((e) => (e.type === 'damage' ? [e] : []));
    const [heal] = r.events.flatMap((e) => (e.type === 'heal' && e.seat === 0 ? [e] : []));
    expect(heal.amount).toBe(Math.floor(damage.amount / 2));
  });
});

describe("US-05 — ordre d'action", () => {
  it("l'abandon passe avant le changement", () => {
    const s = makeBattle(['goblin', 'slime'], ['goblin']);
    expect(getActionOrder(s, [{ type: 'switch', toIndex: 1 }, { type: 'forfeit' }], mulberry32(1))).toEqual([1, 0]);
  });

  it('le changement de monstre passe avant les compétences, même prioritaires', () => {
    const s = makeBattle(['salamander', 'goblin'], ['flying_eye']);
    expect(getActionOrder(s, [{ type: 'switch', toIndex: 1 }, skill('quick_strike')], mulberry32(1))).toEqual([0, 1]);
  });

  it('une compétence prioritaire passe avant une plus rapide', () => {
    const s = makeBattle(['slime'], ['flying_eye']); // VIT 30 contre 75
    s.players[0].team[0].skills.push({ id: 'quick_strike', ppLeft: 10 });
    expect(getActionOrder(s, [skill('quick_strike'), skill('shadow_claw')], mulberry32(1))).toEqual([0, 1]);
  });

  it('à priorité égale, la VIT la plus haute agit en premier', () => {
    const s = makeBattle(['slime'], ['flying_eye']);
    expect(getActionOrder(s, [skill('vine'), skill('shadow_claw')], mulberry32(1))).toEqual([1, 0]);
  });

  it("à VIT égale, l'ordre est tiré avec le RNG du tour", () => {
    const s = makeBattle(['goblin'], ['goblin']);
    const actions: [Action, Action] = [skill('strike'), skill('strike')];
    expect(getActionOrder(s, actions, fixedRng(0.2))).toEqual([0, 1]);
    expect(getActionOrder(s, actions, fixedRng(0.8))).toEqual([1, 0]);
  });

  it("un monstre mis KO avant son action n'agit pas", () => {
    const s = makeBattle(['flying_eye'], ['slime', 'goblin']);
    s.players[1].team[0].hp = 1;
    const r = resolveTurn(s, [skill('shadow_claw'), skill('vine')], mulberry32(1));
    expect(r.events.some((e) => e.type === 'skill_used' && e.seat === 1)).toBe(false);
  });

  it('le changement a lieu avant la compétence adverse, qui touche le nouveau monstre', () => {
    const s = makeBattle(['salamander', 'undine'], ['undine']);
    const r = resolveTurn(s, [{ type: 'switch', toIndex: 1 }, skill('water_jet')], mulberry32(1));
    expect(r.events[0]).toMatchObject({ type: 'switch', seat: 0, toIndex: 1, forced: false });
    expect(r.state.players[0].team[0].hp).toBe(r.state.players[0].team[0].maxHp);
    expect(r.state.players[0].team[1].hp).toBeLessThan(r.state.players[0].team[1].maxHp);
  });
});

describe('US-06 — KO et fin de combat', () => {
  it('émet faint puis remplace automatiquement le monstre KO', () => {
    const s = makeBattle(['flying_eye'], ['slime', 'goblin']);
    s.players[1].team[0].hp = 1;
    const r = resolveTurn(s, [skill('shadow_claw'), skill('vine')], mulberry32(1));
    expect(r.events).toContainEqual({ type: 'faint', seat: 1, index: 0, name: 'Slime' });
    expect(r.events.at(-1)).toEqual({ type: 'switch', seat: 1, fromIndex: 0, toIndex: 1, forced: true, name: 'Gobelin' });
    expect(r.state.players[1].activeIndex).toBe(1);
    expect(r.winnerSeat).toBeNull();
    expect(r.state.turn).toBe(2);
  });

  it('remplace par le premier monstre en vie', () => {
    const s = makeBattle(['flying_eye'], ['slime', 'goblin', 'skeleton']);
    s.players[1].team[0].hp = 1;
    s.players[1].team[1].hp = 0;
    const r = resolveTurn(s, [skill('shadow_claw'), skill('vine')], mulberry32(1));
    expect(r.state.players[1].activeIndex).toBe(2);
  });

  it("déclare la victoire quand toute l'équipe adverse est KO", () => {
    const s = makeBattle(['salamander'], ['mushroom']);
    s.players[1].team[0].hp = 1;
    const r = resolveTurn(s, [skill('fireball'), skill('vine')], mulberry32(7));
    expect(r.winnerSeat).toBe(0);
    expect(r.events.at(-1)).toEqual({ type: 'battle_end', winnerSeat: 0 });
  });

  it('déclare la défaite quand toute sa propre équipe est KO', () => {
    const s = makeBattle(['slime'], ['flying_eye']);
    s.players[0].team[0].hp = 1;
    const r = resolveTurn(s, [skill('vine'), skill('shadow_claw')], mulberry32(3));
    expect(r.winnerSeat).toBe(1);
    expect(r.events.at(-1)).toEqual({ type: 'battle_end', winnerSeat: 1 });
  });

  it("l'abandon donne la victoire à l'adversaire", () => {
    const s = makeBattle(['goblin'], ['goblin']);
    const r = resolveTurn(s, [{ type: 'forfeit' }, skill('strike')], mulberry32(1));
    expect(r.winnerSeat).toBe(1);
    expect(r.events).toEqual([{ type: 'forfeit', seat: 0 }, { type: 'battle_end', winnerSeat: 1 }]);
  });
});

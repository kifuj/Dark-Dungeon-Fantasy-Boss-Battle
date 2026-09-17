import { describe, expect, it } from 'vitest';
import { COMMON_EVOLUTION_LEVEL, STARTER_EVOLUTION_LEVEL } from '../data/monsters.js';
import { resolveTurn } from '../engine/battle.js';
import { grantKillLevels, KILL_LEVELS, levelUp } from '../engine/level.js';
import { createMonster } from '../engine/stats.js';
import { fixedRng, makeBattle } from './helpers.js';
import type { BattleState } from '../types.js';

/** Le joueur (siège 0) achève un ennemi à 1 PV. */
function lethalTurn(state: BattleState) {
  state.players[1].team[0].hp = 1;
  return resolveTurn(state, [{ type: 'skill', skillId: 'strike' }, { type: 'skill', skillId: 'strike' }], fixedRng(0.99));
}

describe('Niveau gagné en mettant un ennemi K.O. (solo)', () => {
  it('fait gagner un niveau au monstre du joueur qui abat un ennemi', () => {
    const state = makeBattle(['wolf'], ['slime', 'goblin'], 6);
    state.players[0].team[0].stats.spd = 999; // le joueur frappe en premier
    const result = grantKillLevels(lethalTurn(state));
    const wolf = result.state.players[0].team[0];
    expect(wolf.level).toBe(6 + KILL_LEVELS);
    expect(wolf.maxHp).toBe(createMonster('wolf', 7, 'x').maxHp);
    const types = result.events.map((e) => e.type);
    expect(types.indexOf('level_up')).toBe(types.indexOf('faint') + 1);
    expect(result.events.find((e) => e.type === 'level_up')).toMatchObject({ seat: 0, name: 'Loup sylvestre', level: 7, evolvedFrom: null });
  });

  it('ne donne rien sans K.O. ennemi, ni à l’ennemi qui met le joueur K.O.', () => {
    const quiet = resolveTurn(makeBattle(['wolf'], ['slime']), [{ type: 'skill', skillId: 'strike' }, { type: 'skill', skillId: 'strike' }], fixedRng(0.99));
    expect(grantKillLevels(quiet)).toBe(quiet);

    const state = makeBattle(['wolf', 'slime'], ['goblin'], 6);
    state.players[0].team[0].hp = 1;
    state.players[1].team[0].stats.spd = 999;
    const result = grantKillLevels(resolveTurn(state, [{ type: 'skill', skillId: 'strike' }, { type: 'skill', skillId: 'strike' }], fixedRng(0.99)));
    expect(result.state.players[1].team[0].level).toBe(6);
    expect(result.events.some((e) => e.type === 'level_up')).toBe(false);
  });

  it('fait évoluer le monstre qui atteint son niveau d’évolution, sans changer ses PV perdus ni ses compétences', () => {
    const state = makeBattle(['salamander'], ['slime'], STARTER_EVOLUTION_LEVEL - 1);
    const salamander = state.players[0].team[0];
    salamander.stats.spd = 999;
    salamander.hp -= 10;
    const result = grantKillLevels(lethalTurn(state));
    const evolved = result.state.players[0].team[0];
    expect(evolved).toMatchObject({ speciesId: 'drakeid', name: 'Drakéide', level: STARTER_EVOLUTION_LEVEL, uid: salamander.uid });
    expect(evolved.maxHp - evolved.hp).toBe(10);
    expect(evolved.skills.map((s) => s.id)).toEqual(salamander.skills.map((s) => s.id));
    expect(result.events.find((e) => e.type === 'level_up')).toMatchObject({ speciesId: 'drakeid', evolvedFrom: 'Salamandre' });
  });
});

describe('levelUp', () => {
  it('garde un KO à 0 PV et suit l’évolution des communs', () => {
    const bat = { ...createMonster('bat', COMMON_EVOLUTION_LEVEL - 2, 'b'), hp: 0 };
    const grown = levelUp(bat, 2);
    expect(grown).toMatchObject({ speciesId: 'vampire_lord', level: COMMON_EVOLUTION_LEVEL, hp: 0 });
  });
});

import { describe, expect, it } from 'vitest';
import { createOnlineBattle, ONLINE_LEVEL, ONLINE_POOL, ONLINE_TEAM_SIZE, onlineTeam } from '../engine/online.js';
import { SPECIES } from '../data/monsters.js';

describe('US-19 — équipes du duel en ligne', () => {
  it('donne 3 monstres de niveau 10 à chaque joueur (CA1)', () => {
    const state = createOnlineBattle(1234, 'joueur-1', 'joueur-2');
    for (const player of state.players) {
      expect(player.team).toHaveLength(ONLINE_TEAM_SIZE);
      expect(player.team.every((m) => m.level === ONLINE_LEVEL)).toBe(true);
      expect(player.team.every((m) => m.hp === m.maxHp)).toBe(true);
      expect(player.activeIndex).toBe(0);
    }
    expect(state.players[0].userId).toBe('joueur-1');
    expect(state.players[1].userId).toBe('joueur-2');
    expect(state.round).toBe(1);
    expect(state.turn).toBe(1);
  });

  it('tire sans remise : pas deux fois la même espèce dans une équipe', () => {
    for (let seed = 0; seed < 50; seed++) {
      for (const seat of [0, 1] as const) {
        const ids = onlineTeam(seed, seat).map((m) => m.speciesId);
        expect(new Set(ids).size).toBe(ONLINE_TEAM_SIZE);
      }
    }
  });

  it('ne tire jamais de boss (réservés au solo)', () => {
    expect(ONLINE_POOL).not.toContain('demon');
    expect(ONLINE_POOL).not.toContain('lich');
    const drawn = new Set(Array.from({ length: 200 }, (_, seed) => onlineTeam(seed, 0).map((m) => m.speciesId)).flat());
    expect([...drawn].every((id) => SPECIES[id].rarity !== 'boss')).toBe(true);
  });

  it('est déterministe : même seed → mêmes équipes pour les deux joueurs (CA1)', () => {
    expect(createOnlineBattle(42, 'a', 'b')).toEqual(createOnlineBattle(42, 'a', 'b'));
    // Deux seeds différentes donnent des duels différents (sinon tous les matchs seraient identiques).
    const teams = new Set(Array.from({ length: 30 }, (_, seed) => onlineTeam(seed, 0).map((m) => m.speciesId).join('-')));
    expect(teams.size).toBeGreaterThan(5);
  });

  it('donne des identifiants uniques aux monstres des deux équipes', () => {
    const state = createOnlineBattle(7, 'a', 'b');
    const uids = state.players.flatMap((p) => p.team.map((m) => m.uid));
    expect(new Set(uids).size).toBe(uids.length);
  });
});

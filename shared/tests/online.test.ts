import { describe, expect, it } from 'vitest';
import {
  createDraftState,
  createOnlineBattle,
  DRAFT_OFFER_SIZE,
  draftOffer,
  ONLINE_LEVEL,
  ONLINE_POOL,
  ONLINE_TEAM_SIZE,
  onlineTeam,
  startBattleFromDrafts,
  validateDraftPicks,
} from '../engine/online.js';
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

describe('US-18 — draft d’équipe', () => {
  it('propose 6 espèces distinctes, hors boss, à chaque joueur (CA1)', () => {
    const state = createDraftState(99, 'a', 'b');
    expect(state.turn).toBe(0);
    for (const seat of [0, 1] as const) {
      const offer = state.draftOffers![seat];
      expect(offer).toHaveLength(DRAFT_OFFER_SIZE);
      expect(new Set(offer).size).toBe(DRAFT_OFFER_SIZE);
      expect(offer.every((id) => ONLINE_POOL.includes(id))).toBe(true);
      expect(state.players[seat].team).toEqual([]);
    }
  });

  it('tire les offres avec la seed du match (CA1)', () => {
    expect(draftOffer(5, 0)).toEqual(draftOffer(5, 0));
    expect(createDraftState(5, 'a', 'b')).toEqual(createDraftState(5, 'a', 'b'));
    const offers = new Set(Array.from({ length: 30 }, (_, seed) => draftOffer(seed, 1).join('-')));
    expect(offers.size).toBeGreaterThan(5);
  });

  it('accepte exactement 3 indices distincts compris dans l’offre', () => {
    expect(validateDraftPicks([0, 3, 5])).toBe(true);
    expect(validateDraftPicks([0, 3])).toBe(false);
    expect(validateDraftPicks([0, 3, 3])).toBe(false);
    expect(validateDraftPicks([0, 3, 6])).toBe(false);
    expect(validateDraftPicks([0, 1.5, 2])).toBe(false);
    expect(validateDraftPicks([0, 1, 2, 3])).toBe(false);
    expect(validateDraftPicks('0,1,2')).toBe(false);
  });

  it('construit les équipes choisies, dans l’ordre des choix, et lance le tour 1 (CA3)', () => {
    const draft = createDraftState(12, 'a', 'b');
    const battle = startBattleFromDrafts(draft, [[5, 0, 2], [1, 3, 4]]);
    expect(battle.turn).toBe(1);
    expect(battle.draftOffers).toBeNull();
    expect(battle.players[0].team.map((m) => m.speciesId)).toEqual([5, 0, 2].map((i) => draft.draftOffers![0][i]));
    expect(battle.players[1].team.map((m) => m.speciesId)).toEqual([1, 3, 4].map((i) => draft.draftOffers![1][i]));
    expect(battle.players.flatMap((p) => p.team).every((m) => m.level === ONLINE_LEVEL && m.hp === m.maxHp)).toBe(true);
    expect(battle.players.map((p) => p.userId)).toEqual(['a', 'b']);
    const uids = battle.players.flatMap((p) => p.team.map((m) => m.uid));
    expect(new Set(uids).size).toBe(uids.length);
  });

  it('refuse un draft invalide ou un état sans draft', () => {
    const draft = createDraftState(12, 'a', 'b');
    expect(() => startBattleFromDrafts(draft, [[0, 0, 1], [1, 2, 3]])).toThrow();
    expect(() => startBattleFromDrafts(createOnlineBattle(12, 'a', 'b'), [[0, 1, 2], [0, 1, 2]])).toThrow();
  });
});

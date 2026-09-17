import { describe, expect, it } from 'vitest';
import {
  createDraftState,
  createOnlineBattle,
  DEFAULT_DRAFT_PICKS,
  defaultAction,
  DRAFT_OFFER_SIZE,
  draftOffer,
  isTurnExpired,
  ONLINE_LEVEL,
  ONLINE_POOL,
  ONLINE_TEAM_SIZE,
  onlineTeam,
  startBattleFromDrafts,
  TIMEOUT_GRACE_MS,
  TURN_DURATION_MS,
  validateDraftPicks,
} from '../engine/online.js';
import { validateAction } from '../engine/validate.js';
import { resolveTurn } from '../engine/battle.js';
import { createTurnRng } from '../engine/rng.js';
import { createMonster } from '../engine/stats.js';
import type { BattleState, MonsterInstance } from '../types.js';
import { SPECIES } from '../data/monsters.js';

const SEED_TIMEOUT = 2026;

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

describe('US-20 — timeout de tour', () => {
  const battle = () => createOnlineBattle(SEED_TIMEOUT, 'host', 'guest');
  /**
   * Équipe fixe : Salamandre (a `strike`), puis Loup et Feu follet privés de leur Frappe, comme dans
   * un duel enregistré avant que toutes les espèces aient une compétence à PP illimités.
   */
  const fixed = (): BattleState => {
    const state = battle();
    state.players[1].team = ['salamander', 'wolf', 'wisp'].map((id, i) => {
      const monster = createMonster(id, 10, `p1-m${i}`);
      return i === 0 ? monster : { ...monster, skills: monster.skills.filter((s) => s.id !== 'strike') };
    });
    return state;
  };
  const drain = (monster: MonsterInstance) => monster.skills.forEach((slot) => slot.ppLeft !== null && (slot.ppLeft = 0));

  it('joue la première compétence qui a encore des PP (CA2)', () => {
    const state = fixed();
    expect(defaultAction(state, 1)).toEqual({ type: 'skill', skillId: 'fireball' });
    drain(state.players[1].team[0]);
    expect(defaultAction(state, 1)).toEqual({ type: 'skill', skillId: 'strike' });
  });

  it('change de monstre quand l’actif n’a plus aucune compétence utilisable', () => {
    const state = fixed();
    state.players[1].activeIndex = 1;
    drain(state.players[1].team[1]);
    const action = defaultAction(state, 1);
    expect(action).toEqual({ type: 'switch', toIndex: 0 });
    expect(validateAction(state, 1, action).ok).toBe(true);
  });

  it('frappe quand même si le dernier monstre n’a plus de PP : le duel ne se bloque pas', () => {
    const state = fixed();
    state.players[1].activeIndex = 1;
    state.players[1].team[0].hp = 0;
    state.players[1].team[2].hp = 0;
    drain(state.players[1].team[1]);
    const action = defaultAction(state, 1);
    expect(action).toEqual({ type: 'skill', skillId: 'vine' });
    const result = resolveTurn(state, [defaultAction(state, 0), action], createTurnRng(SEED_TIMEOUT, 1, 1));
    expect(result.events.some((e) => e.type === 'skill_used' && e.seat === 1)).toBe(true);
  });

  it('suit le monstre actif du joueur absent', () => {
    const state = battle();
    state.players[0].activeIndex = 2;
    expect(defaultAction(state, 0)).toEqual({ type: 'skill', skillId: state.players[0].team[2].skills[0].id });
  });

  it('prend les 3 premières propositions pour un draft absent', () => {
    expect(validateDraftPicks([...DEFAULT_DRAFT_PICKS])).toBe(true);
    expect(DEFAULT_DRAFT_PICKS).toEqual([0, 1, 2]);
  });

  it('refuse le timeout avant la deadline et pendant la marge de 2 s (CA3)', () => {
    const deadline = '2026-09-17T10:00:00.000Z';
    const at = Date.parse(deadline);
    expect(isTurnExpired(deadline, at - 30_000)).toBe(false);
    expect(isTurnExpired(deadline, at + TIMEOUT_GRACE_MS)).toBe(false);
    expect(isTurnExpired(deadline, at + TIMEOUT_GRACE_MS + 1)).toBe(true);
    expect(isTurnExpired(null, at + 3_600_000)).toBe(false); // match terminé : pas de deadline
  });

  it('laisse 60 s par tour', () => {
    expect(TURN_DURATION_MS).toBe(60_000);
  });
});

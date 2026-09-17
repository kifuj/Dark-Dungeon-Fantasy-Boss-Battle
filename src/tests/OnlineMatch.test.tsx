import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { OnlineMatch } from '../pages/OnlineMatch.tsx';
import { ProfileProvider } from '../lib/profile.tsx';
import { ApiError } from '../lib/api.ts';
import { EventBus } from '../game/EventBus.ts';
import { createDraftState, createOnlineBattle, startBattleFromDrafts } from '../../shared/engine/online.js';
import { SPECIES } from '../../shared/data/monsters.js';
import { resolveTurn } from '../../shared/engine/battle.js';
import { createTurnRng } from '../../shared/engine/rng.js';
import type { MatchRow } from '../../shared/types.js';

const { subscribeToMatch, hasPlayedThisTurn, fetchUsernames, sendAction, sendDraft, forfeitMatch, loadProfile } = vi.hoisted(() => ({
  subscribeToMatch: vi.fn(),
  hasPlayedThisTurn: vi.fn(),
  fetchUsernames: vi.fn(),
  sendAction: vi.fn(),
  sendDraft: vi.fn(),
  forfeitMatch: vi.fn(),
  loadProfile: vi.fn(),
}));

vi.mock('../lib/realtime.ts', () => ({ subscribeToMatch, subscribeToRoom: vi.fn() }));
vi.mock('../lib/matches.ts', () => ({ hasPlayedThisTurn, fetchMatch: vi.fn() }));
vi.mock('../lib/rooms.ts', () => ({ fetchUsernames, fetchRoom: vi.fn() }));
vi.mock('../lib/api.ts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/api.ts')>()),
  sendAction,
  sendDraft,
  forfeitMatch,
}));
vi.mock('../lib/session.ts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/session.ts')>()),
  loadProfile,
}));
// Ni le canvas ni le moteur Phaser n'ont leur place dans jsdom : on remplace la scène par
// un div et l'EventBus (un EventEmitter de Phaser) par un émetteur minimal de test.
vi.mock('../game/PhaserGame.tsx', () => ({ PhaserGame: () => <div data-testid="phaser-canvas" /> }));
vi.mock('../game/EventBus.ts', () => {
  type Listener = (...args: unknown[]) => void;
  const listeners = new Map<string, Set<Listener>>();
  return {
    EventBus: {
      on: (event: string, fn: Listener) => listeners.set(event, (listeners.get(event) ?? new Set()).add(fn)),
      off: (event: string, fn: Listener) => listeners.get(event)?.delete(fn),
      emit: (event: string, ...args: unknown[]) => listeners.get(event)?.forEach((fn) => fn(...args)),
    },
  };
});

const SEED = 4242;
const BASE: MatchRow = {
  id: 'match-1',
  room_id: 'room-1',
  player1_id: 'host',
  player2_id: 'guest',
  phase: 'battle',
  round: 1,
  turn: 1,
  seed: SEED,
  state: createOnlineBattle(SEED, 'host', 'guest'),
  last_events: [],
  version: 1,
  turn_deadline: null,
  winner_id: null,
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

async function renderMatch(userId = 'host', playedAlready = false) {
  let push: (row: MatchRow) => void = () => {};
  subscribeToMatch.mockImplementation((_id: string, onRow: (row: MatchRow) => void) => {
    push = onRow;
    return () => {};
  });
  hasPlayedThisTurn.mockResolvedValue(playedAlready);
  fetchUsernames.mockResolvedValue({ host: 'Mattéo', guest: 'Owen' });
  loadProfile.mockResolvedValue({ id: userId, username: userId === 'host' ? 'Mattéo' : 'Owen' });

  render(
    <MemoryRouter initialEntries={['/match/match-1']}>
      <ProfileProvider>
        <Routes>
          <Route path="/match/:matchId" element={<OnlineMatch />} />
        </Routes>
      </ProfileProvider>
    </MemoryRouter>,
  );
  await act(async () => {});
  return {
    user: userEvent.setup(),
    push: async (row: MatchRow) => {
      await act(async () => push(row));
    },
  };
}

describe('US-19 — jouer un combat en ligne', () => {
  it('affiche les deux équipes et rend la main au joueur (CA1)', async () => {
    const { push } = await renderMatch();
    await push(BASE);

    expect(screen.getByTestId('phaser-canvas')).toBeDefined();
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('À vous de jouer.'));
    expect(screen.getByText(/contre Owen/)).toBeDefined();
    const active = BASE.state.players[0].team[0];
    expect(screen.getAllByRole('button', { name: new RegExp(active.skills[0].id === 'strike' ? 'Frappe' : '.') }).length).toBeGreaterThan(0);
  });

  it('envoie l’action puis affiche « En attente de l’adversaire… » (CA2) et ignore le double-clic (CA5)', async () => {
    const { user, push } = await renderMatch();
    await push(BASE);
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('À vous de jouer.'));
    sendAction.mockResolvedValue({ status: 'waiting' });

    const skill = screen.getAllByRole('button', { name: /PP/ })[0];
    await user.dblClick(skill); // deux clics d'affilée sur la même compétence

    expect(sendAction).toHaveBeenCalledTimes(1);
    expect(sendAction).toHaveBeenCalledWith('match-1', 1, 1, { type: 'skill', skillId: BASE.state.players[0].team[0].skills[0].id });
    expect(screen.getByRole('status').textContent).toBe('En attente de l’adversaire…');
  });

  it('rejoue les événements du tour résolu puis rouvre le menu (CA3)', async () => {
    const { push } = await renderMatch();
    await push(BASE);
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('À vous de jouer.'));

    const rng = createTurnRng(SEED, 1, 1);
    const turn = resolveTurn(BASE.state, [{ type: 'skill', skillId: BASE.state.players[0].team[0].skills[0].id }, { type: 'skill', skillId: BASE.state.players[1].team[0].skills[0].id }], rng);
    await push({ ...BASE, state: turn.state, last_events: turn.events, turn: 2, version: 2 });

    expect(screen.getByRole('status').textContent).toBe('Résolution du tour…');
    expect(screen.queryByLabelText("Menu d'actions")).toBeNull(); // menu masqué pendant l'animation
    expect(document.querySelector('.action-menu-hidden')).not.toBeNull();

    await act(async () => EventBus.emit('events-played')); // la scène a fini de rejouer le tour
    expect(screen.getByRole('status').textContent).toBe('À vous de jouer.');
    expect(screen.getByText(/Tour 2/)).toBeDefined();
  });

  it('ignore une ligne déjà traitée (Realtime + polling envoient la même version)', async () => {
    const { push } = await renderMatch();
    await push(BASE);
    await push(BASE); // même version : aucune animation ne doit démarrer
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('À vous de jouer.'));
  });

  it('reste en attente si le serveur répond ALREADY_PLAYED (CA5)', async () => {
    const { user, push } = await renderMatch();
    await push(BASE);
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('À vous de jouer.'));
    sendAction.mockRejectedValue(new ApiError('ALREADY_PLAYED', 409));

    await user.click(screen.getAllByRole('button', { name: /PP/ })[0]);

    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('En attente de l’adversaire…'));
    expect(screen.queryByRole('alert')).toBeNull(); // erreur silencieuse
  });

  it('affiche Victoire pour le gagnant et Défaite pour le perdant (CA6)', async () => {
    const finished: MatchRow = { ...BASE, phase: 'finished', winner_id: 'host', version: 9 };

    const host = await renderMatch('host');
    await host.push(finished);
    expect(screen.getByRole('heading', { name: /Victoire/ })).toBeDefined();
    expect(screen.getByRole('link', { name: /Retour au menu/ })).toBeDefined();

    cleanup();
    const guest = await renderMatch('guest');
    await guest.push(finished);
    expect(screen.getByRole('heading', { name: /Défaite/ })).toBeDefined();
  });

  it('demande confirmation avant d’abandonner (US-23 CA1)', async () => {
    const { user, push } = await renderMatch();
    await push(BASE);
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('À vous de jouer.'));

    await user.click(screen.getByRole('button', { name: /^Abandonner/ }));
    expect(forfeitMatch).not.toHaveBeenCalled(); // un seul clic n'abandonne pas
    expect(screen.getByRole('alertdialog')).toBeDefined();

    await user.click(screen.getByRole('button', { name: /Continuer le duel/ }));
    expect(screen.queryByRole('alertdialog')).toBeNull();

    forfeitMatch.mockResolvedValue({ status: 'finished' });
    await user.click(screen.getByRole('button', { name: /^Abandonner/ }));
    await user.click(screen.getByRole('button', { name: /Confirmer l’abandon/ }));
    expect(forfeitMatch).toHaveBeenCalledWith('match-1');
  });

  it('affiche « Victoire par abandon » chez l’adversaire (US-23 CA2)', async () => {
    const { push } = await renderMatch('guest');
    await push(BASE);
    await push({
      ...BASE,
      phase: 'finished',
      winner_id: 'guest',
      last_events: [
        { type: 'forfeit', seat: 0 },
        { type: 'battle_end', winnerSeat: 1 },
      ],
      version: 2,
    });
    await act(async () => EventBus.emit('events-played'));

    expect(screen.getByRole('heading', { name: /Victoire par abandon/ })).toBeDefined();
    expect(screen.getByText(/Mattéo a abandonné le duel/)).toBeDefined();
  });

  it('affiche l’état courant après un rafraîchissement, sans rejouer d’animation (US-21 CA1)', async () => {
    const played: string[] = [];
    const inits: unknown[] = [];
    const onPlay = () => played.push('play-events');
    const onInit = (payload: unknown) => inits.push(payload);
    EventBus.on('play-events', onPlay);
    EventBus.on('battle-init', onInit);
    const { push } = await renderMatch();

    // Duel déjà avancé : tour 4, version 7, avec les événements du tour 3 dans `last_events`.
    const rng = createTurnRng(SEED, 1, 3);
    const moves = [0, 1].map((seat) => ({ type: 'skill' as const, skillId: BASE.state.players[seat].team[0].skills[0].id }));
    const turn = resolveTurn(BASE.state, [moves[0], moves[1]], rng);
    await push({ ...BASE, state: turn.state, last_events: turn.events, turn: 4, version: 7 });

    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('À vous de jouer.'));
    expect(screen.getByText('Tour 4')).toBeTruthy();
    expect(played).toHaveLength(0); // aucun rejeu du tour précédent
    expect(inits.at(-1)).toEqual({ state: turn.state, playerSeat: 0 }); // bons PV affichés directement
    expect(hasPlayedThisTurn).toHaveBeenCalledWith('match-1', 1, 4, 'battle');
    EventBus.off('play-events', onPlay);
    EventBus.off('battle-init', onInit);
  });

  it('affiche « En attente de l’adversaire… » après un rafraîchissement si le tour est déjà joué (US-21 CA2)', async () => {
    const { push } = await renderMatch();
    hasPlayedThisTurn.mockResolvedValue(true); // le joueur avait déjà envoyé son action avant de rafraîchir
    await push(BASE);

    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('En attente de l’adversaire…'));
  });
});

describe('US-18 — draft d’équipe en duel', () => {
  const DRAFT: MatchRow = { ...BASE, phase: 'draft', turn: 0, state: createDraftState(SEED, 'host', 'guest') };
  const card = (speciesId: string) => screen.getByRole('button', { name: new RegExp(SPECIES[speciesId].name) });

  it('propose les 6 monstres du joueur, sans scène de combat (CA1)', async () => {
    const { push } = await renderMatch('guest');
    await push(DRAFT);

    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('À vous de jouer.'));
    expect(screen.queryByTestId('phaser-canvas')).toBeNull();
    expect(screen.getByText('Draft')).toBeDefined();
    for (const speciesId of DRAFT.state.draftOffers![1]) expect(card(speciesId)).toBeDefined();
    expect(hasPlayedThisTurn).toHaveBeenCalledWith('match-1', 1, 0, 'draft');
  });

  it('n’envoie le choix qu’avec exactement 3 monstres, dans l’ordre des clics (CA1)', async () => {
    const { user, push } = await renderMatch();
    await push(DRAFT);
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('À vous de jouer.'));
    const offer = DRAFT.state.draftOffers![0];
    const confirm = () => screen.getByRole('button', { name: /Valider mon équipe/ }) as HTMLButtonElement;

    await user.click(card(offer[4]));
    await user.click(card(offer[1]));
    expect(confirm().disabled).toBe(true);
    await user.click(card(offer[1])); // un 2e clic retire le monstre
    await user.click(card(offer[2]));
    await user.click(card(offer[0]));
    expect((card(offer[3]) as HTMLButtonElement).disabled).toBe(true); // équipe complète
    expect(confirm().disabled).toBe(false);

    sendDraft.mockResolvedValue({ status: 'waiting' });
    await user.click(confirm());
    expect(sendDraft).toHaveBeenCalledWith('match-1', [4, 2, 0]);
    expect(screen.getByRole('status').textContent).toMatch(/En attente du choix de l’adversaire/);
  });

  it('reste en attente après un rafraîchissement si le choix est déjà envoyé', async () => {
    const { push } = await renderMatch('host', true);
    await push(DRAFT);
    await waitFor(() => expect(screen.getByRole('status').textContent).toMatch(/En attente du choix/));
    expect(screen.getByRole('button', { name: /Équipe validée/ })).toBeDefined();
  });

  it('lance le combat avec les équipes choisies quand les 2 drafts sont reçus (CA3)', async () => {
    const { push } = await renderMatch();
    await push(DRAFT);
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('À vous de jouer.'));

    const state = startBattleFromDrafts(DRAFT.state, [[0, 1, 2], [3, 4, 5]]);
    const inits: unknown[] = [];
    EventBus.on('battle-init', (payload: unknown) => inits.push(payload));
    await push({ ...DRAFT, phase: 'battle', turn: 1, state, version: 2 });

    expect(screen.getByTestId('phaser-canvas')).toBeDefined();
    expect(screen.getByText(/Tour 1/)).toBeDefined();
    expect(screen.getByRole('status').textContent).toBe('À vous de jouer.');
    expect(screen.getAllByRole('button', { name: /PP/ }).length).toBeGreaterThan(0);
    await act(async () => EventBus.emit('scene-ready'));
    expect(inits.at(-1)).toEqual({ state, playerSeat: 0 });
  });

  it('affiche la fin du duel si l’adversaire abandonne pendant le draft', async () => {
    const { push } = await renderMatch();
    await push(DRAFT);
    await push({
      ...DRAFT,
      phase: 'finished',
      winner_id: 'host',
      version: 2,
      last_events: [{ type: 'forfeit', seat: 1 }, { type: 'battle_end', winnerSeat: 0 }],
    });
    expect(screen.getByRole('heading', { name: /Victoire par abandon/ })).toBeDefined();
    expect(screen.queryByTestId('phaser-canvas')).toBeNull();
  });
});

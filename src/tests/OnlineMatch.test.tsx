import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { OnlineMatch } from '../pages/OnlineMatch.tsx';
import { ProfileProvider } from '../lib/profile.tsx';
import { ApiError } from '../lib/api.ts';
import { EventBus } from '../game/EventBus.ts';
import { createOnlineBattle } from '../../shared/engine/online.js';
import { resolveTurn } from '../../shared/engine/battle.js';
import { createTurnRng } from '../../shared/engine/rng.js';
import type { MatchRow } from '../../shared/types.js';

const { subscribeToMatch, hasPlayedThisTurn, fetchUsernames, sendAction, loadProfile } = vi.hoisted(() => ({
  subscribeToMatch: vi.fn(),
  hasPlayedThisTurn: vi.fn(),
  fetchUsernames: vi.fn(),
  sendAction: vi.fn(),
  loadProfile: vi.fn(),
}));

vi.mock('../lib/realtime.ts', () => ({ subscribeToMatch, subscribeToRoom: vi.fn() }));
vi.mock('../lib/matches.ts', () => ({ hasPlayedThisTurn, fetchMatch: vi.fn() }));
vi.mock('../lib/rooms.ts', () => ({ fetchUsernames, fetchRoom: vi.fn() }));
vi.mock('../lib/api.ts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/api.ts')>()),
  sendAction,
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

async function renderMatch(userId = 'host') {
  let push: (row: MatchRow) => void = () => {};
  subscribeToMatch.mockImplementation((_id: string, onRow: (row: MatchRow) => void) => {
    push = onRow;
    return () => {};
  });
  hasPlayedThisTurn.mockResolvedValue(false);
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

  it('affiche « En attente de l’adversaire… » après un rafraîchissement si le tour est déjà joué (US-21 CA2)', async () => {
    const { push } = await renderMatch();
    hasPlayedThisTurn.mockResolvedValue(true); // le joueur avait déjà envoyé son action avant de rafraîchir
    await push(BASE);

    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('En attente de l’adversaire…'));
  });
});

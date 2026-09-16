import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Room } from '../pages/Room.tsx';
import { ProfileProvider } from '../lib/profile.tsx';
import type { RoomRow } from '../../shared/types.js';

const { subscribeToRoom, fetchUsernames, startMatch, loadProfile } = vi.hoisted(() => ({
  subscribeToRoom: vi.fn(),
  fetchUsernames: vi.fn(),
  startMatch: vi.fn(),
  loadProfile: vi.fn(),
}));

vi.mock('../lib/realtime.ts', () => ({ subscribeToRoom, subscribeToMatch: vi.fn() }));
vi.mock('../lib/rooms.ts', () => ({ fetchUsernames, fetchRoom: vi.fn() }));
vi.mock('../lib/api.ts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/api.ts')>()),
  startMatch,
}));
vi.mock('../lib/session.ts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/session.ts')>()),
  loadProfile,
}));

const ROOM: RoomRow = {
  id: 'room-1',
  code: 'K7P2QX',
  host_id: 'host',
  guest_id: null,
  status: 'waiting',
  current_match_id: null,
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

/** Rend le salon et renvoie la fonction que le Realtime utilisera pour pousser une ligne. */
async function renderRoom(userId: string) {
  let push: (row: RoomRow) => void = () => {};
  subscribeToRoom.mockImplementation((_id: string, onRow: (row: RoomRow) => void) => {
    push = onRow;
    return () => {};
  });
  fetchUsernames.mockResolvedValue({ host: 'Mattéo', guest: 'Owen' });
  loadProfile.mockResolvedValue({ id: userId, username: userId === 'host' ? 'Mattéo' : 'Owen' });

  render(
    <MemoryRouter initialEntries={['/salon/room-1']}>
      <ProfileProvider>
        <Routes>
          <Route path="/salon/:roomId" element={<Room />} />
          <Route path="/match/:matchId" element={<h1>Match</h1>} />
        </Routes>
      </ProfileProvider>
    </MemoryRouter>,
  );
  await act(async () => {}); // laisse le ProfileProvider relire la session
  return (row: RoomRow) => act(() => push(row));
}

describe('US-16 — créer un salon', () => {
  it('affiche le code sur 6 caractères et un bouton « Copier » (CA1)', async () => {
    const push = await renderRoom('host');
    push(ROOM);

    expect(screen.getByLabelText('Code du salon').textContent).toBe('K7P2QX');
    const user = userEvent.setup(); // installe un presse-papiers de test sur navigator
    const writeText = vi.spyOn(navigator.clipboard, 'writeText');
    await user.click(screen.getByRole('button', { name: /Copier le code/ }));
    expect(writeText).toHaveBeenCalledWith('K7P2QX');
    expect(await screen.findByRole('button', { name: /Code copié/ })).toBeDefined();
  });

  it("affiche le pseudo de l'invité dès que le Realtime le signale, sans rafraîchir (CA2)", async () => {
    const push = await renderRoom('host');
    push(ROOM);
    expect(screen.getByText(/En attente d’un joueur/)).toBeDefined();

    push({ ...ROOM, guest_id: 'guest' });
    await waitFor(() => expect(screen.getByText('Owen')).toBeDefined());
  });

  it('n’active « Lancer le duel » que pour l’hôte et à deux joueurs (CA3)', async () => {
    const push = await renderRoom('host');
    push(ROOM);
    expect(screen.getByRole('button', { name: /Lancer le duel/ })).toHaveProperty('disabled', true);

    push({ ...ROOM, guest_id: 'guest' });
    const start = screen.getByRole('button', { name: /Lancer le duel/ });
    expect(start).toHaveProperty('disabled', false);

    startMatch.mockResolvedValue({ matchId: 'match-1' });
    await userEvent.setup().click(start);
    expect(startMatch).toHaveBeenCalledWith('room-1');
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Match' })).toBeDefined());
  });

  it('ne propose pas de lancer le duel à l’invité (CA3)', async () => {
    const push = await renderRoom('guest');
    push({ ...ROOM, guest_id: 'guest' });

    expect(screen.queryByRole('button', { name: /Lancer le duel/ })).toBeNull();
    expect(screen.getByText(/En attente du lancement par l’hôte/)).toBeDefined();
  });
});

import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Multiplayer } from '../pages/Multiplayer.tsx';
import { ProfileProvider } from '../lib/profile.tsx';
import { ApiError } from '../lib/api.ts';

const { createRoom, joinRoom, loadProfile } = vi.hoisted(() => ({
  createRoom: vi.fn(),
  joinRoom: vi.fn(),
  loadProfile: vi.fn(),
}));

vi.mock('../lib/api.ts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/api.ts')>()),
  createRoom,
  joinRoom,
}));
vi.mock('../lib/session.ts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/session.ts')>()),
  loadProfile,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

async function renderMultiplayer() {
  loadProfile.mockResolvedValue({ id: 'guest', username: 'Donovan' });
  render(
    <MemoryRouter initialEntries={['/multi']}>
      <ProfileProvider>
        <Routes>
          <Route path="/multi" element={<Multiplayer />} />
          <Route path="/salon/:roomId" element={<h1>Salon</h1>} />
        </Routes>
      </ProfileProvider>
    </MemoryRouter>,
  );
  await act(async () => {});
  return userEvent.setup();
}

describe('US-17 — rejoindre un salon avec un code', () => {
  it('entre dans le salon avec un code valide (CA1)', async () => {
    const user = await renderMultiplayer();
    joinRoom.mockResolvedValue({ roomId: 'room-1' });

    await user.type(screen.getByLabelText('Code du salon'), 'K7P2QX');
    await user.click(screen.getByRole('button', { name: /Rejoindre/ }));

    expect(joinRoom).toHaveBeenCalledWith('K7P2QX');
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Salon' })).toBeDefined());
  });

  it('affiche « Aucun salon avec ce code. » sur un code inconnu (CA2)', async () => {
    const user = await renderMultiplayer();
    joinRoom.mockRejectedValue(new ApiError('ROOM_NOT_FOUND', 404));

    await user.type(screen.getByLabelText('Code du salon'), 'ZZZZZZ');
    await user.click(screen.getByRole('button', { name: /Rejoindre/ }));

    expect((await screen.findByRole('alert')).textContent).toBe('Aucun salon avec ce code.');
  });

  it('affiche « Ce salon est déjà complet. » sur un salon plein (CA3)', async () => {
    const user = await renderMultiplayer();
    joinRoom.mockRejectedValue(new ApiError('ROOM_FULL', 409));

    await user.type(screen.getByLabelText('Code du salon'), 'K7P2QX');
    await user.click(screen.getByRole('button', { name: /Rejoindre/ }));

    expect((await screen.findByRole('alert')).textContent).toBe('Ce salon est déjà complet.');
  });

  it('ignore la casse et les espaces à la saisie (CA4)', async () => {
    const user = await renderMultiplayer();
    joinRoom.mockResolvedValue({ roomId: 'room-1' });

    await user.type(screen.getByLabelText('Code du salon'), ' k7p2 qx');
    expect(screen.getByLabelText('Code du salon')).toHaveProperty('value', 'K7P2QX');

    await user.click(screen.getByRole('button', { name: /Rejoindre/ }));
    expect(joinRoom).toHaveBeenCalledWith('K7P2QX');
  });

  it('crée un salon et ouvre sa page (US-16 CA1)', async () => {
    const user = await renderMultiplayer();
    createRoom.mockResolvedValue({ roomId: 'room-9', code: 'K7P2QX' });

    await user.click(screen.getByRole('button', { name: /Créer un salon/ }));

    expect(createRoom).toHaveBeenCalled();
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Salon' })).toBeDefined());
  });
});

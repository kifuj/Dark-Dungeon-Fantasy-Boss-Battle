import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Login } from '../pages/Login.tsx';
import { ProfileProvider } from '../lib/profile.tsx';
import { SessionFailure } from '../lib/session.ts';

// Le vrai module parle à Supabase : on teste la page, pas le réseau.
const { signInWithUsername, loadProfile } = vi.hoisted(() => ({
  signInWithUsername: vi.fn(),
  loadProfile: vi.fn(),
}));

vi.mock('../lib/session.ts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/session.ts')>()),
  signInWithUsername,
  loadProfile,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function renderLogin() {
  loadProfile.mockResolvedValue(null);
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <ProfileProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/multi" element={<h1>Multijoueur</h1>} />
        </Routes>
      </ProfileProvider>
    </MemoryRouter>,
  );
}

describe('US-15 — se connecter avec un pseudo', () => {
  it('crée la session et le profil, puis ouvre le multijoueur (CA1)', async () => {
    signInWithUsername.mockResolvedValue({ id: 'u1', username: 'Mattéo' });
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText('Pseudo'), 'Mattéo');
    await user.click(screen.getByRole('button', { name: /Entrer/ }));

    expect(signInWithUsername).toHaveBeenCalledWith('Mattéo');
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Multijoueur' })).toBeDefined());
  });

  it('affiche « Ce pseudo est déjà utilisé » quand le pseudo est pris (CA2)', async () => {
    signInWithUsername.mockRejectedValue(new SessionFailure('USERNAME_TAKEN'));
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText('Pseudo'), 'Owen');
    await user.click(screen.getByRole('button', { name: /Entrer/ }));

    expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'Ce pseudo est déjà utilisé.');
  });

  it('refuse un pseudo trop court sans appeler Supabase (CA1)', async () => {
    signInWithUsername.mockRejectedValue(new SessionFailure('INVALID_USERNAME'));
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText('Pseudo'), 'ab');
    await user.click(screen.getByRole('button', { name: /Entrer/ }));

    expect((await screen.findByRole('alert')).textContent).toContain('entre 3 et 20 caractères');
  });

  it('retrouve le pseudo enregistré après un rafraîchissement (CA3)', async () => {
    loadProfile.mockResolvedValue({ id: 'u1', username: 'Paul' });
    render(
      <MemoryRouter initialEntries={['/login']}>
        <ProfileProvider>
          <Login />
        </ProfileProvider>
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText(/Connecté en tant que Paul/)).toBeDefined());
  });
});

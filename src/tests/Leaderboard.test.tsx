import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Leaderboard } from '../pages/Leaderboard.tsx';
import { ProfileProvider } from '../lib/profile.tsx';

// On teste la page, pas Supabase.
const { loadLeaderboard, loadProfile } = vi.hoisted(() => ({
  loadLeaderboard: vi.fn(),
  loadProfile: vi.fn(),
}));

vi.mock('../lib/leaderboard.ts', () => ({ loadLeaderboard }));
vi.mock('../lib/session.ts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/session.ts')>()),
  loadProfile,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function renderLeaderboard() {
  loadProfile.mockResolvedValue({ id: 'u2', username: 'Owen' });
  return render(
    <MemoryRouter>
      <ProfileProvider>
        <Leaderboard />
      </ProfileProvider>
    </MemoryRouter>,
  );
}

describe('US-14 — page Classement', () => {
  it('affiche le meilleur score et la meilleure vague de chaque pseudo, dans l’ordre (CA2)', async () => {
    loadLeaderboard.mockResolvedValue([
      { username: 'Matteo', best_score: 1250, best_wave: 12 },
      { username: 'Owen', best_score: 830, best_wave: 8 },
    ]);
    renderLeaderboard();

    const rows = await screen.findAllByRole('row');
    expect(rows).toHaveLength(3); // en-tête + 2 joueurs
    expect(rows[1].textContent).toBe('1Matteo125012');
    expect(rows[2].textContent).toBe('2Owen8308');
    expect(rows[2].className).toBe('leaderboard-me');
  });

  it('invite à jouer quand personne n’a encore de score', async () => {
    loadLeaderboard.mockResolvedValue([]);
    renderLeaderboard();
    expect(await screen.findByText(/Aucun score/)).toBeTruthy();
  });

  it('prévient si le classement ne se charge pas', async () => {
    loadLeaderboard.mockRejectedValue(new Error('réseau'));
    renderLeaderboard();
    expect((await screen.findByRole('alert')).textContent).toMatch(/Impossible/);
  });
});

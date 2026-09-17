import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Menu } from '../pages/Menu.tsx';
import { ProfileProvider } from '../lib/profile.tsx';

const { fetchOngoingMatchId, loadProfile } = vi.hoisted(() => ({
  fetchOngoingMatchId: vi.fn(),
  loadProfile: vi.fn(),
}));

vi.mock('../lib/matches.ts', () => ({ fetchOngoingMatchId, hasPlayedThisTurn: vi.fn(), fetchMatch: vi.fn() }));
vi.mock('../lib/session.ts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/session.ts')>()),
  loadProfile,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

async function renderMenu(profile: { id: string; username: string } | null, ongoing: string | null | Error) {
  loadProfile.mockResolvedValue(profile);
  if (ongoing instanceof Error) fetchOngoingMatchId.mockRejectedValue(ongoing);
  else fetchOngoingMatchId.mockResolvedValue(ongoing);
  render(
    <MemoryRouter initialEntries={['/menu']}>
      <ProfileProvider>
        <Routes>
          <Route path="/menu" element={<Menu />} />
          <Route path="/match/:matchId" element={<h1>Duel repris</h1>} />
        </Routes>
      </ProfileProvider>
    </MemoryRouter>,
  );
  await act(async () => {});
}

describe('US-21 — reprendre une partie depuis le menu (CA3)', () => {
  it('affiche « Reprendre la partie » quand le joueur a un match non terminé', async () => {
    await renderMenu({ id: 'host', username: 'Paul' }, 'match-42');
    expect(fetchOngoingMatchId).toHaveBeenCalledWith('host');
    const resume = screen.getByRole('link', { name: /Reprendre la partie/ });
    expect(resume.getAttribute('href')).toBe('/match/match-42');
    await userEvent.click(resume);
    expect(screen.getByRole('heading', { name: 'Duel repris' })).toBeTruthy();
  });

  it('n’affiche pas le bouton sans match en cours', async () => {
    await renderMenu({ id: 'host', username: 'Paul' }, null);
    expect(screen.queryByRole('link', { name: /Reprendre la partie/ })).toBeNull();
    expect(screen.getAllByRole('link')).toHaveLength(5); // Solo, Multijoueur, Guide, Classement, Crédits
  });

  it('ne cherche rien pour un visiteur sans pseudo', async () => {
    await renderMenu(null, 'match-42');
    expect(fetchOngoingMatchId).not.toHaveBeenCalled();
    expect(screen.queryByRole('link', { name: /Reprendre la partie/ })).toBeNull();
  });

  it('reste utilisable si Supabase ne répond pas', async () => {
    await renderMenu({ id: 'host', username: 'Paul' }, new Error('réseau'));
    expect(screen.queryByRole('link', { name: /Reprendre la partie/ })).toBeNull();
    expect(screen.getByRole('link', { name: /Solo/ })).toBeTruthy();
  });
});

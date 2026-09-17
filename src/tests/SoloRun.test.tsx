import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { SoloRun } from '../pages/SoloRun.tsx';
import { EventBus } from '../game/EventBus.ts';
import { ANIMATION_TIMEOUT_MS } from '../game/timing.ts';

// Même bouchon que pour le duel : pas de canvas dans jsdom, et un EventBus minimal.
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

// Enregistrement du score (US-14) : pas de réseau dans les tests.
const { saveSoloRun } = vi.hoisted(() => ({ saveSoloRun: vi.fn() }));
vi.mock('../lib/leaderboard.ts', () => ({ saveSoloRun }));

beforeEach(() => {
  saveSoloRun.mockResolvedValue('saved');
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.useRealTimers();
});

async function startRun() {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  render(
    <MemoryRouter>
      <SoloRun />
    </MemoryRouter>,
  );
  await user.click(screen.getAllByRole('button', { name: /Salamandre/ })[0]);
  await user.click(screen.getByRole('button', { name: /Commencer|Choisir|Valider|Partir/i }));
  return user;
}

describe('Solo — la run ne se fige pas si la scène ne répond pas', () => {
  it('rouvre le menu après le délai de sécurité quand la scène n’a pas encore chargé', async () => {
    const user = await startRun();
    const played: unknown[] = [];
    EventBus.on('play-events', (events: unknown) => played.push(events));

    await user.click(screen.getAllByRole('button', { name: /∞/ })[0]); // Frappe : l'ennemi survit
    expect(played).toHaveLength(1);
    expect(document.querySelector('.action-menu-hidden')).not.toBeNull(); // tour en cours

    await act(async () => vi.advanceTimersByTime(ANIMATION_TIMEOUT_MS - 100));
    expect(document.querySelector('.action-menu-hidden')).not.toBeNull();
    await act(async () => vi.advanceTimersByTime(200));
    expect(document.querySelector('.action-menu-hidden')).toBeNull();
    expect(document.querySelector('.battle-log')?.textContent).toMatch(/utilise/);
  });

  it('applique le tour dès que la scène a fini, sans attendre le délai', async () => {
    const user = await startRun();
    // Frappe (∞) : l'ennemi de niveau 1 survit au premier coup, même critique.
    await user.click(screen.getAllByRole('button', { name: /∞/ })[0]);
    await act(async () => EventBus.emit('events-played'));
    expect(document.querySelector('.action-menu-hidden')).toBeNull();
    // Le délai de sécurité est annulé : il ne rejoue pas une fin de tour fantôme au tour suivant.
    await user.click(screen.getAllByRole('button', { name: /∞/ })[0]);
    await act(async () => vi.advanceTimersByTime(1000));
    expect(document.querySelector('.action-menu-hidden')).not.toBeNull();
  });
});

describe('Solo — abandon et boss', () => {
  it('demande confirmation puis termine la run sur un abandon', async () => {
    const user = await startRun();
    await user.click(screen.getByRole('button', { name: /Abandonner/ }));
    await user.click(screen.getByRole('button', { name: /Continuer la run/ }));
    expect(screen.queryByRole('heading', { name: /abandonnée/ })).toBeNull();

    await user.click(screen.getByRole('button', { name: /Abandonner/ }));
    await user.click(screen.getByRole('button', { name: /Confirmer l’abandon/ }));
    expect(screen.getByRole('heading', { name: 'Run abandonnée' })).toBeTruthy();
    expect(screen.getByLabelText('Fin de run').textContent).toContain('1');
    expect(screen.getByRole('button', { name: /Nouvelle run/ })).toBeTruthy();
  });

  it('calcule le score de la run et l’enregistre une seule fois (US-14 CA1)', async () => {
    const user = await startRun();
    await user.click(screen.getByRole('button', { name: /Abandonner/ }));
    await user.click(screen.getByRole('button', { name: /Confirmer l’abandon/ }));

    // Vague 1 × 100 + PV du starter, intact au premier tour.
    expect(saveSoloRun).toHaveBeenCalledTimes(1);
    const [wave, score, team] = saveSoloRun.mock.calls[0];
    expect(wave).toBe(1);
    expect(score).toBe(100 + team[0].hp);
    const summary = screen.getByLabelText('Fin de run').textContent;
    expect(summary).toContain(`Score : ${score}`);
    expect(await screen.findByText('Score enregistré dans le classement.')).toBeTruthy();
  });

  it('invite à prendre un pseudo quand le joueur joue sans compte', async () => {
    saveSoloRun.mockResolvedValue('guest');
    const user = await startRun();
    await user.click(screen.getByRole('button', { name: /Abandonner/ }));
    await user.click(screen.getByRole('button', { name: /Confirmer l’abandon/ }));
    expect(await screen.findByText(/Connecte-toi avec un pseudo/)).toBeTruthy();
  });

  it('annonce la vague sans mention de boss à la vague 1', async () => {
    await startRun();
    expect(screen.queryByText('BOSS')).toBeNull();
  });
});

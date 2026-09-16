import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActionMenu } from '../components/ActionMenu.tsx';
import { createMonster } from '../../shared/engine/stats.js';
import type { BattleState } from '../../shared/types.js';

afterEach(cleanup);

/** Combat de test : le joueur (siège 0) a une équipe de 3 monstres. */
function state(): BattleState {
  return {
    round: 1,
    turn: 1,
    players: [
      {
        userId: 'solo',
        activeIndex: 0,
        team: [createMonster('salamander', 5, 'a'), createMonster('undine', 5, 'b'), createMonster('mushroom', 5, 'c')],
      },
      { userId: null, activeIndex: 0, team: [createMonster('goblin', 4, 'e')] },
    ],
  };
}

describe('US-08 — menu de choix d’action', () => {
  it('affiche les compétences du monstre actif avec leur élément et leurs PP (CA1)', () => {
    render(<ActionMenu state={state()} seat={0} busy={false} onAction={vi.fn()} />);
    expect(screen.getByRole('button', { name: /Boule de feu/ })).toHaveProperty('disabled', false);
    expect(screen.getByRole('button', { name: /Boule de feu/ }).textContent).toContain('10/10 PP');
    expect(screen.getByRole('button', { name: /Souffle ardent/ }).textContent).toContain('feu');
    expect(screen.getByRole('button', { name: /Frappe/ }).textContent).toContain('∞ PP');
  });

  it('grise une compétence sans PP (CA2)', () => {
    const s = state();
    s.players[0].team[0].skills.find((k) => k.id === 'fireball')!.ppLeft = 0;
    render(<ActionMenu state={s} seat={0} busy={false} onAction={vi.fn()} />);
    expect(screen.getByRole('button', { name: /Boule de feu/ })).toHaveProperty('disabled', true);
    expect(screen.getByRole('button', { name: /Frappe/ })).toHaveProperty('disabled', false);
  });

  it('est masqué pendant la résolution du tour (CA3)', () => {
    const { container, rerender } = render(<ActionMenu state={state()} seat={0} busy onAction={vi.fn()} />);
    expect(container.querySelectorAll('button')).toHaveLength(0);
    rerender(<ActionMenu state={state()} seat={0} busy={false} onAction={vi.fn()} />);
    expect(screen.getByRole('button', { name: /Boule de feu/ })).toBeDefined();
  });

  it('se joue à la souris et au clavier (CA4)', async () => {
    const onAction = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<ActionMenu state={state()} seat={0} busy={false} onAction={onAction} />);
    await user.click(screen.getByRole('button', { name: /Boule de feu/ }));
    expect(onAction).toHaveBeenCalledWith({ type: 'skill', skillId: 'fireball' });

    const menu = container.querySelector('.action-menu')!;
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    expect(document.activeElement?.textContent).toContain('Souffle ardent');
    fireEvent.keyDown(menu, { key: 'ArrowUp' });
    expect(document.activeElement?.textContent).toContain('Boule de feu');
    await user.keyboard('{Enter}');
    expect(onAction).toHaveBeenCalledTimes(2);
  });
});

describe('US-04 — changer de monstre actif', () => {
  it('liste les monstres en vie autres que le monstre actif (CA1)', async () => {
    const user = userEvent.setup();
    render(<ActionMenu state={state()} seat={0} busy={false} onAction={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /^Changer/ }));
    expect(screen.getByRole('button', { name: /Ondine/ })).toBeDefined();
    expect(screen.getByRole('button', { name: /Champignon/ })).toBeDefined();
    expect(screen.queryByRole('button', { name: /Salamandre/ })).toBeNull(); // le monstre actif n'est pas listé
  });

  it('envoie le changement demandé', async () => {
    const onAction = vi.fn();
    const user = userEvent.setup();
    render(<ActionMenu state={state()} seat={0} busy={false} onAction={onAction} />);
    await user.click(screen.getByRole('button', { name: /^Changer/ }));
    await user.click(screen.getByRole('button', { name: /Champignon/ }));
    expect(onAction).toHaveBeenCalledWith({ type: 'switch', toIndex: 2 });
  });

  it('grise un monstre KO (CA3)', async () => {
    const s = state();
    s.players[0].team[1].hp = 0;
    const user = userEvent.setup();
    render(<ActionMenu state={s} seat={0} busy={false} onAction={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /^Changer/ }));
    expect(screen.getByRole('button', { name: /Ondine/ })).toHaveProperty('disabled', true);
    expect(screen.getByRole('button', { name: /Champignon/ })).toHaveProperty('disabled', false);
  });

  it('désactive « Changer » quand aucun remplaçant n’est disponible', () => {
    const s = state();
    s.players[0].team = [s.players[0].team[0]];
    render(<ActionMenu state={s} seat={0} busy={false} onAction={vi.fn()} />);
    expect(screen.getByRole('button', { name: /Changer/ })).toHaveProperty('disabled', true);
  });
});

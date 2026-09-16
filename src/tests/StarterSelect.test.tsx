import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StarterSelect } from '../pages/StarterSelect.tsx';
import { createRun, STARTER_LEVEL } from '../../shared/engine/run.js';

afterEach(cleanup);

describe('US-10 — choisir un starter', () => {
  it('propose Salamandre, Ondine et Champignon avec leur sprite, leur élément et leurs stats (CA1)', () => {
    render(<StarterSelect onChoose={vi.fn()} />);
    for (const name of ['Salamandre', 'Ondine', 'Champignon']) {
      const card = screen.getByRole('button', { name: new RegExp(name) });
      expect(card.textContent).toMatch(/PV|ATK|DEF|VIT/);
      expect(card.querySelector('.monster-sprite')).not.toBeNull();
    }
    expect(screen.getByRole('img', { name: 'Ondine' })).toBeDefined();
    expect(screen.getAllByText(/Feu|Eau|Nature/).length).toBeGreaterThanOrEqual(3);
  });

  it('demande une validation après la sélection, puis démarre la run au niveau 5 (CA2)', async () => {
    const onChoose = vi.fn();
    const user = userEvent.setup();
    render(<StarterSelect onChoose={onChoose} />);

    const confirm = screen.getByRole('button', { name: /Valider/ });
    expect(confirm).toHaveProperty('disabled', true); // rien n'est sélectionné

    await user.click(screen.getByRole('button', { name: /Ondine/ }));
    expect(screen.getByRole('button', { name: /Ondine/, pressed: true })).toBeDefined(); // la carte est sélectionnée
    expect(confirm.textContent).toContain('Ondine');
    expect(onChoose).not.toHaveBeenCalled(); // sélectionner ne lance pas la run

    await user.click(confirm);
    expect(onChoose).toHaveBeenCalledWith('undine');
    const run = createRun(onChoose.mock.calls[0][0], 1);
    expect(run.team[0]).toMatchObject({ speciesId: 'undine', level: STARTER_LEVEL });
    expect(run.wave).toBe(1);
  });
});

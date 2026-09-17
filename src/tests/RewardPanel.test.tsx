import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RewardPanel } from '../components/RewardPanel.tsx';
import { recruitFor } from '../../shared/engine/rewards.js';
import { createMonster } from '../../shared/engine/stats.js';

afterEach(cleanup);

const SEED = 99;
const smallTeam = [createMonster('salamander', 6, 'a'), { ...createMonster('goblin', 5, 'b'), hp: 0 }];
const fullTeam = ['goblin', 'slime', 'imp', 'crab'].map((id, i) => createMonster(id, 5, `m${i}`));

describe('US-12 — écran de récompense', () => {
  it('affiche les 3 récompenses proposées', () => {
    render(<RewardPanel wave={2} seed={SEED} choices={['potion', 'training', 'scroll']} team={smallTeam} onChoose={vi.fn()} />);
    expect(screen.getByText('Vague 2 remportée')).toBeTruthy();
    expect(screen.getAllByRole('button')).toHaveLength(3);
    expect(screen.getByRole('button', { name: /Potion/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Entraînement/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Parchemin/ })).toBeTruthy();
  });

  it('applique directement une récompense sans cible (CA2)', async () => {
    const onChoose = vi.fn();
    render(<RewardPanel wave={2} seed={SEED} choices={['potion', 'elixir', 'recruit']} team={smallTeam} onChoose={onChoose} />);
    await userEvent.click(screen.getByRole('button', { name: /Élixir/ }));
    expect(onChoose).toHaveBeenCalledWith('elixir');
    await userEvent.click(screen.getByRole('button', { name: /Recrutement/ }));
    expect(onChoose).toHaveBeenLastCalledWith('recruit'); // équipe de 2 : pas de remplacement
  });

  it('demande le monstre à entraîner, puis envoie son identifiant', async () => {
    const onChoose = vi.fn();
    render(<RewardPanel wave={2} seed={SEED} choices={['potion', 'training', 'scroll']} team={smallTeam} onChoose={onChoose} />);
    await userEvent.click(screen.getByRole('button', { name: /Entraînement/ }));
    expect(onChoose).not.toHaveBeenCalled();
    expect(screen.getByText('Quel monstre entraîner ?')).toBeTruthy();
    expect(screen.getByRole('button', { name: /Gobelin/ }).textContent).toContain('KO');
    await userEvent.click(screen.getByRole('button', { name: /Salamandre/ }));
    expect(onChoose).toHaveBeenCalledWith('training', 'a');
  });

  it('demande quel monstre remplacer quand l’équipe est pleine (CA3)', async () => {
    const onChoose = vi.fn();
    render(<RewardPanel wave={3} seed={SEED} choices={['recruit', 'potion', 'elixir']} team={fullTeam} onChoose={onChoose} />);
    await userEvent.click(screen.getByRole('button', { name: /Recrutement/ }));
    expect(screen.getByText('Votre équipe est pleine. Quel monstre remplacer ?')).toBeTruthy();
    expect(screen.getByText(new RegExp(`${recruitFor(SEED, 3).name} \\(N\\.3\\) veut rejoindre`))).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: /Changer de récompense/ }));
    expect(screen.getByText('Choisissez une récompense')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: /Recrutement/ }));
    await userEvent.click(screen.getByRole('button', { name: /Slime/ }));
    expect(onChoose).toHaveBeenCalledWith('recruit', 'm1');
  });
});

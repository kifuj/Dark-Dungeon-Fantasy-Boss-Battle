import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Guide } from '../pages/Guide.tsx';
import { SPECIES } from '../../shared/data/monsters.js';
import { SKILLS } from '../../shared/data/skills.js';

afterEach(cleanup);

const renderGuide = () =>
  render(
    <MemoryRouter>
      <Guide />
    </MemoryRouter>,
  );

describe('Guide du jeu', () => {
  it('liste chaque attaque', () => {
    renderGuide();
    for (const skill of Object.values(SKILLS)) expect(screen.getByRole('cell', { name: skill.name })).toBeTruthy();
  });

  it('liste les monstres jouables avec leurs stats, sans les boss', () => {
    renderGuide();
    for (const species of Object.values(SPECIES)) {
      const cell = screen.queryByRole('cell', { name: species.name });
      if (species.rarity === 'boss') expect(cell).toBeNull();
      else expect(cell?.parentElement?.textContent).toContain(String(species.base.spd));
    }
  });

  it('explique la vitesse et les vagues', () => {
    renderGuide();
    expect(screen.getByRole('heading', { name: 'Un tour de combat' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Solo : les vagues' })).toBeTruthy();
  });

  it('propose de revenir au menu', () => {
    renderGuide();
    expect(screen.getByRole('link', { name: /Retour au menu/ }).getAttribute('href')).toBe('/menu');
  });
});

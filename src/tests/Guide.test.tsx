import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Guide } from '../pages/Guide.tsx';
import { SPECIES } from '../../shared/data/monsters.js';
import { RARITIES } from '../../shared/data/rarities.js';
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

  it('liste tous les monstres avec leurs stats et leur rareté, boss compris', () => {
    renderGuide();
    for (const species of Object.values(SPECIES)) {
      const row = screen.getByRole('cell', { name: species.name }).parentElement?.textContent;
      expect(row).toContain(String(species.base.spd));
      expect(row).toContain(RARITIES[species.rarity].label);
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

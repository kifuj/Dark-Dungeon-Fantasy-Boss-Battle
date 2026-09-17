import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Credits } from '../pages/Credits.tsx';
import credits from '../../docs/CREDITS.md?raw';

afterEach(cleanup);

const renderCredits = () =>
  render(
    <MemoryRouter>
      <Credits />
    </MemoryRouter>,
  );

describe('US-26 — page Crédits', () => {
  it('reprend chaque section de docs/CREDITS.md', () => {
    renderCredits();
    const sections = [...credits.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
    expect(sections.length).toBeGreaterThan(3);
    for (const title of sections) expect(screen.getByRole('heading', { name: title })).toBeTruthy();
  });

  it('affiche chaque asset avec son auteur et sa licence (CA1)', () => {
    renderCredits();
    const rows = credits.split('\n').filter((line) => line.startsWith('| Sprites') || line.startsWith('| Icônes') || line.startsWith('| Décor'));
    expect(rows).toHaveLength(3);
    const table = screen.getAllByRole('table')[0];
    expect(within(table).getAllByText('CC0 (création de l\'équipe)')).toHaveLength(3);
    expect(within(table).getAllByText('Équipe groupe 3')).toHaveLength(3);
    expect(screen.getByRole('cell', { name: 'Phaser' })).toBeTruthy();
  });

  it('transforme les liens relatifs en liens vers la doc sur GitHub', () => {
    renderCredits();
    const links = screen.getAllByRole('link', { name: '08-CONVENTIONS §4' });
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(link.getAttribute('href')).toBe(
        'https://github.com/kifuj/Dark-Dungeon-Fantasy-Boss-Battle/blob/main/docs/08-CONVENTIONS.md#4-assets-et-licences',
      );
    }
  });

  it('propose de revenir au menu', () => {
    renderCredits();
    expect(screen.getByRole('link', { name: /Retour au menu/ }).getAttribute('href')).toBe('/menu');
  });
});

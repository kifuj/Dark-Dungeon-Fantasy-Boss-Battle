// ⚠️ Fichier généré par `npm run functions:sync` — ne pas modifier : éditer shared/ puis relancer la commande.
import type { Element } from '../types.ts';

const STRONG_AGAINST: Record<Element, Element[]> = {
  feu: ['nature'],
  nature: ['eau'],
  eau: ['feu'],
  lumiere: ['ombre'],
  ombre: ['lumiere'],
  neutre: [],
};

export function elementMultiplier(attack: Element, defense: Element): number {
  if (STRONG_AGAINST[attack].includes(defense)) return 2;
  if (STRONG_AGAINST[defense].includes(attack)) return 0.5;
  return 1;
}

/** Couleurs d'affichage (docs/01-GAME-DESIGN.md §8). */
export const ELEMENT_COLORS: Record<Element, string> = {
  feu: '#e0603a',
  eau: '#3a8fe0',
  nature: '#5dbb4a',
  lumiere: '#f2d45c',
  ombre: '#7b4fb5',
  neutre: '#b0a8a0',
};

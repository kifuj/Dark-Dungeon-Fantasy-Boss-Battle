import type { Element } from '../../../shared/types.js';
import type { HpTier } from '../../../shared/engine/hp.js';

/** Palette du jeu (docs/01-GAME-DESIGN.md §8), en nombres pour Phaser. */
export const COLORS = {
  charcoal: 0x0d0d0f,
  anthracite: 0x242329,
  stone: 0x4a4745,
  bone: 0xc2b59a,
  ember: 0xb65324,
  violet: 0x291a35,
} as const;

export const HP_COLORS: Record<HpTier, number> = {
  ok: 0x5dbb4a,
  warn: 0xf2d45c,
  danger: 0xc0392b,
};

/** Ordre des images dans `public/assets/ui/elements.png` (tools/art/icons.mjs). */
export const ELEMENT_FRAME: Record<Element, number> = {
  feu: 0,
  eau: 1,
  nature: 2,
  lumiere: 3,
  ombre: 4,
  neutre: 5,
};

import { Canvas, rgb } from '../lib/canvas.mjs';

/** Icônes d'élément 16 × 16 (US-07 CA2), dans l'ordre de `Element`. */
export const ELEMENT_ORDER = ['feu', 'eau', 'nature', 'lumiere', 'ombre', 'neutre'];

const ICONS = {
  feu: (c) => {
    c.triangle([8, 1], [3, 11], [13, 11], rgb('#e0603a'));
    c.ellipse(8, 10, 5, 4.5, rgb('#b8371c'), rgb('#ff9a3c'));
    c.ellipse(8, 11, 2.4, 2.6, rgb('#ffd24a'), rgb('#fff1a8'));
  },
  eau: (c) => {
    c.triangle([8, 1], [3.5, 9], [12.5, 9], rgb('#3a8fe0'));
    c.ellipse(8, 10, 4.8, 4.6, rgb('#1d5a8c'), rgb('#8fd0ff'));
    c.ellipse(6, 10.5, 1.4, 1.8, rgb('#d8f3ff'), rgb('#ffffff'), { shade: false });
  },
  nature: (c) => {
    c.ellipse(9, 7, 5.5, 4.2, rgb('#2f6b28'), rgb('#9ee07a'));
    c.line(3, 13, 9, 6, rgb('#4a3220'), 2);
    c.line(9, 4, 9, 10, rgb('#2f6b28'), 1);
  },
  lumiere: (c) => {
    for (let a = 0; a < 8; a++) {
      const r = (a * Math.PI) / 4;
      c.line(8 + Math.cos(r) * 4, 8 + Math.sin(r) * 4, 8 + Math.cos(r) * 7, 8 + Math.sin(r) * 7, rgb('#f2d45c'), 1);
    }
    c.ellipse(8, 8, 4.2, 4.2, rgb('#c9a52f'), rgb('#fff3b0'));
  },
  ombre: (c) => {
    c.ellipse(8, 8, 6.2, 6.2, rgb('#43286b'), rgb('#a884e0'));
    const mask = new Canvas(16, 16); // masque : creuse le croissant
    mask.ellipse(11.5, 6.5, 5.6, 5.6, rgb('#000000'), rgb('#000000'), { shade: false });
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) if (mask.get(x, y)[3] !== 0) c.clearRect(x, y, 1, 1);
    c.ellipse(5.5, 11, 1, 1, rgb('#e6dcff'), rgb('#ffffff'), { shade: false });
  },
  neutre: (c) => {
    c.ellipse(8, 8, 5.5, 5.5, rgb('#6d665e'), rgb('#cdc4b6'));
    c.ellipse(6.5, 6.5, 1.6, 1.6, rgb('#e9e2d4'), rgb('#ffffff'), { shade: false });
  },
};

/** Une seule spritesheet : 6 images de 16 × 16 côte à côte. */
export function renderElementIcons() {
  const sheet = new Canvas(16 * ELEMENT_ORDER.length, 16);
  ELEMENT_ORDER.forEach((element, i) => {
    const frame = new Canvas(16, 16);
    ICONS[element](frame);
    frame.outline(rgb('#14121a'));
    frame.blitInto(sheet, i * 16, 0);
  });
  return sheet;
}

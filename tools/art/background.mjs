import { Canvas, mix, rgb } from '../lib/canvas.mjs';

/** Décor du combat (US-07 CA4) : salle de donjon 480 × 270, dessinée en 240 × 135 puis agrandie × 2. */
const W = 240;
const H = 135;
const HORIZON = 80; // ligne de séparation mur / sol
const VANISH_X = W / 2;

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function wall(c, rng) {
  const dark = rgb('#201f28');
  const light = rgb('#413d4e');
  c.rect(0, 0, W, HORIZON, rgb('#121118')); // mortier
  for (let by = 0; by < HORIZON; by += 9) {
    const offset = (by / 9) % 2 === 0 ? 0 : 9;
    for (let bx = -18; bx < W; bx += 18) {
      const tone = 0.2 + rng() * 0.5;
      const brick = mix(dark, light, tone);
      for (let y = by; y < by + 8 && y < HORIZON; y++) {
        for (let x = bx + offset; x < bx + offset + 17 && x < W; x++) {
          if (x < 0) continue;
          c.set(x, y, y === by ? mix(brick, light, 0.35) : brick); // arête éclairée
        }
      }
    }
  }
  c.rect(0, HORIZON - 6, W, 6, rgb('#4a4556')); // plinthe
  c.rect(0, HORIZON - 6, W, 1, rgb('#5d5870'));
}

function archway(c) {
  const stone = rgb('#4a4556');
  c.ellipse(VANISH_X, HORIZON - 34, 30, 30, stone, rgb('#625c78')); // encadrement
  c.rect(VANISH_X - 30, HORIZON - 34, 60, 34, stone);
  c.ellipse(VANISH_X, HORIZON - 32, 24, 26, rgb('#0a0910'), rgb('#141126'), { shade: false });
  c.rect(VANISH_X - 24, HORIZON - 32, 48, 32, rgb('#0a0910'));
  for (let i = -3; i <= 3; i++) c.line(VANISH_X + i * 7, HORIZON - 52, VANISH_X + i * 7, HORIZON - 2, rgb('#2a2536'), 2); // grille
  for (let y = HORIZON - 30; y < HORIZON; y += 4) c.line(VANISH_X - 22, y, VANISH_X + 22, y, [90, 70, 150, 12]); // brume violette
}

function floor(c, rng) {
  const dark = rgb('#241f1a');
  const light = rgb('#4a4234');
  for (let y = HORIZON; y < H; y++) {
    const depth = (y - HORIZON) / (H - HORIZON);
    const row = mix(dark, light, 0.18 + depth * 0.45);
    c.rect(0, y, W, 1, row);
  }
  // Fuyantes vers le point de fuite.
  for (let i = -9; i <= 9; i++) {
    const xBottom = VANISH_X + i * 34;
    c.line(VANISH_X + i * 5, HORIZON, xBottom, H, rgb('#171410'), 1);
  }
  // Lignes de dalles, de plus en plus espacées.
  let y = HORIZON + 2;
  let gap = 3;
  while (y < H) {
    c.line(0, y, W, y, rgb('#171410'), 1);
    if (rng() < 0.5) c.line(0, y + 1, W, y + 1, rgb('#564c3c'), 1); // arête éclairée
    y += gap;
    gap = Math.round(gap * 1.45) + 1;
  }
  c.rect(0, HORIZON, W, 2, rgb('#15120e')); // ombre au pied du mur
}

function torch(c, x, y) {
  c.rect(x - 1, y, 3, 11, rgb('#3a2a1c')); // support
  c.rect(x - 3, y + 10, 7, 2, rgb('#4a3a28'));
  c.ellipse(x, y - 4, 4, 7, rgb('#b8371c'), rgb('#ffcf5c')); // flamme
  c.ellipse(x, y - 3, 2, 4, rgb('#ffd24a'), rgb('#fff3c4'), { shade: false });
  for (let r = 34; r > 3; r--) {
    const alpha = Math.round(14 * (1 - r / 34) ** 1.6);
    if (alpha <= 0) continue;
    for (let a = 0; a < 128; a++) {
      const ang = (a * Math.PI) / 64;
      c.set(x + Math.cos(ang) * r, y - 3 + Math.sin(ang) * r, [255, 165, 70, alpha]);
    }
  }
  // Tache de lumière sur le sol, juste en dessous.
  for (let r = 22; r > 2; r--) {
    const alpha = Math.round(10 * (1 - r / 22) ** 1.5);
    if (alpha <= 0) continue;
    for (let a = 0; a < 128; a++) {
      const ang = (a * Math.PI) / 64;
      c.set(x + Math.cos(ang) * r * 1.5, HORIZON + 22 + Math.sin(ang) * r * 0.45, [255, 175, 90, alpha]);
    }
  }
}

function vignette(c) {
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const dx = (x - W / 2) / (W / 2);
      const dy = (y - H * 0.55) / (H * 0.55);
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d > 0.5) c.set(x, y, [4, 3, 7, Math.min(205, Math.round((d - 0.5) * 230))]);
    }
  }
}

export function renderBattleBackground() {
  const c = new Canvas(W, H);
  const rng = mulberry32(20260916);
  wall(c, rng);
  archway(c);
  floor(c, rng);
  for (const x of [34, W - 34]) {
    c.rect(x - 12, 0, 24, HORIZON - 6, rgb('#332f3d')); // colonnes
    c.rect(x - 12, 0, 3, HORIZON - 6, rgb('#454052'));
    c.rect(x + 8, 0, 4, HORIZON - 6, rgb('#1d1b24'));
    torch(c, x, 26);
  }
  vignette(c);
  return c.scale(2);
}

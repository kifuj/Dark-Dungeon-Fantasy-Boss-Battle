import { Canvas, rgb } from '../lib/canvas.mjs';

/**
 * Sprites des 10 espèces du bestiaire (docs/01-GAME-DESIGN.md §5).
 * Chaque espèce est dessinée dans une grille 32 × 32 puis agrandie × 2 → cadre de 64 × 64.
 * Les pieds sont posés vers y = 29 pour laisser la place au contour et à l'oscillation d'attente.
 */

const OUTLINE = rgb('#14121a');
const WHITE = rgb('#f5f1e6');
const BLACK = rgb('#17151c');

const eyes = (c, cx, y, dx, rx, ry, white, pupil) => {
  for (const sx of [-1, 1]) {
    c.ellipse(cx + sx * dx, y, rx, ry, white, white, { shade: false });
    c.ellipse(cx + sx * dx + sx * 0.3, y + 0.3, rx * 0.55, ry * 0.6, pupil, pupil, { shade: false });
  }
};

const salamander = (c) => {
  const dark = rgb('#7a2410');
  const mid = rgb('#d1451f');
  const light = rgb('#f5934a');
  const belly = rgb('#f2c08a');
  const flame = rgb('#ffd24a');
  c.line(19, 25, 26, 24, mid, 3); // queue, visible à droite du corps
  c.line(26, 24, 29, 18, mid, 3);
  c.ellipse(29, 15, 2.5, 3, rgb('#ff8a2a'), flame); // flamme au bout de la queue
  c.ellipse(11, 22, 2.5, 3.5, dark, mid);
  c.ellipse(21, 22, 2.5, 3.5, dark, mid);
  c.ellipse(16, 23, 7, 6, dark, mid);
  c.ellipse(16, 25, 4, 3.5, rgb('#c98a4e'), belly);
  c.ellipse(12, 28, 3, 2, dark, mid);
  c.ellipse(20, 28, 3, 2, dark, mid);
  c.triangle([12, 9], [13.5, 3], [15, 9], dark); // cornes
  c.triangle([20, 9], [18.5, 3], [17, 9], dark);
  c.ellipse(16, 13, 7, 6, dark, mid);
  c.ellipse(16, 16, 4, 2.5, mid, light);
  eyes(c, 16, 12, 3.2, 2, 2, WHITE, BLACK);
};

const undine = (c) => {
  const dark = rgb('#14507f');
  const mid = rgb('#3a8fe0');
  const light = rgb('#a9dcff');
  c.triangle([16, 5], [9.5, 20], [22.5, 20], mid); // pointe de la goutte
  c.ellipse(16, 21, 7.5, 8, dark, light);
  c.ellipse(8.5, 21, 2.5, 4, dark, mid);
  c.ellipse(23.5, 21, 2.5, 4, dark, mid);
  c.ellipse(13, 17, 2, 3, rgb('#dff3ff'), rgb('#ffffff'), { shade: false });
  eyes(c, 16, 21, 3.2, 2, 2.2, rgb('#eaf7ff'), rgb('#0d3350'));
  c.line(14.5, 25, 17.5, 25, rgb('#0d3350'), 1);
};

const mushroom = (c) => {
  const capDark = rgb('#2f5a22');
  const capMid = rgb('#5dbb4a');
  const capLight = rgb('#9ee07a');
  const stemDark = rgb('#b9a882');
  const stemLight = rgb('#efe3c4');
  const stem = () => {
    c.ellipse(16, 23, 4.2, 7.5, stemDark, stemLight); // pied, glissé sous le chapeau
    c.ellipse(11, 25, 1.8, 2.4, stemDark, stemLight); // petits bras
    c.ellipse(21, 25, 1.8, 2.4, stemDark, stemLight);
  };
  stem();
  c.ellipse(16, 15, 11, 8, capDark, capLight); // chapeau
  c.clearRect(0, 16, 32, 16);
  c.line(5.5, 15, 26.5, 15, capDark, 1); // lèvre du chapeau
  stem();
  for (const [x, y, r] of [[10, 11, 1.8], [17, 8.5, 2.2], [22, 12, 1.5]]) {
    c.ellipse(x, y, r, r * 0.8, capMid, capLight, { shade: false }); // taches
  }
  eyes(c, 16, 22, 2.2, 1.6, 1.8, WHITE, BLACK);
  c.line(15, 25.5, 17, 25.5, rgb('#8a7a58'), 1);
};

const goblin = (c) => {
  const dark = rgb('#4d6626');
  const mid = rgb('#86a34a');
  const light = rgb('#b8cf74');
  const leather = rgb('#5A3E2B');
  c.triangle([11, 10], [4, 11], [11, 17], mid); // oreilles
  c.triangle([21, 10], [28, 11], [21, 17], mid);
  c.ellipse(9.5, 23, 2.5, 4, dark, mid);
  c.ellipse(22.5, 23, 2.5, 4, dark, mid);
  c.ellipse(16, 24, 6, 6, dark, mid);
  c.rect(11, 26, 10, 3, leather); // pagne
  c.ellipse(13, 29, 2.5, 1.8, dark, mid);
  c.ellipse(19, 29, 2.5, 1.8, dark, mid);
  c.ellipse(16, 13, 7, 6, dark, mid);
  c.ellipse(16, 15, 1.6, 1.4, dark, light);
  eyes(c, 16, 12, 3.2, 2.1, 2, rgb('#f2d45c'), BLACK);
  c.line(13, 17.5, 19, 17.5, rgb('#2a2013'), 1); // bouche
  c.set(14, 17, WHITE);
  c.set(18, 17, WHITE);
};

const skeleton = (c) => {
  const boneDark = rgb('#8f886f');
  const boneLight = rgb('#e5dfca');
  const glow = rgb('#a86bff');
  c.line(11, 17, 8, 25, boneDark, 2); // bras
  c.line(21, 17, 24, 25, boneDark, 2);
  c.line(16, 15, 16, 24, boneLight, 2); // colonne
  for (const y of [17.5, 20, 22.5]) {
    c.line(15, y, 11, y + 1.2, boneLight, 2); // côtes (les trous laissent voir le fond)
    c.line(17, y, 21, y + 1.2, boneLight, 2);
  }
  c.rect(12, 24.5, 8, 3, boneDark); // bassin
  c.line(14, 27, 13, 31, boneDark, 2); // jambes
  c.line(18, 27, 19, 31, boneDark, 2);
  c.ellipse(16, 10, 6, 5.5, boneDark, boneLight); // crâne
  c.rect(13, 13.5, 7, 2.5, boneDark);
  for (const x of [14, 16, 18]) c.line(x, 13.5, x, 16, rgb('#5d5844'), 1); // dents
  c.ellipse(13, 10, 2.2, 2.2, BLACK, BLACK, { shade: false });
  c.ellipse(19, 10, 2.2, 2.2, BLACK, BLACK, { shade: false });
  c.ellipse(13, 10, 1.2, 1.2, glow, glow, { shade: false });
  c.ellipse(19, 10, 1.2, 1.2, glow, glow, { shade: false });
};

const flyingEye = (c) => {
  const wing = rgb('#2e2040');
  const sclera = rgb('#b9b2a0');
  const scleraLight = rgb('#f7f2e4');
  c.triangle([10, 13], [0, 5], [6, 21], wing); // ailes
  c.triangle([22, 13], [32, 5], [26, 21], wing);
  for (const x of [13, 16, 19]) c.line(x, 21, x + (x - 16) * 0.4, 29, rgb('#3f2760'), 2); // tentacules
  c.ellipse(16, 15, 8, 8, sclera, scleraLight);
  c.ellipse(16, 16, 4.5, 4.5, rgb('#3f2760'), rgb('#9a6fd8'));
  c.ellipse(16, 16, 2, 2, BLACK, BLACK, { shade: false });
  c.ellipse(13, 12, 1.4, 1.4, WHITE, WHITE, { shade: false });
};

const slime = (c) => {
  const dark = rgb('#2f6b28');
  const light = rgb('#a8e88a');
  c.ellipse(16, 15, 2, 2.5, dark, light); // goutte sur la tête
  c.ellipse(16, 23, 10, 8, dark, light);
  c.clearRect(0, 30, 32, 2);
  c.ellipse(11, 19, 3, 2, rgb('#d6f7c2'), rgb('#ffffff'), { shade: false });
  eyes(c, 16, 23, 3.4, 2, 2.2, WHITE, BLACK);
  c.line(14, 27, 18, 27, rgb('#1e4a1a'), 1);
};

const knight = (c) => {
  const steelDark = rgb('#5b616c');
  const steelLight = rgb('#d6dae1');
  const gold = rgb('#f2d45c');
  const cape = rgb('#7A1717');
  c.triangle([16, 14], [6, 30], [26, 30], cape);
  c.line(27, 9, 27, 25, steelLight, 2); // épée
  c.line(25, 13, 29, 13, gold, 1);
  c.ellipse(16, 21, 7, 7, steelDark, steelLight); // buste
  c.ellipse(8.5, 18, 3, 3, steelDark, steelLight); // épaulières
  c.ellipse(23.5, 18, 3, 3, steelDark, steelLight);
  c.ellipse(7, 23, 2.5, 4, steelDark, steelLight);
  c.line(16, 18, 16, 24, gold, 1); // croix
  c.line(13, 21, 19, 21, gold, 1);
  c.rect(12, 27, 3.5, 3, steelDark);
  c.rect(17, 27, 3.5, 3, steelDark);
  c.ellipse(16, 11, 5.5, 5.5, steelDark, steelLight); // heaume
  c.rect(11, 10, 10, 2.5, rgb('#23262c'));
  c.line(12, 11, 20, 11, gold, 1);
  c.triangle([15, 6], [16, 1], [17, 6], gold);
};

const demon = (c) => {
  const dark = rgb('#4d0d12');
  const mid = rgb('#a02020');
  const light = rgb('#d94b31');
  const ember = rgb('#ffae3a');
  const horn = rgb('#e5dfca');
  c.triangle([9, 14], [0, 4], [5, 25], rgb('#340a10')); // ailes
  c.triangle([23, 14], [32, 4], [27, 25], rgb('#340a10'));
  c.ellipse(7, 21, 3, 4.5, dark, mid);
  c.ellipse(25, 21, 3, 4.5, dark, mid);
  c.ellipse(16, 23, 8, 7, dark, mid);
  c.ellipse(16, 25, 5, 4, rgb('#b05a25'), ember);
  c.ellipse(12, 30, 3, 2, dark, mid);
  c.ellipse(20, 30, 3, 2, dark, mid);
  c.triangle([11, 8], [7, 0], [13.5, 7], horn); // cornes
  c.triangle([21, 8], [25, 0], [18.5, 7], horn);
  c.ellipse(16, 11, 6.5, 5.5, dark, mid);
  c.ellipse(16, 13.5, 3.2, 2, mid, light); // museau
  eyes(c, 16, 10.5, 3, 2, 1.8, rgb('#ffd24a'), BLACK);
  c.line(12, 14.5, 20, 14.5, rgb('#2a0a0c'), 1);
  for (const x of [13, 15, 17, 19]) c.set(x, 14, horn); // dents
};

const lich = (c) => {
  const robeDark = rgb('#1c1230');
  const robeMid = rgb('#3b2a55');
  const robeLight = rgb('#6b5192');
  const bone = rgb('#e5dfca');
  const glow = rgb('#7CFC9A');
  c.line(27, 5, 27, 30, bone, 2); // bâton
  c.ellipse(27, 4, 2.5, 2.5, rgb('#2f7a4e'), glow);
  c.triangle([16, 12], [4, 31], [28, 31], robeMid); // robe
  c.ellipse(8.5, 22, 3, 4.5, robeDark, robeMid); // manches
  c.ellipse(23.5, 22, 3, 4.5, robeDark, robeMid);
  c.ellipse(16, 12, 7, 7.5, robeDark, robeLight); // capuche
  c.ellipse(16, 13.5, 4.5, 5, rgb('#0b0812'), rgb('#140f1f'));
  c.ellipse(13.8, 13, 1.4, 1.4, glow, glow, { shade: false });
  c.ellipse(18.2, 13, 1.4, 1.4, glow, glow, { shade: false });
  c.line(14, 17, 18, 17, rgb('#2f7a4e'), 1);
};

export const MONSTER_ART = {
  salamander,
  undine,
  mushroom,
  goblin,
  skeleton,
  flying_eye: flyingEye,
  slime,
  knight,
  demon,
  lich,
};

/** Une espèce → une spritesheet de 2 images 64 × 64 (animation d'attente). */
export function renderSpecies(draw) {
  const base = new Canvas(32, 32);
  draw(base);
  base.outline(OUTLINE);
  const scaled = base.scale(2);
  const sheet = new Canvas(128, 64);
  scaled.blitInto(sheet, 0, 0);
  scaled.blitInto(sheet, 64, 2); // 2ᵉ image : le monstre respire (1 pixel source plus bas)
  return sheet;
}

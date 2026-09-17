import { Canvas, rgb } from '../lib/canvas.mjs';

/**
 * Sprites des 25 espèces du bestiaire (docs/01-GAME-DESIGN.md §5).
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

const imp = (c) => {
  const dark = rgb('#6e1a0e');
  const mid = rgb('#d1451f');
  const light = rgb('#f58a4a');
  const wing = rgb('#3a1410');
  c.triangle([11, 17], [2, 10], [7, 24], wing); // petites ailes
  c.triangle([21, 17], [30, 10], [25, 24], wing);
  c.line(20, 26, 27, 27, dark, 1); // queue fourchue
  c.triangle([26, 25], [30, 27], [26, 29], dark);
  c.ellipse(16, 24, 5, 5, dark, mid);
  c.ellipse(13, 29, 2, 1.6, dark, mid);
  c.ellipse(19, 29, 2, 1.6, dark, mid);
  c.ellipse(10.5, 23, 1.8, 3, dark, mid);
  c.ellipse(21.5, 23, 1.8, 3, dark, mid);
  c.triangle([10, 12], [8, 4], [13, 10], rgb('#2a0a0c')); // cornes
  c.triangle([22, 12], [24, 4], [19, 10], rgb('#2a0a0c'));
  c.ellipse(16, 14, 6.5, 5.5, dark, light);
  eyes(c, 16, 13, 2.8, 1.8, 1.8, rgb('#ffd24a'), BLACK);
  c.line(13, 17, 19, 17, rgb('#2a0a0c'), 1);
  c.set(14, 16, WHITE);
  c.set(18, 16, WHITE);
};

const crab = (c) => {
  const dark = rgb('#12406a');
  const mid = rgb('#2f7fc0');
  const light = rgb('#8fcaf0');
  for (const sx of [-1, 1]) {
    for (const k of [0, 1, 2]) c.line(16 + sx * 6, 25 + k, 16 + sx * (11 + k), 29 + k * 0.5, dark, 1); // pattes
    c.line(16 + sx * 8, 21, 16 + sx * 11, 15, dark, 2); // bras
    c.ellipse(16 + sx * 12, 12, 3.5, 3, dark, mid); // pinces
    c.clearRect(16 + sx * 12 - (sx < 0 ? 1 : 0), 9, 1, 3);
  }
  c.ellipse(16, 23, 9.5, 6, dark, light); // carapace
  for (const x of [11, 16, 21]) c.set(x, 20, rgb('#dff3ff'));
  c.line(13, 17, 13, 14, dark, 1); // yeux pédonculés
  c.line(19, 17, 19, 14, dark, 1);
  c.ellipse(13, 13, 1.6, 1.6, WHITE, WHITE, { shade: false });
  c.ellipse(19, 13, 1.6, 1.6, WHITE, WHITE, { shade: false });
  c.set(13, 13, BLACK);
  c.set(19, 13, BLACK);
  c.line(14, 25, 18, 25, rgb('#0d3350'), 1);
};

const wolf = (c) => {
  const dark = rgb('#2f4a22');
  const mid = rgb('#5a8a3e');
  const light = rgb('#a9cf7a');
  const leaf = rgb('#8fdc5a');
  c.line(24, 20, 30, 13, mid, 3); // queue
  c.ellipse(30, 12, 1.8, 2.5, dark, leaf);
  c.ellipse(19, 21, 8, 5.5, dark, mid); // corps
  for (const x of [13, 17, 21, 25]) c.line(x, 24, x, 29, dark, 2); // pattes
  c.triangle([7, 9], [8, 2], [11, 8], dark); // oreilles
  c.triangle([15, 9], [15, 2], [12, 8], dark);
  c.ellipse(11, 13, 6, 5, dark, mid); // tête
  c.ellipse(6, 16, 3.5, 2.2, dark, light); // museau
  c.set(3, 15, BLACK);
  c.rect(8, 11, 2, 2, rgb('#ffd24a'));
  c.rect(12, 11, 2, 2, rgb('#ffd24a'));
  c.set(9, 12, BLACK);
  c.set(13, 12, BLACK);
  for (const [x, y] of [[18, 16], [22, 17], [25, 18]]) c.ellipse(x, y, 1.5, 1, rgb('#3e7a2a'), leaf, { shade: false }); // feuilles
};

const wisp = (c) => {
  const core = rgb('#fff6c8');
  const glow = rgb('#f2d45c');
  const halo = [242, 212, 92, 90];
  c.ellipse(16, 17, 11, 11, halo, halo, { shade: false });
  c.triangle([10, 18], [16, 1], [22, 18], glow); // flamme
  c.triangle([12, 18], [9, 6], [16, 14], glow);
  c.triangle([20, 18], [24, 7], [16, 14], glow);
  c.ellipse(16, 20, 7, 7, rgb('#d9a830'), glow);
  c.ellipse(16, 20, 4, 4, glow, core, { shade: false });
  c.line(14, 27, 12, 30, glow, 1); // traînée
  c.line(18, 27, 20, 31, glow, 1);
  c.rect(13, 19, 2, 3, rgb('#5a3d0a'));
  c.rect(17, 19, 2, 3, rgb('#5a3d0a'));
};

const ghost = (c) => {
  const dark = rgb('#3b2a55');
  const mid = rgb('#8a78b8');
  const light = rgb('#d9cff2');
  c.ellipse(16, 14, 9, 9, dark, light); // tête et corps
  c.rect(7, 14, 19, 10, light);
  c.line(7, 14, 7, 24, dark, 1);
  c.line(25, 14, 25, 24, dark, 1);
  for (const x of [7, 12, 17, 22]) c.triangle([x, 23], [x + 2.5, 30], [x + 5, 23], mid); // bas en lambeaux
  c.ellipse(5, 18, 2, 3, dark, mid); // bras flottants
  c.ellipse(27, 18, 2, 3, dark, mid);
  c.ellipse(12.5, 13, 2, 2.6, BLACK, BLACK, { shade: false });
  c.ellipse(19.5, 13, 2, 2.6, BLACK, BLACK, { shade: false });
  c.set(12, 12, rgb('#a86bff'));
  c.set(19, 12, rgb('#a86bff'));
  c.ellipse(16, 19, 2, 1.6, BLACK, BLACK, { shade: false }); // bouche
};

const golem = (c) => {
  const dark = rgb('#4a4640');
  const mid = rgb('#8a8378');
  const light = rgb('#c9c1b0');
  const moss = rgb('#5dbb4a');
  c.ellipse(6, 20, 4, 6, dark, mid); // bras massifs
  c.ellipse(26, 20, 4, 6, dark, mid);
  c.ellipse(6, 27, 3.5, 2.5, dark, light);
  c.ellipse(26, 27, 3.5, 2.5, dark, light);
  c.rect(11, 25, 4, 6, dark); // jambes
  c.rect(17, 25, 4, 6, dark);
  c.ellipse(16, 19, 8, 8, dark, mid); // torse
  c.line(12, 17, 15, 21, dark, 1); // fissures
  c.line(20, 15, 18, 19, dark, 1);
  c.ellipse(16, 9, 5, 4, dark, light); // tête
  c.rect(12.5, 8, 7, 2, rgb('#1c1a17'));
  c.set(14, 8, rgb('#7fe0ff'));
  c.set(18, 8, rgb('#7fe0ff'));
  for (const [x, y] of [[13, 5], [21, 13], [10, 16]]) c.ellipse(x, y, 1.6, 1, moss, moss, { shade: false }); // mousse
};

const siren = (c) => {
  const dark = rgb('#14507f');
  const mid = rgb('#3a8fe0');
  const light = rgb('#a9dcff');
  const skin = rgb('#bfe2da');
  const hair = rgb('#1f8f8a');
  c.line(16, 20, 20, 26, mid, 5); // queue de poisson
  c.line(20, 26, 23, 28, mid, 3);
  c.triangle([22, 27], [29, 23], [28, 31], light); // nageoire
  c.ellipse(16, 18, 4.5, 5, rgb('#7fb3aa'), skin); // buste
  c.ellipse(11, 18, 1.6, 4, rgb('#7fb3aa'), skin);
  c.ellipse(21, 18, 1.6, 4, rgb('#7fb3aa'), skin);
  c.line(13, 17, 19, 17, dark, 1);
  c.ellipse(16, 10, 6.5, 6.5, rgb('#10524f'), hair); // chevelure
  c.rect(10, 11, 2, 9, hair);
  c.rect(20, 11, 2, 9, hair);
  c.ellipse(16, 11, 4, 4.2, rgb('#7fb3aa'), skin); // visage
  eyes(c, 16, 11, 1.8, 1, 1.3, rgb('#0d3350'), rgb('#0d3350'));
  c.set(16, 14, rgb('#5d8f88'));
  c.ellipse(13, 6, 1.4, 1.4, rgb('#f7f2e4'), rgb('#ffffff'), { shade: false }); // coquillage
};

const treant = (c) => {
  const bark = rgb('#4a2f1a');
  const wood = rgb('#8a5a32');
  const leafDark = rgb('#2f5a22');
  const leaf = rgb('#6fcf4a');
  c.ellipse(16, 8, 12, 7, leafDark, leaf); // feuillage
  c.ellipse(7, 12, 5, 4, leafDark, leaf);
  c.ellipse(25, 12, 5, 4, leafDark, leaf);
  c.line(9, 17, 3, 23, bark, 2); // branches-bras
  c.line(23, 17, 29, 23, bark, 2);
  c.ellipse(16, 20, 6, 9, bark, wood); // tronc
  c.line(10, 29, 7, 31, bark, 2); // racines
  c.line(22, 29, 25, 31, bark, 2);
  c.line(16, 28, 16, 31, bark, 2);
  c.line(14, 23, 14, 27, bark, 1); // écorce
  c.line(18, 24, 18, 28, bark, 1);
  c.ellipse(13.5, 17, 1.4, 1.4, rgb('#ffe27a'), rgb('#ffe27a'), { shade: false });
  c.ellipse(18.5, 17, 1.4, 1.4, rgb('#ffe27a'), rgb('#ffe27a'), { shade: false });
  c.line(14, 21, 18, 21, rgb('#2a1a0c'), 1);
};

const griffin = (c) => {
  const dark = rgb('#7a5a20');
  const fur = rgb('#c9953e');
  const feather = rgb('#f2e6c4');
  const gold = rgb('#f2d45c');
  c.triangle([14, 16], [2, 3], [8, 22], gold); // ailes dorées
  c.triangle([20, 16], [31, 3], [26, 22], gold);
  c.line(24, 24, 30, 20, fur, 2); // queue
  c.ellipse(30, 19, 1.5, 1.8, dark, fur);
  c.ellipse(18, 22, 8, 5.5, dark, fur); // corps de lion
  for (const x of [12, 16, 21, 24]) c.line(x, 25, x, 30, dark, 2);
  c.ellipse(11, 12, 5.5, 5.5, rgb('#a89a78'), feather); // tête d'aigle
  c.triangle([6, 11], [2, 14], [6, 15], rgb('#e0a020')); // bec
  c.triangle([13, 8], [16, 4], [15, 10], feather); // plumes
  c.ellipse(9.5, 11, 1.2, 1.2, BLACK, BLACK, { shade: false });
};

const dragon = (c) => {
  const dark = rgb('#3a0d0d');
  const mid = rgb('#b02a1a');
  const light = rgb('#e8663a');
  const belly = rgb('#f2c08a');
  const wing = rgb('#5a1410');
  c.triangle([12, 14], [0, 0], [3, 24], wing); // grandes ailes
  c.triangle([20, 14], [32, 0], [29, 24], wing);
  c.line(22, 27, 30, 29, mid, 3); // queue
  c.triangle([29, 26], [32, 29], [29, 31], light);
  c.ellipse(16, 23, 8.5, 7, dark, mid);
  c.ellipse(16, 25, 5, 4.5, rgb('#b8864e'), belly);
  for (const y of [22, 25, 28]) c.line(13, y, 19, y, rgb('#c98a4e'), 1);
  c.ellipse(10, 30, 3, 2, dark, mid);
  c.ellipse(22, 30, 3, 2, dark, mid);
  c.line(16, 16, 16, 12, mid, 4); // cou
  c.triangle([12, 7], [9, 0], [14, 6], rgb('#e5dfca')); // cornes
  c.triangle([20, 7], [23, 0], [18, 6], rgb('#e5dfca'));
  c.ellipse(16, 9, 6, 4.5, dark, light);
  c.ellipse(16, 12, 3.5, 2, mid, light); // museau
  c.set(14.5, 12, BLACK);
  c.set(17.5, 12, BLACK);
  eyes(c, 16, 8, 2.8, 1.4, 1.3, rgb('#ffd24a'), BLACK);
  c.ellipse(16, 15, 1.5, 1, rgb('#ff8a2a'), rgb('#ffd24a'), { shade: false }); // braise
};

const bat = (c) => {
  const dark = rgb('#1f1430');
  const mid = rgb('#4b3570');
  const light = rgb('#8a6fb8');
  const membrane = rgb('#6e2440');
  c.triangle([13, 14], [0, 6], [4, 24], dark); // ailes
  c.triangle([13, 14], [2, 10], [6, 22], membrane);
  c.triangle([19, 14], [32, 6], [28, 24], dark);
  c.triangle([19, 14], [30, 10], [26, 22], membrane);
  for (const x of [3, 7]) c.line(x, 24, x + 1, 20, dark, 1); // doigts des ailes
  for (const x of [29, 25]) c.line(x, 24, x - 1, 20, dark, 1);
  c.ellipse(16, 19, 5, 6, dark, mid); // corps
  c.ellipse(16, 21, 3, 3.5, mid, light);
  c.line(14, 25, 13, 29, dark, 1); // pattes
  c.line(18, 25, 19, 29, dark, 1);
  c.triangle([11, 11], [10, 3], [14, 9], dark); // grandes oreilles
  c.triangle([21, 11], [22, 3], [18, 9], dark);
  c.ellipse(16, 12, 5, 4.5, dark, mid);
  eyes(c, 16, 11.5, 2.2, 1.3, 1.3, rgb('#ff4a5a'), BLACK);
  c.set(14.5, 14.5, WHITE); // crocs
  c.set(17.5, 14.5, WHITE);
};

const unicorn = (c) => {
  const dark = rgb('#8f886f');
  const coat = rgb('#f5f1e6');
  const mane = rgb('#c49bf2');
  const maneLight = rgb('#f2d45c');
  const gold = rgb('#f2d45c');
  c.line(23, 18, 30, 24, mane, 3); // queue
  c.line(29, 24, 30, 29, maneLight, 2);
  c.ellipse(18, 20, 8, 5.5, dark, coat); // corps
  for (const x of [12, 15, 21, 24]) c.line(x, 23, x, 29, dark, 2); // pattes
  for (const x of [12, 15, 21, 24]) c.set(x, 30, gold); // sabots
  c.line(11, 17, 9, 11, coat, 4); // cou
  c.ellipse(8, 10, 4.5, 3.5, dark, coat); // tête
  c.ellipse(4.5, 11.5, 2, 1.8, dark, rgb('#e8d9d0')); // museau
  c.line(9, 6, 7, 0, gold, 1); // corne
  c.line(10, 6, 8, 1, maneLight, 1);
  c.triangle([10, 7], [11, 3], [12, 8], dark); // oreille
  for (const [x, y] of [[12, 8], [13, 11], [13, 14], [12, 17]]) c.ellipse(x, y, 1.8, 1.6, rgb('#8a5fc8'), mane, { shade: false }); // crinière
  c.ellipse(7.5, 9.5, 1, 1, BLACK, BLACK, { shade: false });
};

const kraken = (c) => {
  const dark = rgb('#0d2f4f');
  const mid = rgb('#2a6fa8');
  const light = rgb('#7fc3ea');
  const sucker = rgb('#f2c0d8');
  for (const [x0, x1, y1] of [[9, 2, 22], [11, 5, 30], [14, 11, 31], [18, 21, 31], [21, 27, 30], [23, 30, 22]]) {
    c.line(x0, 20, x1, y1, mid, 3); // tentacules
    c.set((x0 + x1) / 2, (20 + y1) / 2 + 1, sucker);
  }
  c.line(2, 22, 1, 17, mid, 2); // bouts enroulés
  c.line(30, 22, 31, 17, mid, 2);
  c.ellipse(16, 12, 9, 10, dark, mid); // manteau
  c.ellipse(13, 7, 3, 3.5, mid, light, { shade: false });
  c.ellipse(16, 18, 7, 3.5, dark, mid);
  eyes(c, 16, 15, 3.5, 2.2, 2, rgb('#ffd24a'), BLACK);
  c.line(14, 19, 18, 19, rgb('#0a2238'), 1);
};

const phoenix = (c) => {
  const dark = rgb('#7a2410');
  const mid = rgb('#e0603a');
  const light = rgb('#ffb04a');
  const flame = rgb('#ffd24a');
  const core = rgb('#fff6c8');
  c.triangle([13, 16], [0, 2], [5, 22], mid); // ailes de feu
  c.triangle([12, 16], [2, 7], [7, 20], flame);
  c.triangle([19, 16], [32, 2], [27, 22], mid);
  c.triangle([20, 16], [30, 7], [25, 20], flame);
  c.triangle([13, 24], [9, 31], [16, 26], mid); // plumes de la queue
  c.triangle([16, 24], [16, 31], [19, 26], light);
  c.triangle([19, 24], [23, 31], [16, 26], mid);
  c.ellipse(16, 19, 5.5, 6.5, dark, light); // corps
  c.ellipse(16, 20, 3, 3.5, light, core, { shade: false });
  c.ellipse(16, 10, 4, 4, dark, light); // tête
  c.triangle([14, 7], [13, 1], [16, 6], flame); // aigrette
  c.triangle([17, 7], [19, 2], [16, 6], flame);
  c.triangle([15, 12], [16, 15], [17, 12], rgb('#f2d45c')); // bec
  eyes(c, 16, 9.5, 2, 1, 1, BLACK, BLACK);
};

const hydra = (c) => {
  const dark = rgb('#1f3d1a');
  const mid = rgb('#3e7a2a');
  const light = rgb('#8fdc5a');
  const belly = rgb('#d9e8a8');
  c.line(24, 26, 31, 28, mid, 3); // queue
  c.ellipse(16, 24, 9.5, 6.5, dark, mid); // corps
  c.ellipse(16, 26, 6, 3.5, rgb('#9aa86a'), belly);
  c.ellipse(9, 30, 3, 2, dark, mid);
  c.ellipse(23, 30, 3, 2, dark, mid);
  const head = (x, y) => {
    c.ellipse(x, y, 3.5, 3, dark, light);
    c.set(x - 1, y - 0.5, rgb('#ff4a5a'));
    c.set(x + 1, y - 0.5, rgb('#ff4a5a'));
    c.line(x - 1.5, y + 1.5, x + 1.5, y + 1.5, rgb('#12260f'), 1);
  };
  c.line(11, 20, 5, 11, mid, 3); // trois cous
  c.line(16, 19, 16, 7, mid, 3);
  c.line(21, 20, 27, 11, mid, 3);
  head(5, 9);
  head(16, 5);
  head(27, 9);
  for (const [x, y] of [[12, 22], [16, 21], [20, 22]]) c.set(x, y, light); // écailles
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
  imp,
  crab,
  wolf,
  wisp,
  ghost,
  golem,
  siren,
  treant,
  griffin,
  demon,
  lich,
  dragon,
  bat,
  unicorn,
  kraken,
  phoenix,
  hydra,
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

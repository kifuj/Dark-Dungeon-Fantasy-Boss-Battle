#!/usr/bin/env node
/**
 * Génère les assets du jeu dans `public/assets/` (US-07).
 *
 *   npm run assets
 *
 * Les images sont dessinées par le code de `tools/art/` : ce sont donc des créations
 * de l'équipe (CC0), ce qui évite de redistribuer un pack sous licence restrictive
 * dans un dépôt public (docs/08-CONVENTIONS.md §4).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { encodePng } from './lib/png.mjs';
import { MONSTER_ART, renderSpecies } from './art/monsters.mjs';
import { renderElementIcons } from './art/icons.mjs';
import { renderBattleBackground } from './art/background.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const assets = join(root, 'public', 'assets');

function write(relativePath, canvas) {
  const file = join(assets, relativePath);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, encodePng(canvas.width, canvas.height, canvas.data));
  console.log(`  ${relativePath.padEnd(40)} ${canvas.width}×${canvas.height}`);
}

console.log('Monstres (2 images de 64 × 64 par espèce) :');
for (const [id, draw] of Object.entries(MONSTER_ART)) {
  write(join('sprites', 'monsters', `${id}.png`), renderSpecies(draw));
}

console.log('Interface et décor :');
write(join('ui', 'elements.png'), renderElementIcons());
write(join('backgrounds', 'dungeon.png'), renderBattleBackground());

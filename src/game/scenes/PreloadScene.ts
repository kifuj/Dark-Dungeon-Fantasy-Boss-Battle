import { Scene } from 'phaser';
import { SPECIES } from '../../../shared/data/monsters.js';

/**
 * Chargement des assets (US-07).
 * Sprites de monstres : 2 images de 64 × 64 par espèce (animation d'attente).
 * Les images sont générées par `npm run assets` (docs/08-CONVENTIONS.md §3).
 */
export const FRAME_SIZE = 64;

export class PreloadScene extends Scene {
  constructor() {
    super('Preload');
  }

  preload() {
    this.load.setPath('assets');
    this.load.image('dungeon', 'backgrounds/dungeon.png');
    this.load.spritesheet('elements', 'ui/elements.png', { frameWidth: 16, frameHeight: 16 });
    for (const species of Object.values(SPECIES)) {
      this.load.spritesheet(species.sprite, `sprites/monsters/${species.sprite}.png`, {
        frameWidth: FRAME_SIZE,
        frameHeight: FRAME_SIZE,
      });
    }
  }

  create() {
    for (const species of Object.values(SPECIES)) {
      this.anims.create({
        key: `${species.sprite}-idle`,
        frames: this.anims.generateFrameNumbers(species.sprite, { start: 0, end: 1 }),
        frameRate: 2,
        repeat: -1,
      });
    }
    this.scene.start('Battle');
  }
}

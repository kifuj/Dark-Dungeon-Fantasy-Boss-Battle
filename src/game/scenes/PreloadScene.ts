import { Scene } from 'phaser';

/**
 * Chargement des assets.
 * Taille de cadre des sprites de monstres : 64 × 64 (docs/08-CONVENTIONS.md §3).
 */
export class PreloadScene extends Scene {
  constructor() {
    super('Preload');
  }

  preload() {
    // Les spritesheets seront chargées ici (US-07).
  }

  create() {
    this.scene.start('Battle');
  }
}

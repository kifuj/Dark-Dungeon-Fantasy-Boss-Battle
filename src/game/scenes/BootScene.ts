import { Scene } from 'phaser';

export class BootScene extends Scene {
  constructor() {
    super('Boot');
  }

  create() {
    this.scene.start('Preload');
  }
}

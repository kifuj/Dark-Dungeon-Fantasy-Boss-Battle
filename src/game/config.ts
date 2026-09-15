import { AUTO, Scale, type Types } from 'phaser';
import { BootScene } from './scenes/BootScene.ts';
import { PreloadScene } from './scenes/PreloadScene.ts';
import { BattleScene } from './scenes/BattleScene.ts';

export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 270;

export const gameConfig: Types.Core.GameConfig = {
  type: AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  pixelArt: true, // pas de lissage des pixels
  backgroundColor: '#1a1423',
  scale: { mode: Scale.FIT, autoCenter: Scale.CENTER_BOTH },
  scene: [BootScene, PreloadScene, BattleScene],
};

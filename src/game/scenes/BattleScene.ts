import { Scene } from 'phaser';
import { EventBus } from '../EventBus.ts';
import { GAME_HEIGHT, GAME_WIDTH } from '../config.ts';

export class BattleScene extends Scene {
  constructor() {
    super('Battle');
  }

  create() {
    // Cadre de contrôle du canvas 480×270 (US-01) ; la vraie scène arrive avec US-07.
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH - 8, GAME_HEIGHT - 8).setStrokeStyle(2, 0x7b4fb5);
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'DARK DUNGEON FANTASY BOSS BATTLE', { fontFamily: 'monospace', fontSize: '24px', color: '#C2B59A' })
      .setOrigin(0.5);
    EventBus.emit('scene-ready');
  }
}

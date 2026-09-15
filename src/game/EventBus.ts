import { Events } from 'phaser';

/** Canal de communication React ↔ Phaser (voir docs/02-ARCHITECTURE.md §5). */
export const EventBus = new Events.EventEmitter();

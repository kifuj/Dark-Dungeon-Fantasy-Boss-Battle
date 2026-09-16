import { Scene, type GameObjects } from 'phaser';
import { EventBus } from '../EventBus.ts';
import { GAME_HEIGHT, GAME_WIDTH } from '../config.ts';
import { FighterView } from '../ui/FighterView.ts';
import type { BattleState, Seat } from '../../../shared/types.js';

export interface BattleInit {
  state: BattleState;
  /** Siège du joueur humain : il est affiché en bas à gauche (US-07 CA1). */
  playerSeat: Seat;
}

/**
 * Scène de combat (US-07) : décor, deux monstres face à face et leurs encadrés.
 * React reste maître de l'état : la scène ne fait qu'afficher ce qu'on lui envoie
 * (`battle-init`, `battle-update`) — voir docs/02-ARCHITECTURE.md §5.
 */
export class BattleScene extends Scene {
  private views?: { player: FighterView; enemy: FighterView };
  private playerSeat: Seat = 0;
  private state?: BattleState;
  private banner?: GameObjects.Text;
  private bannerTimer?: Phaser.Time.TimerEvent;

  constructor() {
    super('Battle');
  }

  create() {
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'dungeon');

    this.views = {
      enemy: new FighterView(this, {
        sprite: { x: 352, y: 92, scale: 1.5 },
        platform: { x: 352, y: 140, rx: 52 },
        box: { x: 14, y: 20 },
        flip: true,
        showNumbers: false,
      }),
      player: new FighterView(this, {
        sprite: { x: 128, y: 172, scale: 2 },
        platform: { x: 128, y: 238, rx: 62 },
        box: { x: GAME_WIDTH - FighterView.BOX_WIDTH - 14, y: 176 },
        flip: false,
        showNumbers: true,
      }),
    };

    this.banner = this.add
      .text(GAME_WIDTH / 2, 12, '', { fontFamily: 'monospace', fontSize: '11px', color: '#C2B59A', backgroundColor: '#0D0D0FCC', padding: { x: 6, y: 3 } })
      .setOrigin(0.5, 0)
      .setVisible(false);

    EventBus.on('battle-init', this.onInit, this);
    EventBus.on('battle-update', this.onUpdate, this);
    EventBus.on('battle-banner', this.onBanner, this);
    // `game.destroy()` (démontage de <PhaserGame>, ex. « Nouvelle run ») émet `destroy` sans `shutdown` :
    // sans ce double abonnement, la scène détruite resterait branchée sur l'EventBus et planterait la suivante.
    const unsubscribe = () => {
      EventBus.off('battle-init', this.onInit, this);
      EventBus.off('battle-update', this.onUpdate, this);
      EventBus.off('battle-banner', this.onBanner, this);
    };
    this.events.once('shutdown', unsubscribe);
    this.events.once('destroy', unsubscribe);

    EventBus.emit('scene-ready', this);
  }

  private onInit({ state, playerSeat }: BattleInit) {
    this.playerSeat = playerSeat;
    this.onUpdate(state);
  }

  private onUpdate(state: BattleState) {
    if (!this.views) return;
    this.state = state;
    const enemySeat: Seat = this.playerSeat === 0 ? 1 : 0;
    for (const [seat, view] of [
      [this.playerSeat, this.views.player],
      [enemySeat, this.views.enemy],
    ] as const) {
      const player = state.players[seat];
      view.show(player.team[player.activeIndex]);
    }
  }

  /** Bannière de vague : visible quelques instants au début de chaque vague. */
  private onBanner(text: string | null) {
    if (!this.banner) return;
    this.bannerTimer?.remove();
    this.banner.setText(text ?? '').setVisible(Boolean(text));
    if (text) this.bannerTimer = this.time.delayedCall(1600, () => this.banner?.setVisible(false));
  }

  /** Utilisé par les tests manuels de la review : l'état affiché est bien celui de React. */
  get displayedState() {
    return this.state;
  }
}

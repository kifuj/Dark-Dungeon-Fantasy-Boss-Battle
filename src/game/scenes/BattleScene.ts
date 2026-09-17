import { Scene, type GameObjects } from 'phaser';
import { EventBus } from '../EventBus.ts';
import { GAME_HEIGHT, GAME_WIDTH } from '../config.ts';
import { FighterView } from '../ui/FighterView.ts';
import { EVENT_DURATION } from '../timing.ts';
import type { BattleEvent, BattleState, Seat } from '../../../shared/types.js';

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
  /** Vrai pendant la lecture d'une file `play-events` : `onUpdate` n'écrase alors pas l'affichage (US-09). */
  private animating = false;

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
    EventBus.on('play-events', this.onPlayEvents, this);
    // `game.destroy()` (démontage de <PhaserGame>, ex. « Nouvelle run ») émet `destroy` sans `shutdown` :
    // sans ce double abonnement, la scène détruite resterait branchée sur l'EventBus et planterait la suivante.
    const unsubscribe = () => {
      EventBus.off('battle-init', this.onInit, this);
      EventBus.off('battle-update', this.onUpdate, this);
      EventBus.off('battle-banner', this.onBanner, this);
      EventBus.off('play-events', this.onPlayEvents, this);
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
    // Une file `play-events` est en train de piloter l'affichage : elle amène déjà la scène
    // au bon état à la fin, un `show()` immédiat ici écraserait l'animation en cours (US-09).
    if (this.animating) return;
    const enemySeat: Seat = this.playerSeat === 0 ? 1 : 0;
    for (const [seat, view] of [
      [this.playerSeat, this.views.player],
      [enemySeat, this.views.enemy],
    ] as const) {
      const player = state.players[seat];
      view.show(player.team[player.activeIndex]);
    }
  }

  /** Bannière de vague ou de compétence : visible `duration` ms (US-07, réutilisée par US-09 CA1). */
  private onBanner(text: string | null, duration = 1600) {
    if (!this.banner) return;
    this.bannerTimer?.remove();
    this.banner.setText(text ?? '').setVisible(Boolean(text));
    if (text) this.bannerTimer = this.time.delayedCall(duration, () => this.banner?.setVisible(false));
  }

  private seatView(seat: Seat): FighterView {
    return seat === this.playerSeat ? this.views!.player : this.views!.enemy;
  }

  /**
   * Rejoue un tour événement par événement (US-09). `state` est l'état *avant* le tour :
   * les compositions d'équipe n'y changent pas pendant un tour, seuls hp/PV bougent, et ceux-ci
   * viennent directement de chaque événement (`hpAfter`/`maxHp`) — pas besoin du nouvel état.
   */
  private onPlayEvents(events: BattleEvent[]) {
    // Rien à animer tant que la scène n'a pas reçu d'état : on rend la main tout de suite,
    // sinon la page attendrait `events-played` pour rien.
    if (!this.views || !this.state) {
      EventBus.emit('events-played');
      return;
    }
    const state = this.state;
    this.animating = true;
    let delay = 0;
    for (const event of events) {
      this.time.delayedCall(delay, () => this.playEvent(event, state));
      delay += EVENT_DURATION[event.type];
    }
    this.time.delayedCall(delay, () => {
      this.animating = false;
      EventBus.emit('events-played');
    });
  }

  private playEvent(event: BattleEvent, state: BattleState) {
    switch (event.type) {
      case 'skill_used':
        this.onBanner(`${event.actorName} utilise ${event.skillName} !`, EVENT_DURATION.skill_used);
        break;
      case 'damage': {
        const view = this.seatView(event.targetSeat);
        view.flash();
        view.animateHpTo({ hp: event.hpAfter, maxHp: event.maxHp }, EVENT_DURATION.damage);
        // Critique et efficacité peuvent se cumuler : les deux textes s'affichent, l'un au-dessus de l'autre (CA2).
        const texts = [
          event.crit ? 'Coup critique !' : null,
          event.effectiveness > 1 ? "C'est super efficace !" : event.effectiveness < 1 ? "Ce n'est pas très efficace…" : null,
        ].filter((text): text is string => text !== null);
        texts.forEach((text, row) => view.popText(text, row));
        break;
      }
      case 'heal':
        this.seatView(event.seat).animateHpTo({ hp: event.hpAfter, maxHp: event.maxHp }, EVENT_DURATION.heal);
        break;
      case 'buff':
        this.seatView(event.seat).popText('Défense en hausse !');
        break;
      case 'faint':
        this.seatView(event.seat).playFaint(EVENT_DURATION.faint);
        break;
      case 'switch': {
        const monster = state.players[event.seat].team[event.toIndex];
        if (monster) this.seatView(event.seat).show(monster);
        break;
      }
      case 'forfeit':
      case 'battle_end':
        break; // pas d'animation dédiée : React gère déjà la fin de combat (US-11).
    }
  }

  /** Utilisé par les tests manuels de la review : l'état affiché est bien celui de React. */
  get displayedState() {
    return this.state;
  }
}

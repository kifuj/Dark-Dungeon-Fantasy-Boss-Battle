import type { GameObjects, Scene } from 'phaser';
import { SPECIES } from '../../../shared/data/monsters.js';
import { hpRatio, hpTier } from '../../../shared/engine/hp.js';
import type { MonsterInstance } from '../../../shared/types.js';
import { COLORS, ELEMENT_FRAME, HP_COLORS } from './theme.ts';

interface Layout {
  sprite: { x: number; y: number; scale: number };
  platform: { x: number; y: number; rx: number };
  box: { x: number; y: number };
  flip: boolean;
  showNumbers: boolean;
}

/** Un combattant à l'écran : son sprite, sa plateforme et son encadré (US-07 CA1 et CA2). */
export class FighterView {
  private readonly scene: Scene;
  private readonly layout: Layout;
  private sprite?: GameObjects.Sprite;
  private readonly icon: GameObjects.Image;
  private readonly name: GameObjects.Text;
  private readonly level: GameObjects.Text;
  private readonly numbers: GameObjects.Text;
  private readonly barFill: GameObjects.Rectangle;

  static readonly BOX_WIDTH = 186;
  static readonly BAR_WIDTH = 150;

  constructor(scene: Scene, layout: Layout) {
    this.scene = scene;
    this.layout = layout;
    const { x, y } = layout.box;

    scene.add.ellipse(layout.platform.x, layout.platform.y, layout.platform.rx * 2, layout.platform.rx * 0.5, COLORS.charcoal, 0.55);
    scene.add.ellipse(layout.platform.x, layout.platform.y, layout.platform.rx * 2, layout.platform.rx * 0.5).setStrokeStyle(1, COLORS.stone, 0.5);

    scene.add.rectangle(x + 3, y + 3, FighterView.BOX_WIDTH, 44, COLORS.charcoal, 0.75).setOrigin(0);
    scene.add.rectangle(x, y, FighterView.BOX_WIDTH, 44, COLORS.anthracite, 0.92).setOrigin(0).setStrokeStyle(2, COLORS.stone);

    this.icon = scene.add.image(x + 14, y + 14, 'elements', 0);
    this.name = scene.add.text(x + 26, y + 7, '', { fontFamily: 'monospace', fontSize: '12px', color: '#C2B59A' });
    this.level = scene.add.text(x + FighterView.BOX_WIDTH - 8, y + 8, '', { fontFamily: 'monospace', fontSize: '10px', color: '#B65324' }).setOrigin(1, 0);

    scene.add.text(x + 8, y + 26, 'PV', { fontFamily: 'monospace', fontSize: '9px', color: '#B65324' });
    scene.add.rectangle(x + 26, y + 27, FighterView.BAR_WIDTH, 8, COLORS.charcoal).setOrigin(0).setStrokeStyle(1, COLORS.stone);
    this.barFill = scene.add.rectangle(x + 27, y + 28, FighterView.BAR_WIDTH - 2, 6, HP_COLORS.ok).setOrigin(0);
    this.numbers = scene.add
      .text(x + FighterView.BOX_WIDTH - 8, y + 36, '', { fontFamily: 'monospace', fontSize: '9px', color: '#C2B59A' })
      .setOrigin(1, 0)
      .setVisible(layout.showNumbers);
  }

  /** Affiche un (nouveau) monstre actif : sprite, animation d'attente, encadré. */
  show(monster: MonsterInstance) {
    const textureKey = SPECIES[monster.speciesId].sprite;
    if (this.sprite && this.sprite.texture.key !== textureKey) {
      this.sprite.destroy();
      this.sprite = undefined;
    }
    if (!this.sprite) {
      this.sprite = this.scene.add
        .sprite(this.layout.sprite.x, this.layout.sprite.y, textureKey, 0)
        .setScale(this.layout.sprite.scale)
        .setFlipX(this.layout.flip);
    }
    this.sprite.play(`${textureKey}-idle`, true);
    this.sprite.setAlpha(1);
    this.name.setText(monster.name);
    this.level.setText(`N.${monster.level}`);
    this.icon.setFrame(ELEMENT_FRAME[monster.element]);
    this.update(monster);
  }

  /** Met à jour la barre de PV et sa couleur. */
  update(monster: MonsterInstance) {
    const ratio = hpRatio(monster);
    this.barFill.setDisplaySize(Math.max(0, Math.round((FighterView.BAR_WIDTH - 2) * ratio)), 6);
    this.barFill.setFillStyle(HP_COLORS[hpTier(ratio)]);
    this.barFill.setVisible(ratio > 0);
    this.numbers.setText(`${monster.hp} / ${monster.maxHp}`);
    this.sprite?.setAlpha(monster.hp > 0 ? 1 : 0.35);
  }
}

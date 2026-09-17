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
  /** Dernières PV affichées : sert de point de départ aux tweens de `animateHpTo` (US-09). */
  private displayedHp = { hp: 0, maxHp: 1 };

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
    // Un fondu de KO peut encore tourner sur ce sprite (remplacement par la même espèce) : on l'arrête.
    if (this.sprite) this.scene.tweens.killTweensOf(this.sprite);
    if (!this.sprite) {
      this.sprite = this.scene.add
        .sprite(this.layout.sprite.x, this.layout.sprite.y, textureKey, 0)
        .setScale(this.layout.sprite.scale)
        .setFlipX(this.layout.flip);
    }
    this.sprite.play(`${textureKey}-idle`, true);
    this.sprite.setAlpha(1);
    this.sprite.clearTint();
    this.sprite.y = this.layout.sprite.y;
    this.name.setText(monster.name);
    this.level.setText(`N.${monster.level}`);
    this.icon.setFrame(ELEMENT_FRAME[monster.element]);
    this.update(monster);
  }

  /** Montée de niveau ou évolution en plein combat : sprite, nom et niveau changent, les PV affichés restent. */
  relabel(speciesId: string, name: string, level: number) {
    const textureKey = SPECIES[speciesId].sprite;
    if (this.sprite && this.sprite.texture.key !== textureKey) {
      this.sprite.setTexture(textureKey, 0).play(`${textureKey}-idle`, true);
      this.scene.tweens.add({ targets: this.sprite, alpha: { from: 0.2, to: 1 }, duration: 400 });
    }
    this.name.setText(name);
    this.level.setText(`N.${level}`);
  }

  /** Met à jour la barre de PV et sa couleur, sans transition (rechargement / init — US-16 CA1). */
  update(monster: MonsterInstance) {
    this.displayedHp = { hp: monster.hp, maxHp: monster.maxHp };
    this.applyHp(this.displayedHp);
    this.sprite?.setAlpha(monster.hp > 0 ? 1 : 0); // un monstre KO a disparu (US-09 CA3), y compris après rechargement
  }

  private applyHp({ hp, maxHp }: { hp: number; maxHp: number }) {
    const ratio = hpRatio({ hp, maxHp });
    this.barFill.setDisplaySize(Math.max(0, Math.round((FighterView.BAR_WIDTH - 2) * ratio)), 6);
    this.barFill.setFillStyle(HP_COLORS[hpTier(ratio)]);
    this.barFill.setVisible(ratio > 0);
    this.numbers.setText(`${Math.round(hp)} / ${Math.round(maxHp)}`);
  }

  /**
   * Anime la barre de PV vers sa valeur finale (US-09 CA1). `hpAfter`/`maxHp` viennent
   * directement de l'événement `damage`/`heal` : pas besoin de rejouer tout `BattleState`.
   */
  animateHpTo(target: { hp: number; maxHp: number }, duration = 450) {
    const from = { ...this.displayedHp };
    this.displayedHp = { ...target };
    this.scene.tweens.addCounter({
      from: 0,
      to: 1,
      duration,
      onUpdate: (tween) => {
        const t = tween.getValue() ?? 1;
        this.applyHp({ hp: from.hp + (target.hp - from.hp) * t, maxHp: from.maxHp + (target.maxHp - from.maxHp) * t });
      },
    });
  }

  /** Flash rouge bref sur le monstre touché (US-09 CA1). */
  flash() {
    if (!this.sprite) return;
    this.sprite.setTint(0xff4444);
    this.scene.time.delayedCall(180, () => this.sprite?.clearTint());
  }

  /**
   * Texte flottant près de l'encadré : efficacité / critique (US-09 CA2). `row` empile les textes
   * d'un même coup. L'encadré ennemi touche le haut du canvas : ses textes passent en dessous.
   */
  popText(text: string, row = 0) {
    const { x, y } = this.layout.box;
    const above = y > 40;
    const t = this.scene.add
      .text(x + FighterView.BOX_WIDTH / 2, above ? y - 6 - row * 16 : y + 50 + row * 16, text, {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#F2D45C',
        backgroundColor: '#0D0D0FCC',
        padding: { x: 4, y: 2 },
      })
      .setOrigin(0.5, above ? 1 : 0)
      .setDepth(10);
    this.scene.tweens.add({ targets: t, y: t.y - 14, alpha: 0, duration: 700, delay: 300, onComplete: () => t.destroy() });
  }

  /** Fondu + descente d'un monstre K.O. (US-09 CA3). */
  playFaint(duration = 500) {
    if (!this.sprite) return;
    this.scene.tweens.add({ targets: this.sprite, y: this.sprite.y + 20, alpha: 0, duration });
  }
}

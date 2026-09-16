import { Scene } from 'phaser';
import { EventBus } from '../EventBus.ts';
import { GAME_HEIGHT, GAME_WIDTH } from '../config.ts';
import { SKILLS } from '../../../shared/data/skills.js';
import { createMonster } from '../../../shared/engine/stats.js';
import type { Element, MonsterInstance } from '../../../shared/types.js';

const ELEMENT_COLORS: Record<Element, number> = {
  feu: 0xb65324,
  eau: 0x6f8f9a,
  nature: 0x6b8f71,
  lumiere: 0xc2b59a,
  ombre: 0x8c68a8,
  neutre: 0x9a9487,
};

const ELEMENT_LABELS: Record<Element, string> = {
  feu: 'FEU', eau: 'EAU', nature: 'NATURE', lumiere: 'LUMIERE', ombre: 'OMBRE', neutre: 'NEUTRE',
};

export class BattleScene extends Scene {
  private team: MonsterInstance[] = [];
  private activeIndex = 0;
  private menuItems: Phaser.GameObjects.GameObject[] = [];
  private menuSelection = 0;
  private menuMode: 'actions' | 'switch' = 'actions';
  private resolving = false;
  private statusText?: Phaser.GameObjects.Text;
  private activeSummary?: Phaser.GameObjects.Text;

  constructor() {
    super('Battle');
  }

  create() {
    this.team = ['salamander', 'undine', 'mushroom'].map((id) => createMonster(id, 5, `battle-${id}`));
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH - 8, GAME_HEIGHT - 8).setStrokeStyle(2, 0x4a4745);
    this.add.text(18, 14, 'LA DESCENTE  /  TOUR 01', { fontFamily: 'monospace', fontSize: '11px', color: '#C2B59A', letterSpacing: 1 });
    this.add.text(18, 34, 'MENU DE COMBAT', { fontFamily: 'monospace', fontSize: '18px', color: '#B65324', letterSpacing: 2 });
    this.activeSummary = this.add.text(18, 67, '', { fontFamily: 'monospace', fontSize: '12px', color: '#C2B59A', lineSpacing: 5 });
    this.statusText = this.add.text(18, 112, 'CHOISISSEZ UNE ACTION', { fontFamily: 'monospace', fontSize: '10px', color: '#4A4745', letterSpacing: 1 });
    this.refreshMenu();
    this.input.keyboard?.on('keydown-UP', () => this.moveSelection(-1));
    this.input.keyboard?.on('keydown-DOWN', () => this.moveSelection(1));
    this.input.keyboard?.on('keydown-LEFT', () => this.moveSelection(-1));
    this.input.keyboard?.on('keydown-RIGHT', () => this.moveSelection(1));
    this.input.keyboard?.on('keydown-ENTER', () => this.activateSelection());
    EventBus.emit('scene-ready');
  }

  private refreshMenu() {
    this.menuItems.forEach((item) => item.destroy());
    this.menuItems = [];
    const active = this.team[this.activeIndex];
    this.activeSummary?.setText(`${active.name.toUpperCase()}  ·  NIVEAU ${active.level}\n${ELEMENT_LABELS[active.element]}  ·  PV ${active.hp}/${active.maxHp}`);

    if (this.menuMode === 'switch') {
      this.addMenuLabel('CHANGER DE MONSTRE', 142);
      this.team.forEach((monster, index) => {
        if (index !== this.activeIndex) this.addSwitchButton(monster, index, 162 + this.menuItems.length * 28);
      });
      this.addSwitchButton(null, -1, 162 + this.menuItems.length * 28);
      this.menuSelection = this.team.findIndex((_, index) => index !== this.activeIndex);
      this.highlightSelection();
      return;
    }

    this.addMenuLabel('COMPETENCES', 142);
    active.skills.forEach((knownSkill, index) => {
      const skill = SKILLS[knownSkill.id];
      this.addSkillButton(skill.name, skill.element, knownSkill.ppLeft, skill.pp, index, 162 + index * 28);
    });
    this.addSwitchButton(null, 99, 162 + active.skills.length * 28);
    this.menuSelection = 0;
    this.highlightSelection();
  }

  private addMenuLabel(label: string, y: number) {
    this.menuItems.push(this.add.text(18, y, label, { fontFamily: 'monospace', fontSize: '9px', color: '#4A4745', letterSpacing: 1 }));
  }

  private addSkillButton(name: string, element: Element, ppLeft: number | null, maxPp: number | null, index: number, y: number) {
    const disabled = ppLeft !== null && ppLeft <= 0;
    const row = this.add.rectangle(18, y, 250, 24, disabled ? 0x242329 : 0x291a35).setOrigin(0, 0.5);
    const text = this.add.text(28, y, `${name.toUpperCase()}  [${ELEMENT_LABELS[element]}]`, { fontFamily: 'monospace', fontSize: '9px', color: disabled ? '#4A4745' : '#C2B59A' }).setOrigin(0, 0.5);
    const pp = this.add.text(254, y, ppLeft === null ? 'PP ∞' : `PP ${ppLeft}/${maxPp}`, { fontFamily: 'monospace', fontSize: '8px', color: disabled ? '#4A4745' : `#${ELEMENT_COLORS[element].toString(16).padStart(6, '0')}` }).setOrigin(1, 0.5);
    row.setStrokeStyle(1, ELEMENT_COLORS[element], disabled ? 0.25 : 0.8);
    [row, text, pp].forEach((item) => {
      item.setData('menuIndex', index);
      item.setData('disabled', disabled);
      item.setInteractive({ useHandCursor: !disabled }).on('pointerdown', () => { this.menuSelection = index; this.activateSelection(); });
      this.menuItems.push(item);
    });
  }

  private addSwitchButton(monster: MonsterInstance | null, index: number, y: number) {
    const isBack = index === -1;
    const isSwitchMenu = index >= 0;
    const label = isBack ? '← RETOUR' : isSwitchMenu ? `↔ ${monster?.name.toUpperCase()}  ·  NIVEAU ${monster?.level}` : '↔ CHANGER DE MONSTRE';
    const row = this.add.rectangle(18, y, 250, 24, 0x242329).setOrigin(0, 0.5);
    const text = this.add.text(28, y, label, { fontFamily: 'monospace', fontSize: '9px', color: '#C2B59A' }).setOrigin(0, 0.5);
    row.setStrokeStyle(1, 0x5a3e2b, 0.8);
    [row, text].forEach((item) => {
      item.setData('menuIndex', index);
      item.setInteractive({ useHandCursor: true }).on('pointerdown', () => {
        this.menuSelection = index === -1 ? 0 : index;
        if (index === -1) this.menuMode = 'actions';
        else if (isSwitchMenu) this.resolveSwitch(index);
        else this.menuMode = 'switch';
        if (!isSwitchMenu) this.refreshMenu();
        else if (index === -1) this.refreshMenu();
      });
      this.menuItems.push(item);
    });
  }

  private moveSelection(direction: number) {
    if (this.resolving || this.menuItems.length === 0) return;
    const actionable = this.getActionableIndices();
    if (actionable.length === 0) return;
    const current = actionable.indexOf(this.menuSelection);
    this.menuSelection = actionable[(current + direction + actionable.length) % actionable.length];
    this.highlightSelection();
  }

  private getActionableIndices() {
    return this.menuItems.filter((item) => !item.getData('disabled') && item.getData('menuIndex') !== undefined).map((item) => item.getData('menuIndex') as number).filter((value, index, values) => values.indexOf(value) === index);
  }

  private highlightSelection() {
    this.menuItems.forEach((item) => {
      const selected = item.getData('menuIndex') === this.menuSelection;
      if (item instanceof Phaser.GameObjects.Rectangle) item.setFillStyle(selected ? 0x5a3e2b : (item.getData('disabled') ? 0x242329 : 0x291a35));
      if (item instanceof Phaser.GameObjects.Text) item.setColor(selected ? '#C2B59A' : (item.getData('disabled') ? '#4A4745' : '#C2B59A'));
    });
  }

  private activateSelection() {
    if (this.resolving) return;
    if (this.menuMode === 'switch') {
      const index = this.menuSelection;
      if (index >= 0 && index !== this.activeIndex) this.resolveSwitch(index);
      return;
    }
    const active = this.team[this.activeIndex];
    if (this.menuSelection === 99) { this.menuMode = 'switch'; this.menuSelection = 0; this.refreshMenu(); return; }
    const knownSkill = active.skills[this.menuSelection];
    if (!knownSkill || (knownSkill.ppLeft !== null && knownSkill.ppLeft <= 0)) return;
    knownSkill.ppLeft = knownSkill.ppLeft === null ? null : knownSkill.ppLeft - 1;
    this.resolveAction(`${SKILLS[knownSkill.id].name} utilisee`);
  }

  private resolveSwitch(index: number) {
    if (index < 0 || index >= this.team.length || index === this.activeIndex) return;
    this.activeIndex = index;
    this.menuMode = 'actions';
    this.resolveAction(`${this.team[index].name} entre en combat`);
  }

  private resolveAction(message: string) {
    this.resolving = true;
    this.menuItems.forEach((item) => (item as Phaser.GameObjects.GameObject & { setVisible: (visible: boolean) => void }).setVisible(false));
    this.statusText?.setColor('#B65324').setText(`RESOLUTION · ${message.toUpperCase()}`);
    this.tweens.add({ targets: this.statusText, alpha: 0.25, duration: 180, yoyo: true, repeat: 2 });
    this.time.delayedCall(900, () => {
      this.resolving = false;
      this.statusText?.setColor('#4A4745').setText('CHOISISSEZ UNE ACTION');
      this.refreshMenu();
    });
  }
}

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, UI, DEPTH, COLORS } from '../config/constants';
import { GameScene } from '../scenes/GameScene';

export class HUD {
  scene: GameScene;
  container: Phaser.GameObjects.Container;

  // HP bar
  private hpBarBg: Phaser.GameObjects.Graphics;
  private hpBarFill: Phaser.GameObjects.Graphics;
  private hpText: Phaser.GameObjects.Text;

  // XP bar
  private xpBarBg: Phaser.GameObjects.Graphics;
  private xpBarFill: Phaser.GameObjects.Graphics;

  // Level display
  private levelText: Phaser.GameObjects.Text;

  // Timer
  private timerText: Phaser.GameObjects.Text;

  // Enemy count
  private enemyCountText: Phaser.GameObjects.Text;

  // Pause button
  private pauseButton: Phaser.GameObjects.Container;

  constructor(scene: GameScene) {
    this.scene = scene;

    // Create container (fixed to camera)
    this.container = scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.setDepth(DEPTH.UI);

    // Create HP bar
    this.hpBarBg = scene.add.graphics();
    this.hpBarFill = scene.add.graphics();
    this.container.add([this.hpBarBg, this.hpBarFill]);

    // HP text
    this.hpText = scene.add.text(
      UI.HUD_PADDING + UI.HP_BAR_WIDTH / 2,
      UI.HUD_PADDING + UI.HP_BAR_HEIGHT / 2,
      '',
      {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2,
      }
    );
    this.hpText.setOrigin(0.5);
    this.container.add(this.hpText);

    // Create XP bar (below HP bar)
    this.xpBarBg = scene.add.graphics();
    this.xpBarFill = scene.add.graphics();
    this.container.add([this.xpBarBg, this.xpBarFill]);

    // Level text
    this.levelText = scene.add.text(
      UI.HUD_PADDING,
      UI.HUD_PADDING + UI.HP_BAR_HEIGHT + UI.XP_BAR_HEIGHT + 8,
      'Lv.1',
      {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#00ff88',
        stroke: '#000000',
        strokeThickness: 2,
      }
    );
    this.container.add(this.levelText);

    // Timer (top right)
    this.timerText = scene.add.text(
      GAME_WIDTH - UI.HUD_PADDING,
      UI.HUD_PADDING,
      '0:00',
      {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2,
      }
    );
    this.timerText.setOrigin(1, 0);
    this.container.add(this.timerText);

    // Enemy count (below timer)
    this.enemyCountText = scene.add.text(
      GAME_WIDTH - UI.HUD_PADDING,
      UI.HUD_PADDING + 24,
      'Bugs: 0',
      {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#ff6666',
        stroke: '#000000',
        strokeThickness: 2,
      }
    );
    this.enemyCountText.setOrigin(1, 0);
    this.container.add(this.enemyCountText);

    // Pause button (top center-right)
    this.pauseButton = this.createPauseButton();
    this.container.add(this.pauseButton);

    // Initial draw
    this.drawBars();
  }

  private createPauseButton(): Phaser.GameObjects.Container {
    const x = GAME_WIDTH - UI.HUD_PADDING - 60;
    const y = GAME_HEIGHT - 80;

    const container = this.scene.add.container(x, y);

    const bg = this.scene.add.graphics();
    bg.fillStyle(0x333333, 0.8);
    bg.fillRoundedRect(-25, -25, 50, 50, 8);
    bg.lineStyle(2, 0x666666, 1);
    bg.strokeRoundedRect(-25, -25, 50, 50, 8);

    // Pause icon (two bars)
    const icon = this.scene.add.graphics();
    icon.fillStyle(0xffffff, 1);
    icon.fillRect(-8, -10, 6, 20);
    icon.fillRect(2, -10, 6, 20);

    container.add([bg, icon]);
    container.setSize(50, 50);
    container.setInteractive();

    container.on('pointerdown', () => {
      this.scene.togglePause();
      this.updatePauseButton();
    });

    return container;
  }

  private updatePauseButton(): void {
    // Update pause icon based on state
    const icon = this.pauseButton.getAt(1) as Phaser.GameObjects.Graphics;
    icon.clear();
    icon.fillStyle(0xffffff, 1);

    if (this.scene.isPaused) {
      // Play icon (triangle)
      icon.fillTriangle(-5, -10, -5, 10, 10, 0);
    } else {
      // Pause icon (two bars)
      icon.fillRect(-8, -10, 6, 20);
      icon.fillRect(2, -10, 6, 20);
    }
  }

  private drawBars(): void {
    const player = this.scene.player;
    if (!player) return;

    // HP bar background
    this.hpBarBg.clear();
    this.hpBarBg.fillStyle(COLORS.HP_BAR_BG, 1);
    this.hpBarBg.fillRoundedRect(
      UI.HUD_PADDING,
      UI.HUD_PADDING,
      UI.HP_BAR_WIDTH,
      UI.HP_BAR_HEIGHT,
      4
    );

    // HP bar fill
    const hpPercent = player.currentHP / player.maxHP;
    const hpColor = hpPercent > 0.5 ? COLORS.HP_BAR_FILL :
                    hpPercent > 0.25 ? 0xffff00 : COLORS.HP_BAR_DAMAGE;

    this.hpBarFill.clear();
    if (hpPercent > 0) {
      this.hpBarFill.fillStyle(hpColor, 1);
      this.hpBarFill.fillRoundedRect(
        UI.HUD_PADDING + 2,
        UI.HUD_PADDING + 2,
        (UI.HP_BAR_WIDTH - 4) * hpPercent,
        UI.HP_BAR_HEIGHT - 4,
        3
      );
    }

    // XP bar background
    const xpY = UI.HUD_PADDING + UI.HP_BAR_HEIGHT + 4;
    this.xpBarBg.clear();
    this.xpBarBg.fillStyle(COLORS.XP_BAR_BG, 1);
    this.xpBarBg.fillRoundedRect(
      UI.HUD_PADDING,
      xpY,
      UI.HP_BAR_WIDTH,
      UI.XP_BAR_HEIGHT,
      2
    );

    // XP bar fill
    const xpNeeded = player.getXPForNextLevel();
    const xpPercent = Math.min(player.currentXP / xpNeeded, 1);

    this.xpBarFill.clear();
    if (xpPercent > 0) {
      this.xpBarFill.fillStyle(COLORS.XP_BAR_FILL, 1);
      this.xpBarFill.fillRoundedRect(
        UI.HUD_PADDING + 1,
        xpY + 1,
        (UI.HP_BAR_WIDTH - 2) * xpPercent,
        UI.XP_BAR_HEIGHT - 2,
        1
      );
    }
  }

  update(): void {
    const player = this.scene.player;
    if (!player) return;

    // Update bars
    this.drawBars();

    // Update HP text
    this.hpText.setText(`${Math.ceil(player.currentHP)}/${player.maxHP}`);

    // Update level text
    this.levelText.setText(`Lv.${player.level}`);

    // Update timer
    const totalSeconds = Math.floor(this.scene.gameTime / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    this.timerText.setText(`${minutes}:${seconds.toString().padStart(2, '0')}`);

    // Update enemy count
    const enemyCount = this.scene.enemies.getLength();
    this.enemyCountText.setText(`Bugs: ${enemyCount}`);
  }

  destroy(): void {
    this.container.destroy();
  }
}

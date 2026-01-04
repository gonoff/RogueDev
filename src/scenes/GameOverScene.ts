import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config/constants';

interface GameOverData {
  gameTime: number;
  level: number;
  bossDefeated: boolean;
}

export class GameOverScene extends Phaser.Scene {
  private gameData!: GameOverData;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: GameOverData): void {
    this.gameData = data;
  }

  create(): void {
    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x0a0a0a, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Game Over text
    const gameOver = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT * 0.2, 'RUNTIME\nCRASHED', {
      fontFamily: 'monospace',
      fontSize: '40px',
      color: '#ff4444',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 4,
    });
    gameOver.setOrigin(0.5);

    // Stats
    const minutes = Math.floor(this.gameData.gameTime / 60000);
    const seconds = Math.floor((this.gameData.gameTime % 60000) / 1000);
    const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    const statsY = GAME_HEIGHT * 0.45;
    const lineHeight = 40;

    this.add.text(GAME_WIDTH / 2, statsY, `Uptime: ${timeStr}`, {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, statsY + lineHeight, `Level: ${this.gameData.level}`, {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#ffffff',
    }).setOrigin(0.5);

    if (this.gameData.bossDefeated) {
      this.add.text(GAME_WIDTH / 2, statsY + lineHeight * 2, 'Boss Defeated!', {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#00ff88',
      }).setOrigin(0.5);
    }

    // Dev Hours earned (meta currency placeholder)
    const devHours = Math.floor(this.gameData.level * 10 + this.gameData.gameTime / 10000);
    this.add.text(GAME_WIDTH / 2, statsY + lineHeight * 3, `+${devHours} Dev Hours`, {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#ffdd44',
    }).setOrigin(0.5);

    // Buttons
    this.createButton(
      GAME_WIDTH / 2,
      GAME_HEIGHT * 0.75,
      'RESTART',
      () => this.scene.start('GameScene')
    );

    this.createButton(
      GAME_WIDTH / 2,
      GAME_HEIGHT * 0.85,
      'MAIN MENU',
      () => this.scene.start('MenuScene')
    );

    // Fade in
    this.cameras.main.fadeIn(500);
  }

  private createButton(
    x: number,
    y: number,
    text: string,
    callback: () => void
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(0x333333, 1);
    bg.fillRoundedRect(-80, -25, 160, 50, 8);
    bg.lineStyle(2, COLORS.PLAYER, 1);
    bg.strokeRoundedRect(-80, -25, 160, 50, 8);

    const buttonText = this.add.text(0, 0, text, {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#ffffff',
    });
    buttonText.setOrigin(0.5);

    container.add([bg, buttonText]);
    container.setSize(160, 50);
    container.setInteractive();

    container.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x444444, 1);
      bg.fillRoundedRect(-80, -25, 160, 50, 8);
      bg.lineStyle(2, COLORS.PLAYER, 1);
      bg.strokeRoundedRect(-80, -25, 160, 50, 8);
    });

    container.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x333333, 1);
      bg.fillRoundedRect(-80, -25, 160, 50, 8);
      bg.lineStyle(2, COLORS.PLAYER, 1);
      bg.strokeRoundedRect(-80, -25, 160, 50, 8);
    });

    container.on('pointerdown', callback);

    return container;
  }
}

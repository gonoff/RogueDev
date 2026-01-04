import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config/constants';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    // Title
    const title = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT * 0.25, 'RUNTIME\nSURVIVORS', {
      fontFamily: 'monospace',
      fontSize: '48px',
      color: '#00aaff',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 4,
    });
    title.setOrigin(0.5);

    // Subtitle
    const subtitle = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT * 0.4, 'Systems scale faster than control', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#888888',
    });
    subtitle.setOrigin(0.5);

    // Play button
    const playButton = this.createButton(
      GAME_WIDTH / 2,
      GAME_HEIGHT * 0.55,
      'START RUN',
      () => {
        this.scene.start('GameScene');
      }
    );

    // Class display (Python is the only class for MVP)
    const classText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT * 0.7, '[ PYTHON ]', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#ffdd44',
    });
    classText.setOrigin(0.5);

    const classDesc = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT * 0.75, '+10% XP Gain', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#888888',
    });
    classDesc.setOrigin(0.5);

    // Instructions
    const instructions = this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT * 0.9,
      'Use left thumb to move\nAttacks are automatic',
      {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#666666',
        align: 'center',
      }
    );
    instructions.setOrigin(0.5);

    // Add pulsing animation to play button
    this.tweens.add({
      targets: playButton,
      scale: 1.05,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
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
    bg.fillRoundedRect(-100, -30, 200, 60, 10);
    bg.lineStyle(2, COLORS.PLAYER, 1);
    bg.strokeRoundedRect(-100, -30, 200, 60, 10);

    const buttonText = this.add.text(0, 0, text, {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#ffffff',
    });
    buttonText.setOrigin(0.5);

    container.add([bg, buttonText]);
    container.setSize(200, 60);
    container.setInteractive();

    container.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x444444, 1);
      bg.fillRoundedRect(-100, -30, 200, 60, 10);
      bg.lineStyle(2, COLORS.PLAYER, 1);
      bg.strokeRoundedRect(-100, -30, 200, 60, 10);
    });

    container.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x333333, 1);
      bg.fillRoundedRect(-100, -30, 200, 60, 10);
      bg.lineStyle(2, COLORS.PLAYER, 1);
      bg.strokeRoundedRect(-100, -30, 200, 60, 10);
    });

    container.on('pointerdown', callback);

    return container;
  }
}

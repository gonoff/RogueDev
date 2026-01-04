import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config/constants';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Create loading bar
    const progressBox = this.add.graphics();
    const progressBar = this.add.graphics();

    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(GAME_WIDTH / 2 - 160, GAME_HEIGHT / 2 - 25, 320, 50);

    const loadingText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50, 'Compiling...', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#ffffff',
    });
    loadingText.setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(COLORS.XP_BAR_FILL, 1);
      progressBar.fillRect(GAME_WIDTH / 2 - 150, GAME_HEIGHT / 2 - 15, 300 * value, 30);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

    // Load SVG sprites
    this.load.svg('player', 'assets/sprites/player.svg', { width: 64, height: 64 });
    this.load.svg('enemy_null_pointer', 'assets/sprites/enemy_null_pointer.svg', { width: 32, height: 32 });
    this.load.svg('enemy_race_condition', 'assets/sprites/enemy_race_condition.svg', { width: 24, height: 24 });
    this.load.svg('enemy_memory_leak', 'assets/sprites/enemy_memory_leak.svg', { width: 48, height: 48 });
    this.load.svg('boss_infinite_loop', 'assets/sprites/boss_infinite_loop.svg', { width: 96, height: 96 });
    this.load.svg('xp_orb', 'assets/sprites/xp_orb.svg', { width: 16, height: 16 });
    this.load.svg('xp_orb_large', 'assets/sprites/xp_orb_large.svg', { width: 24, height: 24 });
    this.load.svg('background_tile', 'assets/sprites/background_tile.svg', { width: 200, height: 200 });
  }

  create(): void {
    this.scene.start('MenuScene');
  }
}

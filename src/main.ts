import Phaser from 'phaser';
import { gameConfig } from './config/game.config';

// Prevent default touch behaviors
document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
document.addEventListener('touchstart', (e) => {
  if (e.touches.length > 1) e.preventDefault();
}, { passive: false });

// Create the game instance
const game = new Phaser.Game(gameConfig);

// Handle visibility changes (pause when tab hidden)
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    game.scene.pause('GameScene');
  }
});

export { game };

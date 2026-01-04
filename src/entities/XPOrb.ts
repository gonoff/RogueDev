import Phaser from 'phaser';
import { PROGRESSION, DEPTH } from '../config/constants';
import { GameScene } from '../scenes/GameScene';

export class XPOrb {
  scene: GameScene;
  sprite: Phaser.Physics.Arcade.Sprite;
  value: number;
  collected: boolean = false;
  isAttracted: boolean = false;
  floatTween: Phaser.Tweens.Tween | null = null;

  constructor(scene: GameScene, x: number, y: number, value: number) {
    this.scene = scene;
    this.value = value;

    // Use large orb texture for higher value
    const textureKey = value >= 5 ? 'xp_orb_large' : 'xp_orb';
    this.sprite = scene.physics.add.sprite(x, y, textureKey);
    this.sprite.setDepth(DEPTH.XP_ORBS);

    // Random initial spread
    const spreadAngle = Math.random() * Math.PI * 2;
    const spreadDistance = 20 + Math.random() * 30;
    this.sprite.setVelocity(
      Math.cos(spreadAngle) * spreadDistance * 2,
      Math.sin(spreadAngle) * spreadDistance * 2
    );

    // Slow down quickly
    this.sprite.setDrag(200);

    // Slight floating animation using scale instead of position (won't interfere with physics)
    this.floatTween = scene.tweens.add({
      targets: this.sprite,
      scaleX: 1.1,
      scaleY: 0.9,
      duration: 500 + Math.random() * 300,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Store reference
    this.sprite.setData('ref', this);
  }

  update(): void {
    // Nothing to update if not attracted
  }

  attractTo(targetX: number, targetY: number): void {
    if (this.collected) return;

    // Remove drag when attracted so orb moves smoothly
    if (!this.isAttracted) {
      this.isAttracted = true;
      this.sprite.setDrag(0);
    }

    const angle = Phaser.Math.Angle.Between(
      this.sprite.x,
      this.sprite.y,
      targetX,
      targetY
    );

    this.sprite.setVelocity(
      Math.cos(angle) * PROGRESSION.XP_ORB_SPEED,
      Math.sin(angle) * PROGRESSION.XP_ORB_SPEED
    );
  }

  collect(): void {
    if (this.collected) return;
    this.collected = true;

    // Collection effect
    this.scene.tweens.add({
      targets: this.sprite,
      scale: 0,
      alpha: 0,
      duration: 100,
      onComplete: () => {
        this.sprite.destroy();
      },
    });
  }

  destroy(): void {
    this.sprite.destroy();
  }
}

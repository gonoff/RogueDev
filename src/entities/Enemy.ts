import Phaser from 'phaser';
import { ENEMIES, BOSS, DEPTH } from '../config/constants';
import { GameScene } from '../scenes/GameScene';

type EnemyType = keyof typeof ENEMIES | 'BOSS';

interface EnemyStats {
  name: string;
  hp: number;
  damage: number;
  speed: number;
  xpValue?: number;
  radius: number;
  color: number;
}

export class Enemy {
  scene: GameScene;
  sprite: Phaser.Physics.Arcade.Sprite;

  type: EnemyType;
  maxHP: number;
  currentHP: number;
  damage: number;
  speed: number;
  xpValue: number;
  isBoss: boolean;

  constructor(scene: GameScene, x: number, y: number, type: EnemyType, hpMultiplier: number = 1) {
    this.scene = scene;
    this.type = type;
    this.isBoss = type === 'BOSS';

    // Get stats based on type
    const stats = this.getStats(type);
    // Apply HP multiplier for late-game scaling (bosses scale at 50% rate)
    const scaledHP = Math.floor(stats.hp * (this.isBoss ? 1 + (hpMultiplier - 1) * 0.5 : hpMultiplier));
    this.maxHP = scaledHP;
    this.currentHP = scaledHP;
    this.damage = stats.damage;
    this.speed = stats.speed;
    // XP scales slightly with HP to reward killing tougher enemies
    const xpBonus = Math.floor((hpMultiplier - 1) * 0.5);
    this.xpValue = (stats.xpValue || (this.isBoss ? 50 : 1)) + xpBonus;

    // Create sprite
    const textureKey = this.getTextureKey(type);
    this.sprite = scene.physics.add.sprite(x, y, textureKey);
    this.sprite.setDepth(this.isBoss ? DEPTH.ENEMIES + 5 : DEPTH.ENEMIES);

    // Get sprite size and set proper collision circle
    const spriteSize = this.getSpriteSize(type);
    const collisionRadius = stats.radius;
    const offset = (spriteSize / 2) - collisionRadius;
    this.sprite.setCircle(collisionRadius, offset, offset);

    // Store reference for collision handling
    this.sprite.setData('ref', this);

    // Boss entrance effect
    if (this.isBoss) {
      this.sprite.setScale(0);
      scene.tweens.add({
        targets: this.sprite,
        scale: 1,
        duration: 500,
        ease: 'Back.easeOut',
      });
    }
  }

  private getSpriteSize(type: EnemyType): number {
    switch (type) {
      case 'NULL_POINTER': return 32;
      case 'RACE_CONDITION': return 24;
      case 'MEMORY_LEAK': return 48;
      case 'BOSS': return 96;
      default: return 32;
    }
  }

  private getStats(type: EnemyType): EnemyStats {
    if (type === 'BOSS') {
      return BOSS.INFINITE_LOOP;
    }
    return ENEMIES[type];
  }

  private getTextureKey(type: EnemyType): string {
    switch (type) {
      case 'NULL_POINTER':
        return 'enemy_null_pointer';
      case 'RACE_CONDITION':
        return 'enemy_race_condition';
      case 'MEMORY_LEAK':
        return 'enemy_memory_leak';
      case 'BOSS':
        return 'boss_infinite_loop';
      default:
        return 'enemy_null_pointer';
    }
  }

  update(): void {
    if (!this.sprite.active) return;

    // Move toward player
    const player = this.scene.player;
    if (!player || !player.sprite.active) return;

    const angle = Phaser.Math.Angle.Between(
      this.sprite.x,
      this.sprite.y,
      player.sprite.x,
      player.sprite.y
    );

    this.sprite.setVelocity(
      Math.cos(angle) * this.speed,
      Math.sin(angle) * this.speed
    );

    // Boss rotation effect
    if (this.isBoss) {
      this.sprite.setRotation(this.sprite.rotation + 0.02);
    }
  }

  takeDamage(amount: number): boolean {
    this.currentHP -= amount;

    // Damage flash
    this.sprite.setTint(0xffffff);
    this.scene.time.delayedCall(50, () => {
      if (this.sprite.active) {
        this.sprite.clearTint();
      }
    });

    // Knockback
    const player = this.scene.player;
    if (player) {
      const angle = Phaser.Math.Angle.Between(
        player.sprite.x,
        player.sprite.y,
        this.sprite.x,
        this.sprite.y
      );
      this.sprite.x += Math.cos(angle) * 5;
      this.sprite.y += Math.sin(angle) * 5;
    }

    if (this.currentHP <= 0) {
      this.die();
      return true;
    }
    return false;
  }

  private die(): void {
    // Death effect
    const deathEffect = this.scene.add.graphics();
    deathEffect.setDepth(DEPTH.EFFECTS);

    const stats = this.getStats(this.type);
    deathEffect.fillStyle(stats.color, 0.5);
    deathEffect.fillCircle(this.sprite.x, this.sprite.y, stats.radius);

    this.scene.tweens.add({
      targets: deathEffect,
      alpha: 0,
      scale: 2,
      duration: 200,
      onComplete: () => deathEffect.destroy(),
    });

    // Boss death special effect
    if (this.isBoss) {
      this.scene.cameras.main.flash(500, 255, 255, 255);
      (this.scene as GameScene).bossDefeated = true;

      // Victory text
      const victory = this.scene.add.text(
        this.sprite.x,
        this.sprite.y,
        'PROCESS\nTERMINATED',
        {
          fontFamily: 'monospace',
          fontSize: '24px',
          color: '#00ff88',
          align: 'center',
          stroke: '#000000',
          strokeThickness: 4,
        }
      );
      victory.setOrigin(0.5);
      victory.setDepth(DEPTH.OVERLAY);

      this.scene.tweens.add({
        targets: victory,
        y: victory.y - 50,
        alpha: 0,
        duration: 2000,
        onComplete: () => victory.destroy(),
      });
    }

    this.sprite.destroy();
  }

  destroy(): void {
    this.sprite.destroy();
  }
}

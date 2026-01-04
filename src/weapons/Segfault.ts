import Phaser from 'phaser';
import { Weapon } from './Weapon';
import { GameScene } from '../scenes/GameScene';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { DEPTH } from '../config/constants';

export class Segfault extends Weapon {
  constructor(scene: GameScene, player: Player) {
    super(scene, player, 'SEGFAULT');
  }

  attack(): void {
    const target = this.findClosestEnemy(this.getRange());
    if (!target) return;

    const baseDamage = this.getDamage();
    const chainCount = (this.stats.chainCount || 3) + this.player.chainCount;
    const chainFalloff = this.stats.chainFalloff || 0.7;
    const chainRange = 150;

    // Build chain of enemies
    const chain: Enemy[] = [target];
    const hitEnemies = new Set<Enemy>([target]);

    let lastEnemy = target;
    for (let i = 0; i < chainCount; i++) {
      let closestDist = chainRange;
      let closestEnemy: Enemy | null = null;

      this.scene.enemies.getChildren().forEach((obj) => {
        const enemy = (obj as Phaser.GameObjects.Sprite).getData('ref') as Enemy;
        if (enemy && enemy.sprite.active && !hitEnemies.has(enemy)) {
          const dist = Phaser.Math.Distance.Between(
            lastEnemy.sprite.x,
            lastEnemy.sprite.y,
            enemy.sprite.x,
            enemy.sprite.y
          );
          if (dist < closestDist) {
            closestDist = dist;
            closestEnemy = enemy;
          }
        }
      });

      if (closestEnemy) {
        chain.push(closestEnemy);
        hitEnemies.add(closestEnemy);
        lastEnemy = closestEnemy;
      } else {
        break;
      }
    }

    // Draw lightning effect
    this.drawLightning(chain);

    // Deal damage with falloff
    let totalDamage = 0;
    chain.forEach((enemy, index) => {
      const damageMultiplier = Math.pow(chainFalloff, index);
      const damage = baseDamage * damageMultiplier;
      totalDamage += damage;

      const killed = this.dealDamage(enemy, damage, false);
      if (killed) {
        this.scene.spawnXPPublic(enemy.sprite.x, enemy.sprite.y, enemy.xpValue);
      }

      // Spark effect at each enemy
      this.showSparkEffect(enemy.sprite.x, enemy.sprite.y);
    });

    // Apply lifesteal
    this.player.onDealDamage(totalDamage);
  }

  private drawLightning(chain: Enemy[]): void {
    if (chain.length === 0) return;

    const graphics = this.scene.add.graphics();
    graphics.setDepth(DEPTH.PROJECTILES);

    // Draw lightning from player to first enemy, then through chain
    let prevX = this.player.sprite.x;
    let prevY = this.player.sprite.y;

    chain.forEach((enemy, index) => {
      const targetX = enemy.sprite.x;
      const targetY = enemy.sprite.y;

      // Draw jagged lightning line
      this.drawLightningBolt(graphics, prevX, prevY, targetX, targetY, index === 0);

      prevX = targetX;
      prevY = targetY;
    });

    // Fade out
    this.scene.tweens.add({
      targets: graphics,
      alpha: 0,
      duration: 150,
      onComplete: () => graphics.destroy(),
    });
  }

  private drawLightningBolt(
    graphics: Phaser.GameObjects.Graphics,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    isPrimary: boolean
  ): void {
    const segments = 5;
    const jitter = 15;
    const color = isPrimary ? this.stats.color : 0x6666ff;
    const width = isPrimary ? 3 : 2;

    graphics.lineStyle(width, color, 0.9);
    graphics.beginPath();
    graphics.moveTo(x1, y1);

    const dx = (x2 - x1) / segments;
    const dy = (y2 - y1) / segments;

    for (let i = 1; i < segments; i++) {
      const midX = x1 + dx * i + (Math.random() - 0.5) * jitter;
      const midY = y1 + dy * i + (Math.random() - 0.5) * jitter;
      graphics.lineTo(midX, midY);
    }

    graphics.lineTo(x2, y2);
    graphics.strokePath();

    // Glow effect
    graphics.lineStyle(width + 4, color, 0.3);
    graphics.beginPath();
    graphics.moveTo(x1, y1);
    graphics.lineTo(x2, y2);
    graphics.strokePath();
  }

  private showSparkEffect(x: number, y: number): void {
    const sparks = this.scene.add.graphics();
    sparks.setDepth(DEPTH.EFFECTS);

    // Draw small sparks
    for (let i = 0; i < 4; i++) {
      const angle = (Math.PI * 2 * i) / 4 + Math.random() * 0.5;
      const length = 8 + Math.random() * 8;

      sparks.lineStyle(2, this.stats.color, 0.8);
      sparks.beginPath();
      sparks.moveTo(x, y);
      sparks.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
      sparks.strokePath();
    }

    this.scene.tweens.add({
      targets: sparks,
      alpha: 0,
      duration: 200,
      onComplete: () => sparks.destroy(),
    });
  }
}

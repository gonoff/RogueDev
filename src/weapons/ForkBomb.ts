import Phaser from 'phaser';
import { Weapon } from './Weapon';
import { GameScene } from '../scenes/GameScene';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { DEPTH } from '../config/constants';

interface Projectile {
  graphics: Phaser.GameObjects.Graphics;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  hitEnemies: Set<Enemy>;
  distance: number;
  maxDistance: number;
}

export class ForkBomb extends Weapon {
  private projectiles: Projectile[] = [];

  constructor(scene: GameScene, player: Player) {
    super(scene, player, 'FORK_BOMB');
  }

  attack(): void {
    const target = this.findClosestEnemy(this.getRange() * 2); // Look further for direction
    if (!target) return;

    const damage = this.getDamage();
    const projectileCount = (this.stats.projectiles || 3) + this.player.projectiles;
    const speed = this.stats.projectileSpeed || 300;
    const maxDistance = this.getRange();

    // Calculate base angle to target
    const baseAngle = Phaser.Math.Angle.Between(
      this.player.sprite.x,
      this.player.sprite.y,
      target.sprite.x,
      target.sprite.y
    );

    // Spread angle (wider with more projectiles)
    const spreadAngle = Math.min(Math.PI / 3, (projectileCount - 1) * 0.15);
    const angleStep = projectileCount > 1 ? spreadAngle / (projectileCount - 1) : 0;
    const startAngle = baseAngle - spreadAngle / 2;

    // Create projectiles
    for (let i = 0; i < projectileCount; i++) {
      const angle = startAngle + angleStep * i;

      const graphics = this.scene.add.graphics();
      graphics.setDepth(DEPTH.PROJECTILES);

      this.projectiles.push({
        graphics,
        x: this.player.sprite.x,
        y: this.player.sprite.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        damage,
        hitEnemies: new Set(),
        distance: 0,
        maxDistance,
      });
    }

    // Muzzle flash effect
    const flash = this.scene.add.graphics();
    flash.setDepth(DEPTH.EFFECTS);
    flash.fillStyle(this.stats.color, 0.6);
    flash.fillCircle(this.player.sprite.x, this.player.sprite.y, 15);

    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 0.5,
      duration: 100,
      onComplete: () => flash.destroy(),
    });
  }

  update(delta: number): void {
    // Call parent update for attack timing
    super.update(delta);

    // Update projectiles
    const deltaSeconds = delta / 1000;
    let totalDamage = 0;

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];

      // Move projectile
      proj.x += proj.vx * deltaSeconds;
      proj.y += proj.vy * deltaSeconds;
      proj.distance += Math.sqrt(proj.vx * proj.vx + proj.vy * proj.vy) * deltaSeconds;

      // Check if out of range
      if (proj.distance >= proj.maxDistance) {
        proj.graphics.destroy();
        this.projectiles.splice(i, 1);
        continue;
      }

      // Check collision with enemies
      const enemies = this.findEnemiesInRadius(proj.x, proj.y, 15);
      for (const enemy of enemies) {
        if (!proj.hitEnemies.has(enemy)) {
          proj.hitEnemies.add(enemy);
          totalDamage += proj.damage;

          const killed = this.dealDamage(enemy, proj.damage, false);
          if (killed) {
            this.scene.spawnXPPublic(enemy.sprite.x, enemy.sprite.y, enemy.xpValue);
          }

          // Hit effect
          this.showHitEffect(proj.x, proj.y);

          // Destroy projectile on hit (no pierce for fork bomb)
          proj.graphics.destroy();
          this.projectiles.splice(i, 1);
          break;
        }
      }

      // Draw projectile if still alive
      if (this.projectiles.includes(proj)) {
        this.drawProjectile(proj);
      }
    }

    // Apply lifesteal
    if (totalDamage > 0) {
      this.player.onDealDamage(totalDamage);
    }
  }

  private drawProjectile(proj: Projectile): void {
    proj.graphics.clear();

    // Main body
    proj.graphics.fillStyle(this.stats.color, 0.9);
    proj.graphics.fillCircle(proj.x, proj.y, 6);

    // Trail
    const trailX = proj.x - proj.vx * 0.03;
    const trailY = proj.y - proj.vy * 0.03;
    proj.graphics.fillStyle(this.stats.color, 0.4);
    proj.graphics.fillCircle(trailX, trailY, 4);
  }

  private showHitEffect(x: number, y: number): void {
    const effect = this.scene.add.graphics();
    effect.setDepth(DEPTH.EFFECTS);
    effect.fillStyle(this.stats.color, 0.6);
    effect.fillCircle(x, y, 12);

    this.scene.tweens.add({
      targets: effect,
      alpha: 0,
      scale: 2,
      duration: 150,
      onComplete: () => effect.destroy(),
    });
  }

  destroy(): void {
    this.projectiles.forEach((p) => p.graphics.destroy());
    this.projectiles = [];
  }
}

import Phaser from 'phaser';
import { Weapon } from './Weapon';
import { GameScene } from '../scenes/GameScene';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { DEPTH } from '../config/constants';

interface OrbitingProjectile {
  graphics: Phaser.GameObjects.Graphics;
  angle: number;
  hitCooldowns: Map<Enemy, number>;
}

export class GarbageCollector extends Weapon {
  private orbitals: OrbitingProjectile[] = [];
  private rotationSpeed: number = 2; // radians per second
  private hitCooldown: number = 500; // ms between hits on same enemy

  constructor(scene: GameScene, player: Player) {
    super(scene, player, 'GARBAGE_COLLECTOR');
    this.createOrbitals();
  }

  private createOrbitals(): void {
    // Clean up existing
    this.orbitals.forEach((o) => o.graphics.destroy());
    this.orbitals = [];

    const count = this.stats.orbitCount || 3;
    const angleStep = (Math.PI * 2) / count;

    for (let i = 0; i < count; i++) {
      const graphics = this.scene.add.graphics();
      graphics.setDepth(DEPTH.PROJECTILES);

      this.orbitals.push({
        graphics,
        angle: i * angleStep,
        hitCooldowns: new Map(),
      });
    }

    this.drawOrbitals();
  }

  protected onLevelUp(): void {
    // Recreate orbitals when leveling up (may have more orbs)
    this.createOrbitals();
  }

  private drawOrbitals(): void {
    const radius = this.stats.orbitRadius || 60;

    this.orbitals.forEach((orbital) => {
      const x = this.player.sprite.x + Math.cos(orbital.angle) * radius;
      const y = this.player.sprite.y + Math.sin(orbital.angle) * radius;

      orbital.graphics.clear();
      orbital.graphics.fillStyle(this.stats.color, 0.9);
      orbital.graphics.fillCircle(x, y, 12);

      // Inner symbol
      orbital.graphics.fillStyle(0xffffff, 0.8);
      orbital.graphics.fillCircle(x, y, 6);

      // Recycling arrow effect
      orbital.graphics.lineStyle(2, 0x228822, 0.8);
      orbital.graphics.strokeCircle(x, y, 8);
    });
  }

  // Override update for continuous rotation
  update(delta: number): void {
    const radius = this.stats.orbitRadius || 60;
    const damage = this.getDamage();
    let totalDamage = 0;

    // Rotate all orbitals
    this.orbitals.forEach((orbital) => {
      orbital.angle += this.rotationSpeed * (delta / 1000);

      // Update hit cooldowns
      orbital.hitCooldowns.forEach((cooldown, enemy) => {
        const newCooldown = cooldown - delta;
        if (newCooldown <= 0) {
          orbital.hitCooldowns.delete(enemy);
        } else {
          orbital.hitCooldowns.set(enemy, newCooldown);
        }
      });

      // Check collision with enemies
      const orbX = this.player.sprite.x + Math.cos(orbital.angle) * radius;
      const orbY = this.player.sprite.y + Math.sin(orbital.angle) * radius;

      const enemies = this.findEnemiesInRadius(orbX, orbY, 20);
      enemies.forEach((enemy) => {
        if (!orbital.hitCooldowns.has(enemy)) {
          totalDamage += damage;
          const killed = this.dealDamage(enemy, damage, false);

          if (killed) {
            this.scene.spawnXPPublic(enemy.sprite.x, enemy.sprite.y, enemy.xpValue);
          }

          orbital.hitCooldowns.set(enemy, this.hitCooldown);

          // Hit effect
          this.showHitEffect(orbX, orbY);
        }
      });
    });

    // Apply lifesteal
    if (totalDamage > 0) {
      this.player.onDealDamage(totalDamage);
    }

    this.drawOrbitals();
  }

  // No attack method needed - damage is continuous in update
  attack(): void {}

  private showHitEffect(x: number, y: number): void {
    const effect = this.scene.add.graphics();
    effect.setDepth(DEPTH.EFFECTS);
    effect.fillStyle(this.stats.color, 0.6);
    effect.fillCircle(x, y, 15);

    this.scene.tweens.add({
      targets: effect,
      alpha: 0,
      scale: 1.5,
      duration: 150,
      onComplete: () => effect.destroy(),
    });
  }

  destroy(): void {
    this.orbitals.forEach((o) => o.graphics.destroy());
    this.orbitals = [];
  }
}

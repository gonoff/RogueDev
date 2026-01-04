import { Weapon } from './Weapon';
import { GameScene } from '../scenes/GameScene';
import { Player } from '../entities/Player';
import { DEPTH } from '../config/constants';

export class StackOverflow extends Weapon {
  constructor(scene: GameScene, player: Player) {
    super(scene, player, 'STACK_OVERFLOW');
  }

  attack(): void {
    const damage = this.getDamage();
    const radius = this.stats.aoeRadius || 80;
    const knockback = this.stats.knockback || 100;

    // Visual effect - expanding ring
    const ring = this.scene.add.graphics();
    ring.setDepth(DEPTH.EFFECTS);
    ring.lineStyle(4, this.stats.color, 0.8);
    ring.strokeCircle(this.player.sprite.x, this.player.sprite.y, 10);

    // Expanding animation
    this.scene.tweens.addCounter({
      from: 10,
      to: radius,
      duration: 250,
      ease: 'Quad.easeOut',
      onUpdate: (tween) => {
        const currentRadius = tween.getValue() ?? 10;
        ring.clear();
        ring.lineStyle(4, this.stats.color, 0.8 * (1 - currentRadius / radius));
        ring.strokeCircle(this.player.sprite.x, this.player.sprite.y, currentRadius);
      },
      onComplete: () => {
        ring.destroy();
      },
    });

    // Inner flash
    const flash = this.scene.add.graphics();
    flash.setDepth(DEPTH.EFFECTS - 1);
    flash.fillStyle(this.stats.color, 0.3);
    flash.fillCircle(this.player.sprite.x, this.player.sprite.y, radius * 0.8);

    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 200,
      onComplete: () => flash.destroy(),
    });

    // Deal damage and knockback to all enemies in radius
    const enemies = this.findEnemiesInRadius(this.player.sprite.x, this.player.sprite.y, radius);
    let totalDamage = 0;

    enemies.forEach((enemy) => {
      totalDamage += damage;
      const killed = this.dealDamage(enemy, damage, false);

      if (killed) {
        this.scene.spawnXPPublic(enemy.sprite.x, enemy.sprite.y, enemy.xpValue);
      } else {
        // Apply knockback
        this.applyKnockback(enemy, this.player.sprite.x, this.player.sprite.y, knockback);
      }
    });

    // Apply lifesteal
    this.player.onDealDamage(totalDamage);
  }
}

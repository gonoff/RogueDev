import Phaser from 'phaser';
import { GameScene } from '../scenes/GameScene';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { WEAPON_DEFINITIONS, getWeaponStats, WeaponDefinition, WeaponLevelBonus } from './weapons.data';
import { DEPTH } from '../config/constants';

export abstract class Weapon {
  scene: GameScene;
  player: Player;
  weaponId: string;
  level: number = 1;
  attackTimer: number = 0;

  constructor(scene: GameScene, player: Player, weaponId: string) {
    this.scene = scene;
    this.player = player;
    this.weaponId = weaponId;
  }

  get definition(): WeaponDefinition {
    return WEAPON_DEFINITIONS[this.weaponId];
  }

  get stats(): WeaponDefinition & WeaponLevelBonus {
    return getWeaponStats(this.weaponId, this.level);
  }

  get maxLevel(): number {
    return this.definition.maxLevel;
  }

  get isMaxLevel(): boolean {
    return this.level >= this.maxLevel;
  }

  levelUp(): boolean {
    if (this.isMaxLevel) return false;
    this.level++;
    this.onLevelUp();
    return true;
  }

  // Override in subclasses for level-up effects
  protected onLevelUp(): void {}

  // Get attack interval in ms
  getAttackInterval(): number {
    const attackSpeed = this.stats.baseAttackSpeed * this.player.attackSpeedMultiplier;
    if (attackSpeed <= 0) return Infinity; // For continuous weapons
    return 1000 / attackSpeed;
  }

  // Get damage with player multiplier
  getDamage(): number {
    return this.stats.baseDamage * this.player.damageMultiplier;
  }

  // Get range with player multiplier
  getRange(): number {
    return this.stats.baseRange * this.player.rangeMultiplier;
  }

  // Update weapon (called every frame)
  update(delta: number): void {
    this.attackTimer += delta;
    const interval = this.getAttackInterval();

    if (this.attackTimer >= interval) {
      this.attackTimer = 0;
      this.attack();
    }
  }

  // Override in subclasses to implement attack logic
  abstract attack(): void;

  // Helper: Find closest enemy within range
  protected findClosestEnemy(range: number): Enemy | null {
    let closest: Enemy | null = null;
    let closestDist = range;

    this.scene.enemies.getChildren().forEach((obj) => {
      const enemy = (obj as Phaser.GameObjects.Sprite).getData('ref') as Enemy;
      if (enemy && enemy.sprite.active) {
        const dist = Phaser.Math.Distance.Between(
          this.player.sprite.x,
          this.player.sprite.y,
          enemy.sprite.x,
          enemy.sprite.y
        );
        if (dist < closestDist) {
          closestDist = dist;
          closest = enemy;
        }
      }
    });

    return closest;
  }

  // Helper: Find enemies within radius of a point
  protected findEnemiesInRadius(x: number, y: number, radius: number): Enemy[] {
    const enemies: Enemy[] = [];

    this.scene.enemies.getChildren().forEach((obj) => {
      const enemy = (obj as Phaser.GameObjects.Sprite).getData('ref') as Enemy;
      if (enemy && enemy.sprite.active) {
        const dist = Phaser.Math.Distance.Between(x, y, enemy.sprite.x, enemy.sprite.y);
        if (dist <= radius) {
          enemies.push(enemy);
        }
      }
    });

    return enemies;
  }

  // Helper: Deal damage to enemy with effects
  protected dealDamage(enemy: Enemy, damage: number, applyLifesteal: boolean = true): boolean {
    const killed = enemy.takeDamage(damage);

    // Apply lifesteal
    if (applyLifesteal && this.player.lifesteal > 0) {
      const healAmount = damage * this.player.lifesteal;
      this.player.heal(healAmount);
    }

    // Trigger explosion on kill
    if (killed && this.player.explosionDamage > 0) {
      this.triggerExplosion(enemy.sprite.x, enemy.sprite.y, enemy.maxHP * this.player.explosionDamage);
    }

    return killed;
  }

  // Helper: Create explosion effect
  protected triggerExplosion(x: number, y: number, damage: number): void {
    const explosionRadius = 50;

    // Visual effect
    const explosion = this.scene.add.graphics();
    explosion.setDepth(DEPTH.EFFECTS);
    explosion.fillStyle(0xff4400, 0.6);
    explosion.fillCircle(x, y, explosionRadius);

    this.scene.tweens.add({
      targets: explosion,
      alpha: 0,
      scale: 1.5,
      duration: 200,
      onComplete: () => explosion.destroy(),
    });

    // Deal damage to nearby enemies
    const nearbyEnemies = this.findEnemiesInRadius(x, y, explosionRadius);
    nearbyEnemies.forEach((enemy) => {
      enemy.takeDamage(damage);
    });
  }

  // Helper: Apply knockback to enemy
  protected applyKnockback(enemy: Enemy, fromX: number, fromY: number, force: number): void {
    const angle = Phaser.Math.Angle.Between(fromX, fromY, enemy.sprite.x, enemy.sprite.y);
    enemy.sprite.x += Math.cos(angle) * force * 0.1;
    enemy.sprite.y += Math.sin(angle) * force * 0.1;
  }
}

import Phaser from 'phaser';
import { PLAYER, PROGRESSION, DEPTH } from '../config/constants';
import { GameScene } from '../scenes/GameScene';
import { Weapon, createWeapon } from '../weapons';

export class Player {
  scene: GameScene;
  sprite: Phaser.Physics.Arcade.Sprite;

  // Weapons
  weapons: Weapon[] = [];

  // Base stats
  maxHP: number = PLAYER.BASE_HP;
  currentHP: number = PLAYER.BASE_HP;
  baseSpeed: number = PLAYER.BASE_SPEED;

  // Multipliers (modified by upgrades)
  damageMultiplier: number = 1;
  speedMultiplier: number = 1;
  attackSpeedMultiplier: number = 1;
  rangeMultiplier: number = 1;
  xpMultiplier: number = 1.1; // Python class bonus: +10% XP

  // Defensive stats
  armor: number = 0; // Damage reduction percentage (0.1 = 10% reduction)
  hpRegen: number = 0; // HP per second
  lifesteal: number = 0; // Percentage of damage dealt returned as HP

  // Weapon stats
  pierce: number = 0; // Number of additional enemies to pierce
  projectiles: number = 1; // Number of projectiles fired
  aoeRadius: number = 0; // Splash damage radius
  chainCount: number = 0; // Number of enemies to chain to
  explosionDamage: number = 0; // Percentage of enemy HP as explosion on death
  critChance: number = 0; // Chance for double damage

  // Utility stats
  magnetRange: number = 0; // Bonus magnet range
  invincibilityBonus: number = 0; // Bonus invincibility duration

  // Progression
  level: number = 1;
  currentXP: number = 0;

  // State
  isInvincible: boolean = false;
  private invincibilityTimer: Phaser.Time.TimerEvent | null = null;
  private regenTimer: number = 0;

  constructor(scene: GameScene, x: number, y: number) {
    this.scene = scene;

    // Create sprite (64x64 SVG)
    this.sprite = scene.physics.add.sprite(x, y, 'player');
    this.sprite.setDepth(DEPTH.PLAYER);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setScale(0.6); // Scale down slightly for better gameplay

    // Set collision circle (centered on sprite)
    const scaledSize = 64 * 0.6;
    this.sprite.setCircle(PLAYER.COLLISION_RADIUS, (scaledSize / 2) - PLAYER.COLLISION_RADIUS, (scaledSize / 2) - PLAYER.COLLISION_RADIUS);

    // Store reference for collision handling
    this.sprite.setData('ref', this);
  }

  update(delta: number): void {
    // Handle HP regeneration
    if (this.hpRegen > 0 && this.currentHP < this.maxHP) {
      this.regenTimer += delta;
      if (this.regenTimer >= 1000) { // Every second
        this.regenTimer = 0;
        this.heal(this.hpRegen);

        // Visual feedback for regen
        if (this.currentHP < this.maxHP) {
          const healText = this.scene.add.text(
            this.sprite.x + Phaser.Math.Between(-10, 10),
            this.sprite.y - 20,
            `+${this.hpRegen}`,
            {
              fontFamily: 'monospace',
              fontSize: '10px',
              color: '#44ff44',
            }
          );
          healText.setOrigin(0.5);
          healText.setDepth(DEPTH.EFFECTS);

          this.scene.tweens.add({
            targets: healText,
            y: healText.y - 15,
            alpha: 0,
            duration: 400,
            onComplete: () => healText.destroy(),
          });
        }
      }
    }
  }

  move(dirX: number, dirY: number): void {
    const speed = this.baseSpeed * this.speedMultiplier;

    // Normalize diagonal movement
    if (dirX !== 0 && dirY !== 0) {
      const len = Math.sqrt(dirX * dirX + dirY * dirY);
      dirX /= len;
      dirY /= len;
    }

    this.sprite.setVelocity(dirX * speed, dirY * speed);

    // Slight tilt based on movement
    if (dirX !== 0) {
      this.sprite.setRotation(dirX * 0.1);
    } else {
      this.sprite.setRotation(0);
    }
  }

  takeDamage(amount: number): void {
    if (this.isInvincible) return;

    // Apply armor reduction
    const reducedDamage = Math.max(1, amount * (1 - this.armor));
    this.currentHP = Math.max(0, this.currentHP - reducedDamage);

    // Visual feedback
    this.sprite.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
      this.sprite.clearTint();
    });

    // Screen shake
    this.scene.cameras.main.shake(100, 0.01);

    // Start invincibility
    this.isInvincible = true;
    this.sprite.setAlpha(0.5);

    const invincibilityDuration = PLAYER.INVINCIBILITY_DURATION + this.invincibilityBonus;

    // Flashing effect during invincibility
    const flashTween = this.scene.tweens.add({
      targets: this.sprite,
      alpha: { from: 0.3, to: 0.8 },
      duration: 100,
      yoyo: true,
      repeat: Math.floor(invincibilityDuration / 200),
    });

    this.invincibilityTimer = this.scene.time.delayedCall(
      invincibilityDuration,
      () => {
        this.isInvincible = false;
        this.sprite.setAlpha(1);
        flashTween.stop();
      }
    );
  }

  // Called when player deals damage - handles lifesteal
  onDealDamage(damageDealt: number): void {
    if (this.lifesteal > 0) {
      const healAmount = Math.floor(damageDealt * this.lifesteal);
      if (healAmount > 0) {
        this.heal(healAmount);
      }
    }
  }

  addXP(amount: number): void {
    const adjustedAmount = Math.floor(amount * this.xpMultiplier);
    this.currentXP += adjustedAmount;

    // Small visual feedback
    const xpText = this.scene.add.text(
      this.sprite.x,
      this.sprite.y - 30,
      `+${adjustedAmount}`,
      {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#00ff88',
      }
    );
    xpText.setOrigin(0.5);
    xpText.setDepth(DEPTH.EFFECTS);

    this.scene.tweens.add({
      targets: xpText,
      y: xpText.y - 20,
      alpha: 0,
      duration: 500,
      onComplete: () => xpText.destroy(),
    });
  }

  getXPForNextLevel(): number {
    return Math.floor(
      PROGRESSION.BASE_XP_TO_LEVEL * Math.pow(PROGRESSION.XP_SCALING, this.level - 1)
    );
  }

  getMagnetRange(): number {
    return PROGRESSION.XP_MAGNET_RADIUS + this.magnetRange;
  }

  // Weapon management
  addWeapon(weaponId: string): void {
    const existing = this.getWeapon(weaponId);
    if (existing) {
      // Level up existing weapon
      existing.levelUp();
    } else {
      // Add new weapon
      const weapon = createWeapon(this.scene, this, weaponId);
      this.weapons.push(weapon);
    }
  }

  hasWeapon(weaponId: string): boolean {
    return this.weapons.some((w) => w.weaponId === weaponId);
  }

  getWeapon(weaponId: string): Weapon | undefined {
    return this.weapons.find((w) => w.weaponId === weaponId);
  }

  getWeaponLevel(weaponId: string): number {
    const weapon = this.getWeapon(weaponId);
    return weapon ? weapon.level : 0;
  }

  updateWeapons(delta: number): void {
    this.weapons.forEach((weapon) => weapon.update(delta));
  }

  heal(amount: number): void {
    const oldHP = this.currentHP;
    this.currentHP = Math.min(this.maxHP, this.currentHP + amount);

    // Flash green when healing significantly
    if (this.currentHP - oldHP >= 5) {
      this.sprite.setTint(0x44ff44);
      this.scene.time.delayedCall(100, () => {
        this.sprite.clearTint();
      });
    }
  }

  destroy(): void {
    if (this.invincibilityTimer) {
      this.invincibilityTimer.destroy();
    }
    this.sprite.destroy();
  }
}

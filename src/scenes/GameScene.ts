import Phaser from 'phaser';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  WORLD_WIDTH,
  WORLD_HEIGHT,
  ENEMIES,
  SPAWNING,
  BOSS,
  DEPTH,
} from '../config/constants';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { XPOrb } from '../entities/XPOrb';
import { VirtualJoystick } from '../ui/VirtualJoystick';
import { HUD } from '../ui/HUD';

export class GameScene extends Phaser.Scene {
  // Core entities
  player!: Player;
  enemies!: Phaser.GameObjects.Group;
  xpOrbs!: Phaser.GameObjects.Group;

  // UI
  joystick!: VirtualJoystick;
  hud!: HUD;

  // State
  gameTime: number = 0;
  spawnTimer: number = 0;
  currentSpawnRate: number = SPAWNING.INITIAL_SPAWN_RATE;
  enemiesPerSpawn: number = SPAWNING.INITIAL_ENEMIES_PER_SPAWN;
  isPaused: boolean = false;
  bossSpawned: boolean = false;
  bossDefeated: boolean = false;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    // Reset state
    this.gameTime = 0;
    this.spawnTimer = 0;
    this.currentSpawnRate = SPAWNING.INITIAL_SPAWN_RATE;
    this.enemiesPerSpawn = SPAWNING.INITIAL_ENEMIES_PER_SPAWN;
    this.isPaused = false;
    this.bossSpawned = false;
    this.bossDefeated = false;

    // Set world bounds
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // Create background grid
    this.createBackground();

    // Create groups
    this.enemies = this.add.group({
      classType: Enemy,
      runChildUpdate: true,
    });

    this.xpOrbs = this.add.group({
      classType: XPOrb,
      runChildUpdate: true,
    });

    // Create player
    this.player = new Player(this, WORLD_WIDTH / 2, WORLD_HEIGHT / 2);

    // Give player starting weapon
    this.player.addWeapon('INTERPRETER_BEAM');

    // Setup camera
    this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // Create UI (fixed to camera)
    this.joystick = new VirtualJoystick(this);
    this.hud = new HUD(this);

    // Setup collisions
    this.setupCollisions();

    // Pause button handler
    this.input.keyboard?.on('keydown-ESC', () => this.togglePause());
  }

  update(_time: number, delta: number): void {
    if (this.isPaused) return;

    this.gameTime += delta;

    // Update player (regen, etc.)
    this.player.update(delta);

    // Update difficulty scaling
    this.updateDifficulty();

    // Handle spawning
    this.handleSpawning(delta);

    // Handle player input and movement
    this.handlePlayerInput();

    // Update all enemies (move toward player)
    this.updateEnemies();

    // Update weapons (auto-attack)
    this.player.updateWeapons(delta);

    // Handle XP magnet
    this.handleXPMagnet();

    // Update HUD
    this.hud.update();

    // Check for boss spawn
    this.checkBossSpawn();

    // Check game over
    if (this.player.currentHP <= 0) {
      this.gameOver();
    }
  }

  private updateEnemies(): void {
    this.enemies.getChildren().forEach((obj) => {
      const enemy = (obj as Phaser.GameObjects.Sprite).getData('ref') as Enemy;
      if (enemy) {
        enemy.update();
      }
    });
  }

  private createBackground(): void {
    // Create tiled background using SVG (200x200 tiles)
    const tileSize = 200;

    for (let x = 0; x < WORLD_WIDTH; x += tileSize) {
      for (let y = 0; y < WORLD_HEIGHT; y += tileSize) {
        const tile = this.add.image(x + tileSize / 2, y + tileSize / 2, 'background_tile');
        tile.setDepth(DEPTH.BACKGROUND);
      }
    }

    // World boundary (danger zone indicator)
    const boundary = this.add.graphics();
    boundary.setDepth(DEPTH.BACKGROUND + 1);
    boundary.lineStyle(6, 0xff0000, 0.4);
    boundary.strokeRect(3, 3, WORLD_WIDTH - 6, WORLD_HEIGHT - 6);

    // Corner warning markers
    const cornerSize = 50;
    boundary.fillStyle(0xff0000, 0.15);
    boundary.fillRect(0, 0, cornerSize, cornerSize);
    boundary.fillRect(WORLD_WIDTH - cornerSize, 0, cornerSize, cornerSize);
    boundary.fillRect(0, WORLD_HEIGHT - cornerSize, cornerSize, cornerSize);
    boundary.fillRect(WORLD_WIDTH - cornerSize, WORLD_HEIGHT - cornerSize, cornerSize, cornerSize);

    // Add floating code particles for atmosphere
    this.createFloatingParticles();
  }

  private createFloatingParticles(): void {
    const codeSnippets = ['0', '1', '{', '}', ';', '//', 'fn', 'if', '()', '[]', '=>', '&&', '||', '!=', '++'];
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
      const x = Phaser.Math.Between(100, WORLD_WIDTH - 100);
      const y = Phaser.Math.Between(100, WORLD_HEIGHT - 100);
      const snippet = codeSnippets[Phaser.Math.Between(0, codeSnippets.length - 1)];

      const particle = this.add.text(x, y, snippet, {
        fontFamily: 'monospace',
        fontSize: `${Phaser.Math.Between(8, 14)}px`,
        color: '#3a6a8a',
      });
      particle.setAlpha(Phaser.Math.FloatBetween(0.1, 0.25));
      particle.setDepth(DEPTH.BACKGROUND + 2);

      // Slow floating animation
      this.tweens.add({
        targets: particle,
        y: y + Phaser.Math.Between(-30, 30),
        x: x + Phaser.Math.Between(-20, 20),
        alpha: Phaser.Math.FloatBetween(0.05, 0.2),
        duration: Phaser.Math.Between(4000, 8000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    // Add some glowing orbs
    for (let i = 0; i < 15; i++) {
      const x = Phaser.Math.Between(200, WORLD_WIDTH - 200);
      const y = Phaser.Math.Between(200, WORLD_HEIGHT - 200);
      const colors = [0x4a9aff, 0x4aff9a, 0xff4a9a, 0xffaa4a];
      const color = colors[Phaser.Math.Between(0, colors.length - 1)];

      const orb = this.add.graphics();
      orb.fillStyle(color, 0.15);
      orb.fillCircle(0, 0, Phaser.Math.Between(20, 40));
      orb.setPosition(x, y);
      orb.setDepth(DEPTH.BACKGROUND + 1);

      this.tweens.add({
        targets: orb,
        alpha: Phaser.Math.FloatBetween(0.3, 0.6),
        scale: Phaser.Math.FloatBetween(0.8, 1.2),
        duration: Phaser.Math.Between(2000, 4000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  private setupCollisions(): void {
    // Enemy-Player collision
    this.physics.add.overlap(
      this.player.sprite,
      this.enemies,
      (_, enemyObj) => {
        const enemy = (enemyObj as Phaser.GameObjects.Sprite).getData('ref') as Enemy;
        if (enemy && !this.player.isInvincible) {
          this.player.takeDamage(enemy.damage);
        }
      }
    );

    // XP-Player collision
    this.physics.add.overlap(
      this.player.sprite,
      this.xpOrbs,
      (_, xpObj) => {
        const orb = (xpObj as Phaser.GameObjects.Sprite).getData('ref') as XPOrb;
        if (orb && !orb.collected) {
          orb.collect();
          this.player.addXP(orb.value);
          this.checkLevelUp();
        }
      }
    );
  }

  private handlePlayerInput(): void {
    const direction = this.joystick.getDirection();
    this.player.move(direction.x, direction.y);
  }

  private handleSpawning(delta: number): void {
    this.spawnTimer += delta;

    if (this.spawnTimer >= this.currentSpawnRate) {
      this.spawnTimer = 0;

      // Check max enemies
      if (this.enemies.getLength() >= SPAWNING.MAX_ENEMIES) return;

      // Spawn enemies
      const count = Math.floor(this.enemiesPerSpawn);
      for (let i = 0; i < count; i++) {
        this.spawnEnemy();
      }
    }
  }

  private spawnEnemy(): void {
    // Calculate spawn position at edge of screen
    const angle = Math.random() * Math.PI * 2;
    const spawnX = this.player.sprite.x + Math.cos(angle) * SPAWNING.SPAWN_DISTANCE;
    const spawnY = this.player.sprite.y + Math.sin(angle) * SPAWNING.SPAWN_DISTANCE;

    // Clamp to world bounds
    const x = Phaser.Math.Clamp(spawnX, 50, WORLD_WIDTH - 50);
    const y = Phaser.Math.Clamp(spawnY, 50, WORLD_HEIGHT - 50);

    // Calculate HP multiplier based on game time (capped)
    const minutes = this.gameTime / 60000;
    const hpMultiplier = Math.min(
      SPAWNING.MAX_HP_SCALE,
      1 + minutes * SPAWNING.HP_SCALE_PER_MINUTE
    );

    // Select enemy type based on game time
    const enemyType = this.selectEnemyType();
    const enemy = new Enemy(this, x, y, enemyType, hpMultiplier);
    this.enemies.add(enemy.sprite);
  }

  private selectEnemyType(): keyof typeof ENEMIES {
    const minutes = this.gameTime / 60000;

    // Early game: mostly Null Pointers
    if (minutes < 1) {
      return 'NULL_POINTER';
    }

    // Mid game: mix in Race Conditions
    if (minutes < 2) {
      return Math.random() < 0.7 ? 'NULL_POINTER' : 'RACE_CONDITION';
    }

    // Late game: all types
    const roll = Math.random();
    if (roll < 0.5) return 'NULL_POINTER';
    if (roll < 0.8) return 'RACE_CONDITION';
    return 'MEMORY_LEAK';
  }

  private updateDifficulty(): void {
    const minutes = this.gameTime / 60000;

    // Increase spawn rate (with minimum cap)
    this.currentSpawnRate = Math.max(
      SPAWNING.MIN_SPAWN_RATE,
      SPAWNING.INITIAL_SPAWN_RATE - minutes * SPAWNING.SPAWN_RATE_DECREASE * 60
    );

    // Increase enemies per spawn (with maximum cap)
    this.enemiesPerSpawn = Math.min(
      SPAWNING.MAX_ENEMIES_PER_SPAWN,
      SPAWNING.INITIAL_ENEMIES_PER_SPAWN + minutes * SPAWNING.ENEMIES_PER_SPAWN_INCREASE * 60
    );
  }

  private spawnXP(x: number, y: number, value: number): void {
    const orb = new XPOrb(this, x, y, value);
    this.xpOrbs.add(orb.sprite);
  }

  // Public method for weapons to spawn XP
  spawnXPPublic(x: number, y: number, value: number): void {
    this.spawnXP(x, y, value);
  }

  private handleXPMagnet(): void {
    const magnetRange = this.player.getMagnetRange();

    this.xpOrbs.getChildren().forEach((obj) => {
      const orb = (obj as Phaser.GameObjects.Sprite).getData('ref') as XPOrb;
      if (orb && orb.sprite.active && !orb.collected) {
        const dist = Phaser.Math.Distance.Between(
          this.player.sprite.x,
          this.player.sprite.y,
          orb.sprite.x,
          orb.sprite.y
        );

        if (dist < magnetRange) {
          orb.attractTo(this.player.sprite.x, this.player.sprite.y);
        }
      }
    });
  }

  private checkLevelUp(): void {
    const xpNeeded = this.player.getXPForNextLevel();
    if (this.player.currentXP >= xpNeeded) {
      this.player.currentXP -= xpNeeded;
      this.player.level++;

      // Pause game and show upgrade screen
      this.scene.pause();
      this.scene.launch('UpgradeScene', { player: this.player, gameScene: this });
    }
  }

  private checkBossSpawn(): void {
    if (!this.bossSpawned && this.gameTime >= BOSS.SPAWN_INTERVAL) {
      this.bossSpawned = true;
      this.spawnBoss();
    }
  }

  private spawnBoss(): void {
    // Flash screen
    this.cameras.main.flash(500, 255, 0, 255);

    // Spawn boss
    const angle = Math.random() * Math.PI * 2;
    const x = this.player.sprite.x + Math.cos(angle) * SPAWNING.SPAWN_DISTANCE;
    const y = this.player.sprite.y + Math.sin(angle) * SPAWNING.SPAWN_DISTANCE;

    const boss = new Enemy(this, x, y, 'BOSS');
    this.enemies.add(boss.sprite);

    // Warning text
    const warning = this.add.text(
      this.cameras.main.scrollX + GAME_WIDTH / 2,
      this.cameras.main.scrollY + GAME_HEIGHT / 2,
      'INFINITE LOOP\nDETECTED',
      {
        fontFamily: 'monospace',
        fontSize: '32px',
        color: '#ff00ff',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 4,
      }
    );
    warning.setOrigin(0.5);
    warning.setDepth(DEPTH.OVERLAY);

    this.tweens.add({
      targets: warning,
      alpha: 0,
      scale: 2,
      duration: 2000,
      onComplete: () => warning.destroy(),
    });
  }

  applyUpgrade(upgrade: { stat: string; value: number; weaponId?: string }): void {
    // Handle weapon upgrades
    if (upgrade.stat === 'weapon' && upgrade.weaponId) {
      this.player.addWeapon(upgrade.weaponId);
      return;
    }

    switch (upgrade.stat) {
      // Basic stats
      case 'damage':
        this.player.damageMultiplier += upgrade.value;
        break;
      case 'speed':
        this.player.speedMultiplier += upgrade.value;
        break;
      case 'attackSpeed':
        this.player.attackSpeedMultiplier += upgrade.value;
        break;
      case 'maxHP':
        this.player.maxHP += upgrade.value;
        this.player.currentHP = Math.min(this.player.currentHP + upgrade.value, this.player.maxHP);
        break;
      case 'range':
        this.player.rangeMultiplier += upgrade.value;
        break;
      case 'xpGain':
        this.player.xpMultiplier += upgrade.value;
        break;

      // Defensive stats
      case 'hpRegen':
        this.player.hpRegen += upgrade.value;
        break;
      case 'armor':
        this.player.armor = Math.min(0.8, this.player.armor + upgrade.value); // Cap at 80%
        break;
      case 'lifesteal':
        this.player.lifesteal += upgrade.value;
        break;
      case 'invincibilityDuration':
        this.player.invincibilityBonus += upgrade.value;
        break;

      // Weapon stats
      case 'pierce':
        this.player.pierce += upgrade.value;
        break;
      case 'projectiles':
        this.player.projectiles += upgrade.value;
        break;
      case 'aoeRadius':
        this.player.aoeRadius += upgrade.value;
        break;
      case 'chainCount':
        this.player.chainCount += upgrade.value;
        break;
      case 'explosionDamage':
        this.player.explosionDamage += upgrade.value;
        break;
      case 'critChance':
        this.player.critChance = Math.min(0.8, this.player.critChance + upgrade.value); // Cap at 80%
        break;

      // Utility stats
      case 'magnetRange':
        this.player.magnetRange += upgrade.value;
        break;
    }
  }

  togglePause(): void {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.physics.pause();
    } else {
      this.physics.resume();
    }
  }

  private gameOver(): void {
    this.scene.start('GameOverScene', {
      gameTime: this.gameTime,
      level: this.player.level,
      bossDefeated: this.bossDefeated,
    });
  }
}

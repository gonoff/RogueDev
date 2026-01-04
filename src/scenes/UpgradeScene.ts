import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants';
import { getAvailableUpgrades, Upgrade } from '../upgrades/upgrades.data';
import { Player } from '../entities/Player';
import { GameScene } from './GameScene';

export class UpgradeScene extends Phaser.Scene {
  private player!: Player;
  private gameScene!: GameScene;

  constructor() {
    super({ key: 'UpgradeScene' });
  }

  init(data: { player: Player; gameScene: GameScene }): void {
    this.player = data.player;
    this.gameScene = data.gameScene;
  }

  create(): void {
    // Dark overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.85);
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Title
    const title = this.add.text(GAME_WIDTH / 2, 60, 'LEVEL UP!', {
      fontFamily: 'monospace',
      fontSize: '32px',
      color: '#00ff88',
      stroke: '#000000',
      strokeThickness: 4,
    });
    title.setOrigin(0.5);

    const levelText = this.add.text(GAME_WIDTH / 2, 100, `Level ${this.player.level}`, {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#888888',
    });
    levelText.setOrigin(0.5);

    // Show tier indicator
    const tierText = this.player.level >= 10 ? 'TIER 3 UNLOCKED!' :
                     this.player.level >= 6 ? 'TIER 2 UNLOCKED!' : '';
    if (tierText) {
      const tier = this.add.text(GAME_WIDTH / 2, 125, tierText, {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#ffaa00',
      });
      tier.setOrigin(0.5);
    }

    // Get 3 random upgrades based on level
    const availableUpgrades = this.getRandomUpgrades(3);

    // Create upgrade cards
    availableUpgrades.forEach((upgrade, index) => {
      this.createUpgradeCard(upgrade, index, availableUpgrades.length);
    });
  }

  private getRandomUpgrades(count: number): Upgrade[] {
    // Get upgrades available at current level
    let available = getAvailableUpgrades(this.player.level);

    // Filter out weapons that are at max level
    available = available.filter(upgrade => {
      if (upgrade.weaponId) {
        const weapon = this.player.getWeapon(upgrade.weaponId);
        if (weapon && weapon.isMaxLevel) {
          return false; // Don't show max level weapons
        }
      }
      return true;
    });

    // Weight higher tier upgrades to appear more often at higher levels
    // Also prioritize weapon upgrades the player already has (to level them up)
    const weighted: Upgrade[] = [];
    available.forEach(upgrade => {
      // Add upgrade multiple times based on how appropriate it is for current level
      let weight = upgrade.tier === 3 && this.player.level >= 12 ? 3 :
                   upgrade.tier === 2 && this.player.level >= 8 ? 2 :
                   upgrade.tier === 1 && this.player.level <= 5 ? 2 : 1;

      // Boost weight for weapons player already has (encourages leveling up)
      if (upgrade.weaponId && this.player.hasWeapon(upgrade.weaponId)) {
        weight += 2;
      }

      for (let i = 0; i < weight; i++) {
        weighted.push(upgrade);
      }
    });

    // Shuffle and pick unique upgrades
    const shuffled = weighted.sort(() => Math.random() - 0.5);
    const selected: Upgrade[] = [];
    const usedIds = new Set<string>();

    for (const upgrade of shuffled) {
      if (selected.length >= count) break;
      if (!usedIds.has(upgrade.id)) {
        selected.push(upgrade);
        usedIds.add(upgrade.id);
      }
    }

    return selected;
  }

  private createUpgradeCard(upgrade: Upgrade, index: number, total: number): void {
    const cardWidth = 110;
    const cardHeight = 220;
    const gap = 15;
    const totalWidth = total * cardWidth + (total - 1) * gap;
    const startX = (GAME_WIDTH - totalWidth) / 2 + cardWidth / 2;
    const x = startX + index * (cardWidth + gap);
    const y = GAME_HEIGHT / 2 + 50;

    const container = this.add.container(x, y);

    // Card background with tier-based glow
    const bg = this.add.graphics();
    const tierGlow = upgrade.tier === 3 ? 0.3 : upgrade.tier === 2 ? 0.15 : 0;
    if (tierGlow > 0) {
      bg.fillStyle(this.getUpgradeColor(upgrade.category), tierGlow);
      bg.fillRoundedRect(-cardWidth / 2 - 4, -cardHeight / 2 - 4, cardWidth + 8, cardHeight + 8, 12);
    }
    bg.fillStyle(0x1a1a1a, 1);
    bg.fillRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 8);
    bg.lineStyle(2, this.getUpgradeColor(upgrade.category), 1);
    bg.strokeRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 8);

    // Tier indicator
    const tierLabel = this.add.text(0, -cardHeight / 2 + 12, `T${upgrade.tier}`, {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: upgrade.tier === 3 ? '#ffaa00' : upgrade.tier === 2 ? '#aaaaff' : '#666666',
    });
    tierLabel.setOrigin(0.5);

    // Category label
    const category = this.add.text(0, -cardHeight / 2 + 28, upgrade.category.toUpperCase(), {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: this.getUpgradeColorHex(upgrade.category),
    });
    category.setOrigin(0.5);

    // Icon (simple text representation)
    const icon = this.add.text(0, -35, upgrade.icon, {
      fontFamily: 'monospace',
      fontSize: '28px',
      color: '#ffffff',
    });
    icon.setOrigin(0.5);

    // Name
    const name = this.add.text(0, 10, upgrade.name, {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: cardWidth - 16 },
    });
    name.setOrigin(0.5);

    // Description
    const desc = this.add.text(0, 50, upgrade.description, {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#aaaaaa',
      align: 'center',
      wordWrap: { width: cardWidth - 12 },
    });
    desc.setOrigin(0.5);

    // Value display
    const valueText = this.formatValue(upgrade);
    const value = this.add.text(0, cardHeight / 2 - 25, valueText, {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#00ff88',
    });
    value.setOrigin(0.5);

    container.add([bg, tierLabel, category, icon, name, desc, value]);
    container.setSize(cardWidth, cardHeight);
    container.setInteractive();

    // Hover effects
    container.on('pointerover', () => {
      bg.clear();
      if (tierGlow > 0) {
        bg.fillStyle(this.getUpgradeColor(upgrade.category), tierGlow + 0.1);
        bg.fillRoundedRect(-cardWidth / 2 - 4, -cardHeight / 2 - 4, cardWidth + 8, cardHeight + 8, 12);
      }
      bg.fillStyle(0x2a2a2a, 1);
      bg.fillRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 8);
      bg.lineStyle(3, this.getUpgradeColor(upgrade.category), 1);
      bg.strokeRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 8);
      container.setScale(1.05);
    });

    container.on('pointerout', () => {
      bg.clear();
      if (tierGlow > 0) {
        bg.fillStyle(this.getUpgradeColor(upgrade.category), tierGlow);
        bg.fillRoundedRect(-cardWidth / 2 - 4, -cardHeight / 2 - 4, cardWidth + 8, cardHeight + 8, 12);
      }
      bg.fillStyle(0x1a1a1a, 1);
      bg.fillRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 8);
      bg.lineStyle(2, this.getUpgradeColor(upgrade.category), 1);
      bg.strokeRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 8);
      container.setScale(1);
    });

    container.on('pointerdown', () => {
      this.selectUpgrade(upgrade);
    });
  }

  private getUpgradeColor(category: string): number {
    switch (category) {
      case 'paradigm':
        return 0xff6600;
      case 'optimization':
        return 0x00ff88;
      case 'tooling':
        return 0x6666ff;
      case 'defense':
        return 0x44aaff;
      case 'weapon':
        return 0xff4466;
      default:
        return 0xffffff;
    }
  }

  private getUpgradeColorHex(category: string): string {
    switch (category) {
      case 'paradigm':
        return '#ff6600';
      case 'optimization':
        return '#00ff88';
      case 'tooling':
        return '#6666ff';
      case 'defense':
        return '#44aaff';
      case 'weapon':
        return '#ff4466';
      default:
        return '#ffffff';
    }
  }

  private formatValue(upgrade: Upgrade): string {
    const stat = upgrade.stat;
    const value = upgrade.value;

    // Weapon upgrades - show current level
    if (stat === 'weapon' && upgrade.weaponId) {
      const currentLevel = this.player.getWeaponLevel(upgrade.weaponId);
      if (currentLevel === 0) {
        return 'NEW WEAPON';
      }
      return `Lv ${currentLevel} → ${currentLevel + 1}`;
    }

    // Non-percentage stats
    if (stat === 'maxHP' || stat === 'hpRegen' || stat === 'magnetRange' || stat === 'invincibilityDuration') {
      const sign = value > 0 ? '+' : '';
      const unit = stat === 'hpRegen' ? ' HP/s' :
                   stat === 'invincibilityDuration' ? 'ms' :
                   stat === 'magnetRange' ? 'px' : ' HP';
      return `${sign}${value}${unit}`;
    }

    // Count-based stats
    if (stat === 'pierce' || stat === 'projectiles' || stat === 'chainCount') {
      return `+${value}`;
    }

    // AOE radius
    if (stat === 'aoeRadius') {
      return `+${value}px AOE`;
    }

    // Percentage stats
    const percent = Math.round(value * 100);
    const sign = value > 0 ? '+' : '';
    const statName = stat.replace(/([A-Z])/g, ' $1').trim().toLowerCase();
    return `${sign}${percent}% ${statName}`;
  }

  private selectUpgrade(upgrade: Upgrade): void {
    // Apply upgrade (include weaponId for weapon upgrades)
    this.gameScene.applyUpgrade({
      stat: upgrade.stat,
      value: upgrade.value,
      weaponId: upgrade.weaponId,
    });

    // Flash effect based on tier (weapons get special color)
    const flashColor = upgrade.weaponId ? [255, 68, 102] :
                       upgrade.tier === 3 ? [255, 170, 0] :
                       upgrade.tier === 2 ? [100, 100, 255] : [0, 255, 136];
    this.cameras.main.flash(200, flashColor[0], flashColor[1], flashColor[2]);

    // Resume game
    this.scene.stop();
    this.scene.resume('GameScene');
  }
}

import Phaser from 'phaser';
import { Weapon } from './Weapon';
import { GameScene } from '../scenes/GameScene';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { DEPTH } from '../config/constants';

export class InterpreterBeam extends Weapon {
  constructor(scene: GameScene, player: Player) {
    super(scene, player, 'INTERPRETER_BEAM');
  }

  attack(): void {
    const target = this.findClosestEnemy(this.getRange());
    if (!target) return;

    let baseDamage = this.getDamage();

    // Critical hit check
    const isCrit = Math.random() < this.player.critChance;
    if (isCrit) {
      baseDamage *= 2;
    }

    // Collect enemies to hit (pierce + chain)
    const enemiesToHit: Enemy[] = [target];
    const hitEnemies = new Set<Enemy>([target]);

    // Pierce: hit enemies in a line
    const pierce = (this.stats.pierce || 0) + this.player.pierce;
    if (pierce > 0) {
      const angle = Phaser.Math.Angle.Between(
        this.player.sprite.x, this.player.sprite.y,
        target.sprite.x, target.sprite.y
      );

      this.scene.enemies.getChildren().forEach((obj) => {
        if (enemiesToHit.length > pierce + 1) return;
        const enemy = (obj as Phaser.GameObjects.Sprite).getData('ref') as Enemy;
        if (enemy && enemy !== target && enemy.sprite.active && !hitEnemies.has(enemy)) {
          const enemyAngle = Phaser.Math.Angle.Between(
            this.player.sprite.x, this.player.sprite.y,
            enemy.sprite.x, enemy.sprite.y
          );
          if (Math.abs(Phaser.Math.Angle.Wrap(enemyAngle - angle)) < 0.3) {
            enemiesToHit.push(enemy);
            hitEnemies.add(enemy);
          }
        }
      });
    }

    // Chain: add nearby enemies (from player stats)
    if (this.player.chainCount > 0 && enemiesToHit.length > 0) {
      let lastEnemy = enemiesToHit[enemiesToHit.length - 1];
      for (let i = 0; i < this.player.chainCount; i++) {
        let closestDist = 150;
        let closestEnemy: Enemy | null = null;

        this.scene.enemies.getChildren().forEach((obj) => {
          const enemy = (obj as Phaser.GameObjects.Sprite).getData('ref') as Enemy;
          if (enemy && enemy.sprite.active && !hitEnemies.has(enemy)) {
            const dist = Phaser.Math.Distance.Between(
              lastEnemy.sprite.x, lastEnemy.sprite.y,
              enemy.sprite.x, enemy.sprite.y
            );
            if (dist < closestDist) {
              closestDist = dist;
              closestEnemy = enemy;
            }
          }
        });

        if (closestEnemy) {
          enemiesToHit.push(closestEnemy);
          hitEnemies.add(closestEnemy);
          lastEnemy = closestEnemy;
        } else {
          break;
        }
      }
    }

    // Visual beam effect
    const beam = this.scene.add.graphics();
    beam.setDepth(DEPTH.PROJECTILES);

    const beamColor = isCrit ? 0xffff00 : this.stats.color;
    const beamWidth = isCrit ? 6 : 4;

    let prevX = this.player.sprite.x;
    let prevY = this.player.sprite.y;
    beam.lineStyle(beamWidth, beamColor, 0.8);

    enemiesToHit.forEach((enemy) => {
      beam.lineBetween(prevX, prevY, enemy.sprite.x, enemy.sprite.y);
      prevX = enemy.sprite.x;
      prevY = enemy.sprite.y;
    });

    // Deal damage to all enemies
    let totalDamageDealt = 0;
    enemiesToHit.forEach((enemy, index) => {
      const damageMultiplier = index === 0 ? 1 : 0.7;
      const finalDamage = baseDamage * damageMultiplier;
      totalDamageDealt += finalDamage;

      const killed = this.dealDamage(enemy, finalDamage, false);
      if (killed) {
        this.scene.spawnXPPublic(enemy.sprite.x, enemy.sprite.y, enemy.xpValue);
      }

      // AOE damage around target (from player stats)
      if (this.player.aoeRadius > 0) {
        this.dealAOEDamageExcluding(enemy.sprite.x, enemy.sprite.y, this.player.aoeRadius, baseDamage * 0.5, hitEnemies);
      }
    });

    // Lifesteal
    this.player.onDealDamage(totalDamageDealt);

    // Crit text
    if (isCrit) {
      this.showCritText(target.sprite.x, target.sprite.y);
    }

    // Fade out beam
    this.scene.tweens.add({
      targets: beam,
      alpha: 0,
      duration: 100,
      onComplete: () => beam.destroy(),
    });
  }

  private showCritText(x: number, y: number): void {
    const critText = this.scene.add.text(x, y - 20, 'CRIT!', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 2,
    });
    critText.setOrigin(0.5);
    critText.setDepth(DEPTH.EFFECTS);
    this.scene.tweens.add({
      targets: critText,
      y: critText.y - 30,
      alpha: 0,
      scale: 1.5,
      duration: 400,
      onComplete: () => critText.destroy(),
    });
  }

  private dealAOEDamageExcluding(x: number, y: number, radius: number, damage: number, exclude: Set<Enemy>): void {
    this.scene.enemies.getChildren().forEach((obj) => {
      const enemy = (obj as Phaser.GameObjects.Sprite).getData('ref') as Enemy;
      if (enemy && enemy.sprite.active && !exclude.has(enemy)) {
        const dist = Phaser.Math.Distance.Between(x, y, enemy.sprite.x, enemy.sprite.y);
        if (dist <= radius) {
          const killed = enemy.takeDamage(damage);
          if (killed) {
            this.scene.spawnXPPublic(enemy.sprite.x, enemy.sprite.y, enemy.xpValue);
          }
        }
      }
    });
  }
}

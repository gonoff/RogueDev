import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, UI, DEPTH, COLORS } from '../config/constants';
import { GameScene } from '../scenes/GameScene';

export class VirtualJoystick {
  scene: GameScene;
  container: Phaser.GameObjects.Container;

  private base: Phaser.GameObjects.Graphics;
  private knob: Phaser.GameObjects.Graphics;
  private baseX: number;
  private baseY: number;
  private knobX: number = 0;
  private knobY: number = 0;
  private isActive: boolean = false;
  private activePointer: Phaser.Input.Pointer | null = null;

  // Direction output
  private directionX: number = 0;
  private directionY: number = 0;

  constructor(scene: GameScene) {
    this.scene = scene;

    // Position joystick in bottom-left for left thumb
    this.baseX = 100;
    this.baseY = GAME_HEIGHT - 150;

    // Create container (fixed to camera)
    this.container = scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.setDepth(DEPTH.JOYSTICK);

    // Create base (outer ring)
    this.base = scene.add.graphics();
    this.drawBase(1);
    this.container.add(this.base);

    // Create knob (inner circle)
    this.knob = scene.add.graphics();
    this.drawKnob(this.baseX, this.baseY);
    this.container.add(this.knob);

    // Setup input
    this.setupInput();
  }

  private drawBase(alpha: number): void {
    this.base.clear();

    // Outer ring
    this.base.fillStyle(COLORS.JOYSTICK_BG, alpha * 0.5);
    this.base.fillCircle(this.baseX, this.baseY, UI.JOYSTICK_RADIUS);

    // Border
    this.base.lineStyle(2, COLORS.JOYSTICK_KNOB, alpha * 0.5);
    this.base.strokeCircle(this.baseX, this.baseY, UI.JOYSTICK_RADIUS);
  }

  private drawKnob(x: number, y: number): void {
    this.knob.clear();
    this.knob.fillStyle(COLORS.JOYSTICK_KNOB, 0.8);
    this.knob.fillCircle(x, y, UI.JOYSTICK_INNER_RADIUS);
    this.knob.lineStyle(2, 0xaaaaaa, 0.8);
    this.knob.strokeCircle(x, y, UI.JOYSTICK_INNER_RADIUS);
  }

  private setupInput(): void {
    // Handle touch/mouse on entire scene
    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // Only activate if touch is in the left half of screen (for left thumb)
      if (pointer.x < GAME_WIDTH * 0.6 && !this.isActive) {
        this.activate(pointer);
      }
    });

    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isActive && pointer === this.activePointer) {
        this.updateKnobPosition(pointer.x, pointer.y);
      }
    });

    this.scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (pointer === this.activePointer) {
        this.deactivate();
      }
    });

    // Also support keyboard for desktop testing
    const cursors = this.scene.input.keyboard?.createCursorKeys();
    const wasd = this.scene.input.keyboard?.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    }) as { up: Phaser.Input.Keyboard.Key; down: Phaser.Input.Keyboard.Key; left: Phaser.Input.Keyboard.Key; right: Phaser.Input.Keyboard.Key };

    this.scene.events.on('update', () => {
      // Only use keyboard if joystick isn't active
      if (!this.isActive && cursors) {
        let kx = 0;
        let ky = 0;

        if (cursors.left.isDown || wasd?.left.isDown) kx = -1;
        if (cursors.right.isDown || wasd?.right.isDown) kx = 1;
        if (cursors.up.isDown || wasd?.up.isDown) ky = -1;
        if (cursors.down.isDown || wasd?.down.isDown) ky = 1;

        if (kx !== 0 || ky !== 0) {
          this.directionX = kx;
          this.directionY = ky;
        }
      }
    });
  }

  private activate(pointer: Phaser.Input.Pointer): void {
    this.isActive = true;
    this.activePointer = pointer;
    this.drawBase(1);
    this.updateKnobPosition(pointer.x, pointer.y);
  }

  private deactivate(): void {
    this.isActive = false;
    this.activePointer = null;
    this.directionX = 0;
    this.directionY = 0;

    // Return knob to center
    this.drawKnob(this.baseX, this.baseY);
    this.drawBase(0.5);
  }

  private updateKnobPosition(pointerX: number, pointerY: number): void {
    // Calculate distance from base center
    const dx = pointerX - this.baseX;
    const dy = pointerY - this.baseY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Clamp to joystick radius
    const maxDist = UI.JOYSTICK_RADIUS - UI.JOYSTICK_INNER_RADIUS;

    if (distance > maxDist) {
      const angle = Math.atan2(dy, dx);
      this.knobX = this.baseX + Math.cos(angle) * maxDist;
      this.knobY = this.baseY + Math.sin(angle) * maxDist;
    } else {
      this.knobX = pointerX;
      this.knobY = pointerY;
    }

    // Draw knob at new position
    this.drawKnob(this.knobX, this.knobY);

    // Calculate direction (-1 to 1)
    if (distance > UI.JOYSTICK_DEADZONE) {
      this.directionX = (this.knobX - this.baseX) / maxDist;
      this.directionY = (this.knobY - this.baseY) / maxDist;
    } else {
      this.directionX = 0;
      this.directionY = 0;
    }
  }

  getDirection(): { x: number; y: number } {
    return {
      x: this.directionX,
      y: this.directionY,
    };
  }

  destroy(): void {
    this.container.destroy();
  }
}

// Export all weapon classes and data
export { Weapon } from './Weapon';
export { InterpreterBeam } from './InterpreterBeam';
export { StackOverflow } from './StackOverflow';
export { GarbageCollector } from './GarbageCollector';
export { ForkBomb } from './ForkBomb';
export { Segfault } from './Segfault';

export {
  WEAPON_DEFINITIONS,
  getWeaponStats,
  getAllWeaponIds,
  type WeaponDefinition,
  type WeaponLevelBonus,
} from './weapons.data';

import { GameScene } from '../scenes/GameScene';
import { Player } from '../entities/Player';
import { Weapon } from './Weapon';
import { InterpreterBeam } from './InterpreterBeam';
import { StackOverflow } from './StackOverflow';
import { GarbageCollector } from './GarbageCollector';
import { ForkBomb } from './ForkBomb';
import { Segfault } from './Segfault';

// Factory function to create weapons by ID
export function createWeapon(scene: GameScene, player: Player, weaponId: string): Weapon {
  switch (weaponId) {
    case 'INTERPRETER_BEAM':
      return new InterpreterBeam(scene, player);
    case 'STACK_OVERFLOW':
      return new StackOverflow(scene, player);
    case 'GARBAGE_COLLECTOR':
      return new GarbageCollector(scene, player);
    case 'FORK_BOMB':
      return new ForkBomb(scene, player);
    case 'SEGFAULT':
      return new Segfault(scene, player);
    default:
      throw new Error(`Unknown weapon: ${weaponId}`);
  }
}

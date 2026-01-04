// Weapon definitions and level progression

export interface WeaponLevelBonus {
  damage?: number;
  attackSpeed?: number;
  range?: number;
  pierce?: number;
  projectiles?: number;
  aoeRadius?: number;
  chainCount?: number;
  orbitCount?: number;
  orbitRadius?: number;
  knockback?: number;
}

export interface WeaponDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'beam' | 'aoe' | 'orbit' | 'projectile' | 'chain';
  baseDamage: number;
  baseAttackSpeed: number; // attacks per second
  baseRange: number;
  color: number;
  maxLevel: number;
  // Level bonuses (index 0 = level 2, index 1 = level 3, etc.)
  levelBonuses: WeaponLevelBonus[];
  // Type-specific properties
  pierce?: number;
  projectiles?: number;
  aoeRadius?: number;
  chainCount?: number;
  chainFalloff?: number;
  orbitCount?: number;
  orbitRadius?: number;
  projectileSpeed?: number;
  knockback?: number;
}

export const WEAPON_DEFINITIONS: Record<string, WeaponDefinition> = {
  INTERPRETER_BEAM: {
    id: 'INTERPRETER_BEAM',
    name: 'Interpreter Beam',
    description: 'Auto-targeting beam that parses enemies',
    icon: '>>',
    type: 'beam',
    baseDamage: 8,
    baseAttackSpeed: 6,
    baseRange: 150,
    color: 0x00ffff,
    maxLevel: 5,
    pierce: 0,
    levelBonuses: [
      { damage: 3, range: 20 },           // Level 2
      { damage: 4, pierce: 1 },            // Level 3
      { damage: 5, attackSpeed: 1 },       // Level 4
      { damage: 8, pierce: 2, range: 30 }, // Level 5
    ],
  },

  STACK_OVERFLOW: {
    id: 'STACK_OVERFLOW',
    name: 'Stack Overflow',
    description: 'Explosive AOE that crashes nearby enemies',
    icon: '!!',
    type: 'aoe',
    baseDamage: 15,
    baseAttackSpeed: 1.5,
    baseRange: 0, // AOE uses aoeRadius instead
    color: 0xff6600,
    maxLevel: 5,
    aoeRadius: 80,
    knockback: 100,
    levelBonuses: [
      { damage: 5, aoeRadius: 15 },                   // Level 2
      { damage: 8, knockback: 50 },                   // Level 3
      { damage: 10, aoeRadius: 20, attackSpeed: 0.3 }, // Level 4
      { damage: 15, aoeRadius: 30, knockback: 100 },  // Level 5
    ],
  },

  GARBAGE_COLLECTOR: {
    id: 'GARBAGE_COLLECTOR',
    name: 'Garbage Collector',
    description: 'Orbiting projectiles that clean up bugs',
    icon: 'GC',
    type: 'orbit',
    baseDamage: 5,
    baseAttackSpeed: 0, // Continuous damage
    baseRange: 0,
    color: 0x44ff44,
    maxLevel: 5,
    orbitCount: 3,
    orbitRadius: 60,
    levelBonuses: [
      { damage: 2, orbitCount: 1 },                     // Level 2
      { damage: 3, orbitRadius: 15 },                   // Level 3
      { damage: 4, orbitCount: 2 },                     // Level 4
      { damage: 6, orbitCount: 2, orbitRadius: 20 },    // Level 5
    ],
  },

  FORK_BOMB: {
    id: 'FORK_BOMB',
    name: 'Fork Bomb',
    description: 'Fires spreading projectiles that multiply',
    icon: ':()',
    type: 'projectile',
    baseDamage: 6,
    baseAttackSpeed: 2,
    baseRange: 200,
    color: 0xffff00,
    maxLevel: 5,
    projectiles: 3,
    projectileSpeed: 300,
    levelBonuses: [
      { damage: 2, projectiles: 1 },                    // Level 2
      { damage: 3, range: 30 },                         // Level 3
      { damage: 4, projectiles: 2, attackSpeed: 0.3 },  // Level 4
      { damage: 6, projectiles: 2, range: 50 },         // Level 5
    ],
  },

  SEGFAULT: {
    id: 'SEGFAULT',
    name: 'Segfault',
    description: 'Lightning that chains between enemies',
    icon: 'zZ',
    type: 'chain',
    baseDamage: 10,
    baseAttackSpeed: 2,
    baseRange: 180,
    color: 0x8888ff,
    maxLevel: 5,
    chainCount: 3,
    chainFalloff: 0.7, // 70% damage per chain
    levelBonuses: [
      { damage: 3, chainCount: 1 },                     // Level 2
      { damage: 4, range: 25 },                         // Level 3
      { damage: 6, chainCount: 2, attackSpeed: 0.3 },   // Level 4
      { damage: 10, chainCount: 2, range: 40 },         // Level 5
    ],
  },
};

// Helper to get weapon stats at a specific level
export function getWeaponStats(weaponId: string, level: number): WeaponDefinition & WeaponLevelBonus {
  const base = WEAPON_DEFINITIONS[weaponId];
  if (!base) throw new Error(`Unknown weapon: ${weaponId}`);

  // Start with base stats
  const stats: WeaponDefinition & WeaponLevelBonus = { ...base };

  // Apply level bonuses
  for (let i = 0; i < level - 1 && i < base.levelBonuses.length; i++) {
    const bonus = base.levelBonuses[i];
    if (bonus.damage) stats.baseDamage += bonus.damage;
    if (bonus.attackSpeed) stats.baseAttackSpeed += bonus.attackSpeed;
    if (bonus.range) stats.baseRange += bonus.range;
    if (bonus.pierce) stats.pierce = (stats.pierce || 0) + bonus.pierce;
    if (bonus.projectiles) stats.projectiles = (stats.projectiles || 0) + bonus.projectiles;
    if (bonus.aoeRadius) stats.aoeRadius = (stats.aoeRadius || 0) + bonus.aoeRadius;
    if (bonus.chainCount) stats.chainCount = (stats.chainCount || 0) + bonus.chainCount;
    if (bonus.orbitCount) stats.orbitCount = (stats.orbitCount || 0) + bonus.orbitCount;
    if (bonus.orbitRadius) stats.orbitRadius = (stats.orbitRadius || 0) + bonus.orbitRadius;
    if (bonus.knockback) stats.knockback = (stats.knockback || 0) + bonus.knockback;
  }

  return stats;
}

// Get all weapon IDs
export function getAllWeaponIds(): string[] {
  return Object.keys(WEAPON_DEFINITIONS);
}

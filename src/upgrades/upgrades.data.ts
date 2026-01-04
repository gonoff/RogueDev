export interface Upgrade {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'paradigm' | 'optimization' | 'tooling' | 'defense' | 'weapon';
  stat: string;
  value: number;
  tier: 1 | 2 | 3; // Higher tiers appear at higher levels
  stackable?: boolean; // Can be picked multiple times
  weaponId?: string; // For weapon upgrades - the weapon ID to add/level up
}

// Tier 1: Available from start (levels 1-5)
// Tier 2: Available from level 6+
// Tier 3: Available from level 10+ (powerful)

export const UPGRADES: Upgrade[] = [
  // ============ TIER 1 - BASIC UPGRADES ============

  // Damage upgrades
  {
    id: 'damage_1',
    name: 'Sharper Code',
    description: 'Cleaner syntax hits harder',
    icon: '///',
    category: 'optimization',
    stat: 'damage',
    value: 0.12,
    tier: 1,
    stackable: true,
  },
  {
    id: 'speed_1',
    name: 'Async Movement',
    description: 'Non-blocking locomotion',
    icon: '>>',
    category: 'paradigm',
    stat: 'speed',
    value: 0.12,
    tier: 1,
    stackable: true,
  },
  {
    id: 'attack_speed_1',
    name: 'Hot Reload',
    description: 'Faster execution cycles',
    icon: '~',
    category: 'optimization',
    stat: 'attackSpeed',
    value: 0.15,
    tier: 1,
    stackable: true,
  },
  {
    id: 'hp_1',
    name: 'Error Handling',
    description: 'Try-catch for your life',
    icon: '{}',
    category: 'defense',
    stat: 'maxHP',
    value: 15,
    tier: 1,
    stackable: true,
  },
  {
    id: 'range_1',
    name: 'Long Range Import',
    description: 'Reach distant modules',
    icon: '=>',
    category: 'tooling',
    stat: 'range',
    value: 0.15,
    tier: 1,
    stackable: true,
  },
  {
    id: 'xp_1',
    name: 'Learning Rate',
    description: 'Absorb knowledge faster',
    icon: '++',
    category: 'optimization',
    stat: 'xpGain',
    value: 0.12,
    tier: 1,
    stackable: true,
  },

  // ============ WEAPON UPGRADES ============
  // These add new weapons or level up existing ones

  {
    id: 'weapon_stack_overflow',
    name: 'Stack Overflow',
    description: 'AOE explosion around you',
    icon: '!!',
    category: 'weapon',
    stat: 'weapon',
    value: 0,
    tier: 1,
    weaponId: 'STACK_OVERFLOW',
  },
  {
    id: 'weapon_garbage_collector',
    name: 'Garbage Collector',
    description: 'Orbiting projectiles clean up bugs',
    icon: 'GC',
    category: 'weapon',
    stat: 'weapon',
    value: 0,
    tier: 1,
    weaponId: 'GARBAGE_COLLECTOR',
  },
  {
    id: 'weapon_fork_bomb',
    name: 'Fork Bomb',
    description: 'Spread projectiles that multiply',
    icon: ':()',
    category: 'weapon',
    stat: 'weapon',
    value: 0,
    tier: 1,
    weaponId: 'FORK_BOMB',
  },
  {
    id: 'weapon_segfault',
    name: 'Segfault',
    description: 'Chain lightning between enemies',
    icon: 'zZ',
    category: 'weapon',
    stat: 'weapon',
    value: 0,
    tier: 1,
    weaponId: 'SEGFAULT',
  },

  // ============ TIER 2 - INTERMEDIATE UPGRADES ============

  // Stronger versions
  {
    id: 'damage_2',
    name: 'Optimized Build',
    description: 'Production-ready damage',
    icon: '-O3',
    category: 'optimization',
    stat: 'damage',
    value: 0.25,
    tier: 2,
    stackable: true,
  },
  {
    id: 'attack_speed_2',
    name: 'JIT Compiler',
    description: 'Just-in-time attacks',
    icon: 'JIT',
    category: 'optimization',
    stat: 'attackSpeed',
    value: 0.25,
    tier: 2,
    stackable: true,
  },

  // Defensive upgrades
  {
    id: 'regen_1',
    name: 'Garbage Collector',
    description: 'Slowly recover HP over time',
    icon: 'GC',
    category: 'defense',
    stat: 'hpRegen',
    value: 2, // HP per second
    tier: 2,
    stackable: true,
  },
  {
    id: 'armor_1',
    name: 'Type Safety',
    description: 'Reduce incoming damage',
    icon: 'TS',
    category: 'defense',
    stat: 'armor',
    value: 0.1, // 10% damage reduction
    tier: 2,
    stackable: true,
  },
  {
    id: 'lifesteal_1',
    name: 'Memory Recycling',
    description: 'Heal when dealing damage',
    icon: '<>',
    category: 'defense',
    stat: 'lifesteal',
    value: 0.05, // 5% of damage dealt
    tier: 2,
    stackable: true,
  },

  // Weapon upgrades
  {
    id: 'pierce_1',
    name: 'Pointer Reference',
    description: 'Attacks pierce through enemies',
    icon: '*p',
    category: 'weapon',
    stat: 'pierce',
    value: 1, // Pierce 1 additional enemy
    tier: 2,
    stackable: true,
  },
  {
    id: 'projectiles_1',
    name: 'Array Spread',
    description: 'Fire additional projectiles',
    icon: '[]',
    category: 'weapon',
    stat: 'projectiles',
    value: 1, // +1 projectile
    tier: 2,
    stackable: true,
  },
  {
    id: 'aoe_1',
    name: 'Broadcast Event',
    description: 'Attacks hit nearby enemies',
    icon: '@',
    category: 'weapon',
    stat: 'aoeRadius',
    value: 30, // 30px splash radius
    tier: 2,
    stackable: true,
  },

  // ============ TIER 3 - POWERFUL UPGRADES ============

  {
    id: 'damage_3',
    name: 'Root Access',
    description: 'Devastating system-level damage',
    icon: '#!',
    category: 'paradigm',
    stat: 'damage',
    value: 0.5,
    tier: 3,
    stackable: true,
  },
  {
    id: 'multithreading',
    name: 'Multithreading',
    description: 'Double your attack speed',
    icon: '||',
    category: 'paradigm',
    stat: 'attackSpeed',
    value: 0.5,
    tier: 3,
  },
  {
    id: 'regen_2',
    name: 'Auto-Scaling',
    description: 'Powerful HP regeneration',
    icon: 'K8',
    category: 'defense',
    stat: 'hpRegen',
    value: 5, // HP per second
    tier: 3,
    stackable: true,
  },
  {
    id: 'armor_2',
    name: 'Firewall',
    description: 'Major damage reduction',
    icon: '|||',
    category: 'defense',
    stat: 'armor',
    value: 0.2, // 20% damage reduction
    tier: 3,
  },
  {
    id: 'lifesteal_2',
    name: 'Dependency Injection',
    description: 'Strong lifesteal effect',
    icon: 'DI',
    category: 'defense',
    stat: 'lifesteal',
    value: 0.12, // 12% of damage dealt
    tier: 3,
  },
  {
    id: 'chain_lightning',
    name: 'Event Propagation',
    description: 'Attacks chain to nearby enemies',
    icon: '~>',
    category: 'weapon',
    stat: 'chainCount',
    value: 3, // Chain to 3 enemies
    tier: 3,
  },
  {
    id: 'explosion',
    name: 'Stack Overflow',
    description: 'Enemies explode on death',
    icon: '!!!',
    category: 'weapon',
    stat: 'explosionDamage',
    value: 0.5, // 50% of enemy HP as explosion
    tier: 3,
  },
  {
    id: 'critical',
    name: 'Race Condition',
    description: 'Chance for double damage',
    icon: 'x2',
    category: 'optimization',
    stat: 'critChance',
    value: 0.2, // 20% crit chance
    tier: 3,
    stackable: true,
  },
  {
    id: 'magnet',
    name: 'Global Scope',
    description: 'Massively increased XP pickup range',
    icon: '$',
    category: 'tooling',
    stat: 'magnetRange',
    value: 100, // +100px magnet range
    tier: 3,
    stackable: true,
  },
  {
    id: 'invincibility',
    name: 'Exception Handler',
    description: 'Longer invincibility after damage',
    icon: '!e',
    category: 'defense',
    stat: 'invincibilityDuration',
    value: 500, // +500ms invincibility
    tier: 3,
    stackable: true,
  },
];

// Helper to get upgrades by tier
export function getUpgradesByTier(tier: 1 | 2 | 3): Upgrade[] {
  return UPGRADES.filter(u => u.tier === tier);
}

// Get available upgrades based on player level
export function getAvailableUpgrades(level: number): Upgrade[] {
  if (level >= 10) {
    return UPGRADES; // All tiers
  } else if (level >= 6) {
    return UPGRADES.filter(u => u.tier <= 2);
  }
  return UPGRADES.filter(u => u.tier === 1);
}

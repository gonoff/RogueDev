// Game dimensions (portrait mode for mobile)
export const GAME_WIDTH = 390;
export const GAME_HEIGHT = 844;

// World/Arena size (larger than viewport for scrolling)
export const WORLD_WIDTH = 2000;
export const WORLD_HEIGHT = 2000;

// Player constants
export const PLAYER = {
  BASE_HP: 100,
  BASE_SPEED: 180, // Faster to kite enemies
  BASE_DAMAGE: 10,
  BASE_ATTACK_SPEED: 1.0, // attacks per second
  COLLISION_RADIUS: 16,
  INVINCIBILITY_DURATION: 1000, // ms after taking damage (more forgiving)
} as const;

// Enemy constants
export const ENEMIES = {
  NULL_POINTER: {
    name: 'Null Pointer',
    hp: 12, // Reduced: dies in 2-3 hits
    damage: 5, // Reduced: 5% HP per hit instead of 10%
    speed: 50, // Slightly slower
    xpValue: 1,
    color: 0xff4444,
    radius: 12,
  },
  RACE_CONDITION: {
    name: 'Race Condition',
    hp: 6, // Reduced
    damage: 3, // Reduced
    speed: 120, // Slightly slower
    xpValue: 2,
    color: 0xffff44,
    radius: 8,
  },
  MEMORY_LEAK: {
    name: 'Memory Leak',
    hp: 50, // Reduced
    damage: 8, // Reduced
    speed: 35,
    xpValue: 5,
    color: 0x44ff44,
    radius: 20,
  },
} as const;

// Spawning constants
export const SPAWNING = {
  INITIAL_SPAWN_RATE: 2500, // ms between spawns (slower start)
  MIN_SPAWN_RATE: 600, // minimum ms between spawns (raised to prevent overwhelming)
  SPAWN_RATE_DECREASE: 20, // ms decrease per minute (slower ramp)
  SPAWN_DISTANCE: 350, // distance from player to spawn
  MAX_ENEMIES: 200, // Reduced max enemies for performance and balance
  INITIAL_ENEMIES_PER_SPAWN: 1,
  ENEMIES_PER_SPAWN_INCREASE: 0.05, // increase per minute (slower ramp)
  MAX_ENEMIES_PER_SPAWN: 4, // Cap on enemies per spawn
  // Enemy HP scaling (so upgrades feel meaningful)
  HP_SCALE_PER_MINUTE: 0.08, // 8% HP increase per minute
  MAX_HP_SCALE: 2.5, // Cap at 2.5x base HP
} as const;

// XP and leveling
export const PROGRESSION = {
  BASE_XP_TO_LEVEL: 8, // Faster early leveling
  XP_SCALING: 1.25, // multiplier per level
  XP_PICKUP_RADIUS: 60,
  XP_MAGNET_RADIUS: 150, // larger magnet radius for safety
  XP_ORB_SPEED: 350, // faster attraction
} as const;

// Boss constants
export const BOSS = {
  SPAWN_INTERVAL: 180000, // 3 minutes in ms
  INFINITE_LOOP: {
    name: 'Infinite Loop',
    hp: 500,
    damage: 25,
    speed: 50,
    radius: 48,
    color: 0xff00ff,
  },
} as const;

// UI constants
export const UI = {
  JOYSTICK_RADIUS: 60,
  JOYSTICK_INNER_RADIUS: 25,
  JOYSTICK_DEADZONE: 10,
  HUD_PADDING: 16,
  HP_BAR_WIDTH: 200,
  HP_BAR_HEIGHT: 16,
  XP_BAR_HEIGHT: 8,
} as const;

// Colors
export const COLORS = {
  BACKGROUND: 0x0a0a0a,
  PLAYER: 0x00aaff,
  XP_ORB: 0x00ff88,
  HP_BAR_BG: 0x333333,
  HP_BAR_FILL: 0x44ff44,
  HP_BAR_DAMAGE: 0xff4444,
  XP_BAR_BG: 0x222222,
  XP_BAR_FILL: 0x00ff88,
  JOYSTICK_BG: 0x222222,
  JOYSTICK_KNOB: 0x666666,
  TEXT: 0xffffff,
  TEXT_SHADOW: 0x000000,
} as const;

// Weapon constants
export const WEAPONS = {
  INTERPRETER_BEAM: {
    name: 'Interpreter Beam',
    damage: 8, // Increased: kills basic enemy in 2 hits
    range: 150, // Increased: engage enemies earlier
    width: 30,
    attackSpeed: 6, // Slightly faster attacks
    color: 0x00ffff,
  },
} as const;

// Depth layers for rendering order
export const DEPTH = {
  BACKGROUND: 0,
  XP_ORBS: 10,
  ENEMIES: 20,
  PLAYER: 30,
  PROJECTILES: 40,
  EFFECTS: 50,
  UI: 100,
  JOYSTICK: 110,
  OVERLAY: 200,
} as const;

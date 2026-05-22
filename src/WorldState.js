/**
 * Generates a random alphanumeric seed string for procedural generation.
 * Example output: "ATH-7A9F3X"
 */
function generateRandomSeedString() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excludes confusing tokens like O, 0, I, 1
    let segment = '';
    for (let i = 0; i < 6; i++) {
        segment += chars[Math.floor(Math.random() * chars.length)];
    }
    return `ATH-${segment}`;
}

/**
 * Master World State Tree
 * Exported as a constant module to ensure structural assignment protection.
 */
export const worldState = {
    clock: {
        tick: 0,
        day: 1,
        timeOfDay: 0.2, // Starts mid-morning
        cycleSpeed: 0.0002 // Slow, natural progression pacing
    },
    session: {
        seed: generateRandomSeedString(), // Auto-generates once on engine ignition
        discoveredPercent: 0
    },
    grid: {
        width: 100, // 100x100 tile space map
        height: 100,
        tiles: {},  // Populated procedurally by MapGen.js
        fog: {}     // Managed by EngineLogic.js visibility sweeps
    },
    entities: {
        player: {
            x: 1600.0, y: 1600.0, // Instanced dead center of the 3168px grid map
            vx: 0, vy: 0,
            width: 32, height: 48,
            speed: 4.5,
            reach: 90, // Range threshold for mining strikes
            inventory: { stone: 0 }
        },
        camera: { x: 1600.0, y: 1600.0 },
        droppedItems: [], // Tracks floating, magnetic loot nodes
        particles: []     // Tracks temporary physics-active visual mining chips
    }
};
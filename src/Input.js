// --- 1. MODULE IMPORTS ---
import { worldState } from './WorldState.js';

// --- 2. EXPORTED STATE FOR ENGINELOGIC ---
export const inputState = {
    keys: {},
    mouse: { worldX: 0, worldY: 0 }
};

// --- 3. GLOBAL BINDINGS ---
window.addEventListener('keydown', (e) => inputState.keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', (e) => inputState.keys[e.key.toLowerCase()] = false);

// Track global screen-to-world cursor modifications
window.addEventListener('mousemove', (e) => {
    inputState.mouse.worldX = e.clientX + worldState.entities.camera.x;
    inputState.mouse.worldY = e.clientY + worldState.entities.camera.y;
});

// Click Handler Engine for harvesting tiles
window.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return; // Only process Left Clicks

    const player = worldState.entities.player;
    const clickWorldX = e.clientX + worldState.entities.camera.x;
    const clickWorldY = e.clientY + worldState.entities.camera.y;

    // Run distance vector radius formula checks
    const pCenterX = player.x + player.width / 2;
    const pCenterY = player.y + player.height / 2;
    const clickDistance = Math.sqrt(Math.pow(clickWorldX - pCenterX, 2) + Math.pow(clickWorldY - pCenterY, 2));

    if (clickDistance > player.reach) return; // Target out of reach

    // Convert coordinates to structural indices
    const gridX = Math.floor(clickWorldX / 32);
    const gridY = Math.floor(clickWorldY / 32);
    const tileKey = `x${gridX}_y${gridY}`;

    const tile = worldState.grid.tiles[tileKey];
    const fog = worldState.grid.fog[tileKey];

    // Verify tile target exists, is clear of fog, and is a mining rock wall
    if (tile && fog && !fog.hidden && tile.type === 'stone_wall') {
        
        // Subtract Durability points directly from state node
        tile.hp -= 20; // 5 clicks total to break a 100 HP block
        tile.lastHitTick = worldState.clock.tick;

        // Dynamically flag the structural breakdown stage matrix
        if (tile.hp <= 25) tile.crackStage = 3;
        else if (tile.hp <= 50) tile.crackStage = 2;
        else if (tile.hp <= 75) tile.crackStage = 1;

        // Spawn persistent chip particles
        spawnDebrisCloud(clickWorldX, clickWorldY, '#64748b', 4);

        // Check if tile is thoroughly broken
        if (tile.hp <= 0) {
            tile.type = 'plush_grass';
            tile.layer = 2;
            tile.hardness = 0;
            tile.crackStage = 0;

            // Large explosive debris particle burst
            spawnDebrisCloud(gridX * 32 + 16, gridY * 32 + 16, '#475569', 14);
            
            // Instantiate physical collectible item entities
            spawnCollectibleDrop(gridX * 32 + 16, gridY * 32 + 16);
        }
    }
});

// --- 4. INTERNAL UTILITY FUNCTIONS ---
function spawnDebrisCloud(worldX, worldY, color, count) {
    for (let i = 0; i < count; i++) {
        worldState.entities.particles.push({
            x: worldX, y: worldY,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5,
            size: Math.random() * 4 + 1.5,
            alpha: 1.0,
            color: color
        });
    }
}

function spawnCollectibleDrop(worldX, worldY) {
    worldState.entities.droppedItems.push({
        x: worldX, y: worldY,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                friction: 0.92,
                magnetActive: false
    });
}
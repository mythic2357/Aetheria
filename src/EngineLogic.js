// --- 1. MODULE IMPORTS ---
import { worldState } from './WorldState.js';
import { inputState } from './Input.js';

/**
 * Handles the absolute mathematical updates of the simulation.
 * Runs independently of graphics framerates.
 */
export function stepGameSimulation() {
    worldState.clock.tick++;
    
    // 1. ADVANCE DAY/NIGHT METRICS
    worldState.clock.timeOfDay += worldState.clock.cycleSpeed;
    if (worldState.clock.timeOfDay >= 1.0) {
        worldState.clock.timeOfDay = 0.0;
        worldState.clock.day++;
    }

    // Update the HTML HUD clock safely
    const rawHour = Math.floor(worldState.clock.timeOfDay * 24);
    const rawMinute = Math.floor((worldState.clock.timeOfDay * 24 % 1) * 60);
    const formatHour = String(rawHour).padStart(2, '0');
    const formatMin = String(rawMinute).padStart(2, '0');
    
    const clockEl = document.getElementById('ui-clock');
    if (clockEl) {
        clockEl.innerText = `Day ${worldState.clock.day}, ${formatHour}:${formatMin}`;
    }

    // 2. PLAYER DIRECTIONAL VECTOR TRANSLATION
    const player = worldState.entities.player;
    let dx = 0; let dy = 0;

    if (inputState.keys['w'] || inputState.keys['arrowup']) dy -= player.speed;
    if (inputState.keys['s'] || inputState.keys['arrowdown']) dy += player.speed;
    if (inputState.keys['a'] || inputState.keys['arrowleft']) dx -= player.speed;
    if (inputState.keys['d'] || inputState.keys['arrowright']) dx += player.speed;

    player.x += dx; player.y += dy;

    // 3. PHYSICAL MAP BOUNDARY CLAMPS
    const limitW = worldState.grid.width * 32;
    const limitH = worldState.grid.height * 32;
    player.x = Math.max(0, Math.min(player.x, limitW - player.width));
    player.y = Math.max(0, Math.min(player.y, limitH - player.height));

    // 4. FOG DISSOLVE SCAN RADIUS SWEEPS
    const pGridX = Math.floor((player.x + player.width / 2) / 32);
    const pGridY = Math.floor((player.y + player.height / 2) / 32);
    const sightRadius = 4;

    for (let rx = -sightRadius; rx <= sightRadius; rx++) {
        for (let ry = -sightRadius; ry <= sightRadius; ry++) {
            const checkX = pGridX + rx;
            const checkY = pGridY + ry;
            if (Math.sqrt(rx*rx + ry*ry) <= sightRadius) {
                const targetFog = worldState.grid.fog[`x${checkX}_y${checkY}`];
                if (targetFog) targetFog.hidden = false;
            }
        }
    }

    // 5. PARTICLES ARRAY DECAY AND CLEANUP
    const particles = worldState.entities.particles;
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        p.alpha -= 0.03;
        if (p.alpha <= 0) particles.splice(i, 1);
    }

    // 6. COLLECTIBLE ITEM LOOT MAGNET PHYSICS
    const items = worldState.entities.droppedItems;
    const pCenterX = player.x + player.width / 2;
    const pCenterY = player.y + player.height / 2;

    for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        const itemDistance = Math.sqrt(Math.pow(item.x - pCenterX, 2) + Math.pow(item.y - pCenterY, 2));

        if (itemDistance < 90) item.magnetActive = true;

        if (item.magnetActive) {
            const angle = Math.atan2(pCenterY - item.y, pCenterX - item.x);
            item.vx += Math.cos(angle) * 0.7;
            item.vy += Math.sin(angle) * 0.7;
            item.vx = Math.max(-8, Math.min(item.vx, 8));
            item.vy = Math.max(-8, Math.min(item.vy, 8));
        } else {
            item.vx *= item.friction;
            item.vy *= item.friction;
        }

        item.x += item.vx; item.y += item.vy;

        // Inventory collection collision strike check
        if (itemDistance < 16) {
            player.inventory.stone++;
            const stoneCountEl = document.getElementById('ui-stone-count');
            if (stoneCountEl) stoneCountEl.innerText = player.inventory.stone;
            items.splice(i, 1);
        }
    }

    // 7. CAMERA LERP CONVERGENCE SHIFTS (Optimized viewport reference)
    const camera = worldState.entities.camera;
    const canvas = document.getElementById('gameCanvas');
    const viewW = canvas ? canvas.width : window.innerWidth;
    const viewH = canvas ? canvas.height : window.innerHeight;

    const targetCamX = (player.x + player.width / 2) - (viewW / 2);
    const targetCamY = (player.y + player.height / 2) - (viewH / 2);
    
    camera.x += (targetCamX - camera.x) * 0.08;
    camera.y += (targetCamY - camera.y) * 0.08;
    camera.x = Math.max(0, Math.min(camera.x, limitW - viewW));
    camera.y = Math.max(0, Math.min(camera.y, limitH - viewH));

    // 8. UPDATE CARTOGRAPHY METRICS
    let total = worldState.grid.width * worldState.grid.height;
    let cleared = 0;
    for (let key in worldState.grid.fog) { if (!worldState.grid.fog[key].hidden) cleared++; }
    const discoveredEl = document.getElementById('ui-discovered');
    if (discoveredEl) discoveredEl.innerText = Math.floor((cleared / total) * 100);
}
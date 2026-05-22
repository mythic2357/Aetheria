// --- 1. MODULE IMPORTS ---
import { worldState } from './WorldState.js';

// --- 2. CANVAS RENDERING SETUP ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

// The color configuration mapping for tile visual signatures
const PALETTE = {
    'deep_water': '#1d4ed8', 
    'plush_grass': '#22c55e', 
    'stone_wall': '#64748b', 
    'fog': '#090d16'
};

/**
 * Interprets the central world state and handles the complete
 * 2D visual projection transformation steps onto the canvas viewport.
 */
export function renderGraphicsCore() {
    if (!canvas || !ctx) return; // Silent guard if DOM is still caching

    // Clear screen viewport matrix with space tone
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const camera = worldState.entities.camera;
    const player = worldState.entities.player;

    ctx.save();
    // Shift coordinate system inverse to camera perspective vector
    ctx.translate(-camera.x, -camera.y);

    // 1. FRUSTUM CULLING BOUNDS SYSTEM
    // Calculates and crops out rows/columns outside the user view frame to conserve frame rates
    const startCol = Math.max(0, Math.floor(camera.x / 32));
    const endCol = Math.min(worldState.grid.width - 1, startCol + Math.ceil(canvas.width / 32) + 1);
    const startRow = Math.max(0, Math.floor(camera.y / 32));
    const endRow = Math.min(worldState.grid.height - 1, startRow + Math.ceil(canvas.height / 32) + 1);

    for (let x = startCol; x <= endCol; x++) {
        for (let y = startRow; y <= endRow; y++) {
            const key = `x${x}_y${y}`;
            const tile = worldState.grid.tiles[key];
            const fog = worldState.grid.fog[key];

            if (!tile || !fog) continue;

            if (fog.hidden) {
                ctx.fillStyle = PALETTE['fog'];
                ctx.fillRect(x * 32, y * 32, 32, 32);
            } else {
                // Render flat background grid textures
                ctx.fillStyle = PALETTE[tile.type];
                ctx.fillRect(x * 32, y * 32, 32, 32);

                // Draw tile seam structures
                ctx.strokeStyle = 'rgba(255,255,255,0.03)';
                ctx.strokeRect(x * 32, y * 32, 32, 32);

                // 2. DRAW INTERACTIVE PROGRESSIVE DAMAGE CRACK OVERLAYS
                if (tile.crackStage > 0) {
                    ctx.strokeStyle = 'rgba(15, 23, 42, 0.65)'; // Deep charcoal
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    if (tile.crackStage >= 1) { // Primary structural fracture
                        ctx.moveTo(x*32 + 6, y*32 + 6); ctx.lineTo(x*32 + 26, y*32 + 26);
                    }
                    if (tile.crackStage >= 2) { // Secondary fracture crossing
                        ctx.moveTo(x*32 + 26, y*32 + 6); ctx.lineTo(x*32 + 6, y*32 + 26);
                    }
                    if (tile.crackStage >= 3) { // Complete shatter check
                        ctx.moveTo(x*32 + 16, y*32 + 2); ctx.lineTo(x*32 + 16, y*32 + 30);
                    }
                    ctx.stroke();
                    ctx.lineWidth = 1.0; // Reset canvas stroke weight context
                }
            }
        }
    }

    // 3. DRAW MAGNETIC COLLECTIBLE LOOT ITEMS
    const items = worldState.entities.droppedItems;
    for (let item of items) {
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(item.x - 4, item.y - 4, 8, 8);
        ctx.strokeStyle = '#cbd5e1';
        ctx.strokeRect(item.x - 4, item.y - 4, 8, 8);
    }

    // 4. DRAW PHYSICAL SMASH PARTICLES DEBRIS
    const particles = worldState.entities.particles;
    for (let p of particles) {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha; // Map opacity directly to particle age
        ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
    }
    ctx.globalAlpha = 1.0; // Force opacity restoration back to full baseline

    // 5. DRAW THE HERO CHARACTER
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Draw Attached Mining Mallet Accessory
    ctx.fillStyle = '#451a03'; // Wooden Handle
    ctx.fillRect(player.x + 14, player.y + 16, 4, 16);
    ctx.fillStyle = '#78350f'; // Iron block mallet head
    ctx.fillRect(player.x + 6, player.y + 10, 20, 7);

    ctx.restore();
}
// --- 1. MODULE IMPORTS ---
import { worldState } from './WorldState.js';

/**
 * A basic string-hashing algorithm to turn our alphanumeric seed 
 * into a consistent mathematical salt modifier.
 */
function getSeedSaltHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
}

/**
 * Generates the game map data structure directly into the World State tree.
 * Exported to be executed by main.js during initialization.
 */
export function generateAetherWorldGrid() {
    const hash = getSeedSaltHash(worldState.session.seed);
    const w = worldState.grid.width;
    const h = worldState.grid.height;

    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            const key = `x${x}_y${y}`;
            let type = 'plush_grass';
            let maxHp = 50;
            let hardness = 0;

            // Outer perimeter containment rings become deep ocean voids
            if (x < 6 || x > w - 7 || y < 6 || y > h - 7) {
                type = 'deep_water';
                maxHp = 9999;
                hardness = 999;
            } else {
                // Mixed trigonometric waves scaled using seed hash variations
                const waveA = Math.sin(x * 0.18 + hash) * Math.cos(y * 0.18 + hash);
                const waveB = Math.sin(x * 0.04) * Math.cos(y * 0.04);
                const evaluation = waveA + waveB * 0.6;

                if (evaluation > 0.48) {
                    type = 'stone_wall';
                    maxHp = 100;
                    hardness = 10;
                }
            }

            // Direct reference mutation injection
            worldState.grid.tiles[key] = {
                type, 
                layer: type === 'deep_water' ? 1 : 2,
                hp: maxHp, 
                maxHp, 
                hardness, 
                crackStage: 0, 
                lastHitTick: 0
            };
            
            worldState.grid.fog[key] = { 
                hidden: true, 
                alpha: 1.0 
            };
        }
    }
}
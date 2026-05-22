// --- 1. MODULE IMPORTS ---
import './Input.js';
import { worldState } from './WorldState.js';
import { generateAetherWorldGrid } from './MapGen.js';
import { stepGameSimulation } from './EngineLogic.js';
import { renderGraphicsCore } from './RenderCore.js';

// --- 2. ENGINE SUBSYSTEM INITIALIZATION ---
const canvas = document.getElementById('gameCanvas');

/**
 * Handles browser resizing to ensure the game viewport matches 
 * the monitor display resolution dynamically.
 */
function handleResize() {
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
}
window.addEventListener('resize', handleResize);
handleResize(); // Execute initial setup immediately

// --- 3. MASTER RUNTIME FRAME LOOP (Module 6 Core) ---
/**
 * Executes at your monitor's exact refresh rate (typically 60Hz - 144Hz+)
 */
function masterLoopRunner() {
    // Step A: Process all math updates, item tracking, and physics vectors
    stepGameSimulation();
    
    // Step B: Draw the fresh coordinate calculations onto the screen canvas
    renderGraphicsCore();
    
    // Step C: Request the next active screen refresh frame from the browser
    requestAnimationFrame(masterLoopRunner);
}

// --- 4. ENGINE START IGNITION ---
function startAetherEngine() {
    console.log("🚀 Powering up the Aether Modular Engine...");
    
    // 1. Generate the seeded procedural continent data matrix
    generateAetherWorldGrid();
    
    // 2. Ignite the continuous simulation loop
    requestAnimationFrame(masterLoopRunner);
}

// Kickstart the game universe
startAetherEngine();
import { grains } from './classes/grains.js';
import { Simulation } from './classes/simulation.js';
import { height, width, cell_size } from './utils/constants.js';
import { setupInputHandlers } from './input-handlers.js';
import { drawGrainMenu, drawMaterialPreview } from './rendering.js';

// Global variables that need to be shared
export let current_grain = 1;
export let running = false;
export let mousePos = { x: 0, y: 0 };

// Initialize
const mainSim = new Simulation(width, height, cell_size);
setupInputHandlers();

// Start the app
start();
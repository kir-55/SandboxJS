// main.js

// Global variables (already declared in other files, but ensure they exist)
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var cell_size = 10;
var normal_brush_size = 3;
var current_grain = 1;
var grainTypes = [];
var running = false;
var mousePos = { x: 0, y: 0 };
const unexistingGrain = 9999;
const height = 100;
const width = 100;
const pixelHeight = height * cell_size;
const pixelWidth = width * cell_size;

canvas.width = pixelWidth;
canvas.height = pixelHeight;



var screen = new Array(width).fill(0).map(() => new Array(height).fill(0));

// Call getGrainTypes to populate grainTypes (defined in grains.js)
getGrainTypes();

// Start the simulation
start();
drawGrainMenu();

// Update side panel
updateSideMenu();



// Remove the following line – it was causing an error:
// const mainSim = new Simulation(width, height, cell_size);

// All other functions (loop, gameLoop, handleMouse, etc.) are defined elsewhere.
// But we need to define loop and gameLoop here (or move them). I'll define them here:

function loop() {
    if (!running) return;
    gameLoop();
    requestAnimationFrame(loop);
}

function gameLoop() {
    runPhysics();
    drawStep();
}

function handleMouse() {
    if (mousePos.x < 0 || mousePos.y < 0) return;
    const pos = getLockedMousePos();
    placeBrush(pos.x, pos.y);
}

// Ensure placeBrush is defined (it's in simulation.js, but we need it globally)
// It should already be there.
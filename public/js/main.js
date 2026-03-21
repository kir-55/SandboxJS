// main.js

// Global variables (declared in other files, but ensure they exist)
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var cell_size = 10;
var normal_brush_size = 3;
var current_grain = 1;
var grainTypes = [];
var running = false;
var mousePos = { x: 0, y: 0 };
const unexistingGrain = 9999;

// Check for loaded world data
let width, height, screen;
if (window.loadedScreenData) {
    // Use the loaded world
    width = window.loadedWidth;
    height = window.loadedHeight;
    // Deep copy the 2D array
    screen = window.loadedScreenData.map(row => [...row]);
    // Clean up to free memory
    delete window.loadedScreenData;
    delete window.loadedWidth;
    delete window.loadedHeight;
} else {
    // Default empty world
    width = 100;
    height = 100;
    screen = new Array(width).fill(0).map(() => new Array(height).fill(0));
}

// Set canvas dimensions based on cell size and world size
const pixelHeight = height * cell_size;
const pixelWidth = width * cell_size;
canvas.width = pixelWidth;
canvas.height = pixelHeight;

// Call getGrainTypes to populate grainTypes (defined in grains.js)
getGrainTypes();

// Start the simulation
start();
drawGrainMenu();

// Update side panel
updateSideMenu();

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

// Note: runPhysics, drawStep, placeBrush, getLockedMousePos, start, etc.
// are defined in other included scripts (simulation.js, rendering.js, etc.)
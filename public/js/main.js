// main.js

// Global variables
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var cell_size = 10;
var normal_brush_size = 3;
var current_grain = 1;         // will be overwritten after grains load
var grainTypes = [];
var running = false;
var mousePos = { x: 0, y: 0 };
const unexistingGrain = 9999;

// Check for loaded world data
let width, height, screen;
if (window.loadedScreenData) {
    width = window.loadedWidth;
    height = window.loadedHeight;
    screen = window.loadedScreenData.map(row => [...row]);
    delete window.loadedScreenData;
    delete window.loadedWidth;
    delete window.loadedHeight;
} else {
    width = 100;
    height = 100;
    screen = new Array(width).fill(0).map(() => new Array(height).fill(0));
}

// Set canvas dimensions
const pixelHeight = height * cell_size;
const pixelWidth = width * cell_size;
canvas.width = pixelWidth;
canvas.height = pixelHeight;

// Load grain data (this is synchronous – it populates grainTypes immediately)
getGrainTypes();

// Wait for grains to be loaded, then initialize the simulation
function initializeUI() {
    if (grainTypes.length === 0) {
        setTimeout(initializeUI, 10);
        return;
    }
    // grains are ready
    current_grain = 1;          // first grain type (or whatever default)
    start();
    drawGrainMenu();
    setTimeout(() => drawMaterialPreview(), 100);
    updateSideMenu();
}
initializeUI();

// The rest of your functions (loop, gameLoop, handleMouse, etc.) remain unchanged.
// (Keep them as they were, just make sure they are below the initialization.)
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
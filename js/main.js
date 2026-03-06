import { grains } from './classes/grains.js';
import { Simulation } from './classes/simulation.js';
import { height, width, cell_size } from './utils/constants.js';
import { setupInputHandlers } from './input-handlers.js';
import { drawGrainMenu, drawMaterialPreview } from './rendering.js';
import {importFromFile, exportToFile} from './port.js';


var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var h = document.getElementById("height");
var w = document.getElementById("width");
var m = document.getElementById("mines_amount");

var cell_size = 8;
var normal_brush_size = 3;

var current_grain = 1;

grainTypes = [];

let running = false;

//gravity types
// 0 - no gravity
// 1 - full gravity
// 2 - gravity only down

var mousePos = {
	x: 0,
	y: 0,
};

const unexistingGrain = 9999;

const height = 100;
const width = 100;
const pixelHight = height * cell_size;
const pixelWidth = width * cell_size;

canvas.width = pixelHight;
canvas.height = pixelWidth;

var screen = new Array(height).fill(0).map(() => new Array(width).fill(0));

getGrainTypes();

start();

updateSideMenu();





// Initialize
const mainSim = new Simulation(width, height, cell_size);
setupInputHandlers();





// Remove any duplicate listeners first
const grainMenu = document.getElementById("grainMenu");
if (grainMenu) {
	grainMenu.replaceWith(grainMenu.cloneNode(true)); // Remove all listeners
	const newMenu = document.getElementById("grainMenu");
	newMenu.addEventListener("mousedown", handleGrainMenuSelect);
	newMenu.addEventListener("touchstart", handleGrainMenuSelect);
}

// Draw menu on load and when DOM is ready
window.addEventListener("DOMContentLoaded", drawGrainMenu);
window.addEventListener("DOMContentLoaded", drawMaterialPreview);

// drowking listeners
let lockedAxis = null; // "x" or "y"
let shiftPressed = false;
let dragStart = null;





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

// Start the app
start();
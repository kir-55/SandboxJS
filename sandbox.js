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

//mouse handling
var mouseInterval;
// Helper for both mouse and touch
function setPointerPos(x, y) {
	mousePos.x = x;
	mousePos.y = y;
}

function nextGrain() {
	if (current_grain < grainTypes.length) current_grain++;
	else current_grain = 0;
	drawMaterialPreview();
	drawGrainMenu();
}

function prevGrain() {
	if (current_grain > 0) current_grain--;
	else current_grain = grainTypes.length;
	drawMaterialPreview();
	drawGrainMenu();
}

function getCanvasCoords(event, canvas) {
	const rect = canvas.getBoundingClientRect();
	let clientX, clientY;
	if (event.touches && event.touches.length > 0) {
		clientX = event.touches[0].clientX;
		clientY = event.touches[0].clientY;
	} else {
		clientX = event.clientX;
		clientY = event.clientY;
	}
	// Scale to canvas coordinates
	const x = Math.floor((clientX - rect.left) * (canvas.width / rect.width));
	const y = Math.floor((clientY - rect.top) * (canvas.height / rect.height));
	return { x, y };
}

function exportToFile() {
	const data = {
		width: width,
		height: height,
		screen: screen,
	};

	const json = JSON.stringify(data);
	const blob = new Blob([json], { type: "application/json" });
	const url = URL.createObjectURL(blob);

	const a = document.createElement("a");
	a.href = url;
	a.download = "sandbox.sx";
	a.click();

	URL.revokeObjectURL(url);
}

function importFromFile() {
	const input = document.getElementById("fileInput");
	input.click();

	input.onchange = () => {
		const file = input.files[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const data = JSON.parse(e.target.result);

				// Basic validation
				if (!data.screen || !Array.isArray(data.screen)) {
					alert("Invalid file");
					return;
				}

				stop();

				screen = data.screen;

				start();
			} catch (err) {
				alert("Failed to load file");
				console.error(err);
			}
		};
		reader.readAsText(file);
	};
}

document.getElementById("close-btn").onclick = () => {
    document.getElementById("side-panel").style.display = "none";
};

document.getElementById("open-btn").onclick = () => {
    document.getElementById("side-panel").style.display = "block";
};

// For canvas
// Existing mousemove handler
document.addEventListener("mousemove", function (event) {
	var rect = canvas.getBoundingClientRect();
	if (
		event.clientX < rect.left ||
		event.clientX > rect.right ||
		event.clientY < rect.top ||
		event.clientY > rect.bottom
	) {
		mousePos.x = -1;
		mousePos.y = -1;
		return;
	}
	mousePos.x = Math.floor((event.clientX - rect.left) / cell_size);
	mousePos.y = Math.floor((event.clientY - rect.top) / cell_size);
});

// Add touch handlers with matching calculation logic

canvas.addEventListener("touchstart", function (event) {
	event.preventDefault();
	var rect = canvas.getBoundingClientRect();
	var touch = event.touches[0];
	const pos = getCanvasCoords(event, canvas);
	mousePos.x = Math.floor(pos.x / cell_size);
	mousePos.y = Math.floor(pos.y / cell_size);
	if (mouseInterval) clearInterval(mouseInterval);
	mouseInterval = setInterval(handleMouse, 20);
});

canvas.addEventListener("touchmove", function (event) {
	event.preventDefault();
	var rect = canvas.getBoundingClientRect();
	var touch = event.touches[0];
	const pos = getCanvasCoords(event, canvas);
	mousePos.x = Math.floor(pos.x / cell_size);
	mousePos.y = Math.floor(pos.y / cell_size);
});

canvas.addEventListener("touchend", function (event) {
	clearInterval(mouseInterval);
	mouseInterval = null;
	mousePos.x = -1;
	mousePos.y = -1;
});

canvas.addEventListener("touchcancel", function (event) {
	clearInterval(mouseInterval);
	mouseInterval = null;
	mousePos.x = -1;
	mousePos.y = -1;
});

// For grainMenu (selection menu)
document
	.getElementById("grainMenu")
	.addEventListener("touchstart", function (e) {
		e.preventDefault();
		const rect = this.getBoundingClientRect();
		const touch = e.touches[0];
		const y = touch.clientY - rect.top;
		const x = touch.clientX - rect.left;
		const cellSize = 9 * 5;
		const idx = Math.floor(
			(Math.floor(y / cellSize) * rect.width) / cellSize +
				Math.floor(x / cellSize),
		);
		if (idx >= 0 && idx < grainTypes.length) {
			current_grain = idx + 1;
			drawGrainMenu();
			drawMaterialPreview();
		} else {
			current_grain = 0;
			drawGrainMenu();
			drawMaterialPreview();
		}
	});

document.addEventListener("mousemove", function (event) {
	var rect = canvas.getBoundingClientRect();
	if (
		event.clientX < rect.left ||
		event.clientX > rect.right ||
		event.clientY < rect.top ||
		event.clientY > rect.bottom
	) {
		mousePos.x = -1;
		mousePos.y = -1;
		return;
	}
	mousePos.x = Math.floor((event.clientX - rect.left) / cell_size);
	mousePos.y = Math.floor((event.clientY - rect.top) / cell_size);
});

document.addEventListener("mousedown", function (event) {
	if (mousePos.x < 0 || mousePos.y < 0) return;

	dragStart = { x: mousePos.x, y: mousePos.y };
	lockedAxis = null; // reset axis

	if (mouseInterval) clearInterval(mouseInterval);
	mouseInterval = setInterval(handleMouse, 20);
});


document.addEventListener("mouseup", function (event) {
	clearInterval(mouseInterval);
	mouseInterval = null;
	dragStart = null;
	lockedAxis = null;
});



// Optionally handle the scenario where the mouse leaves the canvas
document.addEventListener("mouseleave", function (event) {
	if (mouseInterval) clearInterval(mouseInterval);
});

function resizeCanvasForMobile() {
	const canvas = document.getElementById("canvas");
	const preview = document.getElementById("materialPreview");

	// Desktop: large canvas
	if (window.innerWidth > 700) {
		// Set your preferred desktop size here
		canvas.width = 700;
		canvas.height = 700;
		cell_size = Math.floor(canvas.width / width);
	} else {
		// Mobile: responsive square
		let size = Math.min(window.innerWidth, window.innerHeight);
		size = Math.max(size, 200);
		cell_size = Math.floor(size / width);
		canvas.width = width * cell_size;
		canvas.height = height * cell_size;
	}

	if (preview) {
		preview.width = 48;
		preview.height = 48;
	}
}
window.addEventListener("resize", resizeCanvasForMobile);
window.addEventListener("DOMContentLoaded", resizeCanvasForMobile);

// Draws the grain menu on the side
function drawGrainMenu() {
	const menu = document.getElementById("grainMenu");
	if (!menu) return;
	const ctx = menu.getContext("2d");

	const { grainsPerRow, cellSize, padding } = getMenuLayout();

	const rows = Math.ceil(grainTypes.length / grainsPerRow);

	menu.width = grainsPerRow * (cellSize + padding) + padding;
	menu.height = rows * (cellSize + padding) + padding;

	ctx.clearRect(0, 0, menu.width, menu.height);

	for (let i = 0; i < grainTypes.length; i++) {
		const row = Math.floor(i / grainsPerRow);
		const col = i % grainsPerRow;

		// Gather all colors for this grain type
		let colors = [];
		for (let g of grains) {
			if (g.type === grainTypes[i].type) {
				colors.push(g.color);
			}
		}
		if (colors.length === 0) colors = ["#888"];

		const x = padding + col * (cellSize + padding);
		const y = padding + row * (cellSize + padding);

		// Draw concentric rectangles (rings) for each color
		const ringWidth = Math.floor(cellSize / (2 * colors.length));
		for (let r = 0; r < colors.length; r++) {
			ctx.strokeStyle = colors[r];
			ctx.lineWidth = ringWidth;
			// The offset increases for each inner ring
			const offset = r * ringWidth;
			ctx.strokeRect(
				x + offset + ringWidth / 2,
				y + offset + ringWidth / 2,
				cellSize - 2 * offset - ringWidth,
				cellSize - 2 * offset - ringWidth,
			);
		}

		// Draw selection highlight
		if (current_grain - 1 === i) {
			ctx.strokeStyle = "red";
			ctx.lineWidth = 4;
			ctx.strokeRect(x + 2, y + 2, cellSize - 4, cellSize - 4);
		}
	}
}

// Helper to get menu cell size and grains per row
function getMenuLayout() {
	const isMobile = window.innerWidth <= 700;
	const grainsPerRow = isMobile ? 10 : 20;
	const cellSize = 32;
	const padding = 4;
	return { grainsPerRow, cellSize, padding };
}


// Handle clicks/touches on the grain menu
function handleGrainMenuSelect(e) {
	e.preventDefault();
	const menu = document.getElementById("grainMenu");
	if (!menu) return;
	const { grainsPerRow, cellSize, padding } = getMenuLayout();
	const rect = menu.getBoundingClientRect();

	let clientX, clientY;
	if (e.touches && e.touches.length > 0) {
		clientX = e.touches[0].clientX;
		clientY = e.touches[0].clientY;
	} else {
		clientX = e.clientX;
		clientY = e.clientY;
	}

	// Subtract menu's left/top and the padding
	const x = clientX - rect.left - padding;
	const y = clientY - rect.top - padding;

	if (x < 0 || y < 0) return;

	const col = Math.floor(x / (cellSize + padding));
	const row = Math.floor(y / (cellSize + padding));
	const idx = row * grainsPerRow + col;

	if (
		col < 0 ||
		row < 0 ||
		col >= grainsPerRow ||
		idx < 0 ||
		idx >= grainTypes.length
	) {
		current_grain = 0;
	} else {
		current_grain = idx + 1;
	}
	drawGrainMenu();
	drawMaterialPreview();

	updateSideMenu();
}

function updateSideMenu(){
	const nameLabel = document.getElementById("side-panel-grain-name");
	const descriptionLabel = document.getElementById("side-panel-grain-description");
	if (current_grain != 0){
		nameLabel.innerHTML = grainTypes[current_grain -1 ].type.name;
		descriptionLabel.innerHTML = grainTypes[current_grain -1 ].type.description;


	}
}

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


document.addEventListener("keydown", (e) => {
	if (e.key === "Shift") shiftPressed = true;
});

document.addEventListener("keyup", (e) => {
	if (e.key === "Shift") shiftPressed = false;
});

canvas.addEventListener("wheel", function (event) {
	event.preventDefault();

	const step = event.shiftKey ? 3 : 1;

	if (event.deltaY < 0) {
		normal_brush_size += step;
	} else {
		normal_brush_size -= step;
	}

	normal_brush_size = Math.max(1, Math.min(20, normal_brush_size));

	// Update slider position
	const slider = document.getElementById("brushSize");
	if (slider) {
		slider.value = normal_brush_size;
	}
});




function drawBrushOutline() {
	if (mousePos.x < 0 || mousePos.y < 0) return;

	const pos = getLockedMousePos();

	ctx.strokeStyle = "white";
	ctx.lineWidth = 2;

	const size = normal_brush_size * cell_size;
	const offset = (normal_brush_size %2 ? Math.ceil(normal_brush_size / 2) - 1 : normal_brush_size/2) * cell_size;



	ctx.strokeRect(
		pos.x * cell_size - offset,
		pos.y * cell_size - offset,
		size,
		size
	);
}


function getLockedMousePos() {
	if (!shiftPressed || !dragStart) {
		return { x: mousePos.x, y: mousePos.y };
	}

	const dx = mousePos.x - dragStart.x;
	const dy = mousePos.y - dragStart.y;

	// If axis not chosen yet
	if (!lockedAxis) {

		// Do NOT decide if no movement yet
		if (dx === 0 && dy === 0) {
			return { x: mousePos.x, y: mousePos.y };
		}

		// Choose dominant axis
		if (Math.abs(dx) > Math.abs(dy)) {
			lockedAxis = "y"; // horizontal line
		} else {
			lockedAxis = "x"; // vertical line
		}
	}

	if (lockedAxis === "y") {
		return { x: mousePos.x, y: dragStart.y };
	} else {
		return { x: dragStart.x, y: mousePos.y };
	}
}




function handleMouse() {
	if (mousePos.x < 0 || mousePos.y < 0) return;

	const pos = getLockedMousePos();
	placeBrush(pos.x, pos.y);
}





function start() {
	if (!running) {
		running = true;
		requestAnimationFrame(loop);
	}
}

function loop() {
	if (!running) return;

	gameLoop();
	requestAnimationFrame(loop);
}

function stop() {
	running = false;
}

function arraysEqual(arr1, arr2) {
	for (let x = 0; x < 3; x++) {
		for (let y = 0; y < 3; y++) {
			if (arr1[x][y] !== arr2[x][y]) return false;
		}
	}
	return true;
}

function gameLoop() {
	runPhysics();
	drawStep();
}

function findGrain(int) {
	if (int == 0) return;
	for (let grainIndex in grains)
		if (grainIndex == int - 1) return grains[grainIndex];
}
//this function is only of surrounding type 0
function destroyNear(
	surrounding,
	grainsToDestroy,
	chanceToSelfDestroy = 100,
	onlySides = true,
	maxDensityToDestroy = 100,
	chanceToSelfDestroyOnSides = 100,
) {
	for (var x = 0; x < 3; x++) {
		for (var y = 0; y < 3; y++) {
			if (!onlySides || (onlySides && (x + y) % 2 == 1)) {
				for (let grainToDestroy of grainsToDestroy) {
					var side = surrounding[x][y];
					if (side != 0 && side != unexistingGrain) {
						if (
							grains[surrounding[x][y] - 1].type instanceof
							grainToDestroy
						) {
							if (chanceToSelfDestroyOnSides < 100) {
								var chance = getRandom(0, 100);
								if (
									chance < chanceToSelfDestroyOnSides &&
									grains[surrounding[x][y] - 1].type
										.density <= maxDensityToDestroy
								) {
									surrounding[x][y] = 0;
									return surrounding;
								}
							}
							break;
						}
					}
				}
			}
		}
	}
	return surrounding;
}

function setBrushSize(val) {
	normal_brush_size = Math.max(1, Math.min(20, parseInt(val) || 1));

	// Sync slider position
	const slider = document.getElementById("brushSize");
	if (slider) {
		slider.value = normal_brush_size;
	}
}


function getSurrounding(surroundingFormat, x, y, screen) {
	var sideLength = surroundingFormat * 2 + 3;
	var surrounding = new Array(sideLength)
		.fill(0)
		.map(() => new Array(sideLength).fill(0));

	for (x1 = -sideLength / 2; x1 < sideLength / 2; x1++) {
		for (y1 = -sideLength / 2; y1 < sideLength / 2; y1++) {
			var globalX = x + Math.round(x1);
			var globalY = y + Math.round(y1);
			if (
				globalX >= 0 &&
				globalX < width &&
				globalY >= 0 &&
				globalY < height
			) {
				surrounding[Math.floor(sideLength / 2 + x1)][
					Math.floor(sideLength / 2 + y1)
				] = screen[globalX][globalY];
			} else
				surrounding[Math.floor(sideLength / 2 + x1)][
					Math.floor(sideLength / 2 + y1)
				] = unexistingGrain;
		}
	}

	return surrounding;
}

function runPhysics() {
	var newScreen = JSON.parse(JSON.stringify(screen));
	for (x = 0; x < width; x++) {
		for (y = 0; y < height; y++) {
			var currentGrainInt = screen[x][y];
			if (
				currentGrainInt != 0 &&
				currentGrainInt != unexistingGrain &&
				currentGrainInt == newScreen[x][y]
			) {
				var currentGrainType = grains[currentGrainInt - 1];
				var currentGrain = currentGrainType.type;
				var newSurrounding = currentGrain.applyPhisics(
					getSurrounding(
						currentGrain.surroundingFormat,
						x,
						y,
						newScreen,
					),
				);
				var sideLength = currentGrain.surroundingFormat * 2 + 3;

				//applying the new surrounding
				for (x1 = -sideLength / 2; x1 < sideLength / 2; x1++) {
					for (y1 = -sideLength / 2; y1 < sideLength / 2; y1++) {
						var globalX = x + Math.round(x1);
						var globalY = y + Math.round(y1);
						if (
							globalX >= 0 &&
							globalX < width &&
							globalY >= 0 &&
							globalY < height
						) {
							newScreen[globalX][globalY] =
								newSurrounding[Math.floor(sideLength / 2 + x1)][
									Math.floor(sideLength / 2 + y1)
								];
						}
					}
				}
			}
		}
	}
	screen = newScreen;
}

function placeBrush(x, y, brush_size = normal_brush_size) {
	ctx.fillStyle = "#eeaa00";
	for (x1 = -brush_size / 2; x1 < brush_size / 2; x1++) {
		for (y1 = -brush_size / 2; y1 < brush_size / 2; y1++) {
			var globalX = x + Math.round(x1);
			var globalY = y + Math.round(y1);
			if (
				globalX >= 0 &&
				globalX < width &&
				globalY >= 0 &&
				globalY < height
			)
				screen[x + Math.round(x1)][y + Math.round(y1)] =
					current_grain > 0
						? grainTypes[current_grain - 1].type.getGrainInt()
						: 0;
		}
	}
}


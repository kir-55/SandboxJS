//mouse handling
var mouseInterval;
// Helper for both mouse and touch
function setPointerPos(x, y) {
	mousePos.x = x;
	mousePos.y = y;
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




function setBrushSize(val) {
	normal_brush_size = Math.max(1, Math.min(20, parseInt(val) || 1));

	// Sync slider position
	const slider = document.getElementById("brushSize");
	if (slider) {
		slider.value = normal_brush_size;
	}
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


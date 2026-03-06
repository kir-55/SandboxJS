
function drawStep() {
	for (y = 0; y < height; y++) {
		for (x = 0; x < width; x++) {
			var grain = findGrain(screen[x][y]);
			ctx.fillStyle = grain ? grain.color : "#262626ff";
			ctx.fillRect(x * cell_size, y * cell_size, cell_size, cell_size);
		}
	}

	// Draw brush outline ON TOP
	drawBrushOutline();
}

function drawMaterialPreview() {
	const preview = document.getElementById("materialPreview");
	if (!preview) return;
	const ctxPrev = preview.getContext("2d");
	ctxPrev.clearRect(0, 0, preview.width, preview.height);

	if (current_grain === 0) {
		// If no grain selected, show empty
		ctxPrev.fillStyle = "#262626ff";
		ctxPrev.fillRect(0, 0, preview.width, preview.height);
		const grainNameElem = document.getElementById("grainName");
		if (grainNameElem) {
			grainNameElem.textContent = "Air";
		}
		return;
	}

	// 3x3 grid, each cell 16x16 px
	const cellSize = 16;
	let grainType = grainTypes[current_grain - 1];
	if (!grainType) return;

	// Set the grain name in the UI
	const grainNameElem = document.getElementById("grainName");
	if (grainNameElem) {
		grainNameElem.textContent = grainType.type.name;
	}

	for (let y = 0; y < 3; y++) {
		for (let x = 0; x < 3; x++) {
			// Simulate random texture by picking a random color from the grains of this type
			let color = "#888";
			// Find all grains of this type
			let indices = [];
			let idx = 0;
			for (let g of grains) {
				if (g.type === grainType.type) indices.push(idx);
				idx++;
			}
			if (indices.length > 0) {
				let randIdx =
					indices[Math.floor(Math.random() * indices.length)];
				color = grains[randIdx].color;
			}
			ctxPrev.fillStyle = color;
			ctxPrev.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
		}
	}
}

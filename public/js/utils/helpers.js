

function getRandom(min, max) {
	// this function should return a random float between min (inclusive) and max (exclusive)
	return Math.random() * (max - min) + min;
}

function getRandomInt(min, max) {
	// this function should return a random integer between min (inclusive) and max (exclusive)
	return Math.floor(Math.random() * (max - min)) + min;
}

function arraysEqual(arr1, arr2) {
	for (let x = 0; x < 3; x++) {
		for (let y = 0; y < 3; y++) {
			if (arr1[x][y] !== arr2[x][y]) return false;
		}
	}
	return true;
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

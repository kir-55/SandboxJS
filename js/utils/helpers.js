function getRandom(min, max) {
	// this function should return a random float between min (inclusive) and max (exclusive)
	return Math.random() * (max - min) + min;
}

function getRandomInt(min, max) {
	// this function should return a random integer between min (inclusive) and max (exclusive)
	return Math.floor(Math.random() * (max - min)) + min;
}

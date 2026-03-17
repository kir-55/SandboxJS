let recording = true;
let recordedInstructions = [];
let recordingStartStep = 10;

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

    // 🟢 RECORD ACTION
    if (recording) {
        recordedInstructions.push({
            time: stepCounter - recordingStartStep,
            x: x,
            y: y,
            size: brush_size,
            grain: grainTypes[current_grain - 1]
        });
    }

    for (x1 = -brush_size / 2; x1 < brush_size / 2; x1++) {
        for (y1 = -brush_size / 2; y1 < brush_size / 2; y1++) {
            var globalX = x + Math.round(x1);
            var globalY = y + Math.round(y1);

            if (
                globalX >= 0 &&
                globalX < width &&
                globalY >= 0 &&
                globalY < height
            ) {
                screen[globalX][globalY] =
                    current_grain > 0
                        ? grainTypes[current_grain - 1].type.getGrainInt()
                        : 0;
            }
        }
    }
}

function exportExample() {
    const cleaned = recordedInstructions.map(instr => ({
        time: instr.time,
        x: instr.x,
        y: instr.y,
        size: instr.size,
        grain: instr.grain.type.name // 👈 IMPORTANT (see below)
    }));

    const json = JSON.stringify(cleaned, null, 2);

    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "example.json";
    a.click();

    URL.revokeObjectURL(url);
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

function findGrain(int) {
	if (int == 0) return;
	for (let grainIndex in grains)
		if (grainIndex == int - 1) return grains[grainIndex];
}


function start() {
    if (!running) {
        running = true;
        requestAnimationFrame(loop);
    }
}

function stop() {
	running = false;
}



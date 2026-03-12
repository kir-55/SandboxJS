// example.js – Side panel preview animation

// Configuration
const exampleWidth = 60;
const exampleHeight = 60;
const exampleCellSize = 4; // pixels per cell

// DOM elements
const exampleCanvas = document.getElementById("example-canvas");
if (!exampleCanvas) {
    console.error("example-canvas not found");
}
const exampleCtx = exampleCanvas.getContext("2d");

// Set canvas dimensions
exampleCanvas.width = exampleWidth * exampleCellSize;
exampleCanvas.height = exampleHeight * exampleCellSize;

// Simulation state
let exampleScreen = new Array(exampleWidth).fill(0).map(() => new Array(exampleHeight).fill(0));
let exampleRunning = false;
let exampleAnimationFrame = null;
let exampleCurrentGrain = null; // The grain type object currently being previewed
let exampleStepCounter = 0;      // Step counter for timed instructions

// Instructions list (expandable for future use)
let exampleInstructions = [];

// Start the example animation for a given grain
function startExample(grainType) {
    // Stop any current animation
    stopExample();

    // Reset screen
    exampleScreen = new Array(exampleWidth).fill(0).map(() => new Array(exampleHeight).fill(0));

    // Store the grain to preview
    exampleCurrentGrain = grainType;

    // Build instructions: use grain's own instructions if provided, otherwise default to a single placement at (30,30)
    exampleInstructions = grainType.exampleInstructions || [
        { time: 0, x: 30, y: 30, size: 1, grain: grainType }
    ];

    // Reset step counter
    exampleStepCounter = 0;

    // Start the loop
    exampleRunning = true;
    exampleLoop();
}

// Stop the example animation
function stopExample() {
    exampleRunning = false;
    if (exampleAnimationFrame) {
        cancelAnimationFrame(exampleAnimationFrame);
        exampleAnimationFrame = null;
    }
}

// Main loop for example
function exampleLoop() {
    if (!exampleRunning) return;

    // Process instructions that should execute at current step
    processExampleInstructions(exampleStepCounter);

    // Run one physics step on the example screen
    runExamplePhysics();

    // Draw the example screen
    drawExample();

    // Increment step counter
    exampleStepCounter++;

    // Continue loop
    exampleAnimationFrame = requestAnimationFrame(exampleLoop);
}

// Process all instructions whose time <= current step, then remove them
function processExampleInstructions(step) {
    // Find all instructions that should be executed at or before this step
    let instructionsToExecute = exampleInstructions.filter(instr => instr.time <= step);
    // Execute them (in order)
    for (let instr of instructionsToExecute) {
        placeExampleBrush(instr.x, instr.y, instr.size, instr.grain);
    }
    // Remove executed instructions from the list
    exampleInstructions = exampleInstructions.filter(instr => instr.time > step);
}

// Place brush on example screen
function placeExampleBrush(x, y, size, grainType) {
    // Clamp coordinates
    x = Math.max(0, Math.min(exampleWidth - 1, x));
    y = Math.max(0, Math.min(exampleHeight - 1, y));

    // Draw a square brush
    for (let dx = -Math.floor(size/2); dx < Math.ceil(size/2); dx++) {
        for (let dy = -Math.floor(size/2); dy < Math.ceil(size/2); dy++) {
            let nx = x + dx;
            let ny = y + dy;
            if (nx >= 0 && nx < exampleWidth && ny >= 0 && ny < exampleHeight) {
                let grainInt = 0;
                if (grainType) {
                    grainInt = grainType.getGrainInt(); // Use the grain's own method
                }
                exampleScreen[nx][ny] = grainInt;
            }
        }
    }
}

// Simplified physics for example screen (3×3 neighbourhood)
function runExamplePhysics() {
    let newScreen = JSON.parse(JSON.stringify(exampleScreen));
    for (let x = 0; x < exampleWidth; x++) {
        for (let y = 0; y < exampleHeight; y++) {
            let currentGrainInt = exampleScreen[x][y];
            if (currentGrainInt !== 0 && currentGrainInt !== unexistingGrain && currentGrainInt === newScreen[x][y]) {
                let currentGrainType = grains[currentGrainInt - 1];
                let currentGrain = currentGrainType.type;
                let surrounding = getExampleSurrounding(x, y, newScreen);
                let newSurrounding = currentGrain.applyPhisics(surrounding);

                // If the grain moved (center changed)
                if (newSurrounding[1][1] !== currentGrainInt) {
                    // Clear old position
                    newScreen[x][y] = 0;
                    // Apply the new 3×3 neighbourhood (only non‑zero values)
                    for (let dx = -1; dx <= 1; dx++) {
                        for (let dy = -1; dy <= 1; dy++) {
                            let nx = x + dx;
                            let ny = y + dy;
                            if (nx >= 0 && nx < exampleWidth && ny >= 0 && ny < exampleHeight) {
                                let val = newSurrounding[dx + 1][dy + 1];
                                if (val !== 0 && newScreen[nx][ny] === 0) {
                                    newScreen[nx][ny] = val;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    exampleScreen = newScreen;
}

// Get 3×3 surrounding (format 0)
function getExampleSurrounding(x, y, scr) {
    let surrounding = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ];
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            let nx = x + dx;
            let ny = y + dy;
            if (nx >= 0 && nx < exampleWidth && ny >= 0 && ny < exampleHeight) {
                surrounding[dx + 1][dy + 1] = scr[nx][ny];
            } else {
                surrounding[dx + 1][dy + 1] = unexistingGrain;
            }
        }
    }
    return surrounding;
}

// Draw the example canvas
function drawExample() {
    exampleCtx.clearRect(0, 0, exampleCanvas.width, exampleCanvas.height);
    for (let x = 0; x < exampleWidth; x++) {
        for (let y = 0; y < exampleHeight; y++) {
            let grainInt = exampleScreen[x][y];
            let color = "#262626ff"; // default black
            if (grainInt !== 0 && grainInt !== unexistingGrain) {
                let grain = findGrain(grainInt);
                if (grain) color = grain.color;
            }
            exampleCtx.fillStyle = color;
            exampleCtx.fillRect(x * exampleCellSize, y * exampleCellSize, exampleCellSize, exampleCellSize);
        }
    }
}
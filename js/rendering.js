// rendering.js

function drawStep() {
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            var grain = findGrain(screen[x][y]);
            ctx.fillStyle = grain ? grain.color : "#262626ff";
            ctx.fillRect(x * cell_size, y * cell_size, cell_size, cell_size);
        }
    }
    drawBrushOutline();
}

function drawMaterialPreview() {
    const preview = document.getElementById("materialPreview");
    if (!preview) return;
    const ctxPrev = preview.getContext("2d");
    ctxPrev.clearRect(0, 0, preview.width, preview.height);

    if (current_grain === 0) {
        ctxPrev.fillStyle = "#262626ff";
        ctxPrev.fillRect(0, 0, preview.width, preview.height);
        const grainNameElem = document.getElementById("grainName");
        if (grainNameElem) grainNameElem.textContent = "Air";
        return;
    }

    const cellSize = 16;
    let grainType = grainTypes[current_grain - 1];
    if (!grainType) return;

    const grainNameElem = document.getElementById("grainName");
    if (grainNameElem) grainNameElem.textContent = grainType.type.name;

    for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
            let color = "#888";
            let indices = [];
            let idx = 0;
            for (let g of grains) {
                if (g.type === grainType.type) indices.push(idx);
                idx++;
            }
            if (indices.length > 0) {
                let randIdx = indices[Math.floor(Math.random() * indices.length)];
                color = grains[randIdx].color;
            }
            ctxPrev.fillStyle = color;
            ctxPrev.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
    }
}

function getMenuLayout() {
    const isMobile = window.innerWidth <= 700;
    const grainsPerRow = isMobile ? 10 : 20;
    const cellSize = 32;
    const padding = 4;
    return { grainsPerRow, cellSize, padding };
}

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
        let colors = [];
        for (let g of grains) {
            if (g.type === grainTypes[i].type) colors.push(g.color);
        }
        if (colors.length === 0) colors = ["#888"];

        const x = padding + col * (cellSize + padding);
        const y = padding + row * (cellSize + padding);
        const ringWidth = Math.floor(cellSize / (2 * colors.length));
        for (let r = 0; r < colors.length; r++) {
            ctx.strokeStyle = colors[r];
            ctx.lineWidth = ringWidth;
            const offset = r * ringWidth;
            ctx.strokeRect(
                x + offset + ringWidth / 2,
                y + offset + ringWidth / 2,
                cellSize - 2 * offset - ringWidth,
                cellSize - 2 * offset - ringWidth
            );
        }
        if (current_grain - 1 === i) {
            ctx.strokeStyle = "red";
            ctx.lineWidth = 4;
            ctx.strokeRect(x + 2, y + 2, cellSize - 4, cellSize - 4);
        }
    }
}

function drawBrushOutline() {
    if (mousePos.x < 0 || mousePos.y < 0) return;
    const pos = getLockedMousePos();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    const size = normal_brush_size * cell_size;
    const offset = (normal_brush_size % 2 ? Math.ceil(normal_brush_size / 2) - 1 : normal_brush_size / 2) * cell_size;
    ctx.strokeRect(pos.x * cell_size - offset, pos.y * cell_size - offset, size, size);
}

function updateSideMenu() {
    const nameLabel = document.getElementById("side-panel-grain-name");
    const descriptionLabel = document.getElementById("side-panel-grain-description");
    if (current_grain != 0) {
        nameLabel.innerHTML = grainTypes[current_grain - 1].type.name;
        descriptionLabel.innerHTML = grainTypes[current_grain - 1].type.description;
    }
}
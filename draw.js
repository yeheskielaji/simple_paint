const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let currentTool = 'line';
let startX, startY;
let drawing = false;
let shapes = []; // Array to store all shapes
let imageData;

canvas.addEventListener('mousedown', function(e) {
    startX = e.offsetX;
    startY = e.offsetY;
    drawing = true;
});

canvas.addEventListener('mousemove', function(e) {
    if (!drawing) return;
    if (currentTool === 'pen') {
        const shape = {
            type: 'line',
            points: [
                { x: startX, y: startY },
                { x: e.offsetX, y: e.offsetY }
            ]
        };
        shapes.push(shape);
        drawLineBresenham(startX, startY, e.offsetX, e.offsetY);
        startX = e.offsetX;
        startY = e.offsetY;
    }
});

canvas.addEventListener('mouseup', function(e) {
    if (drawing && currentTool !== 'pen') {
        const shape = {
            type: currentTool,
            points: [
                { x: startX, y: startY },
                { x: e.offsetX, y: e.offsetY }
            ]
        };
        if (currentTool === 'circle') {
            shape.radius = Math.sqrt(Math.pow(e.offsetX - startX, 2) + Math.pow(e.offsetY - startY, 2));
        } else if (currentTool === 'oval') {
            shape.rx = Math.abs(e.offsetX - startX);
            shape.ry = Math.abs(e.offsetY - startY);
        }
        shapes.push(shape);
        redraw();
    }
    drawing = false;
});

canvas.addEventListener('click', function(e) {
    if (currentTool === 'fill') {
        const x = e.offsetX;
        const y = e.offsetY;
        const fillColor = hexToRgb(ctx.fillStyle);
        imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        floodFill(x, y, fillColor);
    }
});

function selectTool(tool) {
    currentTool = tool;
    if (tool === 'clear') {
        shapes = [];
        redraw();
    }
}

function setColor(color) {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
}

function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    shapes.forEach(shape => {
        if (shape.type === 'line') {
            drawLineBresenham(shape.points[0].x, shape.points[0].y, shape.points[1].x, shape.points[1].y);
        } else if (shape.type === 'pen') {
            drawLineDDA(shape.points[0].x, shape.points[0].y, shape.points[1].x, shape.points[1].y);
        } else if (shape.type === 'circle') {
            drawCircleMidpoint(shape.points[0].x, shape.points[0].y, shape.radius);
        } else if (shape.type === 'oval') {
            drawOvalMidpoint(shape.points[0].x, shape.points[0].y, shape.rx, shape.ry);
        }
    });
}

function drawLineDDA(x1, y1, x2, y2) {
    let dx = x2 - x1;
    let dy = y2 - y1;
    let steps = Math.max(Math.abs(dx), Math.abs(dy));

    let xIncrement = dx / steps;
    let yIncrement = dy / steps;

    let x = x1;
    let y = y1;
    for (let i = 0; i <= steps; i++) { ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
        x += xIncrement;
        y += yIncrement; }
}

function drawLineBresenham(x1, y1, x2, y2) {
    let dx = Math.abs(x2 - x1);
    let sx = x1 < x2 ? 1 : -1;
    let dy = -Math.abs(y2 -
        y1);
    let sy = y1 < y2 ? 1 : -1;
    let err = dx + dy;
    while (true) {
        ctx.fillRect(x1, y1, 1, 1);
        if (x1 === x2 && y1 === y2)
            break;
        let e2 = 2 * err;
        if (e2 >= dy) {
            err += dy;
            x1 += sx;
        }
        if (e2 <= dx) { err += dx;
            y1 += sy; }
    }
}

function drawCircleMidpoint(xc, yc, radius) {
    let x = radius;
    let y = 0;
    let
        p = 1 - radius;
    while (x > y) {
        y++;
        if (p <= 0) { p = p + 2 * y + 1; } else { x--;
            p = p + 2 * (y - x) + 1; }
        plotCirclePoints(xc, yc, x, y);
    }
}

function plotCirclePoints(xc, yc, x, y) {
    ctx.fillRect(xc + x, yc + y, 1, 1);
    ctx.fillRect(xc - x, yc + y,
        1, 1);
    ctx.fillRect(xc + x, yc - y, 1, 1);
    ctx.fillRect(xc - x, yc - y, 1, 1);
    ctx.fillRect(xc + y, yc + x,
        1, 1);
    ctx.fillRect(xc - y, yc + x, 1, 1);
    ctx.fillRect(xc + y, yc - x, 1, 1);
    ctx.fillRect(xc - y, yc - x,
        1, 1);
}

function drawOvalMidpoint(xc, yc, rx, ry) {
    let x = 0;
    let y = ry;
    let rx2 = rx * rx;
    let ry2 = ry * ry;
    let tworx2 = 2 * rx2;
    let twory2 = 2 * ry2;
    let p = Math.round(ry2 - (rx2 * ry) + (0.25 * rx2));
    let px = 0;
    let
        py = tworx2 * y;
    while (px < py) {
        x++;
        px += twory2;
        if (p < 0) { p += ry2 + px; } else {
            y--;
            py -= tworx2;
            p
                += ry2 + px - py;
        }
        plotEllipsePoints(xc, yc, x, y);
    }
    p = Math.round(ry2 * (x + 0.5) * (x + 0.5) + rx2 * (y -
        1) * (y - 1) - rx2 * ry2);
    while (y > 0) {
        y--;
        py -= tworx2;
        if (p > 0) {
            p += rx2 - py;
        } else {
            x++;
            px += twory2;
            p += rx2 - py + px;
        }
        plotEllipsePoints(xc, yc, x, y);
    }
}

function plotEllipsePoints(xc, yc, x, y) {
    ctx.fillRect(xc + x, yc + y, 1, 1);
    ctx.fillRect(xc - x, yc + y, 1, 1);
    ctx.fillRect(xc + x, yc - y, 1, 1);
    ctx.fillRect(xc - x, yc - y, 1, 1);
}

function floodFill(x, y, fillColor) {
    const targetColor = getColorAtPixel(x, y);
    if (!colorsMatch(targetColor, fillColor)) {
        let pixelStack = [
            [x, y]
        ];
        while (pixelStack.length) {
            let newPos, x, y;
            newPos = pixelStack.pop();
            x = newPos[0];
            y = newPos[1];

            let currentColor = getColorAtPixel(x, y);
            if (colorsMatch(currentColor, targetColor)) {
                setColorAtPixel(x, y, fillColor);

                pixelStack.push([x + 1, y]);
                pixelStack.push([x - 1, y]);
                pixelStack.push([x, y + 1]);
                pixelStack.push([x, y - 1]);
            }
        }
        ctx.putImageData(imageData, 0, 0);
    }
}

function getColorAtPixel(x, y) {
    const index = (y * canvas.width + x) * 4;
    const data = imageData.data;
    return { r: data[index], g: data[index + 1], b: data[index + 2], a: data[index + 3] };
}

function setColorAtPixel(x, y, color) {
    const index = (y * canvas.width + x) * 4;
    const data = imageData.data;
    data[index] = color.r;
    data[index + 1] = color.g;
    data[index + 2] = color.b;
    data[index + 3] = color.a;
}

function colorsMatch(c1, c2) {
    return c1.r === c2.r && c1.g === c2.g && c1.b === c2.b && c1.a === c2.a;
}

function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r: r, g: g, b: b, a: 255 };
}

function handleTransformationSelection(value) {
    const xInput = document.getElementById('transformX');
    const yInput = document.getElementById('transformY');

    switch (value) {
        case 'rotate':
            xInput.placeholder = "Enter Angle (degrees)";
            xInput.style.display = 'block';
            yInput.style.display = 'none';
            break;
        case 'scale':
            xInput.placeholder = "Uniform Scale Factor";
            yInput.style.display = 'none';
            break;
        case 'reflect':
            xInput.style.display = 'none';
            yInput.style.display = 'none';
            break;
        default:
            xInput.placeholder = "X";
            yInput.placeholder = "Y";
            xInput.style.display = 'block';
            yInput.style.display = 'block';
            break;
    }
}

function promptForTransformationValues(transformationType) {
    if (!transformationType) return;
    let parameters = {};

    switch (transformationType) {
        case 'translate':
            parameters.x = parseFloat(prompt("Enter translation X:"));
            parameters.y = parseFloat(prompt("Enter translation Y:"));
            break;
        case 'rotate':
            parameters.angle = parseFloat(prompt("Enter rotation angle in degrees:"));
            break;
        case 'scale':
            parameters.scaleFactor = parseFloat(prompt("Enter uniform scale factor:"));
            break;
        case 'reflect':
            parameters.axis = prompt("Enter axis (x or y):");
            break;
    }
    window.transformationParameters = parameters;
}

function applyTransform() {
    const type = document.getElementById('transformSelect').value;
    let parameters = window.transformationParameters || {};

    if (type === 'scale' && isNaN(parameters.scaleFactor)) {
        alert("Invalid scale factor.");
        return;
    }

    applyTransformation(type, parameters, shapes);
    redraw();
}
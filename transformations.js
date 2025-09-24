function applyTransformation(type, parameters, shapes) {
    if (shapes.length === 0) {
        alert("No shape to transform.");
        return;
    }

    const lastShape = shapes[shapes.length - 1];
    switch (type) {
        case 'translate':
            translateShape(lastShape, parameters.x, parameters.y);
            break;
        case 'rotate':
            rotateShape(lastShape, parameters.angle);
            break;
        case 'scale':
            if (!isNaN(parameters.scaleFactor)) {
                scaleShape(lastShape, parameters.scaleFactor);
            } else {
                alert("Invalid scale factor.");
            }
            break;
        case 'reflect':
            reflectShape(lastShape, parameters.axis);
            break;
    }
}

function translateShape(shape, dx, dy) {
    shape.points.forEach(point => {
        point.x += dx;
        point.y += dy;
    });
}

function rotateShape(shape, angle) {
    const radians = angle * Math.PI / 180;
    const center = findCenter(shape.points);

    shape.points.forEach(point => {
        const x = point.x - center.x;
        const y = point.y - center.y;
        point.x = center.x + x * Math.cos(radians) - y * Math.sin(radians);
        point.y = center.y + x * Math.sin(radians) + y * Math.cos(radians);
    });
}

function scaleShape(shape, scaleFactor) {
    if (shape.type === 'circle' || shape.type === 'oval') {
        shape.radius *= scaleFactor;
    } else {
        const center = findCenter(shape.points);
        shape.points.forEach(point => {
            point.x = center.x + (point.x - center.x) * scaleFactor;
            point.y = center.y + (point.y - center.y) * scaleFactor;
        });
    }
}

function reflectShape(shape, axis) {
    const center = findCenter(shape.points);
    if (axis === 'x') {
        shape.points.forEach(point => {
            point.y = 2 * center.y - point.y;
        });
    } else {
        shape.points.forEach(point => {
            point.x = 2 * center.x - point.x;
        });
    }
}

function findCenter(points) {
    if (!points || points.length === 0) {
        console.error("Invalid or empty points array");
        return { x: 0, y: 0 };
    }

    const center = points.reduce((acc, p) => {
        acc.x += p.x;
        acc.y += p.y;
        return acc;
    }, { x: 0, y: 0 });

    center.x /= points.length;
    center.y /= points.length;
    return center;
}
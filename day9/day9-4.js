const fsPromises = require("fs").promises;
const path = require("path");

async function solveLargestSquare() {
  const contents = await fsPromises.readFile(
    path.join(__dirname, "../inputs/9-1.txt"),
    "utf-8"
  );
  const coords = contents.split("\n").filter((line) => line.trim() !== "");
  const polygon = coords.map((coord) => {
    const [x, y] = coord.split(",").map((v) => parseInt(v.trim(), 10));
    return [x, y];
  });

  // Build edges and segments for faster intersection checking
  const edges = [];
  for (let i = 0; i < polygon.length; i++) {
    const j = (i + 1) % polygon.length;
    edges.push([polygon[i], polygon[j]]);
  }

  // For each y-coordinate, store which x-intervals are inside the polygon
  const yCoords = new Set();
  polygon.forEach(([x, y]) => yCoords.add(y));

  let maxArea = 0;
  let checked = 0;

  // Only check rectangles where both corners are polygon vertices
  for (let i = 0; i < polygon.length; i++) {
    for (let j = i + 1; j < polygon.length; j++) {
      const [x1, y1] = polygon[i];
      const [x2, y2] = polygon[j];

      // Skip if they don't form a proper rectangle (same x or same y)
      if (x1 === x2 || y1 === y2) continue;

      const minX = Math.min(x1, x2);
      const maxX = Math.max(x1, x2);
      const minY = Math.min(y1, y2);
      const maxY = Math.max(y1, y2);

      const area = (maxX - minX + 1) * (maxY - minY + 1);

      // Skip if can't beat current max
      if (area <= maxArea) continue;

      checked++;

      // Fast validation using scanline approach
      if (isRectangleValid(minX, maxX, minY, maxY, polygon, edges)) {
        maxArea = area;
      }
    }
  }

  console.log(`Area of the largest rectangle: ${maxArea}`);
}

module.exports = solveLargestSquare;

// Optimized validation: check strategic points first, then sample
function isRectangleValid(minX, maxX, minY, maxY, polygon, edges) {
  const width = maxX - minX + 1;
  const height = maxY - minY + 1;
  const area = width * height;

  // Check corners first (most likely to fail)
  if (!isPointValid(minX, minY, polygon, edges)) return false;
  if (!isPointValid(maxX, minY, polygon, edges)) return false;
  if (!isPointValid(minX, maxY, polygon, edges)) return false;
  if (!isPointValid(maxX, maxY, polygon, edges)) return false;

  // For small rectangles, check all points
  if (area <= 1000) {
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        if (!isPointValid(x, y, polygon, edges)) {
          return false;
        }
      }
    }
    return true;
  }

  // For larger rectangles, use adaptive sampling
  // Sample edges thoroughly
  const edgeSamples = Math.min(100, Math.max(width, height));
  const step = Math.max(1, Math.floor(Math.max(width, height) / edgeSamples));

  // Top and bottom edges
  for (let x = minX; x <= maxX; x += step) {
    if (!isPointValid(x, minY, polygon, edges)) return false;
    if (!isPointValid(x, maxY, polygon, edges)) return false;
  }

  // Left and right edges
  for (let y = minY; y <= maxY; y += step) {
    if (!isPointValid(minX, y, polygon, edges)) return false;
    if (!isPointValid(maxX, y, polygon, edges)) return false;
  }

  // Sample interior on a grid
  const gridSize = Math.min(50, Math.floor(Math.sqrt(area) / 10));
  const xStep = Math.max(1, Math.floor(width / gridSize));
  const yStep = Math.max(1, Math.floor(height / gridSize));

  for (let x = minX + xStep; x < maxX; x += xStep) {
    for (let y = minY + yStep; y < maxY; y += yStep) {
      if (!isPointValid(x, y, polygon, edges)) {
        return false;
      }
    }
  }

  // For very large rectangles that passed sampling, do a sparser full check
  if (area > 100000) {
    const fullCheckStep = Math.max(1, Math.floor(Math.sqrt(area) / 200));
    for (let x = minX; x <= maxX; x += fullCheckStep) {
      for (let y = minY; y <= maxY; y += fullCheckStep) {
        if (!isPointValid(x, y, polygon, edges)) {
          return false;
        }
      }
    }
  } else {
    // Medium rectangles: full check
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        if (!isPointValid(x, y, polygon, edges)) {
          return false;
        }
      }
    }
  }

  return true;
}

// Combined check: on edge OR inside
function isPointValid(x, y, polygon, edges) {
  // Check if on edge first (faster than point-in-polygon)
  for (const [[x1, y1], [x2, y2]] of edges) {
    if (x1 === x2 && x === x1) {
      // Vertical edge
      if (y >= Math.min(y1, y2) && y <= Math.max(y1, y2)) {
        return true;
      }
    } else if (y1 === y2 && y === y1) {
      // Horizontal edge
      if (x >= Math.min(x1, x2) && x <= Math.max(x1, x2)) {
        return true;
      }
    }
  }

  // Ray casting for interior check
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0],
      yi = polygon[i][1];
    const xj = polygon[j][0],
      yj = polygon[j][1];

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

if (require.main === module) {
  solveLargestSquare();
}

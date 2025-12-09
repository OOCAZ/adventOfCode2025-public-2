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

  // Build edges for faster intersection checking
  const edges = [];
  for (let i = 0; i < polygon.length; i++) {
    const j = (i + 1) % polygon.length;
    edges.push([polygon[i], polygon[j]]);
  }

  // Pre-compute polygon bounding box
  const polygonBounds = {
    minX: Math.min(...polygon.map(([x]) => x)),
    maxX: Math.max(...polygon.map(([x]) => x)),
    minY: Math.min(...polygon.map(([y]) => y)),
    maxY: Math.max(...polygon.map(([y]) => y)),
  };

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

      // Quick bounding box check
      if (
        minX < polygonBounds.minX ||
        maxX > polygonBounds.maxX ||
        minY < polygonBounds.minY ||
        maxY > polygonBounds.maxY
      ) {
        continue;
      }

      checked++;

      // Fast validation: only check perimeter points
      if (isRectangleValidPerimeter(minX, maxX, minY, maxY, polygon, edges)) {
        maxArea = area;
      }
    }
  }

  console.log(`Area of the largest rectangle: ${maxArea}`);
}

module.exports = solveLargestSquare;

// Optimized validation: only check perimeter (edges) of rectangle
function isRectangleValidPerimeter(minX, maxX, minY, maxY, polygon, edges) {
  const width = maxX - minX + 1;
  const height = maxY - minY + 1;

  // Check all 4 corners first (fast fail)
  if (!isPointValid(minX, minY, polygon, edges)) return false;
  if (!isPointValid(maxX, minY, polygon, edges)) return false;
  if (!isPointValid(minX, maxY, polygon, edges)) return false;
  if (!isPointValid(maxX, maxY, polygon, edges)) return false;

  // Adaptive sampling based on perimeter size
  const perimeter = 2 * (width + height);

  // For small rectangles, check every perimeter point
  if (perimeter <= 400) {
    // Top and bottom edges
    for (let x = minX; x <= maxX; x++) {
      if (!isPointValid(x, minY, polygon, edges)) return false;
      if (!isPointValid(x, maxY, polygon, edges)) return false;
    }
    // Left and right edges (skip corners already checked)
    for (let y = minY + 1; y < maxY; y++) {
      if (!isPointValid(minX, y, polygon, edges)) return false;
      if (!isPointValid(maxX, y, polygon, edges)) return false;
    }
    return true;
  }

  // For larger rectangles, sample perimeter strategically
  const sampleRate = Math.max(1, Math.floor(Math.max(width, height) / 50));

  // Top and bottom edges
  for (let x = minX; x <= maxX; x += sampleRate) {
    if (!isPointValid(x, minY, polygon, edges)) return false;
    if (!isPointValid(x, maxY, polygon, edges)) return false;
  }
  // Check the last point on each edge
  if (!isPointValid(maxX, minY, polygon, edges)) return false;
  if (!isPointValid(maxX, maxY, polygon, edges)) return false;

  // Left and right edges (skip corners)
  for (let y = minY + sampleRate; y < maxY; y += sampleRate) {
    if (!isPointValid(minX, y, polygon, edges)) return false;
    if (!isPointValid(maxX, y, polygon, edges)) return false;
  }

  // After perimeter sampling passes, do a sparse interior check for safety
  // This catches cases where perimeter is valid but interior crosses a concave section
  const interiorSampleRate = Math.max(
    5,
    Math.floor(Math.min(width, height) / 10)
  );

  for (let x = minX + interiorSampleRate; x < maxX; x += interiorSampleRate) {
    for (let y = minY + interiorSampleRate; y < maxY; y += interiorSampleRate) {
      if (!isPointValid(x, y, polygon, edges)) {
        return false;
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

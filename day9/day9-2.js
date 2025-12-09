const fsPromises = require("fs").promises;
const path = require("path");

async function solveLargestSquare() {
  // Read the input file without trimming to preserve spacing
  const contents = await fsPromises.readFile(
    path.join(__dirname, "../inputs/9-1.txt"),
    "utf-8"
  );
  const coords = contents.split("\n").filter((line) => line.trim() !== "");
  let polygon = processOusideBoundaries(coords);
  //console.log("Polygon vertices:", polygon);

  let area = 0;
  let iterations = 0;
  for (let i = 0; i < coords.length; i++) {
    for (let j = 0; j < coords.length; j++) {
      if (i === j) continue;
      iterations++;
      //if outside boundaries, skip
      if (checkOusideBoundaries(coords[i], coords[j], polygon)) continue;
      let tempArea = findArea(coords[i], coords[j]);
      if (tempArea > area) {
        area = tempArea;
      }
    }
  }
  console.log(`Total iterations: ${iterations}`);
  console.log(`Area of the largest square: ${area}`);
}

module.exports = solveLargestSquare;

function findArea(coord1, coord2) {
  const [x1, y1] = coord1.split(",").map((v) => parseInt(v.trim(), 10));
  const [x2, y2] = coord2.split(",").map((v) => parseInt(v.trim(), 10));
  //console.log(`Parsed coordinates: (${x1}, ${y1}) and (${x2}, ${y2})`);
  const length = Math.abs(x2 - x1) + 1;
  const width = Math.abs(y2 - y1) + 1;
  const area = length * width;
  //console.log(`Calculated area: ${area}`);
  return area;
}
// Ray casting algorithm - count how many times a ray from the point crosses the polygon boundary
function isPointInPolygon(x, y, polygon) {
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

// Check if point is on a polygon edge
function isOnPolygonEdge(x, y, polygon) {
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [x1, y1] = polygon[i];
    const [x2, y2] = polygon[j];

    // Check if point is on this edge
    if (x1 === x2) {
      // Vertical edge
      if (x === x1 && y >= Math.min(y1, y2) && y <= Math.max(y1, y2)) {
        return true;
      }
    } else if (y1 === y2) {
      // Horizontal edge
      if (y === y1 && x >= Math.min(x1, x2) && x <= Math.max(x1, x2)) {
        return true;
      }
    }
  }
  return false;
}

// Check if the entire rectangle is inside the polygon
function checkOusideBoundaries(coord1, coord2, polygon) {
  const [x1, y1] = coord1.split(",").map((v) => parseInt(v.trim(), 10));
  const [x2, y2] = coord2.split(",").map((v) => parseInt(v.trim(), 10));

  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);

  // Check all points in the rectangle
  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      // Check if point is on the boundary (edge or vertex)
      const onBoundary = isOnPolygonEdge(x, y, polygon);

      if (!onBoundary && !isPointInPolygon(x, y, polygon)) {
        return true; // Found a point outside - rectangle is invalid
      }
    }
  }
  return false; // All points are inside or on boundary
}

function processOusideBoundaries(coords) {
  // Convert coords to polygon array of [x, y] pairs
  return coords
    .filter((coord) => coord.trim() !== "")
    .map((coord) => {
      const [x, y] = coord.split(",").map((v) => parseInt(v.trim(), 10));
      return [x, y];
    });
}

if (require.main === module) {
  solveLargestSquare();
}

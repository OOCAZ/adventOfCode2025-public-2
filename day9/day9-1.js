const fsPromises = require("fs").promises;
const path = require("path");

async function solveLargestSquare() {
  // Read the input file without trimming to preserve spacing
  const contents = await fsPromises.readFile(
    path.join(__dirname, "../inputs/9-1.txt"),
    "utf-8"
  );
  const coords = contents.split("\n");
  let area = 0;
  let iterations = 0;
  for (let i = 0; i < coords.length; i++) {
    for (let j = 0; j < coords.length; j++) {
      iterations++;
      if (i === j) continue;
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

if (require.main === module) {
  solveLargestSquare();
}

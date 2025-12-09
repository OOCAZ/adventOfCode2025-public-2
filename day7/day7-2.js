const fsPromises = require("fs").promises;
const path = require("path");

async function solveNumSplit() {
  // Read the input file without trimming to preserve spacing
  const contents = await fsPromises.readFile(
    path.join(__dirname, "../inputs/7-1.txt"),
    "utf-8"
  );
  const lines = contents.split("\n");
  let totalSplits = 0;
  let findStart = lines[0].indexOf("S");
  let startingBeam = lines[0][findStart + 1];
  let pathsArray = [];
  for (let i = 0; i < lines.length; i++) {
    let row = [];
    for (let j = 0; j < lines[i].length; j++) {
      if (lines[i][j] === "^") {
        row.push("^"); // Keep splitters as markers
      } else if (lines[i][j] === "S") {
        row.push("S"); // Keep source as marker
      } else {
        row.push(0); // Use numeric 0, not string "0"
      }
    }
    pathsArray.push(row);
  }
  //now to fix the paths array to have the first beam
  pathsArray[1] = pathsArray[0].map((cell, index) =>
    index === findStart ? 1 : cell
  );
  for (let i = 1; i < pathsArray.length; i++) {
    // Process row from both ends toward center to avoid reading values we just wrote
    let updates = {}; // Store updates to apply after scanning the row

    for (let j = 0; j < pathsArray[i].length; j++) {
      //first check if there is a nonzero beam above
      if (
        typeof pathsArray[i - 1][j] === "number" &&
        pathsArray[i - 1][j] > 0
      ) {
        const beamCount = pathsArray[i - 1][j];
        //if there is a splitter here, split the beams and add to left and right
        if (pathsArray[i][j] === "^") {
          updates[j - 1] = (updates[j - 1] || 0) + beamCount;
          updates[j + 1] = (updates[j + 1] || 0) + beamCount;
          totalSplits++;
        } else if (typeof pathsArray[i][j] === "number") {
          //otherwise just continue the beam down
          updates[j] = (updates[j] || 0) + beamCount;
        }
      }
    }

    // Apply all updates at once
    for (let col in updates) {
      if (typeof pathsArray[i][col] === "number") {
        pathsArray[i][col] += updates[col];
      }
    }
  }

  /*console.log("Final beam layout:");
  for (const line of pathsArray) {
    console.log(`${line}`);
  }*/
  let finalRow = pathsArray[pathsArray.length - 1];
  let finalPaths = 0;
  for (const cell of finalRow) {
    if (typeof cell === "number") {
      finalPaths += cell;
    }
  }
  // this may be a lot easier than I first thought, at least with the smaller input the number is just startign at the bottom and adding the number of lines every other line not including the first

  //console.log("Total number of times split:", totalSplits);
  console.log("Total number of paths:", finalPaths); //subtract 1 for the starting beam
}

module.exports = solveNumSplit;

if (require.main === module) {
  solveNumSplit();
}

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
  lines[1] =
    lines[0].substring(0, findStart) + "|" + lines[1].substring(findStart + 1);
  for (let i = 1; i < lines.length; i++) {
    for (let j = 0; j < lines[i].length; j++) {
      //for every char on everyline, if there is a beam above it and no carat beam continues here, if value equals carat add beam before and after
      if (lines[i - 1][j] === "|" && lines[i][j] !== "^") {
        lines[i] = lines[i].substring(0, j) + "|" + lines[i].substring(j + 1);
      } else if (lines[i - 1][j] === "|" && lines[i][j] === "^") {
        totalSplits++;
        if (lines[i][j - 1] !== "^") {
          lines[i] = lines[i].substring(0, j - 1) + "|" + lines[i].substring(j);
        }
        if (lines[i][j + 1] !== "^") {
          lines[i] =
            lines[i].substring(0, j + 1) + "|" + lines[i].substring(j + 2);
        }
      }
    }
  }
  /*console.log("Final beam layout:");
  for (const line of lines) {
    console.log(line);
  }*/

  console.log("Total number of times split:", totalSplits);
}

module.exports = solveNumSplit;

if (require.main === module) {
  solveNumSplit();
}

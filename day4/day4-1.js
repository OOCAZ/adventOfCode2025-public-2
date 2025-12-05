const fsPromises = require("fs").promises;

async function findPapersNeeded() {
  // Read the input file and get the numbers from 3-1.txt
  const oneDPapers = await readFileToArray("../inputs/4-1.txt");
  const numRows = oneDPapers.length;
  const numCols = oneDPapers[0].length;
  let numOfPapersCanGet = 0;
  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numCols; c++) {
      const currentPaper = oneDPapers[r][c]; // Get the current cell content

      if (currentPaper === ".") {
        continue;
      } else {
        let numOfAdjacentPapers = 0;
        //this is the hey, I found a paper spot
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) {
              continue;
            }
            const newRow = r + dr;
            const newCol = c + dc;
            if (
              newRow >= 0 &&
              newRow < numRows &&
              newCol >= 0 &&
              newCol < numCols
            ) {
              if (oneDPapers[newRow][newCol] === "@") {
                numOfAdjacentPapers++;
              }
            }
          }
        }
        if (numOfAdjacentPapers < 4) {
          numOfPapersCanGet++;
        }
      }
    }
  }
  console.log(
    `Total number of papers that can be gotten: ${numOfPapersCanGet}`
  );
}

async function readFileToArray(filename) {
  try {
    const contents = await fsPromises.readFile(filename, "utf-8");
    const arr = contents
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line);
    return arr;
  } catch (err) {}
}

findPapersNeeded();

const fsPromises = require("fs").promises;

async function newSolution() {
  // Read the input file and get the numbers from 5-1.txt
  const input = await readFileToArray("../inputs/5-1.txt");
  //console.log(`Input read: ${input}`);
  let ranges = [];
  let ids = [];
  let validIds = [];
  //split into ranges and ids
  for (const line of input) {
    if (line.includes("-")) {
      ranges.push(line);
    } else {
      ids.push(line);
    }
  }
  const idsSet = new Set(ids);
  console.log(`Finding matches...`);
  //now that they are seperated I need to extract the ranges into a list of the possible valid ids
  for (const range of ranges) {
    const [start, end] = range.split("-").map(Number);
    for (const id of idsSet) {
      const numericId = Number(id);
      if (numericId >= start && numericId <= end) {
        validIds.push(numericId);
      }
    }
  }
  //now we got all valid ids, now we need ot filter out ones that appear more than one time
  let filteredValidIds = [];
  console.log(`Filtering duplicates...`);
  for (const id of validIds) {
    if (!filteredValidIds.includes(id)) {
      filteredValidIds.push(id);
    }
  }
  //console.log(`Valid IDs: ${filteredValidIds}`);
  console.log(`Number of valid IDs: ${filteredValidIds.length}`);
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

newSolution();

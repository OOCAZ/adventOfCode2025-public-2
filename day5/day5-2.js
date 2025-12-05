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
  ranges.sort((a, b) => {
    const [startA, endA] = a.split("-").map(Number);
    const [startB, endB] = b.split("-").map(Number);
    return startA - startB || endA - endB;
  });

  for (let j = 0; j < ranges.length - 1; j++) {
    const [start1, end1] = ranges[j].split("-").map(Number);
    const [start2, end2] = ranges[j + 1].split("-").map(Number);
    if (start2 <= end1) {
      ranges[j] = `${start1}-${Math.max(end1, end2)}`;
      ranges.splice(j + 1, 1);
      j--;
    }
  }
  let answerBin = 0;
  //now that I have unique ranges need to add all possible ids to valid ids
  for (const range of ranges) {
    const [start, end] = range.split("-").map(Number);
    answerBin += end - start + 1;
  }
  console.log(`Sorted ranges: ${ranges}`);
  console.log(`Answer: ${answerBin}`);
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

function findOverlappingIds(start, end, ids, validIds) {
  let count = 0;
  for (const id of ids) {
    const [start2, end2] = id.split("-").map(Number);
    if (start <= end2 && end >= start2) {
      //overlap
      count++;
      validIds.push(id);
    }
  }
  return count;
}

newSolution();

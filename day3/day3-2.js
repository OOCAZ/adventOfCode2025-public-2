const { start } = require("repl");

const fsPromises = require("fs").promises;

async function findEverything() {
  // Read the input file and get the numbers from 3-1.txt
  const banks = await readFileToArray("../inputs/3-1.txt");

  let maxValues = [];
  // Iterate through the banks and find the maximum value in each
  for (const bank of banks) {
    const bigNumber = findNextBiggestSubNumber(bank, 0, 0, "");
    maxValues.push(bigNumber);
  }
  let total = 0;
  for (const value of maxValues) {
    total += value;
  }
  console.log(`The maximum values are: ${maxValues}`);
  console.log("Maxes added together: " + total);
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

function findNextBiggestSubNumber(
  numberString,
  startingIndex,
  numOfRecursions,
  answerThusFar
) {
  //so this starts with presumably at least 12 number to the right of current index
  let maxSubNumber = 0;
  let indexOfMaxSubNumber = startingIndex;
  while (
    startingIndex + (12 - numOfRecursions) <=
    numberString.toString().length
  ) {
    if (numberString[startingIndex] > maxSubNumber) {
      maxSubNumber = numberString[startingIndex];
      indexOfMaxSubNumber = startingIndex;
    }
    startingIndex++;
  }
  startingIndex = indexOfMaxSubNumber + 1;
  answerThusFar = parseInt(
    answerThusFar.toString() + maxSubNumber.toString(),
    10
  );
  numOfRecursions++;
  if (numOfRecursions === 12) {
    return answerThusFar;
  }
  return findNextBiggestSubNumber(
    numberString,
    startingIndex,
    numOfRecursions,
    answerThusFar
  );
}

findEverything();

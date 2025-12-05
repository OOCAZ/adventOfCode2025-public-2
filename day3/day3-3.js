//llm wanted to do backtracking... I don't think it's necessary here, but both appear to work
const fsPromises = require("fs").promises;

async function findEverything() {
  // Read the input file and get the numbers from 3-1.txt
  const banks = await readFileToArray("../inputs/3-1.txt");

  //console.log(banks);
  let maxValues = [];
  // Iterate through the banks and find the maximum value in each
  for (const bank of banks) {
    // Start recursion from position 0, with 0 digits selected and empty answer
    const bigNumber = findNextBiggestSubNumber(bank, 0, 0, "");
    maxValues.push(bigNumber);
  }
  let total = 0n;
  for (const value of maxValues) {
    total += BigInt(value);
  }
  console.log(`The maximum values are: ${maxValues}`);
  console.log("Maxes added together: " + total.toString());
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
  // Base case: we've selected 12 digits
  if (numOfRecursions === 12) {
    return answerThusFar;
  }

  let selectedDigit = null;
  let indexOfSelectedDigit = -1;

  // Try digits from 9 down to 0
  for (let digit = 9; digit >= 0; digit--) {
    const digitChar = digit.toString();
    const digitsNeeded = 12 - numOfRecursions;
    const maxSearchPos = numberString.length - digitsNeeded;

    // Find this digit in the allowed range
    for (let i = startingIndex; i <= maxSearchPos; i++) {
      if (numberString[i] === digitChar) {
        selectedDigit = digitChar;
        indexOfSelectedDigit = i;
        break;
      }
    }

    if (selectedDigit !== null) {
      break;
    }
  }

  // Recurse to find the next digit
  return findNextBiggestSubNumber(
    numberString,
    indexOfSelectedDigit + 1,
    numOfRecursions + 1,
    answerThusFar + selectedDigit
  );
}

findEverything();

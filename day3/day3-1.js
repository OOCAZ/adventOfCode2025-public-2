const fsPromises = require("fs").promises;

async function findEverything() {
  // Read the input file and get the numbers from 3-1.txt
  const banks = await readFileToArray("../inputs/3-1.txt");

  //console.log(banks);
  let maxValues = [];
  // Iterate through the banks and find the maximum value in each
  for (const bank of banks) {
    let currentIndex = 0;
    let maxFirstValue = 0;
    let indexOfFirstMax = 0;
    let maxSecondValue = 0;
    while (currentIndex < bank.length) {
      //added this additional check to make sure highest number is not at the end
      if (
        bank[currentIndex] > maxFirstValue &&
        currentIndex !== bank.length - 1
      ) {
        maxFirstValue = bank[currentIndex];
        indexOfFirstMax = currentIndex;
      }
      currentIndex++;
    }
    indexOfFirstMax++;
    while (indexOfFirstMax < bank.length) {
      if (bank[indexOfFirstMax] > maxSecondValue) {
        maxSecondValue = bank[indexOfFirstMax];
      }
      indexOfFirstMax++;
    }
    maxValues.push(
      parseInt(maxFirstValue.toString() + maxSecondValue.toString(), 10)
    );
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

findEverything();

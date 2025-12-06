const fsPromises = require("fs").promises;

async function solveMathProblems() {
  // Read the input file and get the numbers from 6-1.txt
  const problems = await readFileToArray("../inputs/6-1.txt");
  let operationsToBePerformed = problems[problems.length - 1]
    .split(" ")
    .filter(Boolean, "");
  let numbers = problems
    .slice(0, problems.length - 1)
    .join(" ")
    .split(" ")
    .filter(Boolean, "")
    .map((num) => parseInt(num, 10));
  let numberGroups = [];
  for (let i = 0; i < numbers.length; i++) {
    //I need ot group numbers by what column they are in based on the number of operations
    const groupIndex = i % operationsToBePerformed.length;
    if (!numberGroups[groupIndex]) {
      numberGroups[groupIndex] = [];
    }
    numberGroups[groupIndex].push(numbers[i]);
  }
  //console.log(numberGroups);
  //console.log(`Numbers: ${numbers}`);
  //console.log(`Operations: ${operationsToBePerformed}`);
  let solutionArr = [];
  for (let i = 0; i < operationsToBePerformed.length; i++) {
    const nums = numberGroups[i];
    let binAdd = 0;
    let binMul = 1;
    const operation = operationsToBePerformed[i];
    if (operation === "+") {
      for (const num of nums) {
        binAdd += num;
      }
    } else {
      for (const num of nums) {
        binMul *= num;
      }
    }
    solutionArr.push(operation === "+" ? binAdd : binMul);
  }
  //console.log(numbers);
  //console.log(solutionArr);
  let finalSum = 0;
  for (const sol of solutionArr) {
    finalSum += sol;
  }
  console.log(`Final Sum: ${finalSum}`);
  //console.log(operationsToBePerformed);
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

solveMathProblems();

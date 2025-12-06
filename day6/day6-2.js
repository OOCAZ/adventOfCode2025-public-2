const fsPromises = require("fs").promises;

async function solveMathProblems() {
  // Read the input file without trimming to preserve spacing
  const contents = await fsPromises.readFile(
    "../inputs/6-1-small.txt",
    "utf-8"
  );
  const lines = contents.split("\n");

  // Remove last empty line if exists
  if (lines[lines.length - 1].trim() === "") {
    lines.pop();
  }

  const operatorLine = lines[lines.length - 1];
  const numberLines = lines.slice(0, lines.length - 1);

  // Get the maximum width
  const maxWidth = Math.max(...lines.map((line) => line.length));

  // Process columns from right to left
  const problems = [];
  let currentProblem = [];
  let operators = [];

  for (let col = maxWidth - 1; col >= 0; col--) {
    // Check if this entire column is empty (problem separator)
    let isEmptyColumn = true;
    for (let row = 0; row < numberLines.length; row++) {
      if (col < numberLines[row].length && numberLines[row][col] !== " ") {
        isEmptyColumn = false;
        break;
      }
    }

    if (isEmptyColumn) {
      // Skip empty columns unless we have a problem to save
      if (currentProblem.length > 0) {
        currentProblem.reverse(); // Reverse because we built it right-to-left
        problems.push(currentProblem);
        currentProblem = [];
      }
    } else {
      // Extract number from this column (top to bottom)
      let number = "";
      for (let row = 0; row < numberLines.length; row++) {
        const char =
          col < numberLines[row].length ? numberLines[row][col] : " ";
        number += char;
      }

      // Get operator from this column
      const operator = col < operatorLine.length ? operatorLine[col] : " ";
      if (operator !== " ") {
        operators.push(operator);
      }
      currentProblem.push({ number: number.trim() });
    }
  }

  // Don't forget the last problem
  if (currentProblem.length > 0) {
    currentProblem.reverse();
    problems.push(currentProblem);
  }

  //console.log("Problems:", JSON.stringify(problems, null, 2));

  // Calculate results
  let total = 0;
  //console.log(problems);
  for (const problem of problems) {
    // Find the actual operator (first non-space operator)
    let operator = operators[problems.indexOf(problem)];

    // Extract numbers (skip empty ones)
    const numbers = problem
      .map((item) => item.number)
      .filter((num) => num.trim())
      .map((num) => parseInt(num));

    // Calculate result
    let result = numbers[0];
    for (let i = 1; i < numbers.length; i++) {
      if (operator === "+") {
        result += numbers[i];
      } else if (operator === "*") {
        result *= numbers[i];
      }
    }

    /*console.log(
      "Problem numbers:",
      numbers,
      "Operator:",
      operator,
      "Result:",
      result
    );*/
    total += result;
  }

  console.log("Total:", total);
}

solveMathProblems();

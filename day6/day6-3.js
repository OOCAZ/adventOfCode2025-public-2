const fsPromises = require("fs").promises;

async function solveMathProblems() {
  const contents = await fsPromises.readFile("../inputs/6-1.txt", "utf-8");
  const lines = contents.split("\n");

  if (lines[lines.length - 1].trim() === "") {
    lines.pop();
  }

  const operatorLine = lines[lines.length - 1];
  const numberLines = lines.slice(0, lines.length - 1);
  const operatorLineLen = operatorLine.length;

  const maxWidth = Math.max(...lines.map((line) => line.length));

  // Operation functions for better performance
  const operations = {
    "+": (a, b) => a + b,
    "*": (a, b) => a * b,
  };

  const problems = [];
  let currentProblem = [];
  let currentOperator = "+";

  const saveProblem = () => {
    if (currentProblem.length > 0) {
      problems.push({
        numbers: currentProblem,
        operator: currentOperator,
      });
      currentProblem = [];
      currentOperator = "+";
    }
  };

  for (let col = maxWidth - 1; col >= 0; col--) {
    const isEmptyColumn = !numberLines.some(
      (row) => col < row.length && row[col] !== " "
    );

    if (isEmptyColumn) {
      saveProblem();
    } else {
      const number = numberLines
        .map((row) => (col < row.length ? row[col] : " "))
        .join("")
        .trim();

      if (col < operatorLineLen) {
        const operator = operatorLine[col];
        if (operator !== " ") {
          currentOperator = operator;
        }
      }

      currentProblem.unshift(number);
    }
  }

  saveProblem();

  const total = problems.reduce((sum, problem) => {
    const numbers = problem.numbers.filter(Boolean).map(Number);
    const operation = operations[problem.operator];
    const result = numbers.reduce(operation);
    return sum + result;
  }, 0);

  console.log("Total:", total);
}

solveMathProblems();

const fsPromises = require("fs").promises;
const path = require("path");

async function lightsCalculator() {
  const contents = await fsPromises.readFile(
    path.join(__dirname, "../inputs/10-1.txt"),
    "utf-8"
  );
  const contentsLines = contents.split("\n");

  const parsedLines = contentsLines.map((line) => {
    const switchConfig = line.split("[")[1]?.split("]")[0];
    const buttonSection = line.split("] ")[1]?.split(" {")[0]?.trim();
    const buttonParts = buttonSection?.split(") ") || [];
    const buttonArrays = buttonParts.map((part) => {
      const nums = part
        .replace("(", "")
        .replace(")", "")
        .split(",")
        .map((num) => parseInt(num.trim(), 10));
      return nums;
    });

    const counterSection = line.split("{")[1]?.split("}")[0];
    const targetCounters =
      counterSection?.split(",").map((num) => parseInt(num.trim(), 10)) || [];

    return { switchConfig, buttonArrays, targetCounters };
  });

  let totalButtonPresses = 0;
  let totalCounterSum = 0;

  for (let i = 0; i < parsedLines.length; i++) {
    const { switchConfig, buttonArrays, targetCounters } = parsedLines[i];
    if (!switchConfig) continue;

    const switchConfigBool = switchConfig.split("").map((char) => char === "#");
    const numCounters = targetCounters.length;
    const buttonConfigsBool = buttonArrays.map((button) => {
      const boolArray = [];
      for (let j = 0; j < numCounters; j++) {
        boolArray.push(button.includes(j));
      }
      return boolArray;
    });

    const result = processLine(buttonConfigsBool, targetCounters, i);

    if (result !== null) {
      totalButtonPresses += result.presses;
      totalCounterSum += result.counterSum;
    }
  }

  console.log(`\n=== TOTAL BUTTON PRESSES: ${totalButtonPresses} ===`);
  console.log(`=== TOTAL COUNTER SUM: ${totalCounterSum} ===`);
}

module.exports = lightsCalculator;

function processLine(buttonConfig, targetCounters, lineNum) {
  const numCounters = targetCounters.length;
  const numButtons = buttonConfig.length;

  // Build coefficient matrix A where A[i][j] = 1 if button j affects counter i
  const A = [];
  for (let counter = 0; counter < numCounters; counter++) {
    const row = [];
    for (let button = 0; button < numButtons; button++) {
      row.push(buttonConfig[button][counter] ? 1 : 0);
    }
    A.push(row);
  }

  const solution = solveLinearSystemMinimal(
    A,
    targetCounters,
    numButtons,
    numCounters
  );

  if (solution) {
    const totalPresses = solution.reduce((sum, val) => sum + val, 0);

    // Verify
    const resultCounters = new Array(numCounters).fill(0);
    for (let button = 0; button < numButtons; button++) {
      for (let counter = 0; counter < numCounters; counter++) {
        if (buttonConfig[button][counter]) {
          resultCounters[counter] += solution[button];
        }
      }
    }

    const counterSum = resultCounters.reduce((sum, val) => sum + val, 0);
    return { presses: totalPresses, counterSum };
  }

  return null;
}

function solveLinearSystemMinimal(A, b, numVars, numEqs) {
  // Solve Ax = b using Gaussian elimination to find general solution
  // Then enumerate over free variables to find minimal solution

  // Create augmented matrix [A | b]
  const matrix = [];
  for (let i = 0; i < numEqs; i++) {
    matrix.push([...A[i], b[i]]);
  }

  // Gaussian elimination (without modulo - we want integer solutions)
  const pivotCols = [];
  let currentRow = 0;

  for (let col = 0; col < numVars && currentRow < numEqs; col++) {
    // Find pivot
    let pivotRow = -1;
    for (let row = currentRow; row < numEqs; row++) {
      if (matrix[row][col] !== 0) {
        pivotRow = row;
        break;
      }
    }

    if (pivotRow === -1) continue; // Free variable

    // Swap rows
    if (pivotRow !== currentRow) {
      [matrix[currentRow], matrix[pivotRow]] = [
        matrix[pivotRow],
        matrix[currentRow],
      ];
    }

    pivotCols.push(col);

    // Eliminate below (forward elimination only)
    for (let row = currentRow + 1; row < numEqs; row++) {
      if (matrix[row][col] !== 0) {
        const factor = matrix[row][col] / matrix[currentRow][col];
        for (let c = col; c <= numVars; c++) {
          matrix[row][c] -= factor * matrix[currentRow][c];
        }
      }
    }

    currentRow++;
  }

  // Check for contradictions
  for (let row = 0; row < numEqs; row++) {
    let allZero = true;
    for (let col = 0; col < numVars; col++) {
      if (Math.abs(matrix[row][col]) > 0.0001) {
        allZero = false;
        break;
      }
    }
    if (allZero && Math.abs(matrix[row][numVars]) > 0.0001) {
      return null; // No solution
    }
  }

  // Find free variables
  const freeVars = [];
  for (let col = 0; col < numVars; col++) {
    if (!pivotCols.includes(col)) {
      freeVars.push(col);
    }
  }

  // If too many free variables, use heuristic
  if (freeVars.length > 15) {
    return solveWithHeuristic(matrix, pivotCols, freeVars, numVars, numEqs, b);
  }

  // Enumerate all combinations of free variables
  const maxValue = Math.max(...b);
  let bestSolution = null;
  let bestCost = Infinity;

  // Try all combinations (limit range for each free variable)
  function enumerate(freeVarIndex, solution) {
    if (freeVarIndex === freeVars.length) {
      // Back-substitute to find pivot variables
      const candidate = [...solution];

      for (let row = pivotCols.length - 1; row >= 0; row--) {
        const col = pivotCols[row];
        let sum = matrix[row][numVars];

        for (let c = col + 1; c < numVars; c++) {
          sum -= matrix[row][c] * candidate[c];
        }

        if (Math.abs(matrix[row][col]) < 0.0001) continue;

        const value = sum / matrix[row][col];

        // Must be non-negative integer
        if (value < -0.0001 || Math.abs(value - Math.round(value)) > 0.0001) {
          return;
        }

        candidate[col] = Math.round(value);
      }

      // Check if valid and better
      const cost = candidate.reduce((sum, val) => sum + val, 0);
      if (cost < bestCost) {
        // Verify solution
        let valid = true;
        for (let eq = 0; eq < numEqs; eq++) {
          let sum = 0;
          for (let v = 0; v < numVars; v++) {
            sum += A[eq][v] * candidate[v];
          }
          if (Math.abs(sum - b[eq]) > 0.0001) {
            valid = false;
            break;
          }
        }

        if (valid) {
          bestCost = cost;
          bestSolution = [...candidate];
        }
      }
      return;
    }

    const freeVar = freeVars[freeVarIndex];

    // Try values 0 to maxValue for this free variable
    for (let val = 0; val <= maxValue; val++) {
      solution[freeVar] = val;
      enumerate(freeVarIndex + 1, solution);

      // Early termination if we found a good solution
      if (bestCost < Infinity && val > bestCost) break;
    }

    solution[freeVar] = 0;
  }

  const initialSolution = new Array(numVars).fill(0);
  enumerate(0, initialSolution);

  return bestSolution;
}

function solveWithHeuristic(matrix, pivotCols, freeVars, numVars, numEqs, b) {
  // For large free variable spaces, use greedy heuristic
  // Set all free variables to 0 and solve for pivot variables

  const solution = new Array(numVars).fill(0);

  for (let row = pivotCols.length - 1; row >= 0; row--) {
    const col = pivotCols[row];
    let sum = matrix[row][numVars];

    for (let c = col + 1; c < numVars; c++) {
      sum -= matrix[row][c] * solution[c];
    }

    if (Math.abs(matrix[row][col]) < 0.0001) continue;

    const value = sum / matrix[row][col];

    if (value < -0.0001) {
      // Try adjusting free variables
      return null;
    }

    solution[col] = Math.max(0, Math.round(value));
  }

  return solution;
}

if (require.main === module) {
  lightsCalculator();
}

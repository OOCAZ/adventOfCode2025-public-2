const fsPromises = require("fs").promises;
const path = require("path");

async function lightsCalculator() {
  // Read the input file without trimming to preserve spacing
  const contents = await fsPromises.readFile(
    path.join(__dirname, "../inputs/10-1.txt"),
    "utf-8"
  );
  const contentsLines = contents.split("\n");
  //get rid of everything past the open curly brace
  const processedLines = contentsLines.map((line) => line.split(" {")[0]);
  //now get configurationas of switches
  const switchConfigs = contentsLines.map(
    (line) => line.split("[")[1]?.split("]")[0]
  );
  //now to get the button configurations after swithc ocnfigureations and load them to an array
  const buttonConfigs = processedLines.map((line) =>
    line.split("] ")[1]?.trim()
  );
  //this gives me strign array for buttons but I want each value in () to be an array of numbers
  for (let i = 0; i < buttonConfigs.length; i++) {
    if (buttonConfigs[i]) {
      const buttonParts = buttonConfigs[i].split(") ");
      const buttonArrays = buttonParts.map((part) => {
        const nums = part
          .replace("(", "")
          .replace(")", "")
          .split(",")
          .map((num) => parseInt(num.trim(), 10));
        return nums;
      });
      buttonConfigs[i] = buttonArrays;
    }
  }
  //ok, now that I have the inputs, basically need a helper function to process each line
  //first lets convert switch configs from "." for False and "#" for True into something more usable ( boolean array)
  const switchConfigsBool = switchConfigs.map((config) =>
    config.split("").map((char) => (char === "#" ? true : false))
  );
  //console.log(switchConfigsBool);
  //now we need to convert our buttons configs
  //for each array we need ot convert to boolean array as well [3] converts to [false, false, true, false]
  //and [5,2] converts to [false, false, true, false, false, true]
  const buttonConfigsBool = buttonConfigs.map((buttonArray, index) =>
    buttonArray.map((button) => {
      const length = switchConfigsBool[index].length;
      const boolArray = [];
      for (let i = 0; i < length; i++) {
        boolArray.push(button.includes(i) ? true : false);
      }
      return boolArray;
    })
  );
  //console.log(buttonConfigsBool);
  //now we have everything in boolean arrays, we can process each line
  let totalButtonPresses = 0;
  for (let i = 0; i < processedLines.length; i++) {
    const result = processLine(switchConfigsBool[i], buttonConfigsBool[i], i);
    if (result !== Infinity) {
      totalButtonPresses += result;
    }
  }
  console.log(`\n=== TOTAL BUTTON PRESSES: ${totalButtonPresses} ===`);
}

module.exports = lightsCalculator;

function processLine(switchConfig, buttonConfig, lineNum) {
  // switchConfig is the target state we want to reach
  // buttonConfig is an array where each element represents which lights a button toggles
  // We need to find the minimum number of button presses

  const numLights = switchConfig.length;
  const numButtons = buttonConfig.length;

  // Build the augmented matrix for Gaussian elimination
  // Each row represents a light, each column represents a button
  // The last column is the target state for that light
  const matrix = [];
  for (let light = 0; light < numLights; light++) {
    const row = [];
    for (let button = 0; button < numButtons; button++) {
      // Does this button affect this light?
      row.push(buttonConfig[button][light] ? 1 : 0);
    }
    // Target state for this light
    row.push(switchConfig[light] ? 1 : 0);
    matrix.push(row);
  }

  // Perform Gaussian elimination in GF(2) (binary field)
  const result = gaussianEliminationGF2(matrix, numButtons);

  if (result === null) {
    return Infinity;
  }

  // Find free variables (columns without pivots)
  const { pivotCols, freeVars } = result;

  // Try all combinations of free variables to find minimum button presses
  const numFreeVars = freeVars.length;
  const numCombinations = Math.pow(2, numFreeVars);
  let minPresses = Infinity;

  for (let combo = 0; combo < numCombinations; combo++) {
    // Create solution vector
    const solution = new Array(numButtons).fill(0);

    // Set free variables based on current combination
    for (let i = 0; i < numFreeVars; i++) {
      solution[freeVars[i]] = (combo >> i) & 1;
    }

    // Back-substitute to find pivot variables
    for (let row = numLights - 1; row >= 0; row--) {
      // Find pivot in this row
      let pivotCol = -1;
      for (let col = 0; col < numButtons; col++) {
        if (matrix[row][col] === 1) {
          pivotCol = col;
          break;
        }
      }

      if (pivotCol === -1) continue; // No pivot in this row

      // Calculate what this pivot variable should be
      let sum = matrix[row][numButtons]; // Start with target value
      for (let col = pivotCol + 1; col < numButtons; col++) {
        sum ^= matrix[row][col] * solution[col];
      }
      solution[pivotCol] = sum;
    }

    // Count button presses
    const presses = solution.reduce((sum, val) => sum + val, 0);
    minPresses = Math.min(minPresses, presses);
  }

  return minPresses;
}

function gaussianEliminationGF2(matrix, numButtons) {
  const numRows = matrix.length;
  const numCols = numButtons + 1; // +1 for augmented column

  let currentRow = 0;
  const pivotCols = [];

  // Forward elimination
  for (let col = 0; col < numButtons; col++) {
    // Find pivot
    let pivotRow = -1;
    for (let row = currentRow; row < numRows; row++) {
      if (matrix[row][col] === 1) {
        pivotRow = row;
        break;
      }
    }

    if (pivotRow === -1) {
      // No pivot in this column, it's a free variable
      continue;
    }

    // Swap rows if needed
    if (pivotRow !== currentRow) {
      [matrix[currentRow], matrix[pivotRow]] = [
        matrix[pivotRow],
        matrix[currentRow],
      ];
    }

    pivotCols.push(col);

    // Eliminate all other 1's in this column (both above and below)
    for (let row = 0; row < numRows; row++) {
      if (row !== currentRow && matrix[row][col] === 1) {
        // XOR this row with the pivot row
        for (let c = 0; c < numCols; c++) {
          matrix[row][c] ^= matrix[currentRow][c];
        }
      }
    }

    currentRow++;
  }

  // Check for contradictions (row like [0 0 0 ... 0 | 1])
  for (let row = 0; row < numRows; row++) {
    let allZero = true;
    for (let col = 0; col < numButtons; col++) {
      if (matrix[row][col] === 1) {
        allZero = false;
        break;
      }
    }
    if (allZero && matrix[row][numButtons] === 1) {
      return null; // Contradiction - no solution
    }
  }

  // Find free variables
  const freeVars = [];
  for (let col = 0; col < numButtons; col++) {
    if (!pivotCols.includes(col)) {
      freeVars.push(col);
    }
  }

  return { pivotCols, freeVars };
}

if (require.main === module) {
  lightsCalculator();
}

const fsPromises = require("fs").promises;

async function numberRotator() {
  //I need to go to the inputs file and get the numbers from the 1-1.txt
  const numbers = await readFileToArray("./inputs/1-1.txt");
  console.log(numbers);
  let zeros = 0;
  let currentPosition = 50;
  // iterate values and update position; count occurrences of 0 during the process
  for (const entry of numbers) {
    // console.log(entry);
    if (entry[0] === "L") {
      currentPosition = turnLeft(entry, currentPosition);
    } else if (entry[0] === "R") {
      currentPosition = turnRight(entry, currentPosition);
    }
    // count when position is zero after the move
    if (currentPosition === 0) zeros += 1;
  }
  console.log(`The final position is ${currentPosition}`);
  console.log(`Number of times the position was zero: ${zeros}`);
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

function turnLeft(entry, currentPosition) {
  // Implement the logic for turning left based on the entry
  // the numbers on the safe are 0-99, so after 0 comes 99
  // Reduce the number of steps to the effective steps on a 0-99 dial
  const steps = parseInt(entry.substring(1), 10) % 100;
  // Move left (subtract) with proper modulo handling
  currentPosition = (((currentPosition - steps) % 100) + 100) % 100;
  return currentPosition;
}

function turnRight(entry, currentPosition) {
  // Implement the logic for turning right based on the entry
  // the numbers on the safe are 0-99, so after 99 comes 0
  const steps = parseInt(entry.substring(1), 10) % 100;
  currentPosition = (currentPosition + steps) % 100;
  return currentPosition;
}

numberRotator();
//node day1-1.js

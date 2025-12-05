const fsPromises = require("fs").promises;

async function numberRotator() {
  //I need to go to the inputs file and get the numbers from the 1-1.txt
  const numbers = await readFileToArray("../inputs/1-1.txt");
  console.log(numbers);
  let zeros = 0;
  let currentPosition = 50;
  // iterate values and update position; count occurrences of 0 during the process
  for (const entry of numbers) {
    // console.log(entry);
    if (entry[0] === "L") {
      const { newPosition, zerosPassed } = turnLeft(entry, currentPosition);
      currentPosition = newPosition;
      zeros += zerosPassed;
    } else if (entry[0] === "R") {
      const { newPosition, zerosPassed } = turnRight(entry, currentPosition);
      currentPosition = newPosition;
      zeros += zerosPassed;
    }
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
  const steps = parseInt(entry.substring(1), 10);

  let zerosPassed = 0;
  if (steps > 0) {
    if (currentPosition === 0) {
      zerosPassed = Math.floor(steps / 100);
    } else if (steps >= currentPosition) {
      zerosPassed = 1 + Math.floor((steps - currentPosition) / 100);
    }
  }
  // Apply movement using steps % 100 with proper modulo arithmetic
  const normalized = steps % 100;
  const newPosition = (((currentPosition - normalized) % 100) + 100) % 100;
  return { newPosition, zerosPassed };
}

function turnRight(entry, currentPosition) {
  // Implement the logic for turning right based on the entry
  // the numbers on the safe are 0-99, so after 99 comes 0
  const steps = parseInt(entry.substring(1), 10);
  // Count how many times we pass zero going right
  const zerosPassed = Math.floor((currentPosition + steps) / 100);
  const normalized = steps % 100;
  const newPosition = (currentPosition + normalized) % 100;
  return { newPosition, zerosPassed };
}

numberRotator();
//node day1-1.js

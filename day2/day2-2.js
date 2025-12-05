import { promises as fsPromises } from "fs";

async function goThroughIds() {
  const ids = await readFileToArray("../inputs/2-1.txt");
  console.log(ids);
  let dupes = [];
  for (const id of ids) {
    let lower = parseInt(id.slice(0, id.indexOf("-")), 10);
    //console.log(`Lower is: ${lower}`);
    let upper = parseInt(id.slice(id.indexOf("-") + 1), 10);
    //console.log(`Upper is: ${upper}`);
    let currentCount = lower;
    while (currentCount <= upper) {
      //console.log(`Current Count is: ${currentCount}`);
      findIfDupeExists(currentCount, dupes);
      currentCount++;
    }
  }
  //dupes added together
  let total = 0;
  console.log("funky math time");
  let dupesTwo = [];
  for (const dupe of dupes) {
    if (parseInt(dupe, 10) === dupes[dupes.indexOf(dupe) + 1]) {
      if (!dupesTwo.includes(dupe)) {
        dupesTwo.push(dupe);
        //total += parseInt(dupe, 10);
      }
    }
  }
  for (const dupe of dupesTwo) {
    total += parseInt(dupe, 10);
  }
  console.log(`Filtered dupes: ${dupesTwo}`);
  console.log(`The total of the dupes is: ${total}`);
}

function findIfDupeExists(id, dupes) {
  //first part that divides in half and gets those values
  /*let half = Math.floor(id.toString().length / 2);
  if (id.toString().slice(0, half) === id.toString().slice(half, id.length)) {
    dupes.push(id);
  }*/
  //now I need to find if any number is duplicated in the id, 999, 565656, and 1111111 are all dupes now
  for (const char in id.toString()) {
    let idCopy = id.toString();
    let window = id.toString().slice(0, parseInt(char, 10) + 1);
    while (idCopy.length > 0) {
      if (idCopy.startsWith(window)) {
        idCopy = idCopy.slice(window.length);
        if (idCopy.length === 0) {
          //console.log(`Found a dupe in ID: ${id}`);
          dupes.push(id);
        }
      } else {
        break;
      }
    }
  }
}

async function readFileToArray(filename) {
  try {
    const contents = await fsPromises.readFile(filename, "utf-8");
    const arr = contents
      .split(",")
      .map((line) => line.trim())
      .filter((line) => line);
    return arr;
  } catch (err) {}
}

goThroughIds();

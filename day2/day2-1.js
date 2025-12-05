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
  console.log(`Found ${dupes.length} dupes: ${dupes}`);
  //dupes added together
  let total = 0;
  for (const dupe of dupes) {
    total += parseInt(dupe, 10);
  }
  console.log(`The total of the dupes is: ${total}`);
}

function findIfDupeExists(id, dupes) {
  let half = Math.floor(id.toString().length / 2);
  //console.log(`Half is: ${half}`);

  //console.log(`Checking ID: ${id}`);
  //console.log(`First half: ${id.toString().slice(0, half)}`);
  //console.log(`Second half: ${id.toString().slice(half, id.length)}`);
  if (id.toString().slice(0, half) === id.toString().slice(half, id.length)) {
    //console.log(`Found a dupe in ID: ${id}`);
    dupes.push(id);
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

const fsPromises = require("fs").promises;
const { performance } = require("perf_hooks");

async function computeRanges(filename = "../inputs/5-1.txt") {
  const startTime = performance.now();

  // Read the input file and parse numeric ranges once
  const input = await readFileToArray(filename);
  const ranges = [];
  for (let i = 0; i < input.length; i++) {
    const line = input[i];
    const idx = line.indexOf("-");
    if (idx !== -1) {
      const parts = line.split("-");
      const a = Number(parts[0]);
      const b = Number(parts[1]);
      ranges.push([a, b]);
    }
  }

  if (ranges.length === 0) {
    const timeMs = performance.now() - startTime;
    return { answer: 0, timeMs };
  }

  // Sort numerically by start then end
  ranges.sort((x, y) => x[0] - y[0] || x[1] - y[1]);

  // Merge ranges and accumulate total covered length
  let answerBin = 0;
  let curStart = ranges[0][0];
  let curEnd = ranges[0][1];
  for (let i = 1; i < ranges.length; i++) {
    const s = ranges[i][0];
    const e = ranges[i][1];
    if (s <= curEnd + 1) {
      if (e > curEnd) curEnd = e;
    } else {
      answerBin += curEnd - curStart + 1;
      curStart = s;
      curEnd = e;
    }
  }
  answerBin += curEnd - curStart + 1;

  const timeMs = performance.now() - startTime;
  return { answer: answerBin, timeMs };
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

// Keep CLI behavior for direct runs, and export for benchmarking
async function main() {
  const res = await computeRanges();
  console.log(`Answer: ${res.answer}`);
  console.log(`Execution time: ${res.timeMs.toFixed(2)} ms`);
}

if (require.main === module) main();

module.exports = { computeRanges };

const fsPromises = require("fs").promises;
const path = require("path");

async function countPaths() {
  // Read the input file
  const contents = await fsPromises.readFile(
    path.join(__dirname, "../inputs/11-1.txt"),
    "utf-8"
  );

  // Parse the input to build a graph representation
  const graph = {};
  const lines = contents.trim().split("\n");

  for (const line of lines) {
    const cleanLine = line.trim();
    const [device, outputsStr] = cleanLine.split(": ");
    const outputs = outputsStr.split(" ");
    graph[device] = outputs;
  }

  const specifiedValue1 = "dac";
  const specifiedValue2 = "fft";

  // NEW ALGORITHM: Dynamic Programming with memoization
  // Key insight: We need paths that go through BOTH dac and fft
  // Break this into subproblems:
  // 1. Count paths from svr -> dac -> fft -> out
  // 2. Count paths from svr -> fft -> dac -> out

  console.log("Computing paths with DP...");

  // Memoization: cache[node][visitedDac][visitedFft] = number of paths to "out"
  const memo = new Map();

  function getMemoKey(node, hasDac, hasFft) {
    return `${node}|${hasDac}|${hasFft}`;
  }

  function countPathsDP(current, hasDac, hasFft, visited) {
    // Base case: reached "out"
    if (current === "out") {
      return hasDac && hasFft ? 1 : 0;
    }

    // Check memo
    const key = getMemoKey(current, hasDac, hasFft);
    if (memo.has(key) && !visited.has(current)) {
      return memo.get(key);
    }

    // No outputs
    if (!graph[current]) {
      return 0;
    }

    // Cycle detection
    if (visited.has(current)) {
      return 0;
    }

    visited.add(current);

    // Update state based on current node
    const newHasDac = hasDac || current === specifiedValue1;
    const newHasFft = hasFft || current === specifiedValue2;

    let totalPaths = 0;

    // Explore all neighbors
    for (const next of graph[current]) {
      totalPaths += countPathsDP(next, newHasDac, newHasFft, visited);
    }

    visited.delete(current);

    // Only memoize if we haven't visited this node (to handle cycles properly)
    if (!visited.has(current)) {
      memo.set(key, totalPaths);
    }

    return totalPaths;
  }

  const result = countPathsDP("svr", false, false, new Set());

  console.log(
    `Number of paths from 'svr' to 'out' that visit both '${specifiedValue1}' and '${specifiedValue2}': ${result}`
  );
  return result;
}

module.exports = countPaths;

if (require.main === module) {
  countPaths();
}

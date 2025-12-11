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
    const cleanLine = line.trim(); // Remove any \r or extra whitespace
    const [device, outputsStr] = cleanLine.split(": ");
    const outputs = outputsStr.split(" ");
    graph[device] = outputs;
  }

  let pathCount = 0;

  function dfs(current, visited) {
    if (current === "out") {
      pathCount++;
      return;
    }

    // If this device has no outputs , stop
    if (!graph[current]) {
      return;
    }

    visited.add(current);

    for (const next of graph[current]) {
      if (!visited.has(next)) {
        dfs(next, visited);
      }
    }

    // Backtrack: remove current from visited for other paths
    visited.delete(current);
  }

  // Start DFS from "you"
  dfs("you", new Set());

  console.log(`Total number of paths from 'you' to 'out': ${pathCount}`);
  return pathCount;
}

module.exports = countPaths;

if (require.main === module) {
  countPaths();
}

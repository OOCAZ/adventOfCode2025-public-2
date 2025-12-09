const fsPromises = require("fs").promises;
const path = require("path");

// Union-Find (Disjoint Set Union) data structure
class UnionFind {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.size = Array(n).fill(1);
    this.numSets = n;
  }

  find(x) {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]); // Path compression
    }
    return this.parent[x];
  }

  union(x, y) {
    let rootX = this.find(x);
    let rootY = this.find(y);

    if (rootX === rootY) return false; // Already in same set

    // Union by size
    if (this.size[rootX] < this.size[rootY]) {
      [rootX, rootY] = [rootY, rootX];
    }

    this.parent[rootY] = rootX;
    this.size[rootX] += this.size[rootY];
    this.numSets--;
    return true;
  }

  getSetSizes() {
    const sizes = new Map();
    for (let i = 0; i < this.parent.length; i++) {
      const root = this.find(i);
      sizes.set(root, this.size[root]);
    }
    return Array.from(sizes.values()).sort((a, b) => b - a);
  }
}

async function circuitSolver() {
  const startTime = Date.now();

  // Read the input file
  const contents = await fsPromises.readFile(
    path.join(__dirname, "../inputs/8-1.txt"),
    "utf-8"
  );
  const points = contents
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => line.split(",").map((coord) => parseInt(coord.trim(), 10)));

  // Step 1: Calculate all pairwise distances and create edges
  const edges = [];
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const dist = findDistance(points[i], points[j]);
      edges.push({ i, j, dist });
    }
  }

  // Step 2: Sort edges by distance (Kruskal's algorithm)
  edges.sort((a, b) => a.dist - b.dist);

  // Step 3: Use Union-Find to connect until only 2 circuits remain
  const uf = new UnionFind(points.length);
  let connectionsAttempted = 0;
  let connectionsSuccessful = 0;
  let bridgeEdge = null;

  for (const edge of edges) {
    if (uf.numSets <= 2) {
      // We have 2 circuits - find the edge that would bridge them
      if (!bridgeEdge && uf.find(edge.i) !== uf.find(edge.j)) {
        bridgeEdge = edge;
        break;
      }
    }

    connectionsAttempted++;
    if (uf.union(edge.i, edge.j)) {
      connectionsSuccessful++;
    }
  }
  if (bridgeEdge) {
    const point1 = points[bridgeEdge.i];
    const point2 = points[bridgeEdge.j];
    const result2 = point1[0] * point2[0];
    console.log(`  X-coordinates: ${point1[0]} × ${point2[0]} = ${result2}`);
  }
}

function findDistance(point1, point2) {
  const dx = point1[0] - point2[0];
  const dy = point1[1] - point2[1];
  const dz = point1[2] - point2[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

module.exports = circuitSolver;

if (require.main === module) {
  circuitSolver();
}

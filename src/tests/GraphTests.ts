import DirectedGraph from "../lib/DirectedGraph";
import { Edge, WeightedEdge, WeightedGraph } from "../lib/Graph";
import LoggedArray from "../LoggedArray";
import LoggedGraph from "../LoggedGraph";
import Logger from "../Logger";


//-------------------------------------------------------------------//
//Traversal algorithms


//ideally number should be E
function dijkstra<V>(start: V, graph: LoggedGraph<V,number>) {
  type CostPath<V> = { known: boolean, cost: number, path: V };

  const table: Map<V, CostPath<V>> = new Map<V, CostPath<V>>();
  //temporary solution to immitate minimum priority queue
  const minQueue:  LoggedArray<WeightedEdge<V,number>> = graph.getLogger().createArray([]);
  const comparator = (a: WeightedEdge<V,number>, b: WeightedEdge<V,number>) => b.weight - a.weight;
  //setup
  minQueue.push({src: start, dst: start, weight: 0});
  graph.getNodes().forEach(node => table.set(node, {known: false, cost: Infinity, path: null as V}));
  table.get(start)!.cost = 0;

  //start: table is 'empty' and none of the nodes are visited
  while (minQueue.size() > 0) {
    console.log('Queue:        %o', minQueue);

    const currEdge = minQueue.pop()!;
    const currNodeStatus = table.get(currEdge.dst)!
    
    console.log('Current Edge: %o', currEdge);
    console.log('Status:       %o', currNodeStatus);
    console.log('Table:        %o', table);
    console.log();


    //highlight the node
    graph.getLogger().highlight([[graph, currEdge.dst]], () => {

    //if node has not been visited
    if (!currNodeStatus.known) {
      currNodeStatus.known = true;
      ///*
      //to exclude setting path as start for startnode
      if (currEdge.src !== currEdge.dst) {
        currNodeStatus.path = currEdge.src;
      }
      //*/
      //currNodeStatus.path = currEdge.src;
      currNodeStatus.cost = currEdge.weight;

      //find adjacent edges with destination nodes that have not been visited
      //add accumilated weight to every edge
      //add edges to priority queue
      //assign path to current node
      for (const [adjEdge, pointer] of graph.getEdgesFromNode(currEdge.dst)) {
        const adjNodeStatus = table.get(adjEdge.dst)!;

        graph.getLogger().highlight([[graph, pointer]], () => {
        if (!adjNodeStatus.known /*&& adjNodeStatus.cost > currEdge.weight + adjEdge.weight*/ ) {
          //highlight the edge
          //graph.logger.highlight({graph, pointer});
          adjEdge.weight += currEdge.weight;
          minQueue.push(adjEdge);
        }
        });
      }
      minQueue.apply(Array.prototype.sort, comparator);
    }
    });
  }

  return table;
}

function graphBFS<V,E>(start: V, graph: LoggedGraph<V,E>): V[] {
  //setup for logger
  const indexes = new Map<V,number>();
  let i = 0;
  const visitedArray: [V,boolean][]  = [];
  for (const node of graph.getNodes()) {
    indexes.set(node, i++);
    visitedArray.push([node, false]);
  }
  visitedArray[indexes.get(start)!] = [start, true];

  const result: V[] = []; //convert to LoggedArray<V>?
  const visited = graph.getLogger().createArray<[V,boolean]>(visitedArray);
  const queue = graph.getLogger().createQueue<V>(graph.getAllEdges().length);
  queue.enqueue(start);

  while (queue.size()) {
    const currentNode = queue.dequeue();
    result.push(currentNode);

    for (const [edge, pointer] of graph.getEdgesFromNode(currentNode)) {
      graph.getLogger().highlight([[graph, pointer]], () => {
      if (!visited.get(indexes.get(edge.dst)!)[1]) {
        queue.enqueue(edge.dst);
        visited.set(indexes.get(edge.dst)!, [edge.dst, true]);
      }
      });
    }
  }

  return result;
}

function graphBFS2<V,E>(start: V, graph: LoggedGraph<V,E>): V[] {
  const logger = graph.getLogger();
  const bfsPath: V[] = []; //convert to LoggedArray<V>?
  const table = logger.createTable<V,boolean>();
  const queue = logger.createQueue<V>(graph.getAllEdges().length);  

  graph.getNodes().forEach(node => table.set(node, false));
  table.set(start, true);
  queue.enqueue(start);

  while (queue.size()) {
    const currentNode = queue.dequeue();
    bfsPath.push(currentNode);

    //highlight node as well?

    for (const [edge, pointer] of graph.getEdgesFromNode(currentNode)) {
      logger.highlight([[graph, pointer]], () => {
      if (!table.get(edge.dst)!) {
        queue.enqueue(edge.dst);
        table.set(edge.dst, true);
      }
      });
    }
  }

  return bfsPath;
}

//-------------------------------------------------------------------//
//Auxiliary functions

function adjListToGraph<V,E>(graph: DirectedGraph<V,E>): WeightedGraph<V,E> {
  const weightedGraph: WeightedGraph<V,E> = {
    vertices: [],
    edges: [],
    weights: []
  };
  for (const node of graph.getNodes()) {
    weightedGraph.vertices.push(node);
    for (const weightedEdge of graph.getEdgesFromNode(node)) {
      const edge: Edge<V> = {
        src: weightedEdge.src,
        dst: weightedEdge.dst
      }
      weightedGraph.edges.push(edge);
      weightedGraph.weights.push(weightedEdge.weight);
    }
  }
  return weightedGraph;
}

//TODO: more auxiliary functions to make it easier to create tests.

//-------------------------------------------------------------------//
//Predefined graphs
let adjListHelper = undefined;



/*
//           7            =>            7         
//     _-----------_      =>      _-----------_   
//    /  3      7   \     =>     /  3      7   \  
//   0 ----- 2 ----- 4    =>    A ----- C ----- E 
//   |       |     / |    =>    |       |     / | 
//  4|       |8  /5  |    =>   4|       |8  /5  | 
//   |   8   | /     |    =>    |   8   | /     | 
//   1 ----- 6       |6   =>    B ----- G       |6
//   | \             |    =>    | \             | 
//  4|   \8          |    =>   4|   \8          | 
//   |  9  \     9   |    =>    |  9  \     9   | 
//   3 ----- 5 ----- 7    =>    D ----- F ----- H 
//    \             /     =>     \             /  
//     '-----------'      =>      '-----------'   
//           2            =>            2         
*/
//setup
{
adjListHelper = new DirectedGraph<string, number>();
adjListHelper.addNodes(['A','B','C','D','E','F','G', 'H']);
adjListHelper.addEdge('A', 'B', 4);
adjListHelper.addEdge('A', 'C', 3);
adjListHelper.addEdge('A', 'E', 7);

adjListHelper.addEdge('B', 'A', 4);
adjListHelper.addEdge('B', 'G', 8);
adjListHelper.addEdge('B', 'D', 4);
adjListHelper.addEdge('B', 'F', 8);

adjListHelper.addEdge('C', 'A', 3);
adjListHelper.addEdge('C', 'E', 7);
adjListHelper.addEdge('C', 'G', 8);

adjListHelper.addEdge('D', 'B', 4);
adjListHelper.addEdge('D', 'F', 9);
adjListHelper.addEdge('D', 'H', 2);

adjListHelper.addEdge('E', 'A', 7);
adjListHelper.addEdge('E', 'C', 8);
adjListHelper.addEdge('E', 'G', 5);
adjListHelper.addEdge('E', 'H', 6);

adjListHelper.addEdge('F', 'B', 8);
adjListHelper.addEdge('F', 'D', 9);
adjListHelper.addEdge('F', 'H', 9);

adjListHelper.addEdge('G', 'B', 8);
adjListHelper.addEdge('G', 'C', 8);
adjListHelper.addEdge('G', 'E', 5);

adjListHelper.addEdge('H', 'D', 2);
adjListHelper.addEdge('H', 'E', 6);
adjListHelper.addEdge('H', 'F', 9);
}
const graph1 = adjListToGraph(adjListHelper);
adjListHelper = undefined;



/*
  1----3
 /|    |
0 |    |
 \|    |
  2----4
*/
{
adjListHelper = new DirectedGraph<number, number>();
adjListHelper.addNodes([0,1,2,3,4]);
adjListHelper.addBiEdge(0,1,0);
adjListHelper.addBiEdge(0,2,0);
adjListHelper.addBiEdge(1,2,0);
adjListHelper.addBiEdge(1,3,0);
adjListHelper.addBiEdge(2,4,0);
adjListHelper.addBiEdge(3,4,0);
}
const graph2 = adjListToGraph(adjListHelper);
adjListHelper = undefined;



//-------------------------------------------------------------------//
//Main test function

function logGraph<V,E,R>
(
  algorithm: (start: V, graph: LoggedGraph<V,E>) => R,
  start: V,
  graph: WeightedGraph<V,E>,
  fileName: string
): R
{
  const logger = new Logger();
  const loggedGraph = logger.createGraph(graph);
  const result = algorithm(start, loggedGraph);
  logger.write(fileName);
  return result;
}

//logGraph(graphBFS, 0, graph2, "graphBFS_1.json");
logGraph(graphBFS2, 0, graph2, "graphBFS_2.json");
//logGraph(dijkstra, 'B', graph1, "graphDijkstra_1.json");


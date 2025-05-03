import Logger from './Logger';
import LoggedArray from './LoggedArray';
import { CompareOperator } from './types';
import LoggedBST from './LoggedBST';
import DirectedGraph from './lib/DirectedGraph';
import LoggedGraph from './LoggedGraph';
import { Edge, WeightedEdge, WeightedGraph } from './lib/Graph';
import UndirectedGraph from './lib/UndirectedGraph';
import Stack from './lib/Stack';

//const log = new Logger();
/*
function minimum(arr: number[], arrlog: ArrayLogger): number {
  const minIndex = arrlog.recordState(0, StateVariableType.POINTER, 'minIndex');
  for (
    let i = arrlog.recordState(1, StateVariableType.POINTER, 'i');
    i.value < arr.length;
    i.value++
  ) {
    arrlog.mark(
      () => {
        if (arr[i.value] < arr[minIndex.value]) {
          minIndex.value = i.value;
        }
      },
      i,
      minIndex
    );
  }

  return minIndex.value;
}

function minimum2(arr: number[]): number {
  let minIndex = 0;
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] < arr[minIndex]) {
      minIndex = i;
    }
  }

  return minIndex;
}
*/

/*
const log = new Logger();
let array = log.createArray([3,2,1]);   
array.swap(0,2);  //[1,2,3]
array.swap(0,1);  //[2,1,3]
let array2 = log.createArray([5,6,7]);  
array.swap(0,2);  //[3,1,2]

log.startScope('Test');
log.endScope();

log.startScope('Test 2');
  log.createArray([9]);
  array2.swap(0,1); //[6,5,7]
log.endScope();

log.createArray([10]);

log.startScope('Test 3');
  log.startScope('Test 4');
    log.createArray([11]);
  log.endScope();
  log.startScope('Test 5');
    log.createArray([12]);
  log.endScope();
log.endScope();

log.createArray([13]);

log.write();
*/

function toString(array: LoggedArray<any>): string {
  let str = "["
  let i = 0;
  while(i < array.size()-1) {
    str += array.get(i);
    str += ", ";
    i++;
  }
  if (array.size()) str += array.get(i);
  str += "]";
  return str;
}



function insertionSort<T>(array: LoggedArray<T>) {
  for (let i = array.createIndex(1); i.get() < array.size(); i.set(i.get() + 1)) {
    array.scope(() => {
    let j = array.createIndex(i.get());
    while (j.get() > 0 && array.get(j.get() - 1) > array.get(j.get())) {
      array.swap(j.get()-1,j.get());
      j.set(j.get()-1);
    }
    });
  }
}


function quickSort<T>(array: LoggedArray<T>) {
  quickSortHelper(array, 0, array.size()-1);
}

function quickSortHelper<T>(array: LoggedArray<T>, low: number, high: number) {
  if (low >= high) return;
  //declare range
  let left  = array.createIndex(low, "left");
  let right = array.createIndex(high-1, "right");
  const pivotIndex = array.createIndex(medianOfThree(array, low, high), "pivotIndex");

  array.swap(pivotIndex, high);

  while(left.get() <= right.get()) {    
    //find left number
    while ((left.get() <= right.get()) && (array.get(left) < array.get(high))) {
      left.set(left.get()+1);
    }
    //find left number
    while ((right.get() >= left.get()) && (array.get(right) > array.get(high))) {
      right.set(right.get()-1);
    }

    //if a swap should be performed
    if (left.get() < right.get()) {
      array.swap(left, right);
      left.set(left.get()+1);
      right.set(right.get()-1);
    }
  }
  //swap pivot back to middle
  array.swap(left.get(), high);

  console.log("range: " + [low, left.get()-1]);
  Logger.recursion(() => quickSortHelper(array, low, left.get()-1), array); //range missing
  console.log("range: " + [left.get()+1, high]);
  Logger.recursion(() => quickSortHelper(array, left.get()+1, high), array);
}

function medianOfThree<T>(array: LoggedArray<T>, low: number, high: number): number {
  const mid = Math.floor((low+high)/2);
  const l = array.get(low);
  const m = array.get(mid);
  const h = array.get(high);

  if ((m <= l && l <= h) || (h <= l && l <= m)) return low;
  if ((l <= m && m <= h) || (h <= m && m <= l)) return mid;
  return high;
}

function mergeSort<V>(array: LoggedArray<V>): LoggedArray<V> {
  if (array.size() <= 1) return array;

  const [left, right] = array.split(Math.floor((array.size())/2));
  const sortedLeft  = Logger.recursion(() => mergeSort(left), left);
  const sortedRight = Logger.recursion(() => mergeSort(right), right);

  return merge(sortedLeft, sortedRight);
}

function merge<V>(left: LoggedArray<V>, right: LoggedArray<V>): LoggedArray<V> {
  const merged = left.getLogger().createArray(Array(left.size()+right.size()).fill(null));
  let leftIndex = left.createIndex(0);
  let rightIndex = right.createIndex(0);

  for (let i = 0; i < merged.size(); i++){

    if (leftIndex.get() == left.size()){              //when there are no more elements left, in left array
      merged.set(i, right.get(rightIndex.get()));
      rightIndex.set(rightIndex.get()+1);
    }
    else if (rightIndex.get() == right.size()){       //when there are no more elements left in right array
      merged.set(i, left.get(leftIndex));
      leftIndex.set(leftIndex.get()+1);
    }
    else if (left.get(leftIndex) < right.get(rightIndex)){
      merged.set(i, left.get(leftIndex));
      leftIndex.set(leftIndex.get()+1);
    }
    else {
      merged.set(i, right.get(rightIndex.get()));
      rightIndex.set(rightIndex.get()+1);
    }
  }

  return merged;
}




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

  const result: V[] = [];
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


/*
const log2 = new Logger();
let array3 = log2.createArray([3,2,1]);
insertionSort(array3);


log2.write('log2.json')
*/

/*
const log3 = new Logger();
const a = [];
for(let i = 21; i >= 0; i--) a.push(i); //[21..0]
console.log(a);
let array4 = log3.createArray(a);
quickSort(array4);
log3.write('log3.json');
console.log("\n" + toString(array4));
*/


const log5 = new Logger();
const b = [7,6,5,4,3,2,1];

console.log(b);
let array5 = log5.createArray([3,2,1]);
quickSort(array5);
log5.write('log5.json');
console.log("\n" + toString(array5));

const log15 = new Logger();
const c = [2,1];

console.log(b);
let array15 = log15.createArray(c);
mergeSort(array15);
log15.write('mergeSort.json');
console.log("\nMergeSort: " + toString(array15));



/*
const log6 = new Logger();
const queue = log6.createQueue(6);
//const stack = log6.createStack(6);
queue.enqueue(1);
queue.enqueue(2);
queue.enqueue(3);
queue.enqueue(4);
queue.enqueue(5);
queue.enqueue(6);
queue.dequeue();
queue.enqueue(7);
log6.write('queueTest.json');

const log7 = new Logger();
const stack = log7.createStack(6);
stack.push(1);
stack.push(2);
stack.push(3);
stack.pop();
stack.pop();
stack.push(4);
stack.push(5);
log7.write('stackTest.json');
*/

/*
const log8 = new Logger();
const arrayToSplit = log8.createArray([1,2,3,4,5,6]);
arrayToSplit.split(3);
log8.write('arraySplitting.json');
*/


const logger10 = new Logger()
const tree = logger10.createBST<string>();

[...'ALGORITHM'].forEach(element => {
  tree.insert(element);
  console.log(tree.toString());
  console.log();
});

/*
tree.insert(10);
console.log(tree.toString());
console.log();
tree.insert(9);
console.log(tree.toString())
console.log();
tree.insert(11);
console.log(tree.toString())
console.log();

tree.insert(11);
console.log(tree.toString())
console.log();

tree.delete(10);
console.log(tree.toString())
console.log();
*/

//logger10.write('bst.json');

/*
   2
 A----B
 |\   |
 | \3 |
4|  \ |7
 |   \|
 C----D
   5
*/
const adjList = new DirectedGraph<string, number>();
adjList.addNodes(['B','C','D','A']);
adjList.addBiEdge('A', 'B', 2);
adjList.addBiEdge('A', 'C', 4);
adjList.addBiEdge('A', 'D', 3);
adjList.addBiEdge('B', 'D', 7);
adjList.addBiEdge('C', 'D', 5);
//Logger.registerAndWrite(Array.from(adjList.graph), 'graph1.json');


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

const graph = new LoggedGraph(0, new Logger(), adjListToGraph(adjList)).toValue();
//Logger.registerAndWrite(graph, 'graph2.json');

const map = new Map<string, number>();
map.set("a",1);
map.set("b",2);
map.set("c",3);
map.set("d",4);
//Logger.registerAndWrite(Array.from(map), 'map.json');

const array = [];
array.push(3);
//Logger.registerAndWrite(array, 'array.json');


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

const adjList2 = new DirectedGraph<string, number>();
adjList2.addNodes(['A','B','C','D','E','F','G', 'H']);
adjList2.addEdge('A', 'B', 4);
adjList2.addEdge('A', 'C', 3);
adjList2.addEdge('A', 'E', 7);

adjList2.addEdge('B', 'A', 4);
adjList2.addEdge('B', 'G', 8);
adjList2.addEdge('B', 'D', 4);
adjList2.addEdge('B', 'F', 8);

adjList2.addEdge('C', 'A', 3);
adjList2.addEdge('C', 'E', 7);
adjList2.addEdge('C', 'G', 8);

adjList2.addEdge('D', 'B', 4);
adjList2.addEdge('D', 'F', 9);
adjList2.addEdge('D', 'H', 2);

adjList2.addEdge('E', 'A', 7);
adjList2.addEdge('E', 'C', 8);
adjList2.addEdge('E', 'G', 5);
adjList2.addEdge('E', 'H', 6);

adjList2.addEdge('F', 'B', 8);
adjList2.addEdge('F', 'D', 9);
adjList2.addEdge('F', 'H', 9);

adjList2.addEdge('G', 'B', 8);
adjList2.addEdge('G', 'C', 8);
adjList2.addEdge('G', 'E', 5);

adjList2.addEdge('H', 'D', 2);
adjList2.addEdge('H', 'E', 6);
adjList2.addEdge('H', 'F', 9);

const logger12 = new Logger();
const dijkstraGraph: LoggedGraph<string, number> = logger12.createGraph<string,number>(adjListToGraph(adjList2));
//console.log(dijkstra('B', dijkstraGraph));
//logger12.write('dijkstra.json');



const logger11 = new Logger();
const x = logger11.createArray([1]);
logger11.startScope();
logger11.endScope();
logger11.startScope();
  logger11.createArray([2]);
  x.set(0,3);
logger11.endScope();
logger11.createArray([4]);

logger11.write('scoping.json');


const stack2 = new Stack();

stack2.push(1);
stack2.push(2);
stack2.push(3);
stack2.push(4);

for (const s of stack2) {
  console.log(s);
}

const logger13 = new Logger();
logger13.write('arrScope1.json');
const arrScope = logger13.createArray([1,2]);
logger13.write('arrScope2.json');
arrScope.set(0, 3);
logger13.write('arrScope3.json');


/*
   2
 A----B
 |\   |
 | \3 |
4|  \ |7
 |   \|
 C----D
   5
*/
const logger14 = new Logger();
//const dijkstraGraph2: LoggedGraph<string, number> = logger14.createGraph<string,number>(adjListToGraph(adjList));
//console.log(dijkstra('B', dijkstraGraph2));
//logger14.write('dijkstra2.json');

/*
  1----3
 /|    |
0 |    |
 \|    |
  2----4
*/
const adjList3 = new DirectedGraph<number, number>();
adjList3.addNodes([0,1,2,3,4]);
adjList3.addBiEdge(0,1,0);
adjList3.addBiEdge(0,2,0);
adjList3.addBiEdge(1,2,0);
adjList3.addBiEdge(1,3,0);
adjList3.addBiEdge(2,4,0);
adjList3.addBiEdge(3,4,0);
const bfsGraph: LoggedGraph<number, number> = logger14.createGraph<number,number>(adjListToGraph(adjList3));
console.log(graphBFS(0, bfsGraph));
logger14.write('graphBFS.json');

console.log(graphBFS('B', dijkstraGraph));
logger12.write('bigGraphBSF.json');


Logger.registerAndWrite(Array.from(map), 'map.json');

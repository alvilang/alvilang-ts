import Logger from './Logger';
import LoggedArray from './LoggedArray';
import { CompareOperator } from './types';
import LoggedBST from './LoggedBST';

//const log = new Logger();
/*
function minimum(arr: number[], arrlog: ArrayLogger): number {
  if (arr.length == 0) throw new Error('list is empty');

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
  if (arr.length == 0) throw new Error('list is empty');

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
  while(i < array.length-1) {
    str += array.get(i);
    str += ", ";
    i++;
  }
  if (array.length) str += array.get(i);
  str += "]";
  return str;
}



function insertionSort<T>(array: LoggedArray<T>) {
  for (let i = array.createIndex(1); i.get() < array.length; i.set(i.get() + 1)) {
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
  quickSortHelper(array, 0, array.length-1);
}

function quickSortHelper<T>(array: LoggedArray<T>, low: number, high: number) {
  if (low >= high) return;
  //declare range
  let left  = array.createIndex(low, "left");
  let right = array.createIndex(high-1, "right");
  const pivotIndex = array.createIndex(medianOfThree(array, low, high), "pivotIndex");

  array.swap(pivotIndex, high);

  array.logger.compare(left, CompareOperator.LE, right);
  while(left.get() <= right.get()) {
    
    //find left number
    array.logger.compare(left, CompareOperator.LE, right);
    array.logger.compare([array, left.get()], CompareOperator.LT, [array, high]);
    while ((left.get() <= right.get()) && (array.get(left) < array.get(high))) {
      left.set(left.get()+1);
    }

    //find left number
    array.logger.compare(right, CompareOperator.GE, left);
    array.logger.compare([array, right.get()], CompareOperator.GT, [array, high]);
    while ((right.get() >= left.get()) && (array.get(right) > array.get(high))) {
      right.set(right.get()-1);
    }

    //if a swap should be performed
    //array.mark(left, right, () => {
    array.logger.compare(left, CompareOperator.LT, right);
    if (left.get() < right.get()) {
      array.swap(left, right);
      left.set(left.get()+1);
      right.set(right.get()-1);
    }
    //});

    /*

    // What if the have different loggers? Should they be
    // allowed to have different loggers?

    Logger.if(() => i < j, i,{array,0}, () => {
    
          
    });

    static if(...args: Logged...[], condition: () => boolean, body: () => void) {
      //use args to find logger object
      const logger = ...;

      //create 

      logger.startScope();
      if (condition()) {
        body();
      }
      logger.endScope();
    }

    Logger.highlight(i, j, {array, 0}, () => {      
      ...
    });

    Logger.highlight({array1,i}, {array2,j}, () => {
      ...
    });

    array1.mark(i, () => {
      array2.mark(j, () => {
        if(...) {
          ...
        }      
      });
    });

    */
  }

  array.swap(left.get(), high);

  console.log("range: " + [low, left.get()-1]);
  Logger.recursion(() => quickSortHelper(array, low, left.get()-1), array); //range missing
  console.log("range: " + [left.get()+1, high]);
  Logger.recursion(() => quickSortHelper(array, left.get()+1, high), array);
  /*
  array.scope(() => quickSortHelper(array, low, left.get()-1));
  array.scope(() => quickSortHelper(array, left.get()+1, high));
  */
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
let array5 = log5.createArray(b);
quickSort(array5);
log5.write('log5.json');
console.log("\n" + toString(array5));




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

logger10.write('bst.json');


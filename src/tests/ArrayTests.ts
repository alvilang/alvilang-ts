import LoggedArray from "../LoggedArray";
import Logger from "../Logger";

//-------------------------------------------------------------------//
//Sorting algorithms

function insertionSort<T>(array: LoggedArray<T>) {
  for (let i = array.createIndex(1); i.get() < array.size(); i.modify(x => x+1)) {
    array.getLogger().scope(() => {
    let j = array.createIndex(i);
    while (j.get() > 0 && array.get(j.get() - 1) > array.get(j)) {
      array.swap(j.get()-1,j);
      j.modify(j => j-1);
    }
    });
  }
}


function quickSort<T>(array: LoggedArray<T>) {
  quickSortHelper(array, 0, array.size()-1);
}

function quickSortHelper<T>(array: LoggedArray<T>, low: number, high: number) {
  if (low >= high) return;
  //TODO: declare range
  let left  = array.createIndex(low, "left");
  let right = array.createIndex(high-1, "right");
  const pivotIndex = array.createIndex(medianOfThree(array, low, high), "pivotIndex");

  array.swap(pivotIndex, high);

  while(left.get() <= right.get()) {    
    //find left number
    while ((left.get() <= right.get()) && (array.get(left) < array.get(high))) {
      left.modify(x => x+1);
    }
    //find left number
    while ((right.get() >= left.get()) && (array.get(right) > array.get(high))) {
      right.modify(x => x-1);
    }

    //if a swap should be performed
    if (left.get() < right.get()) {
      array.swap(left, right);
      left.modify(x => x+1);
      right.modify(x => x-1);
    }
  }
  //swap pivot back to middle
  array.swap(left, high);

  Logger.functionCall(quickSortHelper, array, low, left.get()-1);
  Logger.functionCall(quickSortHelper, array, left.get()+1, high);
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
  const sortedLeft  = Logger.functionCall(mergeSort, left);
  const sortedRight = Logger.functionCall(mergeSort, right);

  return Logger.functionCall(merge, sortedLeft, sortedRight);
}

function merge<V>(left: LoggedArray<V>, right: LoggedArray<V>): LoggedArray<V> {
  const merged = left.getLogger().createArray(Array(left.size()+right.size()).fill(null));
  let leftIndex = left.createIndex(0);
  let rightIndex = right.createIndex(0);

  for (let i = 0; i < merged.size(); i++){
    if (leftIndex.get() == left.size()){
      merged.set(i, right.get(rightIndex));
      rightIndex.modify(x => x+1);
    }
    else if (rightIndex.get() == right.size()){
      merged.set(i, left.get(leftIndex));
      leftIndex.modify(x => x+1);
    }
    else if (left.get(leftIndex) < right.get(rightIndex)){
      merged.set(i, left.get(leftIndex));
      leftIndex.modify(x => x+1);
    }
    else {
      merged.set(i, right.get(rightIndex));
      rightIndex.modify(x => x+1);
    }
  }

  return merged;
}

//-------------------------------------------------------------------//
//Other array-functions

function reverse <T>(array: LoggedArray <T>, start: number, end: number): void {
  if (start >= end) return;
  array.swap(start, end);
  Logger.functionCall(reverse,array, start+1, end-1)
}


//-------------------------------------------------------------------//
//Auxiliary functions

function arrayFrom(
  i: number,
  condition: (i: number) => boolean,
  step: (i: number) => number
): number[]
{
  const array: number[] = [];
  while(condition(i)) {
    array.push(i);
    i = step(i);
  }
  return array;
}

function toString(array: LoggedArray<any> | any[]): string {
  if (array instanceof LoggedArray) array = array.toArray();
  let str = "["
  let i = 0;
  
  while(i < array.length-1) {
    str += array[i];
    str += ", ";
    i++;
  }
  if (array.length) str += array[i];
  str += "]";
  return str;
}

//-------------------------------------------------------------------//
//Main test function for sorting algorithms
function sortAndLog<T>
(
  algorithm: (arg: LoggedArray<T>) => LoggedArray<T> | void,
  array: T[],
  fileName: string
): LoggedArray<T> {
  const logger = new Logger();
  let loggedArray = logger.createArray(array);
  const result = algorithm(loggedArray);
  if (result instanceof LoggedArray) {loggedArray = result;}
  console.log("Original:  " + toString(array));
  console.log("Result:    " + toString(loggedArray) + "\n");
  logger.write(fileName);
  return loggedArray;
}

//Default test function for any algorithm
function applyAndLog<T,R>
(
  algorithm: (...args: (LoggedArray<T> | any)[]) => R,
  args: (T[] | any)[],
  fileName: string
): R {
  const logger = new Logger();
  const preparedArgs = args.map(arg => {
    if (arg instanceof Array) return logger.createArray(arg);
    return arg;
  });
  const result = algorithm(...preparedArgs);
  logger.write(fileName);
  return result;
}

//-------------------------------------------------------------------//
//Tests: sort(algorithm, array, filename);

//sortAndLog(insertionSort, [5,2,6,1,3], "insertionSort1.json");


//sortAndLog(quickSort, [3,2,1], "quickSort1.json");
//sortAndLog(quickSort, [7,6,5,4,3,2,1], "quickSort2.json");
//sortAndLog(quickSort, arrayFrom(7, (i) => i > 0, (i) => i-1), "quickSort3.json");

sortAndLog(mergeSort, [4,3], "mergeSort1.json");

applyAndLog(reverse, [[1,2,3,4,5], 0, 4], "reverse1.json");
applyAndLog(reverse, [[1], 0, 0], "reverse2.json");


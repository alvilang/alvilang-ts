import LoggedArray from "../LoggedArray";
import Logger from "../Logger";


//-------------------------------------------------------------------//
//Sorting algorithms

function insertionSort<T>(array: LoggedArray<T>) {
  for (let i = array.createIndex(1); i.get() < array.size(); i.set(i.get() + 1)) {
    array.getLogger().scope(() => {
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


//This does not log correctly yet, do not use it
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
//Main test function
function sortAndLog<T>
(
  algorithm: (arg: LoggedArray<T>) => LoggedArray<T> | void,
  array: T[],
  fileName: string
): LoggedArray<T> | void {
  const logger = new Logger();
  const loggedArray = logger.createArray(array);
  const result = algorithm(loggedArray);
  console.log("Original: " + toString(array));
  console.log("Result:   " + toString(loggedArray));
  logger.write(fileName);
  if (result instanceof LoggedArray) return result;
}

//-------------------------------------------------------------------//
//Tests: sort(algorithm,array);

sortAndLog(insertionSort, [3,2,1], "insertionSort1.json");


//sortAndLog(quickSort, [3,2,1], "quickSort1.json");
//sortAndLog(quickSort, [7,6,5,4,3,2,1], "quickSort2.json");

sortAndLog(quickSort, arrayFrom(7, (i) => i > 0, (i) => i-1), "quickSort3.json");



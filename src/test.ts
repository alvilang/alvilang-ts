import Log from './Log';
import LoggedArray from './LoggedArray';
import { StateVariableType } from './types';

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

const log = new Log();
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


const log2 = new Log();
let array3 = log2.createArray([3,2,1]);
insertionSort(array3);


log2.write('log2.json')



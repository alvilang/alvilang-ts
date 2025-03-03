import ArrayLogger from './ArrayLogger';
import { StateVariableType } from './types';

//const log = new Logger();

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

const arr: number[] = [1, 2, 3];
const arrlog = new ArrayLogger(arr);
console.log(minimum(arr, arrlog)); //arr.createIndex()
arrlog.write('log2.json');

const arr2: number[] = [3, 2, 1];
const arrlog2 = new ArrayLogger(arr2);
console.log(minimum(arr2, arrlog2)); //arr.createIndex()
arrlog2.write('log3.json');

function replacer(key: string, value: any) {
  if (value instanceof Map) {
    return {
      dataType: 'Map',
      value: Array.from(value.entries()) // or with spread: value: [...value]
    };
  } else {
    return value;
  }
}
function reviver(key: string, value: any) {
  if (typeof value === 'object' && value !== null) {
    if (value.dataType === 'Map') {
      return new Map(value.value);
    }
  }
  return value;
}

const test: Map<string, number> = new Map();

test.set('1', 2);

console.log('hello');
console.log(JSON.parse(JSON.stringify(test, replacer), reviver));

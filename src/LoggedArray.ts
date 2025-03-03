import Log from './Log';
import { LogVariable } from './types';

/**
 * This class is a wrapper of an array that documents
 * all changes
 */
export default class LoggedArray<T> {
  private log: Log;
  private array: T[];
  //public readonly length;

  public constructor(array: T[], log: Log) {
    this.log = log;
    this.array = [...array];
    //this.length = array.length;
  }

  //LoggedIndex alternatives too
  public swap(i: number, j: number): void {
    [this.array[i], this.array[j]] = [this.array[j], this.array[i]];

    //update log
  }

  /*
    Splits the array into two arrays where the first array contains
    all elements up until index i-1. The second array contains the
    remaining elements.
    
    arr.split(i) = (arr1, arr2)

    forall j in [0, i-1]:           arr[j] == arr1[j]
    forall j in [i, arr.length-1]:  arr[j] == arr2[j]

    //LoggedIndex alternative too
    */
  public split(i: number): [LoggedArray<T>, LoggedArray<T>] {
    if (i < 0 || this.array.length <= i) {
      throw new RangeError();
    }

    //log that a split has occured

    const arr1 = this.array.slice(0, i);
    const arr2 = this.array.slice(i);
    const split: [LoggedArray<T>, LoggedArray<T>] = [
      this.log.createArray(arr1),
      this.log.createArray(arr2)
    ];

    return split;
  }


  public createIndex(i: number):  {

  }


}

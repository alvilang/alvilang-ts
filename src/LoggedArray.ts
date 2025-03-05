import Log from './Log';
import LoggedIndex from './LoggedIndex';
import { StateVariableType } from './types';

/**
 * This class is a wrapper of an array that documents
 * all changes
 */
export default class LoggedArray<T> {
  private log: Log;
  private array: T[];
  private id: number;
  public readonly length;

  public constructor(array: T[], id: number, log: Log) {
    this.id = id;
    this.log = log;
    this.array = [...array];
    this.length = array.length;
  }

  
  public scope(body: () => void, name?: string): void {
    this.log.startScope(name);
    body();
    this.log.endScope();
  }


  //LoggedIndex alternatives too
  public swap(i: number, j: number): void {
    [this.array[i], this.array[j]] = [this.array[j], this.array[i]];

    //update log
    this.log.logChange(this.id, [...this.array]);
  }

  
  public set(index: number, value: T): void {
    this.array[index] = value;
    this.log.logChange(this.id, [...this.array]);
  }

  //To simulate using numeric variables as they are, arr.get(i) instead of arr.get(i.value) ...
  public get(index: number): T {
    return this.array[index];
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


  
  public createIndex(i: number): LoggedIndex<number> {
    if (i < 0 || this.array.length <= i) {
      throw new RangeError();
    }

    return this.log.createVar(StateVariableType.POINTER, i, this.id);
  }
  


}

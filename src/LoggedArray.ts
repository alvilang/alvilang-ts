import Logger from './Logger';
import LoggedIndex from './LoggedIndex';
import { LoggedObject, StateVariableType } from './types';

/**
 * This class is a wrapper of an array that documents
 * all changes
 */
export default class LoggedArray<T> implements LoggedObject {
  public logger: Logger;
  private array: T[];
  public readonly id: number;
  public readonly length;

  public constructor(array: T[], id: number, logger: Logger) {
    this.id = id;
    this.logger = logger;
    this.array = [...array];
    this.length = array.length;
  }

  getId(): number {
    return this.id;
  }

  toValue() {
    return this.toArray();
  }

  public scope(body: () => void, name?: string): void {
    this.logger.startScope(name);
    body();
    this.logger.endScope();
  }


  //TODO: how to highlight for comparisons?
  public mark(first: LoggedIndex<number> | number,
              second: LoggedIndex<number> | number,
              body: () => void): void {
    const indices = [];
    indices.push(first instanceof LoggedIndex ? first.get() : first);
    indices.push(second instanceof LoggedIndex ? second.get() : second);

    const scope = {
      type: "scope",

      subSteps: []
    };

    this.logger.startScope();
    body();
    this.logger.endScope();
  }

  public toArray(): T[] {
    return [...this.array];
  }

  public swap(i: number | LoggedIndex<number>, j: number | LoggedIndex<number>): void {
    if (i instanceof LoggedIndex) i = i.get();
    if (j instanceof LoggedIndex) j = j.get();
    [this.array[i], this.array[j]] = [this.array[j], this.array[i]];

    //update log
    const animationStep = {type: "swap", subjects: [this.id], data: [i,j]};
    this.logger.logAnimation(animationStep);
    this.logger.logChange(this.id, [...this.array]);
  }

  public set(index: number | LoggedIndex<number>, value: T): void {
    if (index instanceof LoggedIndex) index = index.get();
    this.array[index] = value;
    this.logger.logChange(this.id, [...this.array]);
  }

  public get(index: number | LoggedIndex<number>): T {
    if (index instanceof LoggedIndex) index = index.get();

    return this.array[index];
  }

  /*
  Splits the array into two arrays where the first array contains
  all elements up until index i-1. The second array contains the
  remaining elements.

  arr.split(i) = (arr1, arr2)

  forall j in [0, i-1]:           arr[j] == arr1[j]
  forall j in [i, arr.length-1]:  arr[j] == arr2[j]
  */
  public split(i: number | LoggedIndex<number>): [LoggedArray<T>, LoggedArray<T>] {
    if (i instanceof LoggedIndex) i = i.get();
    if (i < 0 || this.array.length <= i) {
      throw new RangeError();
    }

    //TODO:
    //log that a split has occured
    //how?
    const animationStep = {
      type: 'split',
      subjects: [this.id],
      data: i
    };
    this.logger.logAnimation(animationStep);

    return [this.slice(0,i), this.slice(i)];
  }

  public slice(start?: number | LoggedIndex<number>, end?: number | LoggedIndex<number>): LoggedArray<T> {
    if (start instanceof LoggedIndex) start = start.get();
    if (end instanceof LoggedIndex) end = end.get();

    //animationStep for slice too?

    return this.logger.createArray(this.array.slice(start, end));
  }

  public createIndex(i: number | LoggedIndex<number>, name?: string): LoggedIndex<number> {
    if (i instanceof LoggedIndex) i = i.get();

    if (i < 0 || this.array.length <= i) {
      throw new RangeError();
    }

    return this.logger.createVar(StateVariableType.POINTER, i, name, this.id);
  }
}

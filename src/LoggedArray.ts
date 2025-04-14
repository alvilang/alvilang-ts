import Logger from './Logger';
import LoggedIndex from './LoggedIndex';
import { LoggedObject, Scope, StateVariableType } from './types';

/**
 * This class is a wrapper of an array that documents
 * all changes
 */
export default class LoggedArray<T> implements LoggedObject {
  private logger: Logger;
  private array: T[];
  public readonly id: number;

  public constructor(array: T[], id: number, logger: Logger) {
    this.id = id;
    this.logger = logger;
    this.array = [...array];
  }

  getId(): number {
    return this.id;
  }
  toValue() {
    return this.toArray();
  }
  getLogger(): Logger {
    return this.logger;
  }
  setLogger(logger: Logger): void {
    this.logger = logger;
  }

  public size(): number {
    return this.array.length;
  }

  //TODO: move to logger
  public scope(body: () => void, name?: string): void {
    let scope: Scope | undefined = undefined;
    if (name) {
      scope = {type: 'Scope', name, subSteps: []}
    }

    this.logger.startScope(scope);
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

  //AnimationSteps?
  public push(item: T): void {
    this.array.push(item);
    this.logger.logChange(this.id, [...this.array]);
  }

  //AnimationSteps?
  public pop(): T | undefined {
    const popped = this.array.pop();
    this.logger.logChange(this.id, [...this.array]);
    return popped;
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

  public apply<R>(fn: (this: T[], ...args: any[]) => R, ...args: any[]): R
  {
    const result = fn.apply(this.array, args);
    this.logger.logChange(this.id, [...this.array]);
    return result;
  }

  
}

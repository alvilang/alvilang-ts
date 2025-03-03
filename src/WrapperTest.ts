import { StateVariable } from './types';

export default class WrapperTest<T> {
  private array: T[];
  private nextVarId: number; //id's in recursive calls?

  //do we make a safe copy? a safe copy of elements too?
  //range?
  public constructor(array: T[]) {
    //null/undefined/length == 0 checks?
    this.array = array;
    this.nextVarId = 0;
  }

  //return proxy that can add to the log
  public createIndexVar(index: number = 0, name?: string): number {
    //what if array is empty?
    if (index < 0 || this.array.length <= index) {
      throw new RangeError();
    }

    //TODO: declare variable in log (in the correct section),
    //      return proxy

    throw new Error('method not defined yet');
  }

  //type T instead of any?
  public createStaticVar(initialValue: any, name?: string) {}

  private createVar() {}

  public set(index: number, value: T): void {
    this.array[index] = value;
    //TODO: log stuff

    throw new Error('method not defined yet');
  }

  //To simulate using numeric variables as they are, arr.get(i) instead of arr.get(i.value) ...
  public get(index: number | indexVarType): T {
    //TODO: log stuff

    throw new Error('method not defined yet');
    return this.array[index];
  }
}

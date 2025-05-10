import LoggedArray from "./LoggedArray";
import Logger from "./Logger";
import { LoggedObject } from "./types";

/*
This class is a simplified version of a map that
is logged as a LoggedArray<[K,V]>
*/
export default class LoggedTable<K,V> implements LoggedObject {

  private readonly table: LoggedArray<[K,V]>;

  public constructor(array: LoggedArray<[K,V]>) {
    this.table = array;
  }

  getId(): number {
    return this.table.getId();
  }
  toValue() {
    return this.table.toValue();
  }
  getLogger(): Logger {
    return this.getLogger();
  }
  setLogger(logger: Logger): void {
    this.table.setLogger(logger);
  }

  public get(key: K): V | undefined {
    if (!this.keyIsValid(key)) {
      return undefined
    }

    const keyIndex = this.getKeyIndex(key);
    if (keyIndex == -1) {
      return undefined;
    }
    return this.table.get(keyIndex)[1];
  }

  public set(key: K, value: V): LoggedTable<K,V> {
    if (!this.keyIsValid(key)) {
      throw new Error('keys cannot be \'null\' or \'undefined\'');
    }
    const keyPair: [K,V] = [key, value];
    const keyIndex = this.getKeyIndex(key);

    if (keyIndex == -1) {
      this.table.push(keyPair);
    } else {
      this.table.set(keyIndex, keyPair);
    }
    return this;
  }

  public has(key: K): boolean {
    return this.keyIsValid(key) && this.getKeyIndex(key) != -1;
  }

  public delete(key: K): boolean {
    if (!this.keyIsValid(key)) {
      return false;
    }
    const keyIndex = this.getKeyIndex(key);
    if (keyIndex == -1) {
      return false;
    }
    // helper-function to delete argument key-pair, shift
    // remaining elements, and decrease the array-size by one
    const deleteAndShift = function (this: [K,V][], i: number) {
      while(i+1 < this.length) {
        this[i] = this[++i];
      }
      this.pop();
    };
    this.table.apply(deleteAndShift, keyIndex);

    return true;
  }

  public clear(): void {
    const clear = function (this: [K,V][]) {
      while (this.length) {
        this.pop();
      }
    };

    this.table.apply(clear);
  }

  public keys(): MapIterator<K> {
    const keys: K[] = []
    for (let i = 0; i < this.table.size(); i++) {
      keys.push(this.table.get(i)[0]);
    }

    return keys.values();
  }

  public values(): MapIterator<V> {
    const values: V[] = []
    for (let i = 0; i < this.table.size(); i++) {
      values.push(this.table.get(i)[1]);
    }

    return values.values();
  }

  public entries(): MapIterator<[K,V]> {
    return this.table.toArray().values();
  }

  //Returns index of key, or -1 if it does not exist
  private getKeyIndex(key: K): number {
    for(let i = 0; i < this.table.size(); i++) {
      if (this.table.get(i)[0] === key) {
        return i;
      }
    }
    return -1;
  }

  private keyIsValid(key: K): boolean {
    return key != null && key != undefined;
  }


}
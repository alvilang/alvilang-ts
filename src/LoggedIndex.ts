import Logger from "./Logger";



export default class LoggedIndex<T> {
  private value: T;
  private log: Logger;
  private id: number;

  public constructor (initialValue: T, id: number, log: Logger) {
    this.value = initialValue;
    this.log = log;
    this.id = id;
  }

  public set(newValue: T): void {
    this.value = newValue;

    this.log.logChange(this.id, this.value);
  }

  public get(): T {
    return this.value;
  }

}
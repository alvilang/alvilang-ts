import Logger from "./Logger";



export default class LoggedIndex<T> {
  private value: T;
  private logger: Logger;
  private readonly id: number;

  public constructor (initialValue: T, id: number, log: Logger) {
    this.value = initialValue;
    this.logger = log;
    this.id = id;
  }

  public set(newValue: T): void {
    this.value = newValue;

    this.logger.logChange(this.id, this.value);
  }

  public get(): T {
    return this.value;
  }

  public getId(): number {
    return this.id;
  }

}
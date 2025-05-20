import LoggedArray from "./LoggedArray";
import LoggedVariable from "./LoggedVariable";
import Logger from "./Logger";
import { LoggedObject } from "./types";

export default class LoggedArrayStack<T> implements LoggedObject{
  private readonly stack: LoggedArray<T>;
  private front: LoggedVariable<number>;

  public constructor(stack: LoggedArray<T>) {
    this.stack = stack;
    this.front = stack.createIndex(0);
  }

  getId(): number {
    return this.stack.getId();
  }

  toValue() {
    return this.stack.toValue();
  }

  getLogger(): Logger {
    return this.stack.getLogger();
  }

  setLogger(logger: Logger): void {
    this.stack.setLogger(logger);
  }

  public size(): number {
    return this.front.get();
  }

  public isEmpty(): boolean {
    return this.front.get() == 0;
  }

  public push(item: T): void {
    if (this.front.get() == this.stack.size()) {
      throw new Error("Stack is full");
    }

    const animationStep = {
      type: "push",
      subjects: [this.stack.id],
      data: [item, this.front.get()]
    };

    this.getLogger().logAnimation(animationStep);
    this.stack.set(this.front, item);
    this.front.set(this.front.get()+1);
  }

  public pop(): T {
    if (this.isEmpty()) throw new Error("Stack is empty");
        
    const popValue = this.stack.get(this.front.get()-1);
    const animationStep = {
      type: "pop",
      subjects: [this.stack.id],
      data: [popValue, this.front.get()-1]
    };

    this.getLogger().logAnimation(animationStep);
    this.stack.set(this.front.get()-1, null as T);
    this.front.set(this.front.get()-1);
    
    return popValue;
  }

  public peek(): T {
    if (this.isEmpty()) throw new Error("Stack is empty");

    return this.stack.get(this.front);
  }
}
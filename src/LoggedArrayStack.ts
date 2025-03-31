import LoggedArray from "./LoggedArray";
import LoggedIndex from "./LoggedIndex";

export default class LoggedArrayStack<T> {
  private readonly stack: LoggedArray<T>;
  private front: LoggedIndex<number>;

  public constructor(stack: LoggedArray<T>) {
    this.stack = stack;
    this.front = stack.createIndex(0);
  }

  public size(): number {
    return this.front.get();
  }

  public isEmpty(): boolean {
    return this.front.get() == 0;
  }

  public push(item: T): void {
    if (this.front.get() == this.stack.length) {
      throw new Error("Stack is full");
    }

    const animationStep = {
      type: "push",
      subject: this.stack.id,
      data: item
    };

    this.stack.logger.logAnimation(animationStep);
    this.stack.set(this.front, item);
    this.front.set(this.front.get()+1);
  }

  public pop(): T {
    if (this.isEmpty()) throw new Error("Stack is empty");
        
    const popValue = this.stack.get(this.front.get()-1);
    const animationStep = {
      type: "pop",
      subject: this.stack.id,
      data: popValue
    };

    this.stack.logger.logAnimation(animationStep);
    this.stack.set(this.front.get()-1, null as T);
    this.front.set(this.front.get()-1);
    
    return popValue;
  }

  public peek(): T {
    if (this.isEmpty()) throw new Error("Stack is empty");

    return this.stack.get(this.front);
  }
}
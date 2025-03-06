export default class Stack<T> {
  private storage: T[] = [];

  constructor(private capacity: number = Infinity) {}

  public size(): number {
    return this.storage.length;
  }

  public isEmpty(): boolean {
    return this.size() == 0;
  }

  public push(item: T): void {
    if (this.size() === this.capacity) {
      throw Error('Stack full');
    }

    this.storage.push(item);
  }

  public pop(): T {
    const popped = this.storage.pop();
    if (popped === undefined) {
      throw new Error('Stack is empty');
    }

    return popped;
  }

  public peek(): T {
    return this.storage[this.size() - 1];
  }

  [Symbol.iterator](): ArrayIterator<T> {
    return this.storage.values();
  }
}

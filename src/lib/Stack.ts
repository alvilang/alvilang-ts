export default class Stack<T> {
  private storage: T[] = [];

  constructor(private capacity: number = Infinity) {}

  public size(): number {
    return this.storage.length;
  }

  public push(item: T): void {
    if (this.size() === this.capacity) {
      throw Error('Stack full');
    }

    this.storage.push(item);
  }

  public pop(): T | undefined {
    return this.storage.pop();
  }

  public peek(): T | undefined {
    return this.storage[this.size() - 1];
  }
}

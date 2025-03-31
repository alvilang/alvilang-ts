//interfaces for stack queue and other datastructures?
export default class CircularQueue<T> {
  private readonly capacity: number;
  private queue: T[];
  private items: number;
  private head: number;
  private tail: number;

  public constructor(capacity: number) {
    this.capacity = capacity;
    this.queue = Array(capacity).fill(null);
    this.items = 0;
    this.head = 0;
    this.tail = 0;
  }

  public enqueue(item: T): void {
    if (this.items == this.capacity) {
      throw new Error("Queue is full");
    }

    this.queue[this.head] = item;
    this.head = (this.head + 1) % this.capacity;
    this.items++;
  }

  public dequeue(): T {
    if (this.items == 0) {
      throw new Error("Queue is empty");
    }

    const dequeued = this.queue[this.tail];
    this.tail = (this.tail + 1) % this.capacity;
    this.items--;
    return dequeued;
  }

  public size(): number {
    return this.items;
  }

  public isFull(): boolean {
    return this.items == this.capacity;
  }

  *[Symbol.iterator]() {
    let i = this.tail;
    let size = this.items;

    while(size > 0) {
      yield this.queue[i];
      i = (i + 1) % this.capacity;
      size--;
    }
  }

}
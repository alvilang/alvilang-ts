import CircularQueue from "./CircularQueue";

//interfaces for stack, queue, and other datastructures?
export default class Queue<T> {
  private queue: CircularQueue<T>;
  
  public constructor() {
    this.queue = new CircularQueue(7);
  }

  public enqueue(item: T): void {
    if (this.queue.isFull()) {
      const newQueue = new CircularQueue<T>(this.queue.size()*2);
      while(this.queue.size() > 0) {
          newQueue.enqueue(this.queue.dequeue())
      }
      this.queue = newQueue;
    }

    this.queue.enqueue(item);
  }

  public dequeue(): T {
    return this.queue.dequeue();
  }

  public size(): number {
    return this.queue.size();
  }

  *[Symbol.iterator]() {
    return this.queue[Symbol.iterator]();
  }
  
}
import LoggedArray from "./LoggedArray";
import LoggedIndex from "./LoggedIndex";

/*
{
  steps: [
    {
      type: "StateDump",
      state: [
        {
          type: 0,
          value: {
            queue: [0,0,0,0,0,0,0,0,0,0]
            head: 0
            tail: 0
          }
        },
        {
          type: 0,
          value: [
            {
              type: 0,
              value: [0,0,0,0,0,0,0,0,0,0]
            },
            {
              name: "head"
              type: 1,
              value: 0
            },
            {
              name: "tail"
              type: 1,
              value: 0
            }
          ]
        },
        {
          type: 'Queue',  //??
          value: [0,0,0,0,0,0,0,0,0,0],
          pointers: [
            {
              name: "head"
              value: 0
            },
            {
              name: "tail"
              value: 0
            }
          ]
        }
      ]
    }
  ]
}
*/

export default class LoggedCircularArrayQueue<T> {
  private readonly capacity: number;
  private queue: LoggedArray<T>;
  private items: number;  //logged number or not logged at all?
  private head: LoggedIndex<number>;
  private tail: LoggedIndex<number>;

  public constructor(queue: LoggedArray<T>) {
    this.capacity = queue.length;
    this.queue = queue;
    this.items = 0;
    this.head = queue.createIndex(0);
    this.tail = queue.createIndex(0);
  }

  public enqueue(item: T): void {
    if (this.items == this.capacity) {
      throw new Error("Queue is full");
    }

    const animationStep = {
      type: 'enqueue',
      subjects: [this.queue.id],
      data: [item, this.head.get()]
    };
    this.queue.logger.logAnimation(animationStep);
    this.queue.set(this.head, item);
    this.head.set((this.head.get() + 1) % this.capacity);
    this.items++;
  }

  public dequeue(): T {
    if (this.items == 0) {
      throw new Error("Queue is empty");
    }

    const dequeued = this.queue.get(this.tail);
    const animationStep = {
      type: 'dequeue',
      subjects: [this.queue.id],
      data: [dequeued, this.tail.get()]
    };
    this.queue.logger.logAnimation(animationStep);
    this.queue.set(this.tail, null as T);
    this.tail.set((this.tail.get() + 1) % this.capacity);
    this.items--;
    return dequeued;
  }

  public size(): number {
    return this.items;
  }

  public isFull(): boolean {
    return this.capacity == this.items;
  }

  *[Symbol.iterator]() {
    let i = this.tail.get();
    let size = this.items;

    while(size > 0) {
      yield this.queue.get(i);
      i = (i + 1) % this.capacity;
      size--;
    }
  }

}
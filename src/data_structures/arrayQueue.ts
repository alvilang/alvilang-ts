//A queue that is represented using an array, the first element in the array is the front of the queue and the last element is the back of the queue

export class arrayQueue<T> {
  private items: T[] = [];

  //Check if the queue is empty
  isEmpty(): boolean {
    return this.items.length === 0;
  }

  enqueue(item: T): void {
    this.items.push(item);
  }

  //First check if the queue is empty, if it is throw an error
  //Otherwise, remove the first element in the array and return it
  dequeue(): T | undefined {
    if (this.isEmpty()) {
      throw new Error('Queue is empty. Cannot dequeue.');
    }
    return this.items.shift();
  }

  //Return the first element in the array ie the front of the queue
  peek(): T | undefined {
    return this.items[0];
  }

  size(): number {
    return this.items.length;
  }
}

export class arrayQueue<T> {
    private items: T[] = [];


    isEmpty(): boolean {
        return this.items.length === 0;
    }

    enqueue(item: T): void {
        this.items.push(item);
    }

    dequeue(): T | undefined {
       if (this.isEmpty()) {
        throw new Error("Queue is empty. Cannot dequeue.");
       }
       return this.items.shift();
    }

    peek(): T | undefined {
        return this.items[0];
    }

    size(): number {
        return this.items.length;
    }
}

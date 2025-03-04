export class arrayQueue<T> {
    private items: T[] = [];


    isEmpty(): boolean {
        return this.items.length === 0;
    }

    enqueue(item: T): void {
        this.items.push(item);
    }

    dequeue(): void {
        this.items.shift();
    }

    peek(): T | undefined {
        return this.items[0];
    }

    sisze(): number {
        return this.items.length;
    }
}

import { linkedList } from "./linkedList";

export class linkedListQueue<T> {
    private linkedList: linkedList<T>;
    

    constructor() {
        this.linkedList = new linkedList<T>();
    }

    isEmpty(): boolean {
        return this.linkedList.getSize() === 0;
    }

    size(): number {
        return this.linkedList.getSize();
    }

    enqueue(value: T): void {
        this.linkedList.append(value);
        
    }

    dequeue(): void {
        if (this.isEmpty()) {
            return;
        }
        this.linkedList.removeFirst();
    }

    peek(): T | undefined {
        return this.linkedList.getHead();
    }
}

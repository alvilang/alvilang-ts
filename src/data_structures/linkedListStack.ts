import { linkedList } from './linkedList.ts';

export class linkedListStack<T> {
    private linkedList: linkedList<T> | null = null;
    private size: number = 0;

    constructor() {
        this.linkedList = new linkedList<T>();
    }

    isEmpty(): boolean {
        return this.size === 0;
    }

    push(value: T): void {
        this.linkedList?.append(value)
        this.size++;
    }

    pop(): void {
        if (this.isEmpty()) {
            throw new Error("Stack is empty. Cannot pop.");
        }
        this.linkedList?.removeLast();
        if (this.size > 0) this.size--;
    }

    peek(): T | undefined {
        return this.linkedList?.getTail();
    }

    getSize(): number {
        return this.size;
    }
}

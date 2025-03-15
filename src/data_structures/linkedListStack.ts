//Another stack implementation using a linked list. The linked list is the one implemented in the linkedList.ts file

import { linkedList } from './linkedList.ts';

export class linkedListStack<T> {
    private linkedList: linkedList<T> | null = null;
    private size: number = 0;

    constructor() {
        this.linkedList = new linkedList<T>();
    }

    //Check if the stack is empty
    isEmpty(): boolean {
        return this.size === 0;
    }

    //Add an element to the top of the stack
    //The ? operator is used to check if the linked list is null
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

    //Return the top element in the stack
    //If the stack is empty, return undefined
    peek(): T | undefined {
        return this.linkedList?.getTail();
    }

    getSize(): number {
        return this.size;
    }
}

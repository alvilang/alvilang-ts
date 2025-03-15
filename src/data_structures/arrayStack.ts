//An implementation of a stack using an array

export class arrayStack<T> {
    private items: T[] = [];

    constructor() {
        this.items = [];
    }

    //Check if the stack is empty
    isEmpty(): boolean {
        return this.items.length === 0;
    }

    push(item: T): void {
        this.items.push(item);
    }

    //Remove the top element from the stack
    //If the stack is empty, throw an error
    pop(): T | undefined {
        if (this.isEmpty()) {
            throw new Error("Stack is empty. Cannot pop.");
        }
        return this.items.pop()
    }

    //Return the top element in the stack
    //If the stack is empty, throw an error
    peek(): T | undefined {
        if (this.isEmpty()) {
            throw new Error("Stack is empty. Cannot peek.");
        }
        return this.items[this.items.length - 1];
    }

    size(): number {
        return this.items.length;
    }
}
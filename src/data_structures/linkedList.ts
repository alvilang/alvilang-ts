export class Node2<T> {
    value: T;
    next: Node2<T> | null = null;

    constructor(value: T) {
        this.value = value;
    }
}

export class linkedList<T> {
    private head: Node2<T> | null = null;;
    private tail: Node2<T> | null = null;;
    private size: number = 0;

    //Insert at end of list
    append(value: T): void {
        const newNode = new Node2(value);

        if (!this.head) {
            this.head = newNode;
            this.tail = newNode;

        } else if (this.tail) {
            this.tail.next = newNode;
            this.tail = newNode;
        }
        this.size++;
    }

    //insert at beginning of list
    prepend(value: T): void {
        const newNode = new Node2(value);
        //if there is no head, then there is no list
        if (!this.head) {
            this.head = newNode;
            this.tail = newNode;
        } else {
            newNode.next = this.head;
            this.head = newNode;
        }
        this.size++;
    }

    removeFirst(): T | undefined {
        if (!this.head) {
            throw new Error("List is empty. Cannot remove first element.");
        }
        if (this.size > 0) this.size--;
        const removedValue = this.head.value;
        this.head = this.head.next;
        return removedValue;
        
    }

    removeLast(): T | undefined {
        if (!this.head) {
            throw new Error("List is empty. Cannot remove last element.");
        }
        if (!this.head.next) {
            const removedValue = this.head.value;
            this.head = null;
            this.tail = null;
            if (this.size > 0) this.size--;
            return removedValue;
        }

        let current = this.head;
        //loop until the node before the tail
        while (current.next && current.next !== this.tail) {
            current = current.next;
        }

        const removedValue = this.tail!.value; // Save the removed value
        current.next = null;
        this.tail = current;
        if (this.size > 0) this.size--;

        return removedValue;
    }

    getSize(): number {
        return this.size;
    }

    //returns the value of the head node and not the node itself
    getHead(): T | undefined {
        return this.head?.value;
    }

    //returns the value of the tail node and not the node itself
    getTail(): T | undefined {
        return this.tail?.value;
    }
}

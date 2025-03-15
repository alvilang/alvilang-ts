//This file contains the implementation of a linked list data structure.
//It includes a Node class and a linkedList class.

export class Node2<T> {
  value: T;
  next: Node2<T> | null = null;

  constructor(value: T) {
    this.value = value;
  }
}

export class linkedList<T> {
  private head: Node2<T> | null = null;
  private tail: Node2<T> | null = null;
  private size: number = 0;

  //Insert at end of list
  append(value: T): void {
    const newNode = new Node2(value);

    //if there is no head, then there is no list
    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
      //if there is a head but no tail, then there is only one node in the list
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
  //remove the first node in the list and return its value
  removeFirst(): T | undefined {
    if (!this.head) {
      throw new Error('List is empty. Cannot remove first element.');
    }

    const removedValue = this.head.value;
    this.head = this.head.next;
    if (!this.head) {
      this.tail = null;
    }

    if (this.size > 0) this.size--;
    return removedValue;
  }

  //remove the last node in the list and return its value
  removeLast(): T | undefined {
    if (!this.head) {
      throw new Error('List is empty. Cannot remove last element.');
    }
    if (!this.head.next) {
      const removedValue = this.head.value;
      this.head = null;
      this.tail = null;
      if (this.size > 0) this.size--;
      return removedValue;
    }

    //This part of the code is to remove the last node in the list
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

//test
const list = new linkedList<number>();
list.append(1);
list.append(2);
list.append(3);
list.append(4);
list.append(5);
console.log(list.getHead()); //1
console.log(list.getTail()); //5
console.log(list.getSize()); //5
list.removeFirst();
console.log(list.getHead()); //2
list.removeLast();
console.log(list.getTail()); //4
console.log(list.getSize()); //3
list.prepend(0);
console.log(list.getHead()); //0
list.removeFirst();
list.removeFirst();
list.removeFirst();
list.removeFirst();
console.log(list.getHead()); //undefined
console.log(list.getTail()); //undefined
console.log(list.getSize()); //0
list.removeFirst(); //Error: List is empty. Cannot remove first element.

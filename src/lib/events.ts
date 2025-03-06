export interface EventPublisher<T> {
  subscribe(observer: EventListener<T>, event?: unknown): void;
  unsubscribe(observer: EventListener<T>, event?: unknown): void;
}

export interface EventListener<T> {
  onEvent(data: T): void;
}

/*
array //LoggedArray<number>
i = array.createIndex(0);
i.set(3);

*/

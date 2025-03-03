import WrapperTest from './WrapperTest';

export enum VarType {
  STATIC,
  POINTER
}

/*
export interface Id<T> {
  id: T
}

export interface Step<K,V> {
  variables: Map<Id<K>,LogVariable<V>>
}
*/

export type LogVariable<T> = {
  name?: string;
  type: VarType;
  value: T;
};

export type Variable<T, E> = LogVariable<T> & {
  log: WrapperTest<E>;
};

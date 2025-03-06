import Logger from './Logger';

// export type PointerVariable = {
//   owner: unknown
// }

export enum StateVariableType {
  STATIC,
  POINTER
}

export type StateVariable<T> = {
  name?: string;
  origin?: number;
  type: StateVariableType;
  value: T;
};

export type LogVariable<T> =
  StateVariable<T> & {
  id: number;
};


export type StateDump = {
  type: 'StateDump';
  state: StateVariable<unknown>[];
};

export type NewScope = {
  type: 'NewScope';
  name?: string;
  subSteps: TraceStep[];
};

export type TraceStep = StateDump | NewScope;

export type Trace = {
  steps: TraceStep[];
};

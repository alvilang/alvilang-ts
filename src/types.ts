import Logger from "./Logger";

export enum CompareOperator {
  LT, LE, GT, GE, EQ, NE
//alt: LessThan, LessOrEqualTo, GreaterThan, GreaterEqual, Equal, NotEqual
}

export interface LoggedObject {
  getId(): number,
  toValue(): any,
  getLogger(): Logger,
  setLogger(logger: Logger): void
}


/*
If pointer variables can become a part of objects (arrays, ...) we can
get rid of this type.
Reason: An object being inside another object inherently means that
it is a pointer, and an object that isn't is a static object.
*/
export enum StateVariableType {
  STATIC,
  POINTER
}

export type StateVariable<T> = {
  name?: string;
  origin?: number;
  type: StateVariableType;
  description: string;
  value: T;
};

export type LogVariable<T> = StateVariable<T> & {
  id: number;
};

export type AnimationStep = {
  type: string;
  subjects: number[];
  data: any;  //TODO
}

export type StateDump = {
  type: 'StateDump';
  state: LogVariable<unknown>[];
};


export interface Scope {
  type: 'Scope';
  name?: string
  subSteps: TraceStep[];
}

export type BlockScope = Scope;

export type HighlightScope = Scope & {
  highlighted: ([number,any] | number)[]
};


export type RecursionScope = Scope & {
  //range?
};


export type TraceStep = AnimationStep | StateDump | Scope;

export type Trace = {
  steps: TraceStep[];
};

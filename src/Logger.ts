import { writeFile } from 'fs';
import Stack from './lib/Stack';
import LoggedArray from './LoggedArray';
import LoggedIndex from './LoggedIndex';
import LoggedCircularArrayQueue from './LoggedCircularArrayQueue';
import LoggedArrayStack from './LoggedArrayStack';
import {
  TraceStep,
  StateVariableType,
  Trace,
  StateDump,
  Scope,
  LogVariable,
  AnimationStep,
  CompareOperator,
  LoggedObject,
  HighlightScope,
  RecursionScope
} from './types';
import LoggedBST from './LoggedBST';
import LoggedGraph from './LoggedGraph';
import { WeightedGraph } from './lib/Graph';

export default class Logger {
  private trace: Trace = { steps: [] };
  private scopes = new Stack<Scope>();
  private scopedStates = new Stack<LogVariable<unknown>[]>();
  private nextId: number = 0;

  public constructor() {
    this.scopedStates.push([]);
  }

  private getNextId(): number {
    return this.nextId++;
  }

  private getLogDestination(): TraceStep[] {
    return this.scopes.isEmpty() ? this.trace.steps : this.scopes.peek().subSteps;
  }

  public write(logFile: string = 'log.json') {
    writeFile(logFile, JSON.stringify(this.trace, null, 2), (err) => {
      if (err) {
        console.error(err);
      }
    });
  }

  public static recursion<T>(func: () => T, ...args: LoggedObject[]): T {  //LoggedObject
    //saving their previous loggers to reassign after function, maybe we assume that all args have the same log?
    //const oldLoggers: Logger[] = args.map(arg => arg.logger);

    const oldLoggers: Map<Logger, number[]> = new Map();

    for(let i = 0; i < args.length; i++) {
      const logger = args[i].getLogger();
      if (oldLoggers.has(logger)) {
        oldLoggers.get(logger)!.push(i);
      } else {
        oldLoggers.set(logger, [i]);
      }
    }

    //create new logger for arguments to store their logs in
    const recursionLogger = new Logger();

    //find max id
    if (args.length) {
      let currMaxNextId = args[0].getLogger().nextId;
      for (let i = 1; i < args.length; i++) {
        if (args[i].getLogger().nextId > currMaxNextId) {
          currMaxNextId = args[i].getLogger().nextId;
        }
      }
      //largest id from Logged arguments that are used in recursive call to ensure new arguments created
      //in function get unused ids'
      recursionLogger.nextId = currMaxNextId;
    }

    args.forEach(arg => {
      arg.setLogger(recursionLogger);
      recursionLogger.registerLoggedObject(arg, arg.getId());
    });

    const result = func();

    //??
    args.forEach(arg => arg.setLogger(recursionLogger));

    for (const [oldLogger, loggedObjectsIndices] of oldLoggers) {
      //TODO: range
      const recursionScope: RecursionScope = {
        type: 'Scope',
        subSteps: []
      };

      oldLogger.startScope(recursionScope);
      oldLogger.combine(recursionLogger);
      oldLogger.endScope();
      //assigning new nextId to account for ids used in the recursion
      oldLogger.nextId = recursionLogger.nextId;
      //assigning previous logger to arguments
      loggedObjectsIndices.forEach(i => args[i].setLogger(oldLogger));
    }

    return result;
  }

  public combine(logger: Logger): void {
    const logDest = this.getLogDestination();
    logger.trace.steps.forEach(step => logDest.push(step));
  }


  public highlight(args: ([LoggedObject, any] | LoggedIndex<unknown>)[], body: () => void): void {
    const highlighted: ([number,any] | number)[] = [];
    const highlightScope: HighlightScope = {
      type: 'Scope',
      subSteps: [],
      highlighted
    }

    for (const arg of args) {
      if (arg instanceof LoggedIndex) {
        highlighted.push(arg.getId());
      } else {
        highlighted.push([arg[0].getId(), arg[1]]);
      }
    }

    this.startScope(highlightScope);
    body();
    this.endScope();
  }

  //TODO: comparison of primitive values directly, 5 < 4 etc...
  public compare<T,E>(arg1: [LoggedObject, any] | LoggedIndex<T> | any,
                      op: CompareOperator,
                      arg2: [LoggedObject, any] | LoggedIndex<E> | any): void
  {
    type pointer = { pointerData: any };
    type data = {
      op: CompareOperator,
      arg1?: any | pointer,
      arg2?: any | pointer
    };

    const subjects: number[] = [];
    const compareData: data = { op };


    if (arg1 instanceof LoggedIndex) {
      subjects.push(arg1.getId());
    } else if (arg1 instanceof Array) {
      subjects.push(arg1[0].getId());
      compareData.arg1 = {pointerData: arg1[1]};
    } else {
      compareData.arg1 = arg1;
    }
    if (arg2 instanceof LoggedIndex) {
      subjects.push(arg2.getId());
    } else if (arg2 instanceof Array) {
      subjects.push(arg2[0].getId());
      compareData.arg2 = {pointerData: arg2[1]};
    } else {
      compareData.arg2 = arg2;
    }

    //substeps?
    const animationStep: AnimationStep = {
      type: "comparison",
      subjects,
      data: compareData
    };

    this.logAnimation(animationStep);
    this.logStep();
  }

  public logAnimation<T>(animationStep: AnimationStep): void {
    this.getLogDestination().push(animationStep);
  }

  public logChange<T>(id: number, newValue: T): void {
    //find var with id
    //update its value
    this.updateVar(id, newValue);
    //log step
    this.logStep();
  }


  /*
  TODO: id issue
  potential reasons:
   * the order of the elements in the for loops
   * the order of the calls in logChange
  */
  private updateVar<T>(id: number, newValue: T): void {
    for (const logVarArray of this.scopedStates) {
      for (const logVar of logVarArray) {
        if (logVar.id == id) {
          logVar.value = newValue;
          return;
        }
      }
    }
  }

  private logStep(newVariable?: LogVariable<unknown>) {
    const logDestination = this.getLogDestination();
    const finalState: LogVariable<unknown>[] = [];

    for (const logVarArray of this.scopedStates) {
      logVarArray.forEach(logVar => finalState.push({...logVar}));
    }
    
    if (newVariable) {
      finalState.push(newVariable);
    }

    console.log(finalState);

    const step: StateDump = {
      type: 'StateDump',
      state: finalState
    };

    logDestination.push(step);
  }

  public scope(body: () => void) {
    this.startScope();
    body();
    this.endScope();
  }

  public startScope(scope: Scope = {type: 'Scope', subSteps: []}) {
    this.scopes.push(scope);
    this.scopedStates.push([]);
  }

  public endScope() {
    const currentScope = this.scopes.pop();

    if (this.scopes.isEmpty()) {
      this.trace.steps.push(currentScope);
    } else {
      this.scopes.peek().subSteps.push(currentScope);
    }

    this.scopedStates.pop();
  }

  public createGraph<V,E>(graph?: WeightedGraph<V,E>): LoggedGraph<V,E> {
    const id = this.getNextId();
    const loggedGraph = new LoggedGraph<V,E>(id, this, graph);
    this.registerLoggedObject(loggedGraph, id);

    return loggedGraph;
  }

  public createBST<T>(): LoggedBST<T> {
    const id = this.getNextId();
    const tree = new LoggedBST<T>(id, this);
    this.registerLoggedObject(tree, id);

    return tree;
  }

  public createQueue<T>(capacity: number): LoggedCircularArrayQueue<T> {
    return new LoggedCircularArrayQueue<T>(this.createArray(Array(capacity).fill(null)));
  }

  public createStack<T>(capacity: number): LoggedArrayStack<T> {
    return new LoggedArrayStack<T>(this.createArray(Array(capacity).fill(null)));
    
  }

  public createArray<T>(array: T[]): LoggedArray<T> {
    const id = this.getNextId();
    const loggedArray = new LoggedArray<T>(array, id, this);
    this.registerLoggedObject(loggedArray, id);

    return loggedArray;
  }


  private registerLoggedObject(loggedObject: LoggedObject, id: number): void {
    const logVar: LogVariable<unknown> = {
      type: StateVariableType.STATIC,
      value: loggedObject.toValue(),
      id
    };

    this.logStep({...logVar});
    this.scopedStates.peek().push({...logVar});
  }

  public createVar<T>(value: T, name?: string, origin?: number): LoggedIndex<T> {
    let type = StateVariableType.STATIC;
    if (origin) {
      type = StateVariableType.POINTER;
    }
    const id = this.getNextId();
    const logVar: LogVariable<unknown> = {
      origin,
      type,
      value,
      id
    };

    this.logStep({...logVar});
    this.scopedStates.peek().push({...logVar});

    return new LoggedIndex<T>(value, id, this);
  }

  public static registerAndWrite(o: any, logFile: string) {
    const logger = new Logger();
    const id = logger.getNextId();
    const logVar: LogVariable<unknown> = {
      type: StateVariableType.STATIC,
      value: o,
      id
    };

    logger.logStep({...logVar});
    logger.scopedStates.peek().push({...logVar});

    logger.write(logFile);
  }

}

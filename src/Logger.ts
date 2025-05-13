import { writeFile } from 'fs';
import Stack from './lib/Stack';
import { WeightedGraph } from './lib/Graph';
import LoggedArray from './LoggedArray';
import LoggedIndex from './LoggedIndex';
import LoggedCircularArrayQueue from './LoggedCircularArrayQueue';
import LoggedArrayStack from './LoggedArrayStack';
import LoggedBST from './LoggedBST';
import LoggedGraph from './LoggedGraph';
import LoggedTable from './LoggedTable';
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
    const oneLinedKeys = new Set(['value', 'data', 'subjects', 'highlighted']);
    const preProcessed = this.stringifyWithKeySpacing(this.trace, 2, oneLinedKeys);
    writeFile(logFile, preProcessed, (err) => {
      if (err) {
        console.error(err);
      }
    });
    /*
    //previous version
    writeFile(logFile, JSON.stringify(this.trace, null, 2), (err) => {
      if (err) {
        console.error(err);
      }
    });
    */
  }

  private stringifyWithKeySpacing(obj: any, indent = 2, inlineKeys = new Set<string>(), level = 0): string {
    //Add the following replace-call to make all state variables one-liners.
    // .replace(/,\s/, ', ')
    //inlineElements: "state"
    
    const pad = ' '.repeat(level * indent);
    if (Array.isArray(obj)) {
      const content = obj.map(v => this.stringifyWithKeySpacing(v, indent, inlineKeys, level + 1)).join(',');
      return `[${content}${obj.length?'\n'+pad:''}]`;
    }
  
    if (typeof obj === 'object' && obj !== null) {
      const entries = Object.entries(obj).map(([key, value]) => {
        const shouldInline = inlineKeys.has(key);
        const serializedValue = shouldInline
          ? JSON.stringify(value).replace(/:/g, ': ').replace(/],"/g, '], \"').replace(/},"/g, '}, \"')
          : this.stringifyWithKeySpacing(value, indent, inlineKeys, level + 1);
        return `${' '.repeat((level + 1) * indent)}"${key}": ${serializedValue}`;
      });
  
      return `${level?'\n':""}${pad}{\n${entries.join(',\n')}\n${pad}}`;
    }
  
    return JSON.stringify(obj);
  }

  //TODO: check if this always works?
  public static functionCall<Args extends any[], R>(
    func: (...args: Args) => R,
    ...args: Args
  ): R {
    function isLoggedObject(obj: any): obj is LoggedObject  {
      return obj &&
        typeof obj.getId === 'function' &&
        typeof obj.toValue === 'function' &&
        typeof obj.getLogger === 'function' &&
        typeof obj.setLogger === 'function';
    }

    //1.) setting up map to reassign loggers after function is called
    //2.) assigning new logger to logged objects
    //3.) finding maxId for the new logger
    const oldLoggers: Map<Logger, number[]> = new Map();
    const freshLogger = new Logger();
    let currMaxNextId = 0;

    for(let i = 0; i < args.length; i++) {
      if (isLoggedObject(args[i])) {
        const loggedObject: LoggedObject = args[i];
        const logger = loggedObject.getLogger();

        if (oldLoggers.has(logger)) {
          oldLoggers.get(logger)!.push(i);
        } else {
          oldLoggers.set(logger, [i]);
        }

        if (logger.nextId > currMaxNextId) {
          currMaxNextId = logger.nextId;
        }

        const currId = loggedObject.getId();
        loggedObject.setLogger(freshLogger);
        freshLogger.registerLoggedObject(logger.search(currId)!.description, loggedObject, currId);
      }
    }
    freshLogger.nextId = currMaxNextId;

    const result = func(...args);

    //TODO: simplify/fix this
    args.forEach(arg => {if (isLoggedObject(arg)) arg.setLogger(freshLogger)});

    for (const [oldLogger, loggedObjectsIndices] of oldLoggers) {
      //TODO: range
      const recursionScope: RecursionScope = {
        type: 'Scope',
        subSteps: []
      };

      oldLogger.startScope(recursionScope);
      oldLogger.combine(freshLogger);
      oldLogger.endScope();
      //assigning new nextId to account for ids used in the function
      oldLogger.nextId = freshLogger.nextId;
      loggedObjectsIndices.forEach(i => args[i].setLogger(oldLogger));
    }

    return result;
  }

  public combine(logger: Logger): void {
    const logDest = this.getLogDestination();
    logger.trace.steps.forEach(step => logDest.push(step));
  }

  public highlight(args: ([LoggedObject, any] | LoggedIndex<unknown>)[], block: () => void): void {
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
    block();
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


 
  private updateVar<T>(id: number, newValue: T): void {
    this.search(id)!.value = newValue;
  }

  private search(id: number): LogVariable<unknown> | undefined {
    for (const logVarArray of this.scopedStates) {
      for (const logVar of logVarArray) {
        if (logVar.id == id) {
          return logVar;
        }
      }
    }
    return undefined;
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

    //console.log(finalState);

    const step: StateDump = {
      type: 'StateDump',
      state: finalState
    };

    logDestination.push(step);
  }

  public scope(block: () => void) {
    this.startScope();
    block();
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
    this.registerLoggedObject("graph", loggedGraph, id);

    return loggedGraph;
  }

  public createBST<T>(): LoggedBST<T> {
    const id = this.getNextId();
    const tree = new LoggedBST<T>(id, this);
    this.registerLoggedObject("binary tree", tree, id);

    return tree;
  }

  public createTable<K,V>(): LoggedTable<K,V> {
    const loggedArray = this.createArrayHelper("table", []);
    return new LoggedTable(loggedArray);
  }

  public createQueue<T>(capacity: number): LoggedCircularArrayQueue<T> {
    const loggedArray = this.createArrayHelper("queue", Array(capacity).fill(null));
    return new LoggedCircularArrayQueue<T>(loggedArray);
  }

  public createStack<T>(capacity: number): LoggedArrayStack<T> {
    const loggedArray = this.createArrayHelper("stack", Array(capacity).fill(null));
    return new LoggedArrayStack<T>(loggedArray);
  }

  public createArray<T>(array: T[]): LoggedArray<T> {
    return this.createArrayHelper("array", array);
  }

  private createArrayHelper<T>(description: string, array: T[]): LoggedArray<T> {
    const id = this.getNextId();
    const loggedArray = new LoggedArray<T>(array, id, this);
    this.registerLoggedObject(description, loggedArray, id);
    return loggedArray;
  }

  private registerLoggedObject(description: string, loggedObject: LoggedObject, id: number): void {
    const logVar: LogVariable<unknown> = {
      description,
      type: StateVariableType.STATIC,
      value: loggedObject.toValue(),
      id
    };

    this.logStep({...logVar});
    this.scopedStates.peek().push({...logVar});
  }

  public createVar<T>(value: T, name?: string, origin?: number): LoggedIndex<T> {
    let type = StateVariableType.STATIC;
    if (origin != undefined) {
      type = StateVariableType.POINTER;
    }
    const id = this.getNextId();
    const logVar: LogVariable<unknown> = {
      description: "variable",
      origin,
      type,
      value,
      id
    };

    if (name) {
      logVar.name = name;
    }

    this.logStep({...logVar});
    this.scopedStates.peek().push({...logVar});

    return new LoggedIndex<T>(value, id, this);
  }

  public static registerAndWrite(o: any, logFile: string) {
    const logger = new Logger();
    const id = logger.getNextId();
    const logVar: LogVariable<unknown> = {
      description: "Random object",
      type: StateVariableType.STATIC,
      value: o,
      id
    };

    logger.logStep({...logVar});
    logger.scopedStates.peek().push({...logVar});

    logger.write(logFile);
  }

}

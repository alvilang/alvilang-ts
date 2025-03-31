/*
actions: 
    'declaration'       -- name of variable and its value
    'assignment/update' -- name/id of variable to update and the new value
    'swap'              -- indices to swap and the new array
    'comparison'        -- indices to compare and the resulting comparison, true or false
    'deletion'          -- index to delet and the new array
    'mark'              -- index to mark in the array
*/

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
  StateVariable,
  StateDump,
  Scope,
  LogVariable,
  AnimationStep
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
    writeFile(logFile, JSON.stringify(this.trace, null, 2), (err) => {
      if (err) {
        console.error(err);
      }
    });
  }

  public static recursion(func: () => void, ...args: LoggedArray<any>[]) {  //LoggedObject
    //saving their previous loggers to reassign after function, maybe we assume that all args have the same log?
    const oldLoggers: Logger[] = args.map(arg => arg.logger);
    //create new logger for arguments to store their logs in
    const freshLogger = new Logger();

    //find max id
    let maxId = 0
    {
      if (args.length > 0) {
        maxId = args[0].id;
        for (let i = 1; i < args.length; i++) {
          if (args[i].id > maxId) {
            maxId = args[i].id;
          }        
        }
      }
    }
    //largest id from Logged arguments that are used in recursive call to ensure new arguments created
    //in function get unused ids'    
    freshLogger.nextId = maxId; 

    args.forEach(arg => {
      //assigning new logger to each argument
      arg.logger = freshLogger;

      //adding variable to new logger
      const stateVar: StateVariable<unknown> = {
        type: StateVariableType.STATIC,
        value: arg.toArray()
      };
      const logVar: LogVariable<unknown> = { ...stateVar, id: arg.id};
  
      freshLogger.logStep(stateVar);
      freshLogger.scopedStates.peek().push(logVar);
    });

    func();

    //??
    args.forEach(arg => arg.logger = freshLogger);

    for (let i = 0; i < args.length; i++) {
      oldLoggers[i].startScope("Recursion");
      //combining logged data from function to old loggers inside a new scope
      oldLoggers[i].combine(freshLogger);
      oldLoggers[i].endScope();
      //assigning previous logger to arguments
      args[i].logger = oldLoggers[i];
    }
  }

  public combine(logger: Logger): void {
    const logDest = this.getLogDestination();
    logger.trace.steps.forEach(step => logDest.push(step));
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
    for (const logVarArray of this.scopedStates) {
      for (const logVar of logVarArray) {
        if (logVar.id == id) {
          logVar.value = newValue;
          return;
        }
      }
    }
  }

  private toStateVariable<T>(logVar: LogVariable<T>): StateVariable<T> {
    //deconstructing logVar to retrieve StateVariable
    const { id, ...stateVar } = logVar;
    return stateVar;
  }

  private logStep(value?: StateVariable<unknown>) {
    const logDestination = this.getLogDestination();
    const finalState: StateVariable<unknown>[] = [];

    for (const logVarArray of this.scopedStates) {
      logVarArray.forEach((logVar) => finalState.push(this.toStateVariable(logVar)));
    }
    
    if (value) {
      finalState.push(value);
    }

    console.log(finalState);

    const step: StateDump = {
      type: 'StateDump',
      state: finalState
    };

    logDestination.push(step);
  }

  public startScope(name?: string) {
    this.scopes.push({ type: 'Scope', name, subSteps: [] });
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

  public createQueue<T>(capacity: number): LoggedCircularArrayQueue<T> {
    return new LoggedCircularArrayQueue<T>(this.createArray(Array(capacity).fill(null)));
  }

  public createStack<T>(capacity: number): LoggedArrayStack<T> {
    return new LoggedArrayStack<T>(this.createArray(Array(capacity).fill(null)));
    
  }

  public createArray<T>(array: T[]): LoggedArray<T> {
    const id = this.getNextId();
    const stateVar: StateVariable<unknown> = {
      type: StateVariableType.STATIC,
      value: [...array]
    };

    const logVar: LogVariable<unknown> = { ...stateVar, id };

    this.logStep(stateVar);
    this.scopedStates.peek().push(logVar);

    return new LoggedArray<T>(array, id, this);
  }

  public createVar<T>(type: StateVariableType, value: T, name?: string, origin?: number): LoggedIndex<T> {
    const id = this.getNextId();
    const stateVar: StateVariable<unknown> = {
      origin,
      type,
      value
    };

    const logVar: LogVariable<unknown> = { ...stateVar, id };

    this.logStep(stateVar);
    this.scopedStates.peek().push(logVar);

    return new LoggedIndex<T>(value, id, this);
  }


}

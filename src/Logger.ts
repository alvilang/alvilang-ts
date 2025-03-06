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
import {
  TraceStep,
  StateVariableType,
  Trace,
  StateVariable,
  StateDump,
  Scope,
  LogVariable
} from './types';
import LoggedIndex from './LoggedIndex';

export default class Logger {
  private trace: Trace = { steps: [] };
  private scopes = new Stack<Scope>();
  private currentState = new Stack<LogVariable<unknown>[]>();
  private nextId: number = 0;

  public constructor() {
    this.currentState.push([]);
  }

  public getNextId(): number {
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

  public logChange<T>(id: number, newValue: T): void {
    //find var with id
    const iterator = this.currentState.iterator();

    //update its value
    const update = () => {
      let logVarArray = iterator.next();
      while (!logVarArray.done) {
        for (const logVar of logVarArray.value) {
          if (logVar.id == id) {
            logVar.value = newValue;
            return;
          }
        }
        logVarArray = iterator.next();
      }
    };
    update();

    //log step
    this.logStep();
  }

  private toStateVariable<T>(logVar: LogVariable<T>): StateVariable<T> {
    //deconstructing logVar to retrieve StateVariable
    const { id, ...stateVar } = logVar;
    return stateVar;
  }

  private logStep(value?: StateVariable<unknown>) {
    const logDestination = this.getLogDestination();
    const iterator = this.currentState.iterator();
    const finalState: StateVariable<unknown>[] = [];

    let logVarArray = iterator.next();

    while (!logVarArray.done) {
      logVarArray.value.forEach((logVar) => finalState.push(this.toStateVariable(logVar)));
      logVarArray = iterator.next();
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
    this.currentState.push([]);
  }

  public endScope() {
    const currentScope = this.scopes.pop();

    if (this.scopes.isEmpty()) {
      this.trace.steps.push(currentScope);
    } else {
      this.scopes.peek().subSteps.push(currentScope);
    }

    this.currentState.pop();
  }

  public createArray<T>(array: T[]): LoggedArray<T> {
    const id = this.getNextId();
    const stateVar: StateVariable<unknown> = {
      type: StateVariableType.STATIC,
      value: [...array]
    };

    const logVar: LogVariable<unknown> = { ...stateVar, id };

    this.logStep(stateVar);
    this.currentState.peek().push(logVar);

    return new LoggedArray<T>(array, id, this);
  }

  public createVar<T>(type: StateVariableType, value: T, origin?: number): LoggedIndex<T> {
    const id = this.getNextId();
    const stateVar: StateVariable<unknown> = {
      origin,
      type,
      value
    };

    const logVar: LogVariable<unknown> = { ...stateVar, id };

    this.logStep(stateVar);
    this.currentState.peek().push(logVar);

    return new LoggedIndex<T>(value, id, this);
  }
}

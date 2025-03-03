/*
import { writeFile } from 'fs';
import { Trace, StateVariable, StateVariableType, VariableStep } from './types';

export default class Logger {
  public trace: Trace;
  private state: StateVariable<any>[];

  public constructor() {
    this.trace = { steps: [] };
    this.state = [];
  }

  public logIteration() {
    //this.trace.steps.push({ state: this.state }); // type is Iterate?
  }

  public write(logFile: string = 'log.json') {
    writeFile(logFile, JSON.stringify(this.trace, null, 2), (err) => {
      if (err) {
        console.error(err);
      }
    });
  }

  private createProxy(target: any): any {
    return new Proxy(target, {
      set(obj, key, value) {
        var steps = target.log.trace.steps;
        console.log(target.log.trace.steps);
        console.log(steps[steps.length-1]);

        var deepCopy = JSON.parse(JSON.stringify(steps[steps.length-1]));
        
        //prevStep.state = {type: ... ,state : [...], ... }
        //               = [
        //  {name: minIndex, type: number, value: 0},
        //  {name: i, type: number, value: 2}
        // ]
        // target.name == i
        deepCopy.find((item: StateVariable<any>) => item.name === target.name).value = value;  //deepcopy value?
        
        console.log('Setting', key, 'to', value);
        console.log(target.name);
        
        const variableStep: VariableStep = {
          type:'Assignment',
          state: deepCopy,
          variableName: target.name,
          value: value
        };
        
        steps.push(variableStep);
        
        return Reflect.set(obj, key, value);
      },
      get(obj, key) {
        const value = Reflect.get(obj, key);
        console.log('Getting', key, 'with value', value);
        return value;
      }
    });
  }

  public recordState<T>(
    initialValue: T,
    type: StateVariableType = StateVariableType.STATIC,
    name?: string
  ): StateVariable<T> {
    //how to deepcopy properly??
    const state: StateVariable<T> = {
      name, type, value: JSON.parse(JSON.stringify(initialValue)), log: this
    };

    const stateProxy = this.createProxy(state);
    this.state.push(stateProxy);
    return stateProxy;
  }
}

*/

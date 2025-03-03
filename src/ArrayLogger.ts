import { writeFile } from 'fs';
import {
  Trace,
  ITraceStep,
  StateVariable,
  StateVariableType,
  VariableStep,
  OperationStep
} from './types';

/*
TODO:
 * define private copy method

*/

export default class ArrayLogger {
  public trace: Trace<any>;
  private nextId: number;
  private currentDepth: number;

  public constructor() {
    this.currentDepth = 0;
    this.nextId = 0;
    this.trace = { steps: [] };
  }

  public write(logFile: string = 'log.json') {
    writeFile(logFile, JSON.stringify(this.trace, null, 2), (err) => {
      if (err) {
        console.error(err);
      }
    });
  }

  private omitKey<T, K extends keyof T>(obj: T, key: K): Omit<T, K> {
    const { [key]: _, ...rest } = obj;
    return rest as Omit<T, K>;
  }

  //target: StateVariable<any>
  private createProxy(target: any): any {
    return new Proxy(target, {
      set(obj, key, value) {
        //copy previous state and update value of this variable
        const [prevStep, currentStepList] = target.log.getPreviousStep();

        const copiedList = [...prevStep.state]; // copy everything even the pointers
        const index = copiedList.findIndex((item) => item.id === target.id); // find the index of the item you want to change
        copiedList[index] = JSON.parse(
          JSON.stringify(target.log.omitKey(copiedList[index], 'log'))
        ); // copy the shits so that its modiifable without changing the original
        copiedList[index].value = JSON.parse(JSON.stringify(value)); // change the bish


        console.log('Setting', key, 'to', value);

        const assignmentStep: VariableStep<any> = {
          structure: prevStep.structure, //prevStep.structure?
          type: 'Assignment',
          state: copiedList,
          variableId: target.id,
          value: copiedList[index].value
        };

        currentStepList.push(assignmentStep);

        return Reflect.set(obj, key, value);
      },
      get(obj, key) {
        const value = Reflect.get(obj, key);
        console.log('Getting', key, 'with value', value);
        return value;
      }
    });
  }

  private getNextId(): number {
    return this.nextId++;
  }

  public recordState<T>(
    initialValue: T,
    type: StateVariableType = StateVariableType.STATIC,
    name?: string
  ): StateVariable<T> {
    const state: StateVariable<T> = {
      id: this.getNextId(),
      type: type,
      value: JSON.parse(JSON.stringify(initialValue)),
      log: this
    };

    if (name) {
      state.name = name;
    }

    const stateProxy = this.createProxy(state);
    const [prevStep, currentStepList] = this.getPreviousStep();
    const step: VariableStep<T> = {
      structure: prevStep.structure,
      type: 'Declaration',
      state: [...prevStep.state, this.omitKey(state, 'log')], // left one is a list right one is local
      variableId: state.id,
      value: state.value
    };

    currentStepList.push(step);

    return stateProxy;
  }

  private getPreviousStep(): [ITraceStep<any>, ITraceStep<any>[]] {
    let stepList: ITraceStep<any>[] = this.trace.steps;
    let step: ITraceStep<any> = stepList[stepList.length - 1];
    let tmp: OperationStep<any> = step as OperationStep<any>;
    let depth = this.currentDepth;

    while (depth > 0 && tmp.substeps) {
      stepList = tmp.substeps;
      if (tmp.substeps.length > 0) {
        step = stepList[stepList.length - 1];
        tmp = step as OperationStep<any>;
      } else {
        break;
      }
      depth--;
    }

    return [step, stepList];
  }

  public mark(block: () => void, ...vars: StateVariable<any>[]): void {
    const newVars: string[] = vars.map((v) => v.id + '');
    const [prevStep, currentStepList] = this.getPreviousStep();

    const step: OperationStep<any> = {
      structure: prevStep.structure,
      type: 'Mark',
      state: prevStep.state,
      variables: newVars,
      substeps: []
    };

    //alt: block() skapar en egen logg...

    this.currentDepth++;
    currentStepList.push(step);
    block();
    this.currentDepth--;

    console.log('markstep', step);
  }
}

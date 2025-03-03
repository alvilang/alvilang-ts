/*
[3,5,7,4,2]


insertionSort(array: number[]) {
    for(let i = 1; i < array.length; i++) {
        let j = i;
        while(j > 0 && array[j-1] > array[j]) {
            let tmp = array[j];
            array[j] = array[j-1];
            array[j-1] = tmp;
            j--;
        }    
    }


}


actions: 
    'declaration'       -- name of variable and its value
    'assignment/update' -- name/id of variable to update and the new value
    'swap'              -- indices to swap and the new array
    'comparison'        -- indices to compare and the resulting comparison, true or false
    'deletion'          -- index to delet and the new array
    'mark'              -- index to mark in the array

variables:
    'array'             -- see: LoggedArray
    'static'            -- 
    'pointer'           -- created from LoggedArray, 

all variables have optional names (for visualization purposes)
all variables have id's (to be able to update their values for the correctness of the log)
    

-----------Potential Log-structure: L1
{
    steps: [
            array: [3,5,7,4,2]       -- current state of array
            variables: {name: value} -- all variables in this array so far
            action: act              -- action taken on this array
    ]
}
    (Do we need an id for variables to keep track of which ones are being acted on?)

-----------Potential Log-structure with multiple arrays?: L2
{
    arrays: {arr1: {
                    array: [3,5,7,4,2]       -- current state of array
                    variables: {name: value} -- all variables in this array
                    steps: {action: act}     -- all actions taken on this array in order
            }
            arr2: {
                    ...
            }
    }
}

Example with L1:
{
    steps: [
        {variables: {arr: {main: [3,5,7,4,2]}}
        
        action: {
            'declaration' : {
                arr: [3,5,7,4,2]}
        },
        
        
        {variables: {arr: {main: [3,5,7,4,2]}}
        action: {
            'declaration' : {
                i: {'index': 1}
                }
            }

    ]
}



{

    steps: [
        {
            action: 'declaration'
            variables: [
                {
                    value: [],
                    
                }
            ]
        }
    ]
}

*/

import Stack from './lib/Stack';
import LoggedArray from './LoggedArray';
import { TraceStep, StateVariableType, Trace, StateVariable, StateDump, NewScope } from './types';

export default class Log {
  private trace: Trace = { steps: [] };
  private scopes = new Stack<NewScope>();
  private currentState: TraceStep['state'] = [];

  public constructor() {}

  private getLogDestination(): TraceStep[] {
    const currentScope = this.scopes.peek();
    return currentScope === undefined ? this.trace.steps : currentScope.subSteps;
  }

  private logStep(value: StateVariable<unknown>) {
    const logDestination = this.getLogDestination();
    
    const step: StateDump = {
      type: 'StateDump',
      state: ;
    }


  }

  /*
  var: a
  var: b

  // New scope
    var: a
    var: b
    var: c
    var: d
  // End scope

  var: a
  var: b
  */

  private startScope(name?: string) {
    this.scopes.push({ type: "NewScope", name, subSteps: [] });
  }

  private endScope() {
    const currentScope = this.scopes.pop();

    if (currentScope === undefined) {
      throw new Error('No scope to end');
    }

    const parentScope = this.scopes.peek();

    if (parentScope !== undefined) {
      parentScope.subSteps.push(currentScope);
    } else {
      this.trace.steps.push(currentScope);
    }
  }

  public createArray<T>(array: T[]): LoggedArray<T> {
    this.logStep({
      type: StateVariableType.STATIC,
      value: [...array]
    });

    return new LoggedArray<T>(array, this);
  }
}

/*
const log = new Log();

const arr = log.createArray([]);
const index1 = arr.createIndex(1);

// log.section('');
log.mark(() => {
  const index2 = arr.createIndex(2);
})

const index3 = log.createVar(3);


function insertionSort<T>(array: LoggedArray<T>) {

  for (let i = array.createIndex(1); i < array.length; i++) {
    let j = i; //recordState<>()

    while (j > 0 && array[j - 1] > array[j]) {
      array.swap(j,j-1);
      
      //let tmp = array[j];
      //array[j] = array[j - 1];
      //array[j - 1] = tmp;
      j--;
    }
  }
}

*/

/*

Trace: {
  steps: [

    //arr.createArray()
    {
      type: StateDump
      state: [
        {
          type: StateVariableType.STATIC,
          value: []
        }
      ]
    },

    //const index1 = arr.createIndex(1)
    {
      type: StateDump
      state: [
        {
          type: StateVariableType.STATIC,
          value: []
        },
        {
          type: StateVariableType.POINTER,
          value: 1
        }
      ]
    },

    //log.mark()
    {
      type: StartSection
    },

    // const index2 = arr.createIndex(2)
    {
      type: StateDump
      state: [
        {
          type: StateVariableType.STATIC,
          value: []
        },
        {
          type: StateVariableType.POINTER,
          value: 1
        },
        {
          type: StateVariableType.POINTER,
          value: 2
        }
      ]
    },

    {
      type: EndSection
    }
      
    // const index3 = log.createVar(3)
    {
      type: StateDump
      state: [
        {
          type: StateVariableType.STATIC,
          value: []
        },
        {
          type: StateVariableType.POINTER,
          value: 1
        },
        {
          type: StateVariableType.STATIC,
          value: 3
        }
      ]
    }
  ]
}

*/

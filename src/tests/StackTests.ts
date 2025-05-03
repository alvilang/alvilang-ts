import LoggedCircularArrayQueue from "../LoggedCircularArrayQueue";
import Logger from "../Logger";


//-------------------------------------------------------------------//
//Main test function

function logStack<T>
(
  capacity: number,
  applications: T[],
  fileName: string
): void {
  const logger = new Logger();
  const loggedStack = logger.createStack(capacity);
  
  for(const arg of applications) {
    if (arg) {
      loggedStack.push(arg);
    } else {
      loggedStack.pop();
    }
  }
  logger.write(fileName);
}


//-------------------------------------------------------------------//
//Tests: logStack<T>(capacity, [..., T for push, null or undefined for pop, ...], file);


logStack(6, [1,2,3,null,null,4,5], "stack1.json");
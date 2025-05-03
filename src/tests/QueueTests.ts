import LoggedCircularArrayQueue from "../LoggedCircularArrayQueue";
import Logger from "../Logger";


//-------------------------------------------------------------------//
//Main test function

function logQueue<T>
(
  capacity: number,
  applications: T[],
  fileName: string
): void {
  const logger = new Logger();
  const loggedQueue = logger.createQueue(capacity);
  
  for(const arg of applications) {
    if (arg) {
      loggedQueue.enqueue(arg);
    } else {
      loggedQueue.dequeue();
    }
  }
  logger.write(fileName);
}


//-------------------------------------------------------------------//
//Tests: logQueue<T>(capacity, [..., T for enqueue, null or undefined for dequeue, ...], file);


logQueue(6, [1,2,3,4,5,6,null,7], "queue1.json");
//[3,5,7,4,2]

function insertionSort(array) {
  for (let i = 1; i < array.length; i++) {
    let j = i; //recordState<>()

    while (j > 0 && array[j - 1] > array[j]) {
      let tmp = array[j];
      array[j] = array[j - 1];
      array[j - 1] = tmp;
      j--;
    }
  }
}

const arr = [5, 1, 3, 2, 4, 5, 7];
console.log(arr);
insertionSort(arr);
console.log(arr);

//let log = new Log();
//let array = log.newArray([3,1,2,4]);

//insertionSort2(array)

function insertionSort2(array) {
  //array: LoggedArray

  for (let i = array.createIndex(1); i < array.length; i++) {
    let j = array.createIndex(i);

    while (j > 0 && array[j - 1] > array[j]) {
      array.swap(j, j - 1);
      /*
            let tmp = array[j];
            array[j] = array[j-1];
            array[j-1] = tmp;
            */
      j--;
    }
  }
}

const proxy = new Proxy(
  { value: 2 },
  {
    set(obj, key, value) {},
    get(target, prop, receiver) {
      /*
        ...
        */
      console.log('test2');

      const prim = Reflect.get(target, 'value');
      const value = prim[prop];
      return typeof value === 'function' ? value.bind(prim) : value;
    }
  }
);

console.log(proxy + 2); // => 4

proxy.value += 5;

console.log(proxy);

console.log(proxy + 2);

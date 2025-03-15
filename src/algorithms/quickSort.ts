//Quicksort using median of three partitioning
//Moves all elements less than the pivot to the left and all elements greater than the pivot to the right
//Then recursively sorts the left and right halves
function quickSort(arr: number[]): number[] {
    
    if (arr.length <= 1) {
        return arr;
    }

    const pivot = medianOfThree(arr);
    const left: number[] = [];
    const right: number[] = [];

    for (let i = 1; i < arr.length; i++)  {
        if (arr[i] < pivot) {
            left.push(arr[i]);
        } 
        else {
            right.push(arr[i]);
        }
    }
    return quickSort(left).concat(pivot, quickSort(right));
}

//Helper function to find the median of three elements
function medianOfThree(arr: number[]): number {
    const first = arr[0];
    const last = arr[arr.length - 1];
    const middle = arr[Math.floor(arr.length / 2)];

    if ((first > middle) !== (first > last)) return first;
    
    if ((middle > first) !== (middle > last)) return middle;

    return last;
    
}

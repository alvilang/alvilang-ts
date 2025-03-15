//Works on sorted arrays by halving the array each time and comparing the target to the middle element
//If the target is less than the middle element, the search is done on the lower half of the array and vice versa
function binSearch(arr: number[], target: number): number {
    let low = 0;
    let high = arr.length - 1;

    if (low <= high) {
        let mid = Math.floor((low + high) / 2);
        
        if (arr[mid] === target) 
            return mid;

        else if (arr[mid] < target) 
            low = mid + 1;
            
        else high = mid - 1;

    }

    return -1;

}

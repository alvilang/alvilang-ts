//Simply loops through the array and returns the index of the target if found, otherwise returns -1
function linearSeach(arr: number[], target: number): number {
    for (let i = 0; i < arr.length -1 ; i++) {
        if (arr[i] === target) {
            return i;
        }
    }
    return -1;
}
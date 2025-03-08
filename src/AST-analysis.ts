import { Project, Node } from "ts-morph";
import { writeFileSync } from "fs";

const project = new Project();

const standard_implementation = `
function insertionsort(arr: number[]): number[] {
  const n = arr.length;

  for (let i = 1; i < n; i++) {
      let current = arr[i];
      let j = i - 1;

      while (j >= 0 && arr[j] > current) {
          arr[j + 1] = arr[j];
          j--;
      }
      arr[j + 1] = current;
  }
  return arr;
}
`;

const logged_version = `
function insertionSort<T>(array: LoggedArray<T>) {
  for (let i = array.createIndex(1); i.get() < array.length; i.set(i.get() + 1)) {
    array.scope(() => {
      let j = array.createIndex(i.get());
      while (j.get() > 0 && array.get(j.get() - 1) > array.get(j.get())) {
        array.swap(j.get()-1, j.get());
        j.set(j.get()-1);
      }
    });
  }
}
`;

const [sf1, sf2] = [
  project.createSourceFile("standard_implementation.ts", standard_implementation, { overwrite: true }),
  project.createSourceFile("logged_version.ts", logged_version, { overwrite: true })
];

function extract_node_info(node: Node): any {
  const result: any = {
    kind: node.getKindName(),
    text: node.getText().substring(0, 50)
  };

  const children = node.getChildren();
  if (children.length > 0) {
    result.children = children.map(child => extract_node_info(child));
  }
  return result;

}

function count_nodes(node: Node): number {
  let count = 1; 
  node.getChildren().forEach(child => {
    count += count_nodes(child);
  });
  return count;
}

const total_nodes1 = count_nodes(sf1);
const total_nodes2 = count_nodes(sf2);

console.log("Total amount of nodes in standard implementation:", total_nodes1);
console.log("Total amount of nodes in logged implementation:", total_nodes2);

writeFileSync("ast_standard.json", JSON.stringify(extract_node_info(sf1), null, 2));
writeFileSync("ast_logged.json", JSON.stringify(extract_node_info(sf2), null, 2));
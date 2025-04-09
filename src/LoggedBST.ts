import Logger from "./Logger";
import { BinaryTree, Node, empty, isEmpty, leaf } from "./Tree";
import { CompareOperator, LoggedObject } from "./types";

type LeftRightMatrix<T> = [[T, Branch, Branch]];
type Branch = number | null
//current plan: store as recursive object
//backup: store as left/right matrix

//No duplicate values
export default class LoggedBST<T> implements LoggedObject{
  private readonly id: number;
  public logger: Logger;
  private tree: BinaryTree<T>;

  public constructor(id: number, logger: Logger) {
    this.id = id;
    this.logger = logger;
    this.tree = empty();
  }

  public getId(): number {
    return this.id;
  }

  public toValue() {
    return this.toValueHelper(this.tree);
  }

  private toValueHelper(tree: BinaryTree<T>): BinaryTree<T> {
    if (!tree) return empty();

    const acc = leaf(tree.value) as Node<T>;
    acc.left = this.toValueHelper(tree.left);
    acc.right = this.toValueHelper(tree.right);
    return acc;
  }

  public insert(item: T): boolean {
    if (!this.tree) {
      this.tree = leaf(item);
      this.logger.logChange(this.id, this.toValue());
      return true;
    }

    this.logger.compare([this, []], CompareOperator.EQ, item);
    if (this.tree.value === item) {
      return false;
    }

    const track: boolean[] = []
    let nextTree: BinaryTree<T>;

    this.logger.compare([this, []], CompareOperator.LT, item);
    if (this.tree.value < item) {
      nextTree = this.tree.right;
      track.push(true);
    } else {
      nextTree = this.tree.left;
      track.push(false);
    }

    const result = this.insertHelper(this.tree, nextTree, item, track);
    if (result) {
      this.logger.logChange(this.id, this.toValue());      
    }
    return result;
  }


  /*
  recursivly check where to insert, perform the insert, track the steps (left/right), 
  */
  private insertHelper(prev: Node<T>, curr: BinaryTree<T>, item: T, steps: boolean[]): boolean {
    if (!curr) {
      if (steps[steps.length-1]) {
        prev.right = leaf(item);
      } else {
        prev.left = leaf(item);
      }

      const animationStep = {
        type: 'insert',
        subjects: [this.id],
        data: [...steps]
      }
      this.logger.logAnimation(animationStep);

      return true;
    }

    this.logger.compare([this, [...steps]], CompareOperator.LT, item);
    if (curr.value < item) {
      steps.push(true);
      return this.insertHelper(curr, curr.right, item, steps);
    }
    this.logger.compare([this, [...steps]], CompareOperator.GT, item);
    if (curr.value > item) {
      steps.push(false);
      return this.insertHelper(curr, curr.left, item, steps);
    }

    return false;    
  }


  //TODO: add logging steps
  public delete(item: T): boolean {
    const [newTree, result] = this.deleteHelper(this.tree, item, []);
    this.tree = newTree;
    return result;
  }

  private deleteHelper(curr: BinaryTree<T>, item: T, steps: boolean[]): [BinaryTree<T>, boolean] {
    if (!curr) {
      return [curr, false];
    }

    this.logger.compare([this, [...steps]], CompareOperator.LT, item);
    if (curr.value < item) {
      steps.push(true);
      const [r, result] = this.deleteHelper(curr.right, item, steps);
      curr.right = r;
      return [curr, result];
    }

    this.logger.compare([this, [...steps]], CompareOperator.GT, item);
    if (curr.value > item) {
      steps.push(false);
      const [l, result] = this.deleteHelper(curr.left, item, steps);
      curr.left = l;
      return [curr, result];
    }

    //curr.value === item
    //case 1: both left and right are empty
    if (!curr.left && !curr.right) {
      return [empty(), true];
    }

    //case 2/3: only one of them are empty
    if (!curr.left) {
      return [curr.right, true];
    }
    if (!curr.right) {
      return [curr.left, true];
    }

    //case 4: none are empty
    //find next node/subtree
    let tmpOld: Node<T> = curr;
    let tmp: BinaryTree<T> = curr.left;
    steps.push(false);
    //TODO: hightlight tmp.value
    while (tmp.right) {
      tmpOld = tmp;
      tmp = tmp.right;
      steps.push(true);
      //TODO: hightlight tmp.value
    }

    //replace current value with found value
    curr.value = tmp.value;

    //TODO: highlight value

    //repeat deleteHelper for the subTree and the next node
    const [subTree, result] = this.deleteHelper(tmp, tmp.value, steps);
    if (curr == tmpOld) {
      tmpOld.left = subTree;
    } else {
      tmpOld.right = subTree;
    }

    return [curr, result];
  }

  //TODO: add logging steps
  private find(item: T): boolean {    
    return this.findHelper(this.tree, item, []);
  }

  private findHelper(tree: BinaryTree<T>, item: T, steps: boolean[]): boolean {
    while (tree) {
      this.logger.compare([tree, steps], CompareOperator.LT, item);
      if (tree.value < item) {
        steps.push(true);
        tree = tree.right;
      } else {
        this.logger.compare([tree, steps], CompareOperator.GT, item);
        if (tree.value > item) {
          steps.push(false);
          tree = tree.left;
        } else {
          return true;
        }
      }
    }
    return false;
  }

  public dfs(): T[] {
    return this.dfs_helper(this.tree);
  }

  private dfs_helper(tree: BinaryTree<T>): T[] {
    if (isEmpty(tree)) return [];

    const {value, left, right} = this.tree as Node<T>;    
    const dfs = [value];
    this.dfs_helper(left).forEach(node => dfs.push(node));
    this.dfs_helper(right).forEach(node => dfs.push(node));
    return dfs;
  }


  public toString(): string {
    return this.toStringHelper(this.tree, 0);
  }

  private toStringHelper(tree: BinaryTree<T>, level: number): string {
    let str = "";
    if (tree) {
      if (level) {
        str += "| ".repeat(level-1) + "|-";
      }
      str += tree.value;
      /*
      //this version is more compact, but you cannot
      //tell left from right if only one of them exist
      if (tree.right) {
        str += "\n" + "| ".repeat(level+1);
        str += "\n" + this.toStringHelper(tree.right, level+1);
      }
      if (tree.left) {
        str += "\n" + "| ".repeat(level+1);
        str += "\n" + this.toStringHelper(tree.left, level+1);
      }
      */
      
      //this version shows "missing" edges
      str += "\n" + "| ".repeat(level+1) + "\n";
      if (tree.right) {
        str += this.toStringHelper(tree.right, level+1);
      } else {
        str += "| ".repeat(level) + "|-";
      }
      str += "\n" + "| ".repeat(level+1) + "\n";
      if (tree.left) {
        str += this.toStringHelper(tree.left, level+1);
      } else {
        str += "| ".repeat(level) + "|-";
      }
      
    }
    return str;
  }
}


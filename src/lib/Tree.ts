
//null instead of undefined so it can show up in logger
export type BinaryTree<T> = null | Node<T>
export type Node<T> = {
  value: T,
  left: BinaryTree<T>,
  right: BinaryTree<T>
}

export function empty(): BinaryTree<any> {
  return null;
}

export function leaf<T>(item: T): BinaryTree<T> {
  return {
    value: item,
    left: empty(),
    right: empty()
  }
}

export function isEmpty(tree: BinaryTree<any>): boolean {
  return tree === empty();
}

//needs to be tested
/*
export function isLeaf(tree: BinaryTree<any>): boolean {
  // if (tree is empty or (left or right exist)) return false, else true
  return !(!tree || (tree.left || tree.right))
}
*/


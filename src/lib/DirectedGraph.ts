import { Edge, Graph } from "./Graph";

export default class DirectedGraph<V,E> {
  private readonly graph: Graph<V,E>;

  public constructor() {
    this.graph = new Map();
  }

  public addNode(node: V): void {
    if (this.graph.has(node)) {
      throw new Error('Graph already contains node');
    }

    this.graph.set(node, []);
  }

  public addNodes(nodes: V[]): void {
    nodes.forEach(node => this.addNode(node));
  }

  public addEdge(src: V, dst: V, weight: E): void {
    if (!this.graph.has(src)) {
      throw new Error('Graph does not contain source node');
    }
    if (!this.graph.has(dst)) {
      throw new Error('Graph does not contain destination node');
    }

    const edge = {src, dst, weight};
    this.graph.get(src)?.push(edge);
  }

  //bi directional with same weight in both directions
  public addBiEdge(src: V, dst: V, weight: E) {
    this.addEdge(src, dst, weight);
    this.addEdge(dst, src, weight);
  }

  public hasNode(node: V): boolean {
    return this.graph.has(node);
  }

  public getNodes(): V[] {
    return [...this.graph.keys()];
  }

  public getEdgesFromNode(node: V): Edge<V,E>[] {
    const edges  = this.graph.get(node);
    if (!edges) {
      throw new Error('Node does not exist');
    }
    return edges.map(edge => ({...edge}));
  }

  public getAllEdges(): Edge<V,E>[] {
    const allEdges: Edge<V,E>[] = [];
    for(const [node, edges] of this.graph) {
      edges.forEach(edge => allEdges.push(edge));
    }
    return allEdges;
  }
}

import DirectedGraph from "./DirectedGraph";
import { WeightedEdge } from "./Graph";

export default class UndirectedGraph<V,E> {
  private readonly graph: DirectedGraph<V,E>;

  public constructor() {
    this.graph = new DirectedGraph();
  }

  public addNode(node: V): void {
    this.graph.addNode(node);
  }

  public addNodes(nodes: V[]): void {
    this.graph.addNodes(nodes);
  }

  public addEdge(src: V, dst: V, weight: E): void {
    this.graph.addBiEdge(src, dst, weight);
  }

  public hasNode(node: V): boolean {
    return this.graph.hasNode(node);
  }

  public getNodes(): V[] {
    return this.graph.getNodes();
  }

  public getEdgesFromNode(node: V): WeightedEdge<V,E>[] {
    return this.graph.getEdgesFromNode(node);
  }

  public getAllEdges(): WeightedEdge<V,E>[] {
    return this.graph.getAllEdges();
  }
}

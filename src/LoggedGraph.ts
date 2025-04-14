import DirectedGraph from "./lib/DirectedGraph";
import { AdjacencyList, Edge, Graph, WeightedEdge, WeightedGraph } from "./lib/Graph";
import Logger from "./Logger";
import { LoggedObject } from "./types";

export default class LoggedGraph<V,E> implements LoggedObject {
  private readonly graph: DirectedGraph<V,E>;
  private readonly id: number;
  private logger: Logger;
  
  public constructor(id: number, logger: Logger, graph?: WeightedGraph<V,E>) {
    this.id = id;
    this.logger = logger
    this.graph = new DirectedGraph<V,E>();

    if (!graph) {
      return;
    }

    this.graph.addNodes(graph.vertices);
    for (let i = 0; i < graph.edges.length; i++) {
      const edge = graph.edges[i];
      this.graph.addEdge(edge.src, edge.dst, graph.weights[i]);
    }
  }
  
  getId(): number {
    return this.id;
  }
  
  toValue() {
    const graph: WeightedGraph<V,E> = {
      vertices: [],
      edges: [],
      weights: []
    };

    for (const node of this.graph.getNodes()) {
      graph.vertices.push(node);
      for (const weightedEdge of this.graph.getEdgesFromNode(node)) {
        const edge: Edge<V> = {
          src: weightedEdge.src,
          dst: weightedEdge.dst
        }
        graph.edges.push(edge);
        graph.weights.push(weightedEdge.weight);
      }
    }

    return graph;
  }

  getLogger(): Logger {
    return this.logger;
  }

  setLogger(logger: Logger): void {
    this.logger = logger;
  }

  public addNode(node: V): void {
    this.graph.addNode(node);
    this.logger.logChange(this.id, this.toValue());
  }

  public addNodes(nodes: V[]): void {
    this.graph.addNodes(nodes);
    //for each node or all together?
    this.logger.logChange(this.id, this.toValue());
  }

  public addEdge(src: V, dst: V, weight: E): void {
    this.graph.addEdge(src, dst, weight);
    this.logger.logChange(this.id, this.toValue());
  }

  public addBiEdge(src: V, dst: V, weight: E) {
    this.graph.addBiEdge(src, dst, weight);
    this.logger.logChange(this.id, this.toValue());
  }

  public getNodes(): V[] {
    return this.graph.getNodes();
  }

  public getEdgesFromNode(node: V): [WeightedEdge<V,E>, number][] {
    const edgesAndIndices: [WeightedEdge<V,E>, number][] = [];
    let index = 0;

    for (const n of this.graph.getNodes()) {
      const edges = this.graph.getEdgesFromNode(n);
      if (n === node) {
        edges.forEach(edge => edgesAndIndices.push([edge, index++]));
        break;
      }
      index += edges.length;
    }

    return edgesAndIndices;
  }


}
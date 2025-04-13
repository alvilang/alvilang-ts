
export type Edge<V> = {
  src: V,
  dst: V
}

export type WeightedEdge<V,E> = Edge<V> & {
  weight: E
};

export type Graph<V> = {
  vertices: V[],
  //vertices in the edges must exist in vertices
  edges:    Edge<V>[]
};

export type WeightedGraph<V,E> = Graph<V> & {
  //must have same length as edges, the order of the
  //weights also needs to match the edges such that
  //the weight of edge i is found at index i in weights
  weights: E[]
};


export type AdjacencyList<V,E> = Map<V, WeightedEdge<V,E>[]>



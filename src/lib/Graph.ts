export type Graph<V,E> = Map<V, Edge<V,E>[]>;

export type Edge<V,E> = {
  src: V
  dst: V,
  weight: E,
};


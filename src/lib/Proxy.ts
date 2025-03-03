export function createProxy<T extends object>(obj: T, callbacks?: ProxyHandler<T>): T {
  return new Proxy<T>(obj, {
    ...callbacks
  });
}

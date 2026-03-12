import NodeCache from "node-cache";

// useClones defaults to true — cached objects are returned as copies,
// preventing reference mutation from poisoning the cache.
export const apiCache = new NodeCache({
  stdTTL: 600,
  checkperiod: 120,
});

import { Index } from "@upstash/vector";

// Lazily create the index so the build (and deployments without
// UPSTASH_VECTOR_* configured, e.g. self-hosted) don't crash at import time.
let index: Index | undefined;

const getIndex = () =>
  (index ??= new Index({
    url: process.env.UPSTASH_VECTOR_REST_URL ?? "",
    token: process.env.UPSTASH_VECTOR_REST_TOKEN ?? "",
  }));

export const vectorIndex = new Proxy({} as Index, {
  get(_target, prop) {
    const instance = getIndex();
    const value = Reflect.get(instance, prop, instance);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});

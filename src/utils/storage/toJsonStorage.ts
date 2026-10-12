import type { JsonStorage, TextStorage } from "@/types/storage";
import { safely } from "@/utils/function/safely";

// Values kept as JSON in a storage of text. Turning a value into text and
// back never throws: a text that is not JSON reads as nothing, and a value
// that cannot be written as JSON - one that holds itself, or a bigint - is
// not written, so what was stored before stays. What is read is whatever was
// stored: the caller checks it.
export const toJsonStorage = <Value>(
  storage: TextStorage,
): JsonStorage<Value> => ({
  getItem: (key) =>
    safely<Value | null>(
      () => JSON.parse(storage.getItem(key) ?? "null"),
      null,
    ),
  setItem: (key, value) =>
    safely(() => storage.setItem(key, JSON.stringify(value)), undefined),
  removeItem: (key) => storage.removeItem(key),
});

import type { TextStorage } from "@/types/storage";

import { createMemoryStorage } from "./createMemoryStorage";

// Keeps every value in memory as well as in the storage it is given, and
// reads from memory first: a storage that refuses a write - full, or limited
// by the browser's privacy settings - then loses nothing for its caller.
export const withMemory = (storage: TextStorage): TextStorage => {
  const memory = createMemoryStorage();

  return {
    getItem: (key) => memory.getItem(key) ?? storage.getItem(key),
    setItem: (key, value) => {
      memory.setItem(key, value);
      storage.setItem(key, value);
    },
    removeItem: (key) => {
      memory.removeItem(key);
      storage.removeItem(key);
    },
  };
};

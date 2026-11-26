import type { TextStorage } from "@/types/storage";

// A storage of text that lives in memory only, and is gone with the page.
export const createMemoryStorage = (): TextStorage => {
  const items = new Map<string, string>();

  return {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => {
      items.set(key, value);
    },
    removeItem: (key) => {
      items.delete(key);
    },
  };
};

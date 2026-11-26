import { describe, expect, it, vi } from "vitest";

import type { TextStorage } from "@/types/storage";

import { createMemoryStorage } from "./createMemoryStorage";
import { withMemory } from "./withMemory";

// A storage that takes no write, as a full or restricted browser storage.
const createRefusingStorage = (): TextStorage => ({
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
});

describe("withMemory()", () => {
  describe("given a storage that takes writes", () => {
    it("writes to it as well", () => {
      const storage = createMemoryStorage();

      withMemory(storage).setItem("key", "value");

      expect(storage.getItem("key")).toBe("value");
    });

    it("reads what the storage held before", () => {
      const storage = createMemoryStorage();

      storage.setItem("key", "earlier");

      expect(withMemory(storage).getItem("key")).toBe("earlier");
    });

    it("removes from it as well", () => {
      const storage = createMemoryStorage();
      const stored = withMemory(storage);

      stored.setItem("key", "value");
      stored.removeItem("key");

      expect(storage.getItem("key")).toBeNull();
      expect(stored.getItem("key")).toBeNull();
    });
  });

  describe("given a storage that refuses writes", () => {
    it("still gives back what was written", () => {
      const stored = withMemory(createRefusingStorage());

      stored.setItem("key", "value");

      expect(stored.getItem("key")).toBe("value");
    });

    it("reads memory first, without asking the storage", () => {
      const storage = createRefusingStorage();
      const getItem = vi.spyOn(storage, "getItem");
      const stored = withMemory(storage);

      stored.setItem("key", "value");
      stored.getItem("key");

      expect(getItem).not.toHaveBeenCalled();
    });
  });
});

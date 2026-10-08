import { afterEach, describe, expect, it, vi } from "vitest";

import { toJsonStorage } from "./toJsonStorage";

describe("toJsonStorage()", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  describe("when a value is written", () => {
    it("keeps it as JSON under the key", () => {
      toJsonStorage(sessionStorage).setItem("key", { id: "a", done: [1, 2] });

      expect(sessionStorage.getItem("key")).toBe('{"id":"a","done":[1,2]}');
    });

    it("replaces the value that was there", () => {
      const storage = toJsonStorage(sessionStorage);

      storage.setItem("key", { id: "a" });
      storage.setItem("key", { id: "b" });

      expect(storage.getItem("key")).toEqual({ id: "b" });
    });
  });

  describe("when a value cannot be written as JSON", () => {
    it("does not throw on a value that holds itself, and writes nothing", () => {
      const circular: Record<string, unknown> = { id: "a" };

      circular.self = circular;

      const storage = toJsonStorage(sessionStorage);

      expect(() => storage.setItem("key", circular)).not.toThrow();
      expect(sessionStorage.getItem("key")).toBeNull();
    });

    it("does not throw on a bigint, and keeps what was stored before", () => {
      const storage = toJsonStorage<unknown>(sessionStorage);

      storage.setItem("key", { id: "a" });

      expect(() => storage.setItem("key", { count: 10n })).not.toThrow();
      expect(storage.getItem("key")).toEqual({ id: "a" });
    });
  });

  describe("when a value is read", () => {
    it("returns the value that was written", () => {
      const storage = toJsonStorage(sessionStorage);
      const value = { id: "a", nested: { list: ["x", null, 2] }, flag: false };

      storage.setItem("key", value);

      expect(storage.getItem("key")).toEqual(value);
    });

    it("returns nothing for a key that was never written", () => {
      expect(toJsonStorage(sessionStorage).getItem("missing")).toBeNull();
    });

    it("returns nothing for a text that is not JSON", () => {
      sessionStorage.setItem("key", "{broken");
      sessionStorage.setItem("empty", "");

      expect(toJsonStorage(sessionStorage).getItem("key")).toBeNull();
      expect(toJsonStorage(sessionStorage).getItem("empty")).toBeNull();
    });

    it("returns whatever JSON was stored, also when it is not an object", () => {
      sessionStorage.setItem("number", "7");
      sessionStorage.setItem("text", '"session"');
      sessionStorage.setItem("list", "[1]");

      expect(toJsonStorage(sessionStorage).getItem("number")).toBe(7);
      expect(toJsonStorage(sessionStorage).getItem("text")).toBe("session");
      expect(toJsonStorage(sessionStorage).getItem("list")).toEqual([1]);
    });
  });

  describe("when a value is removed", () => {
    it("removes the key from the storage", () => {
      const storage = toJsonStorage(sessionStorage);

      storage.setItem("key", { id: "a" });
      storage.removeItem("key");

      expect(sessionStorage.getItem("key")).toBeNull();
      expect(storage.getItem("key")).toBeNull();
    });

    it("leaves the other keys where they are", () => {
      const storage = toJsonStorage(sessionStorage);

      storage.setItem("first", 1);
      storage.setItem("second", 2);
      storage.removeItem("first");

      expect(storage.getItem("second")).toBe(2);
    });
  });
});

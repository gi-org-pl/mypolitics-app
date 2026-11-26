import { describe, expect, it } from "vitest";

import { createMemoryStorage } from "./createMemoryStorage";

describe("createMemoryStorage()", () => {
  it("finds nothing under a key that was never set", () => {
    expect(createMemoryStorage().getItem("key")).toBeNull();
  });

  it("gives back the last value set under a key", () => {
    const storage = createMemoryStorage();

    storage.setItem("key", "first");
    storage.setItem("key", "second");

    expect(storage.getItem("key")).toBe("second");
  });

  it("finds nothing under a key once it is removed, and keeps the others", () => {
    const storage = createMemoryStorage();

    storage.setItem("key", "value");
    storage.setItem("other", "kept");
    storage.removeItem("key");

    expect(storage.getItem("key")).toBeNull();
    expect(storage.getItem("other")).toBe("kept");
  });

  it("shares nothing between two storages", () => {
    const first = createMemoryStorage();
    const second = createMemoryStorage();

    first.setItem("key", "value");

    expect(second.getItem("key")).toBeNull();
  });
});

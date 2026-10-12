import { afterEach, describe, expect, it, vi } from "vitest";

import { getSafeSessionStorage } from "./getSafeSessionStorage";

const refuse = () => {
  throw new DOMException("The operation is insecure.", "SecurityError");
};

describe("getSafeSessionStorage()", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    sessionStorage.clear();
    localStorage.clear();
  });

  describe("given a browser with storage", () => {
    it("writes to the storage of the tab and reads from it", () => {
      const storage = getSafeSessionStorage();

      storage?.setItem("key", "value");

      expect(sessionStorage.getItem("key")).toBe("value");
      expect(storage?.getItem("key")).toBe("value");
    });

    it("finds nothing under a key that was never written", () => {
      expect(getSafeSessionStorage()?.getItem("missing")).toBeNull();
    });

    it("removes what was written", () => {
      const storage = getSafeSessionStorage();

      storage?.setItem("key", "value");
      storage?.removeItem("key");

      expect(sessionStorage.getItem("key")).toBeNull();
    });

    it("never writes to the storage shared between tabs", () => {
      getSafeSessionStorage()?.setItem("key", "value");

      expect(localStorage).toHaveLength(0);
    });
  });

  describe("given storage whose calls throw", () => {
    it("finds nothing when a read throws", () => {
      sessionStorage.setItem("key", "value");
      vi.spyOn(Storage.prototype, "getItem").mockImplementation(refuse);

      expect(getSafeSessionStorage()?.getItem("key")).toBeNull();
    });

    it("drops a write that throws - the storage is full", () => {
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new DOMException("The quota is exceeded.", "QuotaExceededError");
      });
      const storage = getSafeSessionStorage();

      expect(() => storage?.setItem("key", "value")).not.toThrow();
      expect(sessionStorage.getItem("key")).toBeNull();
    });

    it("drops a removal that throws", () => {
      sessionStorage.setItem("key", "value");
      vi.spyOn(Storage.prototype, "removeItem").mockImplementation(refuse);
      const storage = getSafeSessionStorage();

      expect(() => storage?.removeItem("key")).not.toThrow();
    });
  });

  describe("given no storage at all", () => {
    it("returns nothing when the browser refuses the storage itself", () => {
      vi.spyOn(globalThis, "sessionStorage", "get").mockImplementation(refuse);

      expect(getSafeSessionStorage()).toBeUndefined();
    });

    it("returns nothing where there is no browser", () => {
      vi.stubGlobal("sessionStorage", undefined);

      expect(getSafeSessionStorage()).toBeUndefined();
    });
  });
});

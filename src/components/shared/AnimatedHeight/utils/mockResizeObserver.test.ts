import { afterEach, describe, expect, it, vi } from "vitest";

import { mockResizeObserver } from "./mockResizeObserver";

describe("mockResizeObserver()", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("when an observer is created", () => {
    it("records it with what it watches", () => {
      const { observers } = mockResizeObserver();
      const first = document.createElement("div");
      const second = document.createElement("div");
      const observer = new ResizeObserver(vi.fn());

      observer.observe(first);
      observer.observe(second);
      observer.unobserve(first);

      expect(observers).toHaveLength(1);
      expect(observers[0].elements).toEqual([second]);
      expect(observers[0].isDisconnected).toBe(false);

      observer.disconnect();

      expect(observers[0].isDisconnected).toBe(true);
    });
  });

  describe("when a height is reported", () => {
    it("calls the newest observer with an entry for each watched element", () => {
      const { resize } = mockResizeObserver();
      const older = vi.fn();
      const newer = vi.fn();
      const element = document.createElement("div");

      new ResizeObserver(older).observe(element);
      new ResizeObserver(newer).observe(element);
      resize(120);

      expect(older).not.toHaveBeenCalled();
      expect(newer).toHaveBeenCalledTimes(1);
      expect(newer.mock.calls[0][0]).toEqual([
        { target: element, contentRect: { height: 120 } },
      ]);
    });

    it("calls the observer that is named", () => {
      const { resize } = mockResizeObserver();
      const older = vi.fn();
      const newer = vi.fn();

      new ResizeObserver(older).observe(document.createElement("div"));
      new ResizeObserver(newer).observe(document.createElement("div"));
      resize(80, 0);

      expect(older).toHaveBeenCalledTimes(1);
      expect(newer).not.toHaveBeenCalled();
    });
  });

  describe("when the globals are unstubbed", () => {
    it("is gone again", () => {
      mockResizeObserver();
      vi.unstubAllGlobals();

      expect(typeof ResizeObserver).toBe("undefined");
    });
  });
});

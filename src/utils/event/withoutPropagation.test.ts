import { describe, expect, it, vi } from "vitest";

import { withoutPropagation } from "./withoutPropagation";

describe("withoutPropagation()", () => {
  describe("given a handler", () => {
    it("does not call it before an event arrives", () => {
      const handler = vi.fn();

      withoutPropagation(handler);

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe("when the returned handler receives an event", () => {
    it("calls the handler once, without the event", () => {
      const handler = vi.fn();

      withoutPropagation(handler)({ stopPropagation: vi.fn() });

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith();
    });

    it("stops the event from reaching the elements around the control", () => {
      const stopPropagation = vi.fn();

      withoutPropagation(vi.fn())({ stopPropagation });

      expect(stopPropagation).toHaveBeenCalledTimes(1);
    });

    it("stops the event before the handler runs", () => {
      const calls: string[] = [];

      withoutPropagation(() => calls.push("handler"))({
        stopPropagation: () => calls.push("stopPropagation"),
      });

      expect(calls).toEqual(["stopPropagation", "handler"]);
    });
  });
});

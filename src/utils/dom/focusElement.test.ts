import { describe, expect, it, vi } from "vitest";

import { focusElement } from "./focusElement";

describe("focusElement()", () => {
  describe("given an element", () => {
    it("moves the focus to it", () => {
      const element = { focus: vi.fn() };

      focusElement(element);

      expect(element.focus).toHaveBeenCalledTimes(1);
    });
  });

  describe("given nothing", () => {
    it("does nothing", () => {
      expect(() => focusElement(null)).not.toThrow();
    });
  });
});

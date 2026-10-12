import { describe, expect, it, vi } from "vitest";

import { cancelEvent } from "./cancelEvent";

describe("cancelEvent()", () => {
  describe("given an event", () => {
    it("keeps it from the controls further down and from the browser", () => {
      const event = { preventDefault: vi.fn(), stopPropagation: vi.fn() };

      cancelEvent(event);

      expect(event.preventDefault).toHaveBeenCalledTimes(1);
      expect(event.stopPropagation).toHaveBeenCalledTimes(1);
    });
  });
});

import { describe, expect, it } from "vitest";

import { doNothing } from "./doNothing";

describe("doNothing", () => {
  describe("when it is called", () => {
    it("returns nothing", () => {
      expect(doNothing()).toBeUndefined();
    });
  });
});

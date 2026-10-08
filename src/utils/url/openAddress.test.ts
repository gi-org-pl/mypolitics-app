import { afterEach, describe, expect, it } from "vitest";

import { openAddress } from "./openAddress";

// The test environment does not navigate between documents, so the address is
// one of the page that is open: only its fragment differs.
describe("openAddress()", () => {
  afterEach(() => {
    window.history.replaceState(null, "", "/");
  });

  describe("given an address", () => {
    it("opens it in the same tab", () => {
      openAddress("/#wyniki");

      expect(window.location.hash).toBe("#wyniki");
    });

    it("adds the address to the history of the tab", () => {
      const entriesBefore = window.history.length;

      openAddress("/#wyniki");

      expect(window.history.length).toBe(entriesBefore + 1);
    });
  });
});

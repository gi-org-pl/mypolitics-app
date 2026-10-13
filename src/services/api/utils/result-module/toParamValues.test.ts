import { describe, expect, it } from "vitest";

import { toParamValues } from "./toParamValues";

describe("toParamValues()", () => {
  describe("given a value under every name", () => {
    it("keeps each as it was saved", () => {
      const values = {
        marker: 37.5,
        selection: "linked_to_leader",
        isFolded: false,
        nothing: null,
        tags: ["a", 2, true, null],
        none: [],
      };

      expect(toParamValues(values)).toEqual(values);
    });

    it("keeps a name the app does not know, and a value its name does not allow", () => {
      expect(toParamValues({ sortBy: "name", marker: 250 })).toEqual({
        sortBy: "name",
        marker: 250,
      });
    });
  });

  describe("given a name whose value could not be read", () => {
    it("leaves the name out and keeps the others", () => {
      const read = toParamValues({ marker: 20, bounds: undefined });

      expect(read).toEqual({ marker: 20 });
      expect(read).not.toHaveProperty("bounds");
    });
  });

  describe("given no names", () => {
    it("returns no parameters", () => {
      expect(toParamValues({})).toEqual({});
    });
  });

  describe("given parameters", () => {
    it("does not change them", () => {
      const values = { marker: 20, bounds: undefined };

      toParamValues(values);

      expect(values).toEqual({ marker: 20, bounds: undefined });
      expect(values).toHaveProperty("bounds");
    });
  });
});

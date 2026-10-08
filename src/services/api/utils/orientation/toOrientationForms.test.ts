import { describe, expect, it } from "vitest";

import { toOrientationForms } from "./toOrientationForms";

describe("toOrientationForms()", () => {
  describe("given two forms", () => {
    it("returns both", () => {
      expect(
        toOrientationForms("Zielony postępowiec", "Zielona postępowczyni"),
      ).toEqual({
        masculine: "Zielony postępowiec",
        feminine: "Zielona postępowczyni",
      });
    });
  });

  describe("given one form", () => {
    it("returns it as the only form", () => {
      expect(toOrientationForms("Rodzic")).toEqual({ masculine: "Rodzic" });
      expect(toOrientationForms(undefined, "Rodzic")).toEqual({
        feminine: "Rodzic",
      });
    });
  });

  describe("given no form", () => {
    it("returns undefined", () => {
      expect(toOrientationForms()).toBeUndefined();
      expect(toOrientationForms("", "")).toBeUndefined();
    });
  });
});

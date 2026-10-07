import { describe, expect, it } from "vitest";

import type { DeclaredGender } from "@/types/orientation";

import { chooseOrientationForm } from "./chooseOrientationForm";

const forms = {
  masculine: "Zielony postępowiec",
  feminine: "Zielona postępowczyni",
};

describe("chooseOrientationForm()", () => {
  describe("given two forms", () => {
    it("returns the feminine form for female", () => {
      expect(chooseOrientationForm(forms, "female")).toBe(forms.feminine);
    });

    it("returns the masculine form for male", () => {
      expect(chooseOrientationForm(forms, "male")).toBe(forms.masculine);
    });

    it.each([
      "other",
      "prefer_not_to_share",
      undefined,
    ] as const)("returns the masculine form for %s", (gender) => {
      expect(chooseOrientationForm(forms, gender)).toBe(forms.masculine);
    });

    it("returns the masculine form for a gender it does not know", () => {
      expect(
        chooseOrientationForm(forms, "FEMALE" as unknown as DeclaredGender),
      ).toBe(forms.masculine);
    });
  });

  describe("given one form", () => {
    it.each([
      "female",
      "male",
      "other",
      "prefer_not_to_share",
      undefined,
    ] as const)("returns it for %s", (gender) => {
      expect(chooseOrientationForm({ masculine: "Rodzic" }, gender)).toBe(
        "Rodzic",
      );
      expect(chooseOrientationForm({ feminine: "Rodzic" }, gender)).toBe(
        "Rodzic",
      );
    });

    it("treats an empty form as missing", () => {
      expect(
        chooseOrientationForm({ masculine: "Rodzic", feminine: "" }, "female"),
      ).toBe("Rodzic");
      expect(
        chooseOrientationForm({ masculine: "", feminine: "Rodzic" }, "male"),
      ).toBe("Rodzic");
    });
  });

  describe("given no forms", () => {
    it("returns undefined", () => {
      expect(chooseOrientationForm()).toBeUndefined();
      expect(chooseOrientationForm(undefined, "female")).toBeUndefined();
      expect(chooseOrientationForm({}, "female")).toBeUndefined();
      expect(
        chooseOrientationForm({ masculine: "", feminine: "" }),
      ).toBeUndefined();
    });
  });
});

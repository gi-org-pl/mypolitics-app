import { describe, expect, it } from "vitest";

import type { DemographicsOption } from "../../SurveyDemographics.types";
import { getSelectedOption } from "./getSelectedOption";

const options: DemographicsOption[] = [
  { value: "male", label: "Mężczyzna" },
  { value: "female", label: "Kobieta" },
];

describe("getSelectedOption()", () => {
  describe("given a value present in the options", () => {
    it("returns that option", () => {
      expect(getSelectedOption(options, "female")).toEqual({
        value: "female",
        label: "Kobieta",
      });
    });
  });

  describe("given a value absent from the options", () => {
    it("returns nothing", () => {
      expect(getSelectedOption(options, "other")).toBeUndefined();
    });
  });

  describe("given no value", () => {
    it("returns nothing", () => {
      expect(getSelectedOption(options)).toBeUndefined();
      expect(getSelectedOption(options, undefined)).toBeUndefined();
    });
  });

  describe("given an empty option list", () => {
    it("returns nothing", () => {
      expect(getSelectedOption([], "female")).toBeUndefined();
    });
  });

  describe("given two options with the same value", () => {
    it("returns the first", () => {
      expect(
        getSelectedOption(
          [
            { value: "same", label: "Pierwsza" },
            { value: "same", label: "Druga" },
          ],
          "same",
        ),
      ).toEqual({ value: "same", label: "Pierwsza" });
    });
  });
});

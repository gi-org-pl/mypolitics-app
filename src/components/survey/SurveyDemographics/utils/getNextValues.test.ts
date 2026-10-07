import { describe, expect, it } from "vitest";

import type { DemographicsValues } from "../SurveyDemographics.types";
import { getNextValues } from "./getNextValues";

describe("getNextValues()", () => {
  describe("given no values", () => {
    it("returns only the chosen one", () => {
      expect(getNextValues({}, "gender", "female")).toStrictEqual({
        gender: "female",
      });
    });
  });

  describe("given values of other fields", () => {
    it("keeps them and adds the chosen one", () => {
      expect(
        getNextValues(
          { age: "18_24", education: "higher" },
          "gender",
          "female",
        ),
      ).toStrictEqual({
        age: "18_24",
        gender: "female",
        education: "higher",
      });
    });
  });

  describe("given a value of the same field", () => {
    it("replaces it", () => {
      expect(
        getNextValues({ age: "18_24", gender: "male" }, "gender", "female"),
      ).toStrictEqual({ age: "18_24", gender: "female" });
    });
  });

  describe("given a key that is not one of the four fields", () => {
    it("leaves it out", () => {
      const values = {
        age: "18_24",
        region: "mazowieckie",
      } as DemographicsValues;

      expect(getNextValues(values, "gender", "female")).toStrictEqual({
        age: "18_24",
        gender: "female",
      });
    });
  });

  describe("given a value that matches no option of its field", () => {
    it("keeps it untouched", () => {
      expect(
        getNextValues({ gender: "village" }, "age", "18_24"),
      ).toStrictEqual({ age: "18_24", gender: "village" });
    });
  });

  describe("given a value that is not text", () => {
    it("leaves it out", () => {
      const values = {
        age: undefined,
        education: null,
      } as unknown as DemographicsValues;

      expect(getNextValues(values, "gender", "female")).toStrictEqual({
        gender: "female",
      });
    });
  });

  describe("given any values", () => {
    it("does not change the object it was given", () => {
      const values: DemographicsValues = { age: "18_24" };

      getNextValues(values, "gender", "female");

      expect(values).toStrictEqual({ age: "18_24" });
    });
  });
});

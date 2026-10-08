import { describe, expect, it } from "vitest";

import { getValidDemographics } from "./getValidDemographics";

describe("getValidDemographics()", () => {
  describe("given values of the lists", () => {
    it("keeps all four fields", () => {
      const values = {
        age: "42",
        gender: "prefer_not_to_share",
        residenceAreaSize: "city_below_200k",
        education: "basic_vocational",
      };

      expect(getValidDemographics(values)).toEqual(values);
    });

    it("keeps the fields that are picked and leaves the others out", () => {
      const validValues = getValidDemographics({ age: "13", gender: "other" });

      expect(validValues).toEqual({ age: "13", gender: "other" });
      expect(Object.keys(validValues)).toEqual(["age", "gender"]);
    });

    it("keeps the youngest and the oldest age of the list", () => {
      expect(getValidDemographics({ age: "13" })).toEqual({ age: "13" });
      expect(getValidDemographics({ age: "99" })).toEqual({ age: "99" });
    });
  });

  describe("given values that are not in their list", () => {
    it("leaves the field empty", () => {
      expect(
        getValidDemographics({
          age: "12",
          gender: "Kobieta",
          residenceAreaSize: "city",
          education: "",
        }),
      ).toEqual({});
    });

    it("keeps the other fields", () => {
      expect(
        getValidDemographics({
          age: "100",
          gender: "female",
          residenceAreaSize: "village",
          education: "higher",
        }),
      ).toEqual({
        gender: "female",
        residenceAreaSize: "village",
        education: "higher",
      });
    });

    it("does not take a value of another field's list", () => {
      expect(
        getValidDemographics({ gender: "village", education: "female" }),
      ).toEqual({});
    });

    it("drops an age that is not written as the list writes it", () => {
      expect(getValidDemographics({ age: 42 })).toEqual({});
      expect(getValidDemographics({ age: " 42" })).toEqual({});
      expect(getValidDemographics({ age: "042" })).toEqual({});
      expect(getValidDemographics({ age: "18_24" })).toEqual({});
    });

    it("drops anything that is not text", () => {
      expect(
        getValidDemographics({
          age: null,
          gender: undefined,
          residenceAreaSize: ["village"],
          education: { value: "higher" },
        }),
      ).toEqual({});
    });
  });

  describe("given fields the card does not have", () => {
    it("leaves them out", () => {
      expect(
        getValidDemographics({ region: "mazowieckie", age: "30" }),
      ).toEqual({ age: "30" });
    });
  });

  describe("given nothing", () => {
    it("returns no values", () => {
      expect(getValidDemographics({})).toEqual({});
    });
  });
});

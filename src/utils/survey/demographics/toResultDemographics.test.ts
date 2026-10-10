import { describe, expect, it } from "vitest";

import type { DemographicsValues } from "@/types/survey";

import { toResultDemographics } from "./toResultDemographics";

const COMPLETE: DemographicsValues = {
  age: "42",
  gender: "female",
  residenceAreaSize: "city_over_500k",
  education: "higher",
};

describe("toResultDemographics()", () => {
  describe("given all four fields picked", () => {
    it("returns them as the API takes them, with the age as a number", () => {
      expect(toResultDemographics(COMPLETE)).toEqual({
        gender: "female",
        age: 42,
        residenceAreaSize: "city_over_500k",
        education: "higher",
      });
    });

    it("sends the youngest and the oldest age of the list as they are", () => {
      expect(toResultDemographics({ ...COMPLETE, age: "13" })?.age).toBe(13);
      expect(toResultDemographics({ ...COMPLETE, age: "99" })?.age).toBe(99);
    });

    it("counts a declined gender as picked", () => {
      expect(
        toResultDemographics({ ...COMPLETE, gender: "prefer_not_to_share" })
          ?.gender,
      ).toBe("prefer_not_to_share");
    });
  });

  describe("given fewer than four fields", () => {
    it("returns nothing when a field is missing", () => {
      expect(
        toResultDemographics({ ...COMPLETE, age: undefined }),
      ).toBeUndefined();
      expect(
        toResultDemographics({ ...COMPLETE, gender: undefined }),
      ).toBeUndefined();
      expect(
        toResultDemographics({ ...COMPLETE, residenceAreaSize: undefined }),
      ).toBeUndefined();
      expect(
        toResultDemographics({ ...COMPLETE, education: undefined }),
      ).toBeUndefined();
    });

    it("returns nothing when nothing is picked", () => {
      expect(toResultDemographics({})).toBeUndefined();
    });
  });

  describe("given a value that is not in its list", () => {
    it("returns nothing, so that nothing the API refuses is sent", () => {
      expect(toResultDemographics({ ...COMPLETE, age: "12" })).toBeUndefined();
      expect(toResultDemographics({ ...COMPLETE, age: "120" })).toBeUndefined();
      expect(toResultDemographics({ ...COMPLETE, age: "" })).toBeUndefined();
      expect(
        toResultDemographics({ ...COMPLETE, gender: "Kobieta" }),
      ).toBeUndefined();
      expect(
        toResultDemographics({ ...COMPLETE, residenceAreaSize: "city" }),
      ).toBeUndefined();
      expect(
        toResultDemographics({ ...COMPLETE, education: "female" }),
      ).toBeUndefined();
    });
  });
});

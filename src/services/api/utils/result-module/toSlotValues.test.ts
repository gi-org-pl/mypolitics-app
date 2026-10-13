import { describe, expect, it } from "vitest";

import { toSlotValues } from "./toSlotValues";

const toUpperCase = (value?: string): string | undefined =>
  value?.toUpperCase();

describe("toSlotValues()", () => {
  describe("given values in the slots listed", () => {
    it("reads each with the reader it was given", () => {
      expect(
        toSlotValues(
          { link: "strona", centre: "centrum" },
          ["link", "centre"],
          toUpperCase,
        ),
      ).toEqual({ link: "STRONA", centre: "CENTRUM" });
    });
  });

  describe("given a value in a slot that is not listed", () => {
    it("leaves it out", () => {
      expect(
        toSlotValues(
          { link: "strona", centre: "centrum" },
          ["link"],
          toUpperCase,
        ),
      ).toEqual({ link: "STRONA" });
    });
  });

  describe("given a listed slot with no value", () => {
    it("leaves it out", () => {
      expect(
        toSlotValues({ link: undefined }, ["link", "centre"], toUpperCase),
      ).toEqual({});
      expect(toSlotValues({}, ["link"], toUpperCase)).toEqual({});
    });
  });

  describe("given a value the reader does not accept", () => {
    it("leaves it out and keeps the others", () => {
      expect(
        toSlotValues(
          { link: "strona", centre: "centrum" },
          ["link", "centre"],
          (value) => (value === "strona" ? undefined : value),
        ),
      ).toEqual({ centre: "centrum" });
    });
  });

  describe("given no slots", () => {
    it("returns nothing", () => {
      expect(toSlotValues({ link: "strona" }, [], toUpperCase)).toEqual({});
    });
  });
});

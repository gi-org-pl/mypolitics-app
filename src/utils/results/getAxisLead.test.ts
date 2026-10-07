import { describe, expect, it } from "vitest";

import { getAxisLead } from "./getAxisLead";

describe("getAxisLead()", () => {
  describe("given one higher value", () => {
    it("returns that side", () => {
      expect(getAxisLead(69, 31)).toBe("start");
      expect(getAxisLead(31, 69)).toBe("end");
    });

    it("returns that side for a narrow lead", () => {
      expect(getAxisLead(51, 49)).toBe("start");
      expect(getAxisLead(49, 51)).toBe("end");
    });

    it("returns that side when the values do not reach 100 together", () => {
      expect(getAxisLead(47, 31)).toBe("start");
    });

    it("returns that side when the values exceed 100 together", () => {
      expect(getAxisLead(80, 90)).toBe("end");
    });
  });

  describe("given values that round to the same number", () => {
    it("returns null", () => {
      expect(getAxisLead(50, 50)).toBeNull();
      expect(getAxisLead(50.4, 49.6)).toBeNull();
      expect(getAxisLead(49.5, 50.49)).toBeNull();
    });
  });

  describe("given values that round to different numbers", () => {
    it("returns the side with the higher rounded value", () => {
      expect(getAxisLead(50.5, 49.4)).toBe("start");
      expect(getAxisLead(49.4, 50.4)).toBe("end");
    });
  });

  describe("given both values at zero", () => {
    it("returns null", () => {
      expect(getAxisLead(0, 0)).toBeNull();
    });
  });

  describe("given one absent value", () => {
    it("returns the other side when it is above zero", () => {
      expect(getAxisLead(40)).toBe("start");
      expect(getAxisLead(undefined, 40)).toBe("end");
    });

    it("returns null when the other side is zero", () => {
      expect(getAxisLead(0)).toBeNull();
      expect(getAxisLead(undefined, 0)).toBeNull();
    });

    it("returns null when the other side rounds to zero", () => {
      expect(getAxisLead(0.4)).toBeNull();
      expect(getAxisLead(undefined, 0.4)).toBeNull();
    });
  });

  describe("given both values absent", () => {
    it("returns null", () => {
      expect(getAxisLead()).toBeNull();
      expect(getAxisLead(undefined, undefined)).toBeNull();
    });
  });

  describe("given values outside 0-100", () => {
    it("compares the clamped values", () => {
      expect(getAxisLead(140, 100)).toBeNull();
      expect(getAxisLead(-20, 0)).toBeNull();
      expect(getAxisLead(140, 99)).toBe("start");
      expect(getAxisLead(-20, 1)).toBe("end");
      expect(getAxisLead(Number.POSITIVE_INFINITY, 100)).toBeNull();
    });

    it("returns null for a lone value below zero", () => {
      expect(getAxisLead(-20)).toBeNull();
    });
  });

  describe("given a value that is not a number", () => {
    it.each([
      Number.NaN,
      "69" as unknown as number,
      null as unknown as number,
    ])("treats %j as absent", (value) => {
      expect(getAxisLead(value, 40)).toBe("end");
      expect(getAxisLead(40, value)).toBe("start");
      expect(getAxisLead(value, 0)).toBeNull();
      expect(getAxisLead(value, value)).toBeNull();
    });
  });
});

import { describe, expect, it } from "vitest";

import { Agreement } from "@/types/comparison";

import { getAgreementShare } from "./getAgreementShare";

const { Agree, Disagree, Neither } = Agreement;

describe("getAgreementShare()", () => {
  describe("given questions that agree and disagree", () => {
    it("returns the share of the agreeing ones, times 100", () => {
      expect(getAgreementShare([Agree, Disagree, Agree, Agree])).toBe(75);
      expect(getAgreementShare([Agree, Agree])).toBe(100);
      expect(getAgreementShare([Disagree])).toBe(0);
    });

    it("rounds to a whole number", () => {
      expect(getAgreementShare([Agree, Disagree, Disagree])).toBe(33);
      expect(getAgreementShare([Agree, Agree, Disagree])).toBe(67);
      expect(
        getAgreementShare([Agree, Disagree, ...Array(7).fill(Agree)]),
      ).toBe(89);
    });
  });

  describe("given questions that are neither", () => {
    it("does not count them", () => {
      expect(getAgreementShare([Agree, Neither, Disagree, Neither])).toBe(50);
    });
  });

  describe("given no question that agrees or disagrees", () => {
    it("returns no share", () => {
      expect(getAgreementShare([])).toBeUndefined();
      expect(getAgreementShare([Neither, Neither])).toBeUndefined();
    });
  });
});

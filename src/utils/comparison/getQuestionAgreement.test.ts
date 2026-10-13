import { describe, expect, it } from "vitest";

import { Agreement } from "@/types/comparison";

import { getQuestionAgreement } from "./getQuestionAgreement";

const a1 = { id: "a1" };
const a2 = { id: "a2" };
const a3 = { id: "a3" };

describe("getQuestionAgreement()", () => {
  describe("given a friend, who has the one answer they chose", () => {
    it("agrees when both chose the same answer", () => {
      expect(getQuestionAgreement(a1, [a1])).toBe(Agreement.Agree);
    });

    it("disagrees when both answered, differently", () => {
      expect(getQuestionAgreement(a1, [a2])).toBe(Agreement.Disagree);
    });

    it("is neither when one of them did not answer", () => {
      expect(getQuestionAgreement(undefined, [a1])).toBe(Agreement.Neither);
      expect(getQuestionAgreement(a1, [])).toBe(Agreement.Neither);
      expect(getQuestionAgreement(undefined, [])).toBe(Agreement.Neither);
    });
  });

  describe("given an orientation, which has every answer that lists it", () => {
    it("agrees when the answer of the taker lists the orientation", () => {
      expect(getQuestionAgreement(a3, [a1, a3])).toBe(Agreement.Agree);
    });

    it("disagrees when the taker answered, some answer lists the orientation, and the one of the taker does not", () => {
      expect(getQuestionAgreement(a2, [a1, a3])).toBe(Agreement.Disagree);
    });

    it("is neither when the taker did not answer", () => {
      expect(getQuestionAgreement(undefined, [a1, a3])).toBe(Agreement.Neither);
    });

    it("is neither when no answer of the question lists the orientation", () => {
      expect(getQuestionAgreement(a2, [])).toBe(Agreement.Neither);
    });
  });
});

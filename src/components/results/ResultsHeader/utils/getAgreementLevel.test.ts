import { describe, expect, it } from "vitest";
import {
  AGREEMENT_HIGH_THRESHOLD,
  AGREEMENT_LOW_THRESHOLD,
} from "../ResultsHeader.constants";
import { getAgreementLevel } from "./getAgreementLevel";

describe("getAgreementLevel()", () => {
  it('returns "high" above the high threshold', () => {
    expect(getAgreementLevel(AGREEMENT_HIGH_THRESHOLD + 1)).toBe("high");
  });

  it('returns "mid" between the thresholds', () => {
    expect(getAgreementLevel(51)).toBe("mid");
  });

  it('returns "low" below the low threshold', () => {
    expect(getAgreementLevel(AGREEMENT_LOW_THRESHOLD - 1)).toBe("low");
  });

  it("handles the boundary values", () => {
    expect(getAgreementLevel(AGREEMENT_HIGH_THRESHOLD)).toBe("high");
    expect(getAgreementLevel(AGREEMENT_LOW_THRESHOLD)).toBe("mid");
  });
});

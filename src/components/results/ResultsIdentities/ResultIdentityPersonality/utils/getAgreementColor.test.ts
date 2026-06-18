import { describe, expect, it } from "vitest";
import { getAgreementColor } from "./getAgreementColor";

describe("getAgreementColor", () => {
  it("returns 'text-gi-red' for low percents (< 33)", () => {
    expect(getAgreementColor(0)).toBe("text-gi-red");
    expect(getAgreementColor(12)).toBe("text-gi-red");
    expect(getAgreementColor(32)).toBe("text-gi-red");
  });

  it("returns 'text-gi-orange' for medium percents (33 - 65)", () => {
    expect(getAgreementColor(33)).toBe("text-gi-orange");
    expect(getAgreementColor(54)).toBe("text-gi-orange");
    expect(getAgreementColor(65)).toBe("text-gi-orange");
  });

  it("returns 'text-gi-green' for high percents (>= 66)", () => {
    expect(getAgreementColor(66)).toBe("text-gi-green");
    expect(getAgreementColor(98)).toBe("text-gi-green");
    expect(getAgreementColor(100)).toBe("text-gi-green");
  });

  it("clamps values below 0 to 0 (red)", () => {
    expect(getAgreementColor(-10)).toBe("text-gi-red");
  });

  it("clamps values above 100 to 100 (green)", () => {
    expect(getAgreementColor(150)).toBe("text-gi-green");
  });
});

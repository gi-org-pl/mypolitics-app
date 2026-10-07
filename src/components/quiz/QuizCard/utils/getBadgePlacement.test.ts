import { describe, expect, it } from "vitest";

import { getBadgePlacement } from "./getBadgePlacement";

describe("getBadgePlacement()", () => {
  describe("given a card without an image", () => {
    it("places the badge at the top of the card", () => {
      expect(getBadgePlacement(false, false)).toBe("top");
    });

    it("ignores a request to hide the image that is not there", () => {
      expect(getBadgePlacement(false, true)).toBe("top");
    });
  });

  describe("given a card with an image at every width", () => {
    it("places the badge below the image", () => {
      expect(getBadgePlacement(true, false)).toBe("belowImage");
    });
  });

  describe("given a card whose image is hidden on a wide screen", () => {
    it("places the badge below the image on a narrow screen only", () => {
      expect(getBadgePlacement(true, true)).toBe("belowImageOnNarrowScreen");
    });
  });
});

import { describe, expect, it } from "vitest";

import { getHeaderResult } from "./getHeaderResult";

const orientation = {
  name: "Liberalizm",
  imageUrl: "https://example.org/liberalism.png",
};

describe("getHeaderResult()", () => {
  describe("given an orientation with a confidence of 80 or more", () => {
    it("returns the orientation in the match band", () => {
      expect(getHeaderResult(orientation, 86.6)).toEqual({
        name: "Liberalizm",
        imageUrl: "https://example.org/liberalism.png",
        confidence: 86.6,
        band: "match",
      });
    });
  });

  describe("given a confidence from 50 to below 80", () => {
    it("returns the orientation in the partial band, on the exact value", () => {
      expect(getHeaderResult(orientation, 50)?.band).toBe("partial");
      expect(getHeaderResult(orientation, 79.9)).toMatchObject({
        confidence: 79.9,
        band: "partial",
      });
    });
  });

  describe("given a confidence below 50", () => {
    it("returns null", () => {
      expect(getHeaderResult(orientation, 49.9)).toBeNull();
      expect(getHeaderResult(orientation, 0)).toBeNull();
    });
  });

  describe("given a confidence outside 0-100", () => {
    it("clamps it", () => {
      expect(getHeaderResult(orientation, 140)).toMatchObject({
        confidence: 100,
        band: "match",
      });
      expect(getHeaderResult(orientation, -5)).toBeNull();
    });
  });

  describe("given no orientation", () => {
    it("returns null", () => {
      expect(getHeaderResult(undefined, 90)).toBeNull();
    });
  });

  describe("given no confidence or one that is not a number", () => {
    it("returns null", () => {
      expect(getHeaderResult(orientation)).toBeNull();
      expect(getHeaderResult(orientation, Number.NaN)).toBeNull();
      expect(
        getHeaderResult(orientation, "90" as unknown as number),
      ).toBeNull();
    });
  });

  describe("given an orientation without a name", () => {
    it("returns the result with an empty name", () => {
      expect(getHeaderResult({}, 90)?.name).toBe("");
    });
  });

  describe("given an orientation without an image", () => {
    it("returns the result without an image", () => {
      expect(getHeaderResult({ name: "Liberalizm" }, 90)?.imageUrl).toBe(
        undefined,
      );
    });
  });
});

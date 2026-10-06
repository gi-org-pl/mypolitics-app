import { describe, expect, it } from "vitest";

import type { AxisOrientation } from "@/types/axis";

import { hasOrientationTitle } from "./hasOrientationTitle";

const orientation: AxisOrientation = {
  id: "radicalism",
  name: "Radykalizm",
  imageUrl: "https://example.com/radicalism.svg",
};

describe("hasOrientationTitle()", () => {
  describe("given a name and an image", () => {
    it("returns true", () => {
      expect(hasOrientationTitle(orientation)).toBe(true);
    });
  });

  describe("given a name without an image", () => {
    it("returns true", () => {
      expect(hasOrientationTitle({ ...orientation, imageUrl: undefined })).toBe(
        true,
      );
    });
  });

  describe("given an image without a name", () => {
    it.each([
      "",
      " \n ",
      undefined as unknown as string,
    ])("returns true for the name %j", (name) => {
      expect(hasOrientationTitle({ ...orientation, name })).toBe(true);
    });
  });

  describe("given neither a name nor an image", () => {
    it.each([undefined, ""])("returns false for the image %j", (imageUrl) => {
      expect(hasOrientationTitle({ id: "x", name: "  ", imageUrl })).toBe(
        false,
      );
    });
  });
});

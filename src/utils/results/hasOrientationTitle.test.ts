import { describe, expect, it } from "vitest";

import type { Orientation } from "@/types/orientation";

import { hasOrientationTitle } from "./hasOrientationTitle";

const orientation: Orientation = {
  id: "radicalism",
  type: "ideology",
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
    it.each(["", " \n ", undefined])("returns true for the name %j", (name) => {
      expect(hasOrientationTitle({ ...orientation, name })).toBe(true);
    });
  });

  describe("given neither a name nor an image", () => {
    it.each([undefined, ""])("returns false for the image %j", (imageUrl) => {
      expect(
        hasOrientationTitle({
          id: "x",
          type: "ideology",
          name: "  ",
          imageUrl,
        }),
      ).toBe(false);
    });
  });
});

import { describe, expect, it } from "vitest";

import { getIconMaskStyle } from "./getIconMaskStyle";

describe("getIconMaskStyle()", () => {
  describe("given the address of an icon file", () => {
    it("returns it as the mask image", () => {
      expect(getIconMaskStyle("/assets/reset.svg").maskImage).toBe(
        'url("/assets/reset.svg")',
      );
    });

    it("returns the same mask under the prefixed property", () => {
      const style = getIconMaskStyle("/assets/reset.svg");

      expect(style.WebkitMaskImage).toBe(style.maskImage);
    });
  });

  describe("given an icon inlined as a data address with single quotes", () => {
    it("keeps the address intact inside double quotes", () => {
      const iconUrl = "data:image/svg+xml,%3csvg%20width='24'%3e%3c/svg%3e";

      expect(getIconMaskStyle(iconUrl)).toEqual({
        maskImage: `url("${iconUrl}")`,
        WebkitMaskImage: `url("${iconUrl}")`,
      });
    });
  });
});

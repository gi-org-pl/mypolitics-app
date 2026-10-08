import { describe, expect, it } from "vitest";

import { createOrientation } from "@/utils/vitest/createOrientation";

import { toNamedOrientation } from "./toNamedOrientation";

describe("toNamedOrientation()", () => {
  describe("given an orientation that is shown and has a name", () => {
    it("returns it", () => {
      expect(
        toNamedOrientation(createOrientation("liberalism", "Liberalizm")),
      ).toMatchObject({ id: "liberalism", name: "Liberalizm" });
    });
  });

  describe("given a name and an image with two forms", () => {
    it("shows the masculine form of both", () => {
      const orientation = toNamedOrientation({
        id: "patriot",
        type: "identity",
        nameForms: { masculine: "Patriota", feminine: "Patriotka" },
        imageUrlForms: {
          masculine: "https://example.com/m.svg",
          feminine: "https://example.com/f.svg",
        },
      });

      expect(orientation).toEqual({
        id: "patriot",
        type: "identity",
        name: "Patriota",
        imageUrl: "https://example.com/m.svg",
      });
    });
  });

  describe("given a hidden orientation", () => {
    it("returns nothing", () => {
      expect(
        toNamedOrientation(
          createOrientation("liberalism", "Liberalizm", { isHidden: true }),
        ),
      ).toBeUndefined();
    });
  });

  describe("given an orientation without a name", () => {
    it("returns nothing", () => {
      expect(
        toNamedOrientation(createOrientation("liberalism")),
      ).toBeUndefined();
      expect(
        toNamedOrientation(createOrientation("liberalism", "   ")),
      ).toBeUndefined();
    });

    it("returns nothing even when it has an image", () => {
      expect(
        toNamedOrientation(
          createOrientation("liberalism", undefined, {
            imageUrl: "https://example.com/liberalism.svg",
          }),
        ),
      ).toBeUndefined();
    });
  });

  describe("given no orientation", () => {
    it("returns nothing", () => {
      expect(toNamedOrientation(undefined)).toBeUndefined();
    });
  });
});

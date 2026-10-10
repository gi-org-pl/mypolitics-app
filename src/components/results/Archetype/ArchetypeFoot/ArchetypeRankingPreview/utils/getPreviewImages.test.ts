import { describe, expect, it } from "vitest";

import { createOrientation } from "@/utils/vitest/createOrientation";

import type { ArchetypeEntry } from "../../../Archetype.types";
import { PREVIEW_IMAGES } from "../ArchetypeRankingPreview.constants";
import { getPreviewImages } from "./getPreviewImages";

const archetype = (id: string, imageUrl?: string): ArchetypeEntry => ({
  orientation: createOrientation(id, id, { imageUrl }),
});

describe("getPreviewImages()", () => {
  it("returns the images of the first archetypes, in the given order", () => {
    expect(
      getPreviewImages([archetype("a", "a.png"), archetype("b", "b.png")]),
    ).toEqual(["a.png", "b.png"]);
  });

  it("returns no more images than the preview holds", () => {
    const images = getPreviewImages(
      ["a", "b", "c", "d", "e"].map((id) => archetype(id, `${id}.png`)),
    );

    expect(PREVIEW_IMAGES).toBe(3);
    expect(images).toEqual(["a.png", "b.png", "c.png"]);
  });

  it("skips archetypes without an image and takes the next ones", () => {
    expect(
      getPreviewImages([
        archetype("a"),
        archetype("b", "b.png"),
        archetype("c", "   "),
        archetype("d", "d.png"),
        archetype("e", "e.png"),
        archetype("f", "f.png"),
      ]),
    ).toEqual(["b.png", "d.png", "e.png"]);
  });

  it("skips an archetype without an orientation or with a non-text image", () => {
    expect(
      getPreviewImages([
        { match: 30 } as unknown as ArchetypeEntry,
        archetype("b", 5 as unknown as string),
        archetype("c", " c.png "),
      ]),
    ).toEqual(["c.png"]);
  });

  it("returns no images for an empty ranking", () => {
    expect(getPreviewImages([])).toEqual([]);
  });

  describe("given addresses that failed to load", () => {
    const ranking = ["a", "b", "c", "d", "e"].map((id) =>
      archetype(id, `${id}.png`),
    );

    it("skips them before the preview is cut, so the next images take their place", () => {
      expect(getPreviewImages(ranking, ["b.png"])).toEqual([
        "a.png",
        "c.png",
        "d.png",
      ]);
      expect(getPreviewImages(ranking, ["a.png", "c.png"])).toEqual([
        "b.png",
        "d.png",
        "e.png",
      ]);
    });

    it("returns fewer images when not enough are left", () => {
      expect(getPreviewImages(ranking, ["a.png", "b.png", "d.png"])).toEqual([
        "c.png",
        "e.png",
      ]);
      expect(
        getPreviewImages(
          ranking,
          ranking.map(({ orientation }) => orientation.imageUrl as string),
        ),
      ).toEqual([]);
    });

    it("skips every entry that uses a failed address", () => {
      expect(
        getPreviewImages(
          [archetype("a", "same.png"), archetype("b", "same.png"), ...ranking],
          ["same.png"],
        ),
      ).toEqual(["a.png", "b.png", "c.png"]);
    });

    it("compares the address as it is drawn, without the surrounding whitespace", () => {
      expect(
        getPreviewImages(
          [archetype("a", " a.png "), archetype("b", "b.png")],
          ["a.png"],
        ),
      ).toEqual(["b.png"]);
    });

    it("ignores a failed address the ranking does not have", () => {
      expect(getPreviewImages(ranking, ["z.png"])).toEqual([
        "a.png",
        "b.png",
        "c.png",
      ]);
    });
  });
});

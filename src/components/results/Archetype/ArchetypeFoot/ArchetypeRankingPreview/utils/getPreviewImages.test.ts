import { describe, expect, it } from "vitest";

import type { ArchetypeEntry } from "../../../Archetype.types";
import { PREVIEW_IMAGES } from "../ArchetypeRankingPreview.constants";
import { getPreviewImages } from "./getPreviewImages";

const archetype = (id: string, imageUrl?: string): ArchetypeEntry => ({
  orientation: { id, name: id, imageUrl },
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
});

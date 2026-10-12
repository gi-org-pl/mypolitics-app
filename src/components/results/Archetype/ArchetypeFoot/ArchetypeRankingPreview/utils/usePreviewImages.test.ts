import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { createOrientation } from "@/utils/vitest/createOrientation";

import type { ArchetypeEntry } from "../../../Archetype.types";
import { usePreviewImages } from "./usePreviewImages";

const archetype = (id: string, imageUrl?: string): ArchetypeEntry => ({
  orientation: createOrientation(id, id, { imageUrl }),
});

const ranking = ["a", "b", "c", "d", "e"].map((id) =>
  archetype(id, `${id}.png`),
);

describe("usePreviewImages()", () => {
  describe("given a ranking", () => {
    it("returns the images of the preview", () => {
      const { result } = renderHook(() => usePreviewImages(ranking));

      expect(result.current.images).toEqual(["a.png", "b.png", "c.png"]);
    });

    it("skips archetypes without an image", () => {
      const { result } = renderHook(() =>
        usePreviewImages([archetype("x"), ...ranking]),
      );

      expect(result.current.images).toEqual(["a.png", "b.png", "c.png"]);
    });
  });

  describe("when an image is marked as failed", () => {
    it("fills its place with the next image of the ranking", () => {
      const { result } = renderHook(() => usePreviewImages(ranking));

      act(() => result.current.markFailed("b.png"));

      expect(result.current.images).toEqual(["a.png", "c.png", "d.png"]);
    });

    it("remembers every failure", () => {
      const { result } = renderHook(() => usePreviewImages(ranking));

      act(() => result.current.markFailed("b.png"));
      act(() => result.current.markFailed("d.png"));
      act(() => result.current.markFailed("a.png"));

      expect(result.current.images).toEqual(["c.png", "e.png"]);
    });

    it("counts two failures reported at once", () => {
      const { result } = renderHook(() => usePreviewImages(ranking));

      act(() => {
        result.current.markFailed("a.png");
        result.current.markFailed("b.png");
      });

      expect(result.current.images).toEqual(["c.png", "d.png", "e.png"]);
    });
  });

  describe("when the ranking changes", () => {
    it("keeps the failure of an address that is still there", () => {
      const { result, rerender } = renderHook(
        ({ entries }) => usePreviewImages(entries),
        { initialProps: { entries: ranking } },
      );

      act(() => result.current.markFailed("b.png"));
      rerender({ entries: ranking.slice(1) });

      expect(result.current.images).toEqual(["c.png", "d.png", "e.png"]);
    });
  });
});

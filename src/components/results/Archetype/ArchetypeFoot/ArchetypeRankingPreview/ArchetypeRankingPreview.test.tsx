import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { createOrientation } from "@/utils/vitest/createOrientation";

import type { ArchetypeEntry } from "../../Archetype.types";
import { ArchetypeRankingPreview } from "./ArchetypeRankingPreview";

const archetype = (id: string, imageUrl?: string): ArchetypeEntry => ({
  orientation: createOrientation(id, id, { imageUrl }),
});

const getSources = (): (string | null | undefined)[] =>
  screen
    .getAllByTestId("archetype-ranking-preview-image")
    .map((image) => image.querySelector("img")?.getAttribute("src"));

describe("<ArchetypeRankingPreview />", () => {
  describe("given a ranking longer than the preview", () => {
    it("renders the first three images and a sign that there are more", () => {
      render(
        <ArchetypeRankingPreview
          ranking={["a", "b", "c", "d", "e"].map((id) =>
            archetype(id, `${id}.png`),
          )}
        />,
      );

      expect(getSources()).toEqual(["a.png", "b.png", "c.png"]);
      expect(
        screen.getByTestId("archetype-ranking-preview-more"),
      ).toBeVisible();
    });

    it("renders the images as decoration", () => {
      render(
        <ArchetypeRankingPreview
          ranking={[archetype("a", "a.png"), archetype("b", "b.png")]}
        />,
      );

      expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });
  });

  describe("given a ranking that fits in the preview", () => {
    it("renders every image and no sign that there are more", () => {
      render(
        <ArchetypeRankingPreview
          ranking={[archetype("a", "a.png"), archetype("b", "b.png")]}
        />,
      );

      expect(getSources()).toEqual(["a.png", "b.png"]);
      expect(
        screen.queryByTestId("archetype-ranking-preview-more"),
      ).not.toBeInTheDocument();
    });
  });

  describe("given an archetype without an image", () => {
    it("leaves it out and says there are more", () => {
      render(
        <ArchetypeRankingPreview
          ranking={[archetype("a"), archetype("b", "b.png")]}
        />,
      );

      expect(getSources()).toEqual(["b.png"]);
      expect(
        screen.getByTestId("archetype-ranking-preview-more"),
      ).toBeVisible();
    });
  });

  describe("given two archetypes with the same image", () => {
    it("renders both", () => {
      const errors = vi.spyOn(console, "error").mockImplementation(() => {});

      render(
        <ArchetypeRankingPreview
          ranking={[archetype("a", "same.png"), archetype("b", "same.png")]}
        />,
      );

      expect(getSources()).toEqual(["same.png", "same.png"]);
      expect(errors).not.toHaveBeenCalled();

      errors.mockRestore();
    });
  });

  describe("given no archetype with an image", () => {
    it("renders nothing", () => {
      const { container } = render(
        <ArchetypeRankingPreview ranking={[archetype("a"), archetype("b")]} />,
      );

      expect(container).toBeEmptyDOMElement();
    });
  });

  describe("given an empty ranking", () => {
    it("renders nothing", () => {
      const { container } = render(<ArchetypeRankingPreview ranking={[]} />);

      expect(container).toBeEmptyDOMElement();
    });
  });
});

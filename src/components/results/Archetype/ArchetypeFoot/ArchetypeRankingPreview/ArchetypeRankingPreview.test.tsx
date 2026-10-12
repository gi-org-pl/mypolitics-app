import { fireEvent, render, screen } from "@testing-library/react";
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

  describe("given an image that fails to load", () => {
    const failImage = (source: string) =>
      fireEvent.error(
        screen
          .getAllByTestId("archetype-ranking-preview-image")
          .map((image) => image.querySelector("img"))
          .find(
            (image) => image?.getAttribute("src") === source,
          ) as HTMLImageElement,
      );

    describe("when the ranking fits in the preview", () => {
      it("leaves that entry out of the row and says there are more, as for an entry without an image", () => {
        render(
          <ArchetypeRankingPreview
            ranking={[archetype("a", "a.png"), archetype("b", "b.png")]}
          />,
        );

        failImage("a.png");

        expect(getSources()).toEqual(["b.png"]);
        expect(
          screen.getByTestId("archetype-ranking-preview-more"),
        ).toBeVisible();
      });

      it("draws no placeholder in its place", () => {
        render(
          <ArchetypeRankingPreview
            ranking={[archetype("a", "a.png"), archetype("b", "b.png")]}
          />,
        );

        failImage("a.png");

        expect(
          screen
            .getByTestId("archetype-ranking-preview")
            .querySelector("[aria-hidden=true]"),
        ).toBeNull();
      });
    });

    describe("when the ranking has more images than the preview", () => {
      const ranking = ["a", "b", "c", "d", "e"].map((id) =>
        archetype(id, `${id}.png`),
      );

      it("fills the place with the next image of the ranking", () => {
        render(<ArchetypeRankingPreview ranking={ranking} />);

        failImage("b.png");

        expect(getSources()).toEqual(["a.png", "c.png", "d.png"]);
        expect(
          screen.getByTestId("archetype-ranking-preview-more"),
        ).toBeVisible();
      });

      it("goes on to the next one when the image that filled the place fails too", () => {
        render(<ArchetypeRankingPreview ranking={ranking} />);

        failImage("b.png");
        failImage("d.png");

        expect(getSources()).toEqual(["a.png", "c.png", "e.png"]);

        failImage("e.png");

        expect(getSources()).toEqual(["a.png", "c.png"]);
      });
    });

    describe("when every image fails", () => {
      it("renders nothing", () => {
        const { container } = render(
          <ArchetypeRankingPreview
            ranking={[archetype("a", "a.png"), archetype("b", "b.png")]}
          />,
        );

        failImage("a.png");
        failImage("b.png");

        expect(container).toBeEmptyDOMElement();
      });
    });

    describe("when two archetypes share the failed image", () => {
      it("leaves both out", () => {
        render(
          <ArchetypeRankingPreview
            ranking={[
              archetype("a", "same.png"),
              archetype("b", "same.png"),
              archetype("c", "c.png"),
            ]}
          />,
        );

        failImage("same.png");

        expect(getSources()).toEqual(["c.png"]);
      });
    });
  });
});

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { QuizCardViewInput } from "../QuizCard.types";
import { useQuizCardView } from "./useQuizCardView";

const renderView = (input: Partial<QuizCardViewInput> = {}) =>
  renderHook(() =>
    useQuizCardView({
      description: "Poznaj najbliższą ideologię.",
      tags: ["15 min"],
      ...input,
    }),
  );

describe("useQuizCardView()", () => {
  describe("given a plain card", () => {
    it("starts collapsed", () => {
      const { result } = renderView();

      expect(result.current.isOpen).toBe(false);
    });

    it("can be collapsed and expanded", () => {
      const { result } = renderView();

      expect(result.current.isCollapsible).toBe(true);
    });

    it("gives the body an id for the toggle to point at", () => {
      const { result } = renderView();

      expect(result.current.bodyId).not.toBe("");
    });

    it("keeps the same id between renders", () => {
      const { result, rerender } = renderView();
      const { bodyId } = result.current;

      rerender();

      expect(result.current.bodyId).toBe(bodyId);
    });

    it("gives two cards different ids", () => {
      const first = renderView();
      const second = renderView();

      expect(first.result.current.bodyId).not.toBe(
        second.result.current.bodyId,
      );
    });
  });

  describe("when the card is toggled", () => {
    it("opens", () => {
      const { result } = renderView();

      act(() => result.current.toggle());

      expect(result.current.isOpen).toBe(true);
    });

    it("stays collapsible", () => {
      const { result } = renderView();

      act(() => result.current.toggle());

      expect(result.current.isCollapsible).toBe(true);
    });
  });

  describe("when the card is toggled twice", () => {
    it("collapses again", () => {
      const { result } = renderView();

      act(() => result.current.toggle());
      act(() => result.current.toggle());

      expect(result.current.isOpen).toBe(false);
    });
  });

  describe("given isAlwaysExpanded", () => {
    it("is open and cannot be collapsed", () => {
      const { result } = renderView({ isAlwaysExpanded: true });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.isCollapsible).toBe(false);
    });
  });

  describe("given isHighlighted", () => {
    it("is open and cannot be collapsed", () => {
      const { result } = renderView({ isHighlighted: true });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.isCollapsible).toBe(false);
    });
  });

  describe("given no backgroundUrl", () => {
    it("is open on a wide screen", () => {
      const { result } = renderView();

      expect(result.current.isOpenOnWideScreen).toBe(true);
      expect(result.current.imageUrl).toBeUndefined();
    });
  });

  describe("given a backgroundUrl", () => {
    it("keeps its toggle and its state on a wide screen", () => {
      const { result } = renderView({ backgroundUrl: "/assets/lata-90.png" });

      expect(result.current.isOpenOnWideScreen).toBe(false);
      expect(result.current.imageUrl).toBe("/assets/lata-90.png");
    });

    it("places the badge below the image", () => {
      const { result } = renderView({ backgroundUrl: "/assets/lata-90.png" });

      expect(result.current.badgePlacement).toBe("belowImage");
    });

    it("still starts collapsed and can be toggled", () => {
      const { result } = renderView({ backgroundUrl: "/assets/lata-90.png" });

      expect(result.current.isOpen).toBe(false);
      expect(result.current.isCollapsible).toBe(true);
    });
  });

  describe("given a backgroundUrl and isImageHiddenOnWide", () => {
    it("is open on a wide screen, like a card without an image", () => {
      const { result } = renderView({
        backgroundUrl: "/assets/lata-90.png",
        isImageHiddenOnWide: true,
      });

      expect(result.current.isOpenOnWideScreen).toBe(true);
      expect(result.current.imageUrl).toBe("/assets/lata-90.png");
    });

    it("still starts collapsed and can be toggled", () => {
      const { result } = renderView({
        backgroundUrl: "/assets/lata-90.png",
        isImageHiddenOnWide: true,
      });

      expect(result.current.isOpen).toBe(false);
      expect(result.current.isCollapsible).toBe(true);
    });

    it("places the badge below the image on a narrow screen only", () => {
      const { result } = renderView({
        backgroundUrl: "/assets/lata-90.png",
        isImageHiddenOnWide: true,
      });

      expect(result.current.badgePlacement).toBe("belowImageOnNarrowScreen");
    });
  });

  describe("given isImageHiddenOnWide but no backgroundUrl", () => {
    it("changes nothing: the badge stays at the top and the card is open on a wide screen", () => {
      const { result } = renderView({ isImageHiddenOnWide: true });

      expect(result.current.badgePlacement).toBe("top");
      expect(result.current.isOpenOnWideScreen).toBe(true);
    });
  });

  describe("given a backgroundUrl of whitespace only", () => {
    it("treats the image as absent", () => {
      const { result } = renderView({ backgroundUrl: "   " });

      expect(result.current.imageUrl).toBeUndefined();
      expect(result.current.isOpenOnWideScreen).toBe(true);
    });
  });

  describe("given a logoUrl", () => {
    it("returns it trimmed", () => {
      const { result } = renderView({ logoUrl: " /assets/logo.svg " });

      expect(result.current.logoUrl).toBe("/assets/logo.svg");
    });

    it("treats a logoUrl of whitespace only as absent", () => {
      const { result } = renderView({ logoUrl: " " });

      expect(result.current.logoUrl).toBeUndefined();
    });
  });

  describe("given a cta", () => {
    it("returns it trimmed as the badge", () => {
      const { result } = renderView({ cta: " Nowy Quiz Tożsamościowy! " });

      expect(result.current.badge).toBe("Nowy Quiz Tożsamościowy!");
    });
  });

  describe("given an empty cta", () => {
    it("returns no badge", () => {
      expect(renderView({ cta: "" }).result.current.badge).toBeUndefined();
      expect(renderView({ cta: "  " }).result.current.badge).toBeUndefined();
      expect(renderView().result.current.badge).toBeUndefined();
    });
  });

  describe("given a description as text", () => {
    it("returns it trimmed", () => {
      const { result } = renderView({ description: " Poznaj ideologię. " });

      expect(result.current.description).toBe("Poznaj ideologię.");
    });
  });

  describe("given a description as a node", () => {
    it("returns the same node", () => {
      const description = <strong>Najbardziej zaawansowany test.</strong>;
      const { result } = renderView({ description });

      expect(result.current.description).toBe(description);
    });
  });

  describe("given an empty description", () => {
    it("returns no description but keeps the body for the tags", () => {
      const { result } = renderView({ description: "  " });

      expect(result.current.description).toBeUndefined();
      expect(result.current.hasBody).toBe(true);
      expect(result.current.isCollapsible).toBe(true);
    });
  });

  describe("given no tags", () => {
    it("keeps the body for the description", () => {
      const { result } = renderView({ tags: [] });

      expect(result.current.hasBody).toBe(true);
    });
  });

  describe("given neither a description nor tags", () => {
    it("has no body and nothing to collapse", () => {
      const { result } = renderView({ description: "", tags: [] });

      expect(result.current.hasBody).toBe(false);
      expect(result.current.isCollapsible).toBe(false);
      expect(result.current.isOpen).toBe(false);
    });
  });

  describe("given onCardClick and a title", () => {
    it("returns the title trimmed and the handler", () => {
      const handleCardClick = vi.fn();
      const { result } = renderView({
        title: " Polskie Lata 90. ",
        onCardClick: handleCardClick,
      });

      expect(result.current.title).toBe("Polskie Lata 90.");
      expect(result.current.onCardClick).toBe(handleCardClick);
    });
  });

  describe("given onCardClick but no title", () => {
    it("returns no handler: the card has no name to offer the action under", () => {
      const { result } = renderView({ onCardClick: vi.fn() });

      expect(result.current.title).toBeUndefined();
      expect(result.current.onCardClick).toBeUndefined();
    });
  });

  describe("given onCardClick and a title of whitespace only", () => {
    it("treats the title as absent, so the handler has no effect either", () => {
      const { result } = renderView({ title: " \n ", onCardClick: vi.fn() });

      expect(result.current.title).toBeUndefined();
      expect(result.current.onCardClick).toBeUndefined();
    });
  });

  describe("given a title but no onCardClick", () => {
    it("returns no handler", () => {
      const { result } = renderView({ title: "Polskie Lata 90." });

      expect(result.current.onCardClick).toBeUndefined();
    });
  });
});

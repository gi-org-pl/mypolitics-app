import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { QuizCardBadge } from "./QuizCardBadge";

const BADGE_TEXT = "Kiedyś to było... no właśnie, jak?";

describe("<QuizCardBadge />", () => {
  describe("given a card without an image", () => {
    it("renders the text as a paragraph", () => {
      render(
        <QuizCardBadge
          text={BADGE_TEXT}
          isBelowImage={false}
          isHighlighted={false}
        />,
      );

      expect(screen.getByRole("paragraph")).toHaveTextContent(BADGE_TEXT);
    });
  });

  describe("given a card with an image", () => {
    it("renders the same text", () => {
      render(
        <QuizCardBadge text={BADGE_TEXT} isBelowImage isHighlighted={false} />,
      );

      expect(screen.getByRole("paragraph")).toHaveTextContent(BADGE_TEXT);
    });
  });

  describe("given a highlighted card", () => {
    it("renders the same text", () => {
      render(
        <QuizCardBadge text={BADGE_TEXT} isBelowImage={false} isHighlighted />,
      );

      expect(screen.getByRole("paragraph")).toHaveTextContent(BADGE_TEXT);
    });
  });

  describe("given a text longer than the card is wide", () => {
    it("renders it in full, without cutting it", () => {
      const longText =
        "Zamiast o politykę, pokłóćmy się o muzykę, filmy, książki i wszystko inne!";

      render(
        <QuizCardBadge
          text={longText}
          isBelowImage={false}
          isHighlighted={false}
        />,
      );

      expect(screen.getByRole("paragraph")).toHaveTextContent(longText);
    });
  });
});

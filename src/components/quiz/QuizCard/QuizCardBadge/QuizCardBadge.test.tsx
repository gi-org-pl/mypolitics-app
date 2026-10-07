import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { QuizCardBadge } from "./QuizCardBadge";
import type { QuizCardBadgePlacement } from "./QuizCardBadge.types";

const BADGE_TEXT = "Kiedyś to było... no właśnie, jak?";
const PLACEMENTS: QuizCardBadgePlacement[] = [
  "top",
  "belowImage",
  "belowImageOnNarrowScreen",
];

describe("<QuizCardBadge />", () => {
  describe.each(PLACEMENTS)("given the placement '%s'", (placement) => {
    it("renders the text as a paragraph", () => {
      render(
        <QuizCardBadge
          text={BADGE_TEXT}
          placement={placement}
          isHighlighted={false}
        />,
      );

      expect(screen.getByRole("paragraph")).toHaveTextContent(BADGE_TEXT);
    });

    it("renders the same text on a highlighted card", () => {
      render(
        <QuizCardBadge text={BADGE_TEXT} placement={placement} isHighlighted />,
      );

      expect(screen.getByRole("paragraph")).toHaveTextContent(BADGE_TEXT);
    });
  });

  describe("given a text longer than the card is wide", () => {
    it("renders it in full, without cutting it", () => {
      const longText =
        "Zamiast o politykę, pokłóćmy się o muzykę, filmy, książki i wszystko inne!";

      render(
        <QuizCardBadge text={longText} placement="top" isHighlighted={false} />,
      );

      expect(screen.getByRole("paragraph")).toHaveTextContent(longText);
    });
  });
});

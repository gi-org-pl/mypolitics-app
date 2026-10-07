import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FOCUS_CLASS_NAME } from "@/constants/focus";
import { BUTTON_ICON_MASK_CLASS_NAME } from "@/constants/icon";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { QuizCardToggle } from "./QuizCardToggle";
import { TOGGLE_HIDDEN_ON_WIDE_SCREEN_CLASS_NAME } from "./QuizCardToggle.constants";
import type { QuizCardToggleProps } from "./QuizCardToggle.types";

const BODY_ID = "quiz-card-body";
const EXPAND_NAME = "Rozwiń";
const COLLAPSE_NAME = "Zwiń";

const renderToggle = (props: Partial<QuizCardToggleProps> = {}) =>
  renderWithI18n(
    <QuizCardToggle
      bodyId={BODY_ID}
      isOpen={false}
      isHiddenOnWideScreen={false}
      onToggle={vi.fn()}
      {...props}
    />,
  );

const getIcon = () => within(screen.getByRole("button")).getByRole("generic");

describe("<QuizCardToggle />", () => {
  describe("given a collapsed card", () => {
    it("renders a button that offers to expand it", () => {
      renderToggle();

      expect(
        screen.getByRole("button", { name: EXPAND_NAME }),
      ).toBeInTheDocument();
    });

    it("reports the content as collapsed", () => {
      renderToggle();

      expect(
        screen.getByRole("button", { name: EXPAND_NAME, expanded: false }),
      ).toBeInTheDocument();
    });
  });

  describe("given an open card", () => {
    it("renders a button that offers to collapse it", () => {
      renderToggle({ isOpen: true });

      expect(
        screen.getByRole("button", { name: COLLAPSE_NAME }),
      ).toBeInTheDocument();
    });

    it("reports the content as expanded", () => {
      renderToggle({ isOpen: true });

      expect(
        screen.getByRole("button", { name: COLLAPSE_NAME, expanded: true }),
      ).toBeInTheDocument();
    });
  });

  describe("given the id of the body", () => {
    it("points at the content it controls", () => {
      renderToggle();

      expect(screen.getByRole("button")).toHaveAttribute(
        "aria-controls",
        BODY_ID,
      );
    });
  });

  describe("given any state", () => {
    it("is named by its label only: the chevron is decorative", () => {
      renderToggle();

      const button = screen.getByRole("button");

      expect(button).toHaveAccessibleName(EXPAND_NAME);
      expect(within(button).queryByRole("img")).not.toBeInTheDocument();
      expect(button).toHaveTextContent("");
    });

    it("draws the chevron as a mask, in the shared way that survives forced colours", () => {
      renderToggle();

      const icon = getIcon();

      expect(icon.style.maskImage).toMatch(/^url\(".+"\)$/);
      expect(icon).toHaveClass(...BUTTON_ICON_MASK_CLASS_NAME.split(" "));
    });

    it("shows keyboard focus with the shared outline", () => {
      renderToggle();

      expect(screen.getByRole("button")).toHaveClass(
        ...FOCUS_CLASS_NAME.split(" "),
      );
    });

    it("does not submit a form around the card", () => {
      renderToggle();

      expect(screen.getByRole("button")).toHaveAttribute("type", "button");
    });
  });

  describe("given a card that is always open on a wide screen", () => {
    it("is hidden from the wide breakpoint up, in CSS alone", () => {
      renderToggle({ isHiddenOnWideScreen: true });

      expect(screen.getByRole("button")).toHaveClass(
        TOGGLE_HIDDEN_ON_WIDE_SCREEN_CLASS_NAME,
      );
    });

    it("renders the same button as a card that keeps its toggle", () => {
      renderToggle({ isHiddenOnWideScreen: true });

      expect(
        screen.getByRole("button", { name: EXPAND_NAME, expanded: false }),
      ).toHaveAttribute("aria-controls", BODY_ID);
    });
  });

  describe("when activated", () => {
    it("calls onToggle once", () => {
      const handleToggle = vi.fn();
      renderToggle({ onToggle: handleToggle });

      fireEvent.click(screen.getByRole("button"));

      expect(handleToggle).toHaveBeenCalledTimes(1);
    });

    it("does not let the click reach the card around it", () => {
      const handleCardClick = vi.fn();
      renderWithI18n(
        <article onClick={handleCardClick}>
          <QuizCardToggle
            bodyId={BODY_ID}
            isOpen={false}
            isHiddenOnWideScreen={false}
            onToggle={vi.fn()}
          />
        </article>,
      );

      fireEvent.click(screen.getByRole("button"));

      expect(handleCardClick).not.toHaveBeenCalled();
    });
  });
});

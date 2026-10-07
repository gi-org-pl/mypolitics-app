import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FOCUS_CLASS_NAME } from "@/constants/focus";
import { BUTTON_ICON_MASK_CLASS_NAME } from "@/constants/icon";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { QuizCardPlayButton } from "./QuizCardPlayButton";
import {
  FORCED_COLORS_BORDER_CLASS_NAME,
  START_TEXT_CLASS_NAME,
} from "./QuizCardPlayButton.constants";
import type { QuizCardPlayButtonProps } from "./QuizCardPlayButton.types";

const BUTTON_NAME = "Rozpocznij quiz";
const START_TEXT = "Rozpocznij";

const renderPlayButton = (props: Partial<QuizCardPlayButtonProps> = {}) =>
  renderWithI18n(
    <QuizCardPlayButton
      isLight={false}
      isShowStartText={false}
      isLoading={false}
      onClick={vi.fn()}
      {...props}
    />,
  );

const getButton = () => screen.getByRole("button", { name: BUTTON_NAME });

const getIcon = () =>
  within(getButton()).getByRole("generic", { hidden: true });

describe("<QuizCardPlayButton />", () => {
  describe("given a card with a logo", () => {
    it("renders a button named after what it does", () => {
      renderPlayButton();

      expect(getButton()).toBeEnabled();
    });

    it("is named by its label only: the play icon is decorative", () => {
      renderPlayButton();

      const button = getButton();

      expect(within(button).queryByRole("img")).not.toBeInTheDocument();
      expect(getIcon()).toHaveAttribute("aria-hidden", "true");
      expect(button).toHaveTextContent("");
    });

    it("draws the play icon as a mask that stays visible in forced colours", () => {
      renderPlayButton();

      const icon = getIcon();

      expect(icon.style.maskImage).toMatch(/^url\(".+"\)$/);
      expect(icon).toHaveClass(...BUTTON_ICON_MASK_CLASS_NAME.split(" "));
    });

    it("keeps its shape in forced colours, which drop the fill", () => {
      renderPlayButton();

      expect(getButton()).toHaveClass(
        ...FORCED_COLORS_BORDER_CLASS_NAME.split(" "),
      );
    });

    it("shows keyboard focus as an outline instead of Athena's ring", () => {
      renderPlayButton();

      expect(getButton()).toHaveClass(...FOCUS_CLASS_NAME.split(" "));
      expect(getButton()).not.toHaveClass("focus-visible:ring-[3px]");
    });

    it("does not submit a form around the card", () => {
      renderPlayButton();

      expect(getButton()).toHaveAttribute("type", "button");
    });
  });

  describe("given a card that shows its title as text", () => {
    it("renders the same button", () => {
      renderPlayButton({ isLight: true });

      expect(getButton()).toBeEnabled();
    });
  });

  describe("given isShowStartText", () => {
    it('renders the "Rozpocznij" label', () => {
      renderPlayButton({ isShowStartText: true });

      expect(within(getButton()).getByText(START_TEXT)).toBeInTheDocument();
    });

    it("keeps the same accessible name, which starts with the visible label", () => {
      renderPlayButton({ isShowStartText: true });

      expect(getButton()).toHaveAccessibleName(BUTTON_NAME);
      expect(BUTTON_NAME.startsWith(START_TEXT)).toBe(true);
    });

    it("shows the label from the wide breakpoint up and the icon alone below it, in CSS alone", () => {
      renderPlayButton({ isShowStartText: true });

      expect(within(getButton()).getByText(START_TEXT)).toHaveClass(
        ...START_TEXT_CLASS_NAME.split(" "),
      );
    });
  });

  describe("given no isShowStartText", () => {
    it("renders the icon alone", () => {
      renderPlayButton();

      expect(screen.queryByText(START_TEXT)).not.toBeInTheDocument();
    });
  });

  describe("given isLoading", () => {
    it("shows the loading state", () => {
      renderPlayButton({ isLoading: true });

      expect(getButton()).toHaveAttribute("aria-busy", "true");
    });

    it("cannot be activated", () => {
      const handleClick = vi.fn();
      renderPlayButton({ isLoading: true, onClick: handleClick });

      fireEvent.click(getButton());

      expect(getButton()).toBeDisabled();
      expect(handleClick).not.toHaveBeenCalled();
    });

    it("replaces the play icon with Athena's spinner", () => {
      renderPlayButton({ isLoading: true });

      expect(
        within(getButton()).queryByRole("generic", { hidden: true }),
      ).not.toBeInTheDocument();
    });

    it("keeps the label next to the spinner when the label is shown", () => {
      renderPlayButton({ isLoading: true, isShowStartText: true });

      expect(within(getButton()).getByText(START_TEXT)).toBeInTheDocument();
    });
  });

  describe("when activated", () => {
    it("calls onClick once", () => {
      const handleClick = vi.fn();
      renderPlayButton({ onClick: handleClick });

      fireEvent.click(getButton());

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("does not let the click reach the card around it", () => {
      const handleCardClick = vi.fn();
      renderWithI18n(
        <article onClick={handleCardClick}>
          <QuizCardPlayButton
            isLight={false}
            isShowStartText={false}
            isLoading={false}
            onClick={vi.fn()}
          />
        </article>,
      );

      fireEvent.click(getButton());

      expect(handleCardClick).not.toHaveBeenCalled();
    });
  });
});

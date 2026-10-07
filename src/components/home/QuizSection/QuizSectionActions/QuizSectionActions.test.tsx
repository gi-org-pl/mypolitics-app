import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FOCUS_CLASS_NAME } from "@/constants/focus";
import { BUTTON_ICON_MASK_CLASS_NAME } from "@/constants/icon";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { QuizSectionActions } from "./QuizSectionActions";

const SHOW_MORE_NAME = "Zobacz więcej";
const CREATE_NAME = "Stwórz własny";

const renderActions = () => {
  const onShowMore = vi.fn();
  const onCreate = vi.fn();

  renderWithI18n(
    <QuizSectionActions onShowMore={onShowMore} onCreate={onCreate} />,
  );

  return { onShowMore, onCreate };
};

describe("<QuizSectionActions />", () => {
  describe("when it is rendered", () => {
    it("renders the two buttons, more quizzes first", () => {
      renderActions();

      expect(
        screen.getAllByRole("button").map((button) => button.textContent),
      ).toEqual([SHOW_MORE_NAME, CREATE_NAME]);
    });

    it("draws keyboard focus on both buttons as the shared outline", () => {
      renderActions();

      for (const button of screen.getAllByRole("button")) {
        expect(button).toHaveClass(...FOCUS_CLASS_NAME.split(" "));
      }
    });

    it("draws the icon of the create button as a mask that survives forced colours", () => {
      renderActions();

      const icon = within(
        screen.getByRole("button", { name: CREATE_NAME }),
      ).getByRole("generic", { hidden: true });

      expect(icon).toHaveAttribute("aria-hidden", "true");
      expect(icon.style.maskImage).toMatch(/^url\(".+"\)$/);
      expect(icon).toHaveClass(...BUTTON_ICON_MASK_CLASS_NAME.split(" "));
    });
  });

  describe("when the button for more quizzes is pressed", () => {
    it("calls onShowMore only", () => {
      const { onShowMore, onCreate } = renderActions();

      fireEvent.click(screen.getByRole("button", { name: SHOW_MORE_NAME }));

      expect(onShowMore).toHaveBeenCalledTimes(1);
      expect(onCreate).not.toHaveBeenCalled();
    });
  });

  describe("when the create button is pressed", () => {
    it("calls onCreate only", () => {
      const { onShowMore, onCreate } = renderActions();

      fireEvent.click(screen.getByRole("button", { name: CREATE_NAME }));

      expect(onCreate).toHaveBeenCalledTimes(1);
      expect(onShowMore).not.toHaveBeenCalled();
    });
  });
});

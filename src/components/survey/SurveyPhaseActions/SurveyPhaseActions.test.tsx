import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { SurveyPhaseActions } from "./SurveyPhaseActions";
import type { SurveyPhaseActionsProps } from "./SurveyPhaseActions.types";

const PRIMARY_LABEL = "Zobacz wyniki";
const REASON = "Wybierz wszystkie cztery pola albo pomiń";

const renderActions = (props: Partial<SurveyPhaseActionsProps> = {}) => {
  const onPrimary = vi.fn();
  const onSkip = vi.fn();

  renderWithI18n(
    <SurveyPhaseActions
      primaryLabel={PRIMARY_LABEL}
      onPrimary={onPrimary}
      onSkip={onSkip}
      {...props}
    />,
  );

  return { onPrimary, onSkip };
};

const getPrimaryButton = () =>
  screen.getByRole("button", { name: PRIMARY_LABEL });

const getSkipButton = () => screen.getByRole("button", { name: "Pomiń" });

describe("<SurveyPhaseActions />", () => {
  describe("given a label", () => {
    it('draws the main button with its label, then "Pomiń"', () => {
      renderActions();

      expect(
        screen.getAllByRole("button").map((button) => button.textContent),
      ).toEqual([PRIMARY_LABEL, "Pomiń"]);
      expect(getPrimaryButton()).toBeEnabled();
      expect(getSkipButton()).toBeEnabled();
    });

    it("describes the main button with nothing", () => {
      renderActions({ primaryDisabledReason: REASON });

      expect(getPrimaryButton()).not.toHaveAccessibleDescription();
      expect(screen.queryByText(REASON)).not.toBeInTheDocument();
    });

    it("takes the width of its parent", () => {
      const { container } = renderWithI18n(
        <SurveyPhaseActions
          primaryLabel={PRIMARY_LABEL}
          onPrimary={vi.fn()}
          onSkip={vi.fn()}
        />,
      );

      expect(container.firstElementChild).toHaveClass("w-full");
    });
  });

  describe("when the buttons are pressed", () => {
    it("calls onPrimary and onSkip", () => {
      const { onPrimary, onSkip } = renderActions();

      fireEvent.click(getPrimaryButton());

      expect(onPrimary).toHaveBeenCalledTimes(1);
      expect(onSkip).not.toHaveBeenCalled();

      fireEvent.click(getSkipButton());

      expect(onSkip).toHaveBeenCalledTimes(1);
      expect(onPrimary).toHaveBeenCalledTimes(1);
    });
  });

  describe("given isPrimaryDisabled", () => {
    it('disables the main button and keeps "Pomiń" working', () => {
      const { onPrimary, onSkip } = renderActions({ isPrimaryDisabled: true });

      expect(getPrimaryButton()).toBeDisabled();

      fireEvent.click(getPrimaryButton());
      fireEvent.click(getSkipButton());

      expect(onPrimary).not.toHaveBeenCalled();
      expect(onSkip).toHaveBeenCalledTimes(1);
    });

    it("describes the main button with the reason", () => {
      renderActions({ isPrimaryDisabled: true, primaryDisabledReason: REASON });

      expect(getPrimaryButton()).toHaveAccessibleDescription(REASON);
    });

    it.each([
      undefined,
      "",
      "   ",
    ])("describes the main button with nothing for the reason %j", (primaryDisabledReason) => {
      renderActions({ isPrimaryDisabled: true, primaryDisabledReason });

      expect(getPrimaryButton()).not.toHaveAccessibleDescription();
    });
  });
});

import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SurveyResultsCalculationMessage } from "./SurveyResultsCalculationMessage";

const TEXT = "Liczenie wyników trwa dłużej niż zwykle.";
const ACTION = "Spróbuj ponownie";

const renderMessage = () => {
  const onAction = vi.fn();

  return {
    ...render(
      <SurveyResultsCalculationMessage
        text={TEXT}
        actionLabel={ACTION}
        onAction={onAction}
      />,
    ),
    onAction,
  };
};

describe("<SurveyResultsCalculationMessage />", () => {
  describe("when it appears", () => {
    it("announces its text when it appears", () => {
      renderMessage();

      expect(screen.getByRole("alert")).toHaveTextContent(TEXT);
    });

    it("moves the focus to its button", () => {
      renderMessage();

      expect(
        within(screen.getByRole("alert")).getByRole("button", { name: ACTION }),
      ).toHaveFocus();
    });
  });

  describe("when its button is pressed", () => {
    it("calls onAction", () => {
      const { onAction } = renderMessage();

      fireEvent.click(screen.getByRole("button", { name: ACTION }));

      expect(onAction).toHaveBeenCalledTimes(1);
    });
  });

  describe("when rendered again", () => {
    it("does not take the focus back", () => {
      const { rerender, onAction } = renderMessage();

      (document.activeElement as HTMLElement).blur();
      rerender(
        <SurveyResultsCalculationMessage
          text={TEXT}
          actionLabel={ACTION}
          onAction={onAction}
        />,
      );

      expect(screen.getByRole("button", { name: ACTION })).not.toHaveFocus();
    });
  });
});

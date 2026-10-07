import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { SurveyControls } from "./SurveyControls";
import type { SurveyControlsProps } from "./SurveyControls.types";

const DIVIDER = "survey-controls-pill-divider";
const DIALOG_TEXT =
  "Czy na pewno chcesz rozpocząć quiz Quiz Name od nowa? Twoje odpowiedzi nie zostaną zapisane.";

const renderControls = (props: Partial<SurveyControlsProps> = {}) =>
  renderWithI18n(
    <SurveyControls
      quizName="Quiz Name"
      onPrevious={vi.fn()}
      onReset={vi.fn()}
      {...props}
    />,
  );

const getBackButton = () =>
  screen.getByRole("button", { name: "Poprzednie pytanie" });

const getResetButton = () =>
  screen.getByRole("button", { name: "Zacznij od nowa" });

const getDialog = () =>
  screen.getByRole("dialog", { name: "Rozpocząć od nowa?" });

const finishClosing = () => {
  const overlay = screen.getByRole("dialog").parentElement;

  fireEvent.transitionEnd(overlay as HTMLElement);
};

describe("<SurveyControls />", () => {
  describe("given only a quiz name", () => {
    it("shows the quiz name in the pill", () => {
      renderControls();

      expect(screen.getByText("Quiz Name")).toBeInTheDocument();
    });
  });

  describe("given a label", () => {
    it("shows the label alone", () => {
      renderControls({
        label: "Prawie koniec!",
        categoryName: "Światopogląd",
        questionsLeft: 11,
      });

      expect(screen.getByText("Prawie koniec!")).toBeInTheDocument();
      expect(screen.queryByText("Światopogląd")).not.toBeInTheDocument();
      expect(screen.queryByText("Quiz Name")).not.toBeInTheDocument();
      expect(screen.queryByText("11")).not.toBeInTheDocument();
    });
  });

  describe("given a category name and questions left", () => {
    it("shows the name, the divider and the number", () => {
      renderControls({ categoryName: "Światopogląd", questionsLeft: 11 });

      expect(screen.getByText("Światopogląd")).toBeInTheDocument();
      expect(screen.getByTestId(DIVIDER)).toBeInTheDocument();
      expect(screen.getByText("11")).toBeInTheDocument();
    });
  });

  describe("given a category name only", () => {
    it("shows the name without a divider", () => {
      renderControls({ categoryName: "Światopogląd" });

      expect(screen.getByText("Światopogląd")).toBeInTheDocument();
      expect(screen.queryByTestId(DIVIDER)).not.toBeInTheDocument();
    });
  });

  describe("given questions left only", () => {
    it("shows the number without a divider", () => {
      renderControls({ questionsLeft: 11 });

      expect(screen.getByText("11")).toBeInTheDocument();
      expect(screen.queryByTestId(DIVIDER)).not.toBeInTheDocument();
      expect(screen.queryByText("Quiz Name")).not.toBeInTheDocument();
    });
  });

  describe("given an empty quiz name and nothing else", () => {
    it("renders no pill and both buttons", () => {
      const { container } = renderControls({ quizName: "" });

      expect(getBackButton()).toBeInTheDocument();
      expect(getResetButton()).toBeInTheDocument();
      expect(container.firstElementChild?.children).toHaveLength(2);
    });

    it("keeps the buttons at the ends of the row", () => {
      const { container } = renderControls({ quizName: "" });

      expect(container.firstElementChild).toHaveClass(
        "w-full",
        "justify-between",
      );
    });
  });

  describe("when the back button is activated", () => {
    it("calls onPrevious", async () => {
      const user = userEvent.setup();
      const onPrevious = vi.fn();
      renderControls({ onPrevious });

      await user.click(getBackButton());

      expect(onPrevious).toHaveBeenCalledTimes(1);
    });

    it("calls onPrevious from the keyboard", async () => {
      const user = userEvent.setup();
      const onPrevious = vi.fn();
      renderControls({ onPrevious });

      await user.tab();
      await user.keyboard("{Enter}");

      expect(getBackButton()).toHaveFocus();
      expect(onPrevious).toHaveBeenCalledTimes(1);
    });
  });

  describe("given isPreviousDisabled", () => {
    it("disables the back button", () => {
      renderControls({ isPreviousDisabled: true });

      expect(getBackButton()).toBeDisabled();
      expect(getResetButton()).toBeEnabled();
    });

    it("does not call onPrevious", () => {
      const onPrevious = vi.fn();
      renderControls({ isPreviousDisabled: true, onPrevious });

      fireEvent.click(getBackButton());

      expect(onPrevious).not.toHaveBeenCalled();
    });

    it("draws the icon and the border in the disabled colour", () => {
      renderControls({ isPreviousDisabled: true });

      expect(getBackButton()).toHaveClass(
        "data-[disabled=true]:text-gi-dark-ash",
        "data-[disabled=true]:border-gi-dark-ash",
      );
      expect(getBackButton()).toHaveAttribute("data-disabled", "true");
    });
  });

  describe("given isResetDisabled", () => {
    it("disables the reset button", () => {
      renderControls({ isResetDisabled: true });

      expect(getResetButton()).toBeDisabled();
      expect(getBackButton()).toBeEnabled();
    });

    it("opens no dialog", () => {
      renderControls({ isResetDisabled: true });

      fireEvent.click(getResetButton());

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("when the reset button is activated", () => {
    it("opens the dialog", async () => {
      const user = userEvent.setup();
      renderControls();

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

      await user.click(getResetButton());

      expect(getDialog()).toBeInTheDocument();
      expect(screen.getByText(DIALOG_TEXT)).toBeInTheDocument();
    });

    it("does not call onReset", async () => {
      const user = userEvent.setup();
      const onReset = vi.fn();
      renderControls({ onReset });

      await user.click(getResetButton());

      expect(onReset).not.toHaveBeenCalled();
    });

    it("moves focus into the dialog", async () => {
      const user = userEvent.setup();
      renderControls();

      await user.click(getResetButton());

      expect(getDialog()).toContainElement(
        document.activeElement as HTMLElement,
      );
    });
  });

  describe("given an empty quiz name when the dialog opens", () => {
    it("leaves the name out of the text", async () => {
      const user = userEvent.setup();
      renderControls({ quizName: "" });

      await user.click(getResetButton());

      expect(
        screen.getByText(
          "Czy na pewno chcesz rozpocząć quiz od nowa? Twoje odpowiedzi nie zostaną zapisane.",
        ),
      ).toBeInTheDocument();
    });
  });

  describe("when the dialog is confirmed", () => {
    it("calls onReset once", async () => {
      const user = userEvent.setup();
      const onReset = vi.fn();
      renderControls({ onReset });

      await user.click(getResetButton());
      await user.click(screen.getByRole("button", { name: "Resetuj quiz" }));

      expect(onReset).toHaveBeenCalledTimes(1);
    });

    it("does not call onReset again while the dialog is closing", async () => {
      const user = userEvent.setup();
      const onReset = vi.fn();
      renderControls({ onReset });

      await user.click(getResetButton());
      const action = screen.getByRole("button", { name: "Resetuj quiz" });
      await user.click(action);
      fireEvent.click(action);

      expect(onReset).toHaveBeenCalledTimes(1);
    });

    it("closes the dialog", async () => {
      const user = userEvent.setup();
      renderControls();

      await user.click(getResetButton());
      await user.click(screen.getByRole("button", { name: "Resetuj quiz" }));
      finishClosing();

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("returns focus to the reset button", async () => {
      const user = userEvent.setup();
      renderControls();

      await user.click(getResetButton());
      await user.click(screen.getByRole("button", { name: "Resetuj quiz" }));

      expect(getResetButton()).toHaveFocus();
    });
  });

  describe("when the dialog is dismissed", () => {
    it("does not call onReset", async () => {
      const user = userEvent.setup();
      const onReset = vi.fn();
      renderControls({ onReset });

      await user.click(getResetButton());
      await user.click(screen.getByRole("button", { name: "Close modal" }));

      expect(onReset).not.toHaveBeenCalled();
    });

    it("closes the dialog", async () => {
      const user = userEvent.setup();
      renderControls();

      await user.click(getResetButton());
      await user.click(screen.getByRole("button", { name: "Close modal" }));
      finishClosing();

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("closes on Escape without calling onReset", async () => {
      const user = userEvent.setup();
      const onReset = vi.fn();
      renderControls({ onReset });

      await user.click(getResetButton());
      await user.keyboard("{Escape}");
      finishClosing();

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(onReset).not.toHaveBeenCalled();
    });

    it("closes on the overlay without calling onReset", async () => {
      const user = userEvent.setup();
      const onReset = vi.fn();
      renderControls({ onReset });

      await user.click(getResetButton());
      await user.click(getDialog().parentElement as HTMLElement);
      finishClosing();

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(onReset).not.toHaveBeenCalled();
    });

    it("returns focus to the reset button", async () => {
      const user = userEvent.setup();
      renderControls();

      await user.click(getResetButton());
      await user.keyboard("{Escape}");

      expect(getResetButton()).toHaveFocus();
    });
  });

  describe("accessibility", () => {
    it("names both buttons", () => {
      renderControls();

      expect(getBackButton()).toBeInTheDocument();
      expect(getResetButton()).toBeInTheDocument();
    });

    it("hides both icons from assistive technology", () => {
      renderControls();

      expect(getBackButton().firstElementChild).toHaveAttribute(
        "aria-hidden",
        "true",
      );
      expect(getResetButton().firstElementChild).toHaveAttribute(
        "aria-hidden",
        "true",
      );
    });

    it("announces the number with its meaning", () => {
      renderControls({ categoryName: "Światopogląd", questionsLeft: 11 });

      expect(
        screen.getByText("Pozostałe pytania w kategorii: 11"),
      ).toBeInTheDocument();
      expect(screen.getByText("11").parentElement).toHaveAttribute(
        "aria-hidden",
        "true",
      );
    });
  });
});

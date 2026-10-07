import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import type { SurveyControlsResetModalProps } from "../SurveyControls.types";
import { SurveyControlsResetModal } from "./SurveyControlsResetModal";

const renderModal = (props: Partial<SurveyControlsResetModalProps> = {}) =>
  renderWithI18n(
    <SurveyControlsResetModal
      quizName="Quiz Name"
      isOpen
      onClose={vi.fn()}
      onConfirm={vi.fn()}
      {...props}
    />,
  );

describe("<SurveyControlsResetModal />", () => {
  describe("given it is open", () => {
    it("renders a dialog named by its title", () => {
      renderModal();

      expect(
        screen.getByRole("dialog", { name: "Rozpocząć od nowa?" }),
      ).toBeInTheDocument();
    });

    it("renders the action with a decorative icon", () => {
      renderModal();

      const action = screen.getByRole("button", { name: "Resetuj quiz" });

      expect(action.querySelector("[aria-hidden='true']")).toBeInTheDocument();
    });
  });

  describe("given it is not open", () => {
    it("renders no dialog", () => {
      renderModal({ isOpen: false });

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("given a quiz name", () => {
    it("names the quiz in the text", () => {
      renderModal();

      expect(
        screen.getByText(
          "Czy na pewno chcesz rozpocząć quiz Quiz Name od nowa? Twoje odpowiedzi nie zostaną zapisane.",
        ),
      ).toBeInTheDocument();
    });
  });

  describe("given an empty quiz name", () => {
    it("uses the text without a name", () => {
      renderModal({ quizName: "" });

      expect(
        screen.getByText(
          "Czy na pewno chcesz rozpocząć quiz od nowa? Twoje odpowiedzi nie zostaną zapisane.",
        ),
      ).toBeInTheDocument();
    });

    it("uses the text without a name for a name of only whitespace", () => {
      renderModal({ quizName: "   " });

      expect(
        screen.getByText(
          "Czy na pewno chcesz rozpocząć quiz od nowa? Twoje odpowiedzi nie zostaną zapisane.",
        ),
      ).toBeInTheDocument();
    });
  });

  describe("when the action is activated", () => {
    it("calls onConfirm and not onClose", () => {
      const onConfirm = vi.fn();
      const onClose = vi.fn();
      renderModal({ onConfirm, onClose });

      fireEvent.click(screen.getByRole("button", { name: "Resetuj quiz" }));

      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe("when the close button is activated", () => {
    it("calls onClose and not onConfirm", () => {
      const onConfirm = vi.fn();
      const onClose = vi.fn();
      renderModal({ onConfirm, onClose });

      fireEvent.click(screen.getByRole("button", { name: "Close modal" }));

      expect(onClose).toHaveBeenCalledTimes(1);
      expect(onConfirm).not.toHaveBeenCalled();
    });
  });

  describe("when Escape is pressed", () => {
    it("calls onClose", () => {
      const onClose = vi.fn();
      renderModal({ onClose });

      fireEvent.keyDown(document, { key: "Escape" });

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("when the overlay is activated", () => {
    it("calls onClose", () => {
      const onClose = vi.fn();
      renderModal({ onClose });

      const overlay = screen.getByRole("dialog").parentElement;
      fireEvent.click(overlay as HTMLElement);

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});

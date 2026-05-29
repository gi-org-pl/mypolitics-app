import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import SurveyControls from "./SurveyControls";
import type { SurveyControlsProps } from "./SurveyContorls.types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const defaultProps: SurveyControlsProps = {
  title: "Światopogląd",
  phase: "QUESTION_ANSWER",
  categoryName: "Polityka zagraniczna",
  questionsLeftnCategory: 11,
  answersCount: 5,
  onPrevious: vi.fn(),
  onReset: vi.fn(),
};

function renderComponent(overrides: Partial<SurveyControlsProps> = {}) {
  return render(<SurveyControls {...defaultProps} {...overrides} />);
}

function mockMatchMedia(width: number) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: width > 400,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("<SurveyControls />", () => {

  describe("given phase is CATEGORY_SELECT", () => {
    it("renders the quiz title in the center pill", () => {
      renderComponent({ phase: "CATEGORY_SELECT", answersCount: 0 });
      expect(screen.getByTestId("pill-title")).toHaveTextContent("Światopogląd");
    });

    it("disables the back button", () => {
      renderComponent({ phase: "CATEGORY_SELECT", answersCount: 0 });
      expect(screen.getByTestId("back-button")).toBeDisabled();
    });

    it("disables the reset button", () => {
      renderComponent({ phase: "CATEGORY_SELECT", answersCount: 0 });
      expect(screen.getByTestId("reset-button")).toBeDisabled();
    });
  });

  describe("given phase is QUESTION_ANSWER and answersCount > 0", () => {
    it("enables the back button", () => {
      renderComponent({ phase: "QUESTION_ANSWER", answersCount: 3 });
      expect(screen.getByTestId("back-button")).not.toBeDisabled();
    });

    it("enables the reset button", () => {
      renderComponent({ phase: "QUESTION_ANSWER", answersCount: 3 });
      expect(screen.getByTestId("reset-button")).not.toBeDisabled();
    });

    describe("on a large screen (>400px)", () => {
      it("renders category name, divider, and question count in the pill", () => {
        mockMatchMedia(800);
        renderComponent({ phase: "QUESTION_ANSWER", answersCount: 3 });

        expect(screen.getByTestId("pill-category-name")).toBeInTheDocument();
        expect(screen.getByTestId("pill-divider")).toBeInTheDocument();
        expect(screen.getByTestId("pill-count-number")).toBeInTheDocument();
      });
    });

    describe("on a small screen (≤400px)", () => {
      it("renders only the question count (no category name or divider)", () => {
        mockMatchMedia(375);
        renderComponent({ phase: "QUESTION_ANSWER", answersCount: 3 });

        expect(screen.queryByTestId("pill-category-name")).not.toBeInTheDocument();
        expect(screen.queryByTestId("pill-divider")).not.toBeInTheDocument();
        expect(screen.getByTestId("pill-count-number")).toBeInTheDocument();
      });
    });
  });

  describe("given phase is QUESTION_ANSWER but answersCount is 0", () => {
    it("disables the back button", () => {
      renderComponent({ phase: "QUESTION_ANSWER", answersCount: 0 });
      expect(screen.getByTestId("back-button")).toBeDisabled();
    });
  });

  describe("given phase is FINISH", () => {
    it('renders "Prawie koniec!" in the center pill', () => {
      renderComponent({ phase: "FINISH", answersCount: 11 });
      expect(screen.getByTestId("pill-finish")).toHaveTextContent("Prawie koniec!");
    });

    it("disables the back button", () => {
      renderComponent({ phase: "FINISH", answersCount: 11 });
      expect(screen.getByTestId("back-button")).toBeDisabled();
    });

    it("disables the reset button", () => {
      renderComponent({ phase: "FINISH", answersCount: 11 });
      expect(screen.getByTestId("reset-button")).toBeDisabled();
    });
  });

  describe("when the back button is clicked", () => {
    it("calls onPrevious", () => {
      const onPrevious = vi.fn();
      renderComponent({ phase: "QUESTION_ANSWER", answersCount: 3, onPrevious });
      fireEvent.click(screen.getByTestId("back-button"));
      expect(onPrevious).toHaveBeenCalledOnce();
    });
  });

  describe("when the reset button is clicked", () => {
    it("opens the reset confirmation modal", () => {
      renderComponent({ phase: "QUESTION_ANSWER", answersCount: 3 });
      fireEvent.click(screen.getByTestId("reset-button"));
      expect(screen.getByTestId("reset-modal")).toBeInTheDocument();
    });
  });

  describe("when the reset modal primary action is confirmed", () => {
    it("calls onReset", () => {
      const onReset = vi.fn();
      renderComponent({ phase: "QUESTION_ANSWER", answersCount: 3, onReset });
      fireEvent.click(screen.getByTestId("reset-button"));
      fireEvent.click(screen.getByTestId("reset-confirm-button"));
      expect(onReset).toHaveBeenCalledOnce();
    });

    it("closes the modal", () => {
      renderComponent({ phase: "QUESTION_ANSWER", answersCount: 3 });
      fireEvent.click(screen.getByTestId("reset-button"));
      fireEvent.click(screen.getByTestId("reset-confirm-button"));
      expect(screen.queryByTestId("reset-modal")).not.toBeInTheDocument();
    });
  });

  describe("when the reset modal is dismissed", () => {
    it("does not call onReset", () => {
      const onReset = vi.fn();
      renderComponent({ phase: "QUESTION_ANSWER", answersCount: 3, onReset });
      fireEvent.click(screen.getByTestId("reset-button"));
      fireEvent.click(screen.getByRole("button", { name: /close/i }));
      expect(onReset).not.toHaveBeenCalled();
    });

    it("closes the modal", () => {
      renderComponent({ phase: "QUESTION_ANSWER", answersCount: 3 });
      fireEvent.click(screen.getByTestId("reset-button"));
      fireEvent.click(screen.getByRole("button", { name: /close/i }));
      expect(screen.queryByTestId("reset-modal")).not.toBeInTheDocument();
    });
  });

});
import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SurveyControlsProps } from "./SurveyContorls.types";
import SurveyControls from "./SurveyControls";

i18n.load({ pl: {} });
i18n.activate("pl");

function wrapper({ children }: { children: ReactNode }) {
  return <I18nProvider i18n={i18n}>{children}</I18nProvider>;
}

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
  return render(<SurveyControls {...defaultProps} {...overrides} />, {
    wrapper,
  });
}

function mockMatchMedia(width: number) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: width > 400,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    })),
  });
}

async function openResetModal() {
  fireEvent.click(screen.getByTestId("reset-button"));

  expect(await screen.findByText(/rozpocząć od nowa\?/i)).toBeInTheDocument();
}

function clickModalCloseButton() {
  const closeButton =
    screen.queryByLabelText(/close modal/i) ??
    screen.queryByLabelText(/close/i) ??
    screen.queryByLabelText(/zamknij/i) ??
    screen.queryByRole("button", { name: /close/i }) ??
    screen.queryByRole("button", { name: /zamknij/i });

  expect(closeButton).toBeInTheDocument();

  fireEvent.click(closeButton as HTMLElement);
}

beforeEach(() => {
  mockMatchMedia(800);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("<SurveyControls />", () => {
  describe("given phase is CATEGORY_SELECT", () => {
    it("renders the quiz title in the center pill", () => {
      renderComponent({ phase: "CATEGORY_SELECT", answersCount: 0 });

      expect(screen.getByTestId("pill-title")).toHaveTextContent(
        "Światopogląd",
      );
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

        renderComponent({
          phase: "QUESTION_ANSWER",
          answersCount: 3,
          categoryName: "Polityka zagraniczna",
          questionsLeftnCategory: 11,
        });

        expect(screen.getByTestId("pill-category-name")).toHaveTextContent(
          "Polityka zagraniczna",
        );
        expect(screen.getByTestId("pill-divider")).toBeInTheDocument();
        expect(screen.getByTestId("pill-count-number")).toHaveTextContent("11");
      });
    });

    describe("on a small screen (≤400px)", () => {
      it("renders only the question count (no category name or divider)", () => {
        mockMatchMedia(375);

        renderComponent({
          phase: "QUESTION_ANSWER",
          answersCount: 3,
          categoryName: "Polityka zagraniczna",
          questionsLeftnCategory: 11,
        });

        expect(
          screen.queryByTestId("pill-category-name"),
        ).not.toBeInTheDocument();
        expect(screen.queryByTestId("pill-divider")).not.toBeInTheDocument();
        expect(screen.getByTestId("pill-count-number")).toHaveTextContent("11");
      });
    });
  });

  describe("given phase is QUESTION_ANSWER but answersCount is 0", () => {
    it("disables the back button", () => {
      renderComponent({ phase: "QUESTION_ANSWER", answersCount: 0 });

      expect(screen.getByTestId("back-button")).toBeDisabled();
    });

    it("keeps the reset button enabled", () => {
      renderComponent({ phase: "QUESTION_ANSWER", answersCount: 0 });

      expect(screen.getByTestId("reset-button")).not.toBeDisabled();
    });
  });

  describe("given phase is FINISH", () => {
    it('renders "Prawie koniec!" in the center pill', () => {
      renderComponent({ phase: "FINISH", answersCount: 11 });

      expect(screen.getByTestId("pill-finish")).toHaveTextContent(
        "Prawie koniec!",
      );
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

      renderComponent({
        phase: "QUESTION_ANSWER",
        answersCount: 3,
        onPrevious,
      });

      fireEvent.click(screen.getByTestId("back-button"));

      expect(onPrevious).toHaveBeenCalledOnce();
    });
  });

  describe("when the reset button is clicked", () => {
    it("opens the reset confirmation modal", async () => {
      renderComponent({ phase: "QUESTION_ANSWER", answersCount: 3 });

      await openResetModal();

      expect(
        screen.getByText(/czy na pewno chcesz rozpocząć quiz/i),
      ).toBeInTheDocument();
      expect(screen.getByText("Światopogląd")).toBeInTheDocument();
    });
  });

  describe("when the reset modal primary action is confirmed", () => {
    it("calls onReset", async () => {
      const onReset = vi.fn();

      renderComponent({
        phase: "QUESTION_ANSWER",
        answersCount: 3,
        onReset,
      });

      await openResetModal();

      fireEvent.click(
        await screen.findByRole("button", { name: /resetuj quiz/i }),
      );

      expect(onReset).toHaveBeenCalledOnce();
    });

    it("closes the modal", async () => {
      renderComponent({ phase: "QUESTION_ANSWER", answersCount: 3 });

      await openResetModal();

      fireEvent.click(
        await screen.findByRole("button", { name: /resetuj quiz/i }),
      );

      await waitFor(() => {
        expect(
          screen.queryByText(/rozpocząć od nowa\?/i),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("when the reset modal is dismissed", () => {
    it("does not call onReset", async () => {
      const onReset = vi.fn();

      renderComponent({
        phase: "QUESTION_ANSWER",
        answersCount: 3,
        onReset,
      });

      await openResetModal();

      clickModalCloseButton();

      expect(onReset).not.toHaveBeenCalled();
    });

    it("closes the modal", async () => {
      renderComponent({ phase: "QUESTION_ANSWER", answersCount: 3 });

      await openResetModal();

      clickModalCloseButton();

      await waitFor(() => {
        expect(
          screen.queryByText(/rozpocząć od nowa\?/i),
        ).not.toBeInTheDocument();
      });
    });
  });
});

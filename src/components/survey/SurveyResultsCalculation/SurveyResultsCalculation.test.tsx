import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { SurveyResultsCalculation } from "./SurveyResultsCalculation";
import type {
  SurveyResultsCalculationProps,
  SurveyResultsCalculationState,
} from "./SurveyResultsCalculation.types";

const WAITING = "Liczymy Twoje wyniki";
const NOT_SAVED =
  "Nie udało się zapisać Twoich odpowiedzi. Sprawdź połączenie i spróbuj ponownie.";
const NOT_READY =
  "Liczenie wyników trwa dłużej niż zwykle. Twoje odpowiedzi są zapisane. Spróbuj ponownie za chwilę.";
const NOT_SENT =
  "Nie udało się wysłać linku na Twój e-mail. Twoje wyniki są gotowe. Zapisz adres strony z wynikami, żeby móc do nich wrócić.";
const RETRY = "Spróbuj ponownie";
const SEE_RESULTS = "Zobacz wyniki";
const LINES = [
  "Prostujemy osie",
  "Liczymy, nie oceniamy",
  "Szukamy Twojej ćwiartki",
];
const STATES: SurveyResultsCalculationState[] = [
  "running",
  "failed-not-saved",
  "failed-not-ready",
  "link-not-sent",
];

const renderCard = (props: Partial<SurveyResultsCalculationProps> = {}) => {
  const onRetry = vi.fn();
  const onSeeResults = vi.fn();

  return {
    ...renderWithI18n(
      <SurveyResultsCalculation
        state="running"
        lines={LINES}
        onRetry={onRetry}
        onSeeResults={onSeeResults}
        {...props}
      />,
    ),
    onRetry,
    onSeeResults,
  };
};

const getRings = (container: HTMLElement) =>
  container.querySelector("[data-moving]");

describe("<SurveyResultsCalculation />", () => {
  describe("given running", () => {
    it("shows the lines in order, the last one as the current line", () => {
      renderCard();

      const lines = screen.getAllByRole("listitem");

      expect(lines.map((line) => line.textContent)).toEqual(LINES);
      expect(lines.map((line) => line.getAttribute("data-current"))).toEqual([
        "false",
        "false",
        "true",
      ]);
    });

    it('announces "Liczymy Twoje wyniki" once, and not the lines', () => {
      renderCard();

      const announcements = screen.getAllByRole("status");

      expect(announcements).toHaveLength(1);
      expect(announcements[0]).toHaveTextContent(WAITING);
      expect(announcements[0]).not.toContainElement(screen.getByRole("list"));
      expect(screen.getByRole("list")).not.toHaveAttribute("aria-live");
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it('shows "Pobierz" and "Pełne wyniki" disabled', () => {
      renderCard();

      expect(screen.getByRole("button", { name: "Pobierz" })).toBeDisabled();
      expect(
        screen.getByRole("button", { name: "Pełne wyniki" }),
      ).toBeDisabled();
    });

    it("shows no line and no message when there are no lines", () => {
      const { container } = renderCard({ lines: [] });

      expect(screen.queryByRole("list")).not.toBeInTheDocument();
      expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(getRings(container)).toHaveAttribute("data-moving", "true");
      expect(screen.getAllByRole("button")).toHaveLength(2);
    });

    it("moves the rings", () => {
      const { container } = renderCard();

      expect(getRings(container)).toHaveAttribute("data-moving", "true");
    });

    it("keeps a line that comes twice", () => {
      renderCard({ lines: ["Prostujemy osie", "Prostujemy osie"] });

      expect(screen.getAllByRole("listitem")).toHaveLength(2);
    });
  });

  describe("given failed-not-saved", () => {
    it('shows its message and "Spróbuj ponownie", and no line', () => {
      const { container } = renderCard({ state: "failed-not-saved" });
      const message = screen.getByRole("alert");

      expect(message).toHaveTextContent(NOT_SAVED);
      expect(
        within(message).getByRole("button", { name: RETRY }),
      ).toBeEnabled();
      expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
      expect(screen.queryByText(LINES[0])).not.toBeInTheDocument();
      expect(getRings(container)).toHaveAttribute("data-moving", "false");
    });

    it("no longer announces the wait", () => {
      renderCard({ state: "failed-not-saved" });

      expect(screen.getByRole("status")).toBeEmptyDOMElement();
    });

    it("calls onRetry when the button is pressed", () => {
      const { onRetry, onSeeResults } = renderCard({
        state: "failed-not-saved",
      });

      fireEvent.click(screen.getByRole("button", { name: RETRY }));

      expect(onRetry).toHaveBeenCalledTimes(1);
      expect(onSeeResults).not.toHaveBeenCalled();
    });
  });

  describe("given failed-not-ready", () => {
    it('shows its message and "Spróbuj ponownie"', () => {
      const { onRetry } = renderCard({ state: "failed-not-ready" });
      const message = screen.getByRole("alert");

      expect(message).toHaveTextContent(NOT_READY);
      expect(screen.queryByRole("listitem")).not.toBeInTheDocument();

      fireEvent.click(within(message).getByRole("button", { name: RETRY }));

      expect(onRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe("given link-not-sent", () => {
    it('shows the notice and "Zobacz wyniki", and no line', () => {
      const { container } = renderCard({ state: "link-not-sent" });
      const message = screen.getByRole("alert");

      expect(message).toHaveTextContent(NOT_SENT);
      expect(
        within(message).getByRole("button", { name: SEE_RESULTS }),
      ).toBeEnabled();
      expect(
        screen.queryByRole("button", { name: RETRY }),
      ).not.toBeInTheDocument();
      expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
      expect(getRings(container)).toHaveAttribute("data-moving", "false");
    });

    it("calls onSeeResults when the button is pressed", () => {
      const { onRetry, onSeeResults } = renderCard({ state: "link-not-sent" });

      fireEvent.click(screen.getByRole("button", { name: SEE_RESULTS }));

      expect(onSeeResults).toHaveBeenCalledTimes(1);
      expect(onRetry).not.toHaveBeenCalled();
    });
  });

  describe("when a failure follows a run", () => {
    it("moves the focus to the button of the message", () => {
      const { rerender, onRetry, onSeeResults } = renderCard();

      expect(document.body).toHaveFocus();

      rerender(
        <I18nProvider i18n={i18n}>
          <SurveyResultsCalculation
            state="failed-not-ready"
            lines={LINES}
            onRetry={onRetry}
            onSeeResults={onSeeResults}
          />
        </I18nProvider>,
      );

      expect(screen.getByRole("button", { name: RETRY })).toHaveFocus();
    });
  });

  describe("in every state", () => {
    it.each(
      STATES,
    )("keeps the two actions disabled, in the order of the frame: %s", (state) => {
      renderCard({ state });

      const actions = screen
        .getAllByRole("button")
        .filter((button) => button.closest("[role='alert']") === null);

      expect(actions.map((action) => action.textContent)).toEqual([
        "Pobierz",
        "Pełne wyniki",
      ]);

      for (const action of actions) {
        expect(action).toBeDisabled();
      }
    });
  });
});

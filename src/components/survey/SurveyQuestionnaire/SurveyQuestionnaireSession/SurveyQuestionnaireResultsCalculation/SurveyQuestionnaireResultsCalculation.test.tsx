import { i18n } from "@lingui/core";
import { act, fireEvent, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_LANGUAGE } from "@/constants/common";
import { SURVEY_SESSION_CONFIG } from "@/constants/survey";
import { createResult } from "@/services/api/client/createResult";
import { getResult } from "@/services/api/client/getResult";
import { requestResultLink } from "@/services/api/client/requestResultLink";
import {
  CreateResultOutcome,
  ResultLinkOutcome,
  type Survey,
  SurveyResultState,
  type SurveySession,
} from "@/types/survey";
import { buildResultInput } from "@/utils/survey/result/buildResultInput";
import { createStartedSession } from "@/utils/vitest/createStartedSession";
import { createSurvey } from "@/utils/vitest/createSurvey";
import { renderPhaseContent } from "@/utils/vitest/renderPhaseContent";
import { SURVEY_PHASE_CONTENT } from "../SurveyQuestionnaireSession.constants";
import { SurveyQuestionnaireResultsCalculation } from "./SurveyQuestionnaireResultsCalculation";
import {
  LINE_INTERVAL_MS,
  MIN_LINES,
  RESULTS_CALCULATION_POOL,
} from "./SurveyQuestionnaireResultsCalculation.constants";
import { getLoaderLines } from "./utils/getLoaderLines";

vi.mock("@/services/api/client/createResult");
vi.mock("@/services/api/client/getResult");
vi.mock("@/services/api/client/requestResultLink");

const TEST_LOCALE = "test";
const NOT_SAVED =
  "Nie udało się zapisać Twoich odpowiedzi. Sprawdź połączenie i spróbuj ponownie.";
const NOT_SENT =
  "Nie udało się wysłać linku na Twój e-mail. Twoje wyniki są gotowe. Zapisz adres strony z wynikami, żeby móc do nich wrócić.";
const POOL = [
  "Prostujemy osie",
  "Liczymy, nie oceniamy",
  "Szukamy Twojej ćwiartki",
  "Panowie, liczymy głosy",
  "Rozpoczynamy trzecie czytanie",
  "Przeliczamy jeszcze raz",
  "Liczymy, ale się cieszymy",
  "Sprawdzamy czy przekraczasz próg",
  "Dzielimy przez zero",
  "Rozdajemy 100 milionów",
  "Zaglądamy do teczek",
  "Kolorujemy wykresy",
  "Jesteśmy za, a nawet przeciw",
  "Czytamy programy partii",
  "Zgłaszamy wniosek formalny",
  "Obradujemy przy okrągłym stole",
  "Słuchamy wywiadów w telewizji",
];

const createResultMock = vi.mocked(createResult);
const getResultMock = vi.mocked(getResult);
const requestResultLinkMock = vi.mocked(requestResultLink);

// The stores live as long as the module does: a quiz of its own.
const createQuiz = (): Survey => createSurvey({ id: crypto.randomUUID() });

const toSession = (
  survey: Survey,
  overrides: Partial<SurveySession> = {},
): SurveySession => ({
  ...createStartedSession(survey, survey.questions.length),
  phase: "results-calculation",
  ...overrides,
});

const renderPhase = (
  overrides: Partial<SurveySession> = {},
  survey = createQuiz(),
) => {
  const session = toSession(survey, overrides);

  return {
    ...renderPhaseContent(
      SurveyQuestionnaireResultsCalculation,
      survey,
      session,
    ),
    survey,
    session,
    order: getLoaderLines(POOL, session.id),
  };
};

// Time passes one line at a time: the next line is timed only once the one
// before has arrived.
const passLines = async (count: number) => {
  for (let line = 0; line < count; line += 1) {
    await act(() => vi.advanceTimersByTimeAsync(LINE_INTERVAL_MS));
  }
};

const settle = () => act(() => vi.advanceTimersByTimeAsync(0));

const getLines = () =>
  screen.queryAllByRole("listitem").map((line) => line.textContent);

describe("<SurveyQuestionnaireResultsCalculation />", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    createResultMock.mockResolvedValue(CreateResultOutcome.Stored);
    getResultMock.mockResolvedValue({ id: "result", isCalculated: true });
    requestResultLinkMock.mockResolvedValue(ResultLinkOutcome.Accepted);
  });

  afterEach(() => {
    act(() => i18n.activate(DEFAULT_LANGUAGE));
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.resetAllMocks();
    sessionStorage.clear();
  });

  describe("given the pool", () => {
    it("holds the 17 lines, in the order of the frame", () => {
      expect(RESULTS_CALCULATION_POOL.map(({ message }) => message)).toEqual(
        POOL,
      );
    });
  });

  describe("when the phase appears", () => {
    it("shows the card with the lines of the session, in the language of the app", async () => {
      const { order } = renderPhase();

      expect(getLines()).toEqual([order[0]]);
      expect(screen.getByRole("status")).toHaveTextContent(
        "Liczymy Twoje wyniki",
      );
      expect(screen.getByRole("button", { name: "Pobierz" })).toBeDisabled();
      expect(
        screen.getByRole("button", { name: "Pełne wyniki" }),
      ).toBeDisabled();

      await passLines(2);

      expect(getLines()).toEqual(order.slice(0, 3));
      expect(
        screen
          .getAllByRole("listitem")
          .map((line) => line.getAttribute("data-current")),
      ).toEqual(["false", "false", "true"]);
    });

    it("shows the same pool in the same order through another catalogue", async () => {
      act(() => {
        i18n.load(
          TEST_LOCALE,
          Object.fromEntries(
            RESULTS_CALCULATION_POOL.map(({ id }, index) => [
              id,
              `Line ${index + 1}`,
            ]),
          ),
        );
        i18n.activate(TEST_LOCALE);
      });

      const { order } = renderPhase();
      const translated = order.map((line) => `Line ${POOL.indexOf(line) + 1}`);

      await passLines(2);

      expect(getLines()).toEqual(translated.slice(0, 3));
    });

    it("hands the session in at once, and sets the result state", async () => {
      createResultMock.mockReturnValue(new Promise(() => undefined));

      const { survey, session, getSession } = renderPhase();

      expect(createResultMock).toHaveBeenCalledTimes(1);
      expect(createResultMock.mock.calls[0][0]).toEqual(
        buildResultInput(survey, session),
      );
      expect(getSession().resultState).toBe(SurveyResultState.Sending);
    });

    it("starts clean from a result state left by an earlier visit of the phase", async () => {
      createResultMock.mockReturnValue(new Promise(() => undefined));

      const { getSession } = renderPhase({
        resultState: SurveyResultState.Failed,
      });

      expect(getSession().resultState).toBe(SurveyResultState.Sending);
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(getLines()).toHaveLength(1);
    });
  });

  describe("when the phase is mounted again for the same session", () => {
    it("shows the same lines for the same session after a remount", async () => {
      getResultMock.mockResolvedValue({ id: "result", isCalculated: false });

      const first = renderPhase();

      await passLines(3);

      const lines = getLines();

      expect(lines).toHaveLength(4);

      first.unmount();

      renderPhase({ id: first.session.id }, first.survey);

      // A run starts again from its first line, and hands in again.
      expect(getLines()).toEqual([lines[0]]);
      expect(createResultMock).toHaveBeenCalledTimes(2);

      await passLines(3);

      expect(getLines()).toEqual(lines);
    });
  });

  describe("when the result is calculated and the stay is over", () => {
    it("leaves through onLeave, once, and keeps the session stored", async () => {
      const { onLeave, getSession } = renderPhase();

      await passLines(MIN_LINES - 1);

      expect(onLeave).not.toHaveBeenCalled();

      await passLines(1);

      expect(onLeave).toHaveBeenCalledTimes(1);
      expect(getSession().phase).toBe("results-calculation");
      expect(getSession().resultState).toBe(SurveyResultState.Calculated);
    });
  });

  describe("when the hand-in fails", () => {
    it("shows the failure in place of the lines, and starts a new run on retry", async () => {
      createResultMock.mockResolvedValueOnce(CreateResultOutcome.Refused);

      const { order, onLeave, getSession } = renderPhase();

      await settle();

      expect(screen.getByRole("alert")).toHaveTextContent(NOT_SAVED);
      expect(getLines()).toEqual([]);
      expect(getSession().resultState).toBe(SurveyResultState.Failed);
      expect(
        screen.getByRole("button", { name: "Spróbuj ponownie" }),
      ).toHaveFocus();

      fireEvent.click(screen.getByRole("button", { name: "Spróbuj ponownie" }));

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(getLines()).toEqual([order[0]]);
      expect(createResultMock).toHaveBeenCalledTimes(2);

      await settle();

      expect(onLeave).toHaveBeenCalledTimes(1);
    });
  });

  describe("when the link could not be sent", () => {
    it('shows the notice, and leaves when "Zobacz wyniki" is pressed', async () => {
      vi.spyOn(
        SURVEY_SESSION_CONFIG,
        "isEmailSendingSetUp",
        "get",
      ).mockReturnValue(true);
      requestResultLinkMock.mockResolvedValue(ResultLinkOutcome.Unavailable);

      const { onLeave, getSession } = renderPhase({
        email: { address: "biuro@mypolitics.pl", hasConsent: true },
      });

      await passLines(MIN_LINES);

      expect(screen.getByRole("alert")).toHaveTextContent(NOT_SENT);
      expect(getLines()).toEqual([]);
      expect(onLeave).not.toHaveBeenCalled();
      expect(getSession().email).toBeNull();
      expect(
        screen.getByRole("button", { name: "Zobacz wyniki" }),
      ).toHaveFocus();

      fireEvent.click(screen.getByRole("button", { name: "Zobacz wyniki" }));
      fireEvent.click(screen.getByRole("button", { name: "Zobacz wyniki" }));

      expect(onLeave).toHaveBeenCalledTimes(1);
      expect(requestResultLinkMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("given the phases of the screen", () => {
    it("is registered for the results-calculation phase, and the stand-in is gone", () => {
      expect(SURVEY_PHASE_CONTENT["results-calculation"]).toBe(
        SurveyQuestionnaireResultsCalculation,
      );
      expect(
        Object.values(SURVEY_PHASE_CONTENT).map(({ name }) => name),
      ).not.toContain("SurveyQuestionnaireHandIn");
    });
  });
});

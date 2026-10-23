import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { act, fireEvent, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RESULT_READ_INTERVAL_MS, RESULT_WAIT_MS } from "@/constants/survey";
import { getResult } from "@/services/api/client/getResult";
import { getSurvey } from "@/services/api/client/getSurvey";
import {
  type ResultLoadResult,
  ResultLoadStatus,
  type SurveyLoadResult,
  SurveyLoadStatus,
} from "@/types/survey";
import {
  identityQuizResult,
  identityResultQuiz,
} from "@/utils/result-modules/identityQuizResult.fixtures";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";
import { createResultLoad } from "@/utils/vitest/survey/createResultLoad";
import { createSurvey } from "@/utils/vitest/survey/createSurvey";

import { ResultsScreen } from "./ResultsScreen";

vi.mock("@/services/api/client/getResult");
vi.mock("@/services/api/client/getSurvey");

// The Nolan chart stands in for a module that fails while it draws, in the
// one test that asks for it.
const nolanFailure = vi.hoisted(() => ({ isOn: false }));

vi.mock("@/components/results/NolanChart/NolanChart", async (importActual) => {
  const actual =
    await importActual<
      typeof import("@/components/results/NolanChart/NolanChart")
    >();

  return {
    NolanChart: (props: Parameters<typeof actual.NolanChart>[0]) => {
      if (nolanFailure.isOn) throw new Error("The map cannot be drawn");

      return actual.NolanChart(props);
    },
  };
});

const RESULT_ID = "3f0c2a52-6f7b-4d53-9a55-0d5f1b9f3c11";
const SURVEY_ID = identityResultQuiz.id;
const QUIZ_NAME = "myPolitics Quiz Tożsamościowy";
const LEADER = "Zielony postępowiec";
const RETRY = "Spróbuj ponownie";
const PARTIES_DESCRIPTION =
  "Te partie zazwyczaj wybierają osoby o poglądach podobnych do Twoich. W quizie tożsamościowym nie dopasowujemy partii do Twoich wyników według odpowiedzi. Zamiast tego najpierw określamy najbliższą tożsamość, a później to, jak ta tożsamość prawdopodobnie zagłosowałaby w wyborach.";

const PENDING = createResultLoad({ id: RESULT_ID, surveyId: SURVEY_ID });
const CALCULATED = createResultLoad({
  id: RESULT_ID,
  isCalculated: true,
  surveyId: SURVEY_ID,
  ...identityQuizResult,
});
const SURVEY_READY: SurveyLoadResult = {
  status: SurveyLoadStatus.Ready,
  survey: { ...identityResultQuiz, name: QUIZ_NAME },
};

const getResultMock = vi.mocked(getResult);
const getSurveyMock = vi.mocked(getSurvey);

const renderScreen = (resultId = RESULT_ID) =>
  renderWithI18n(<ResultsScreen resultId={resultId} />);

// Lets the requests that were answered reach the screen.
const settle = () => act(async () => undefined);

const pass = (milliseconds: number) =>
  act(() => vi.advanceTimersByTimeAsync(milliseconds));

const renderReady = async () => {
  const view = renderScreen();

  await settle();

  return view;
};

// A read of the result that the test answers by hand.
const holdResult = () => {
  let answer: (load: ResultLoadResult) => void = () => undefined;

  getResultMock.mockImplementationOnce(
    () =>
      new Promise<ResultLoadResult>((resolve) => {
        answer = resolve;
      }),
  );

  return (load: ResultLoadResult) => act(async () => answer(load));
};

const getHeading = (name: string) =>
  screen.getByRole("heading", { level: 1, name });

describe("<ResultsScreen />", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.title = "mypolitics";
    getResultMock.mockResolvedValue(CALCULATED);
    getSurveyMock.mockResolvedValue(SURVEY_READY);
  });

  afterEach(() => {
    nolanFailure.isOn = false;
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.resetAllMocks();
  });

  describe("when the address is opened", () => {
    it("asks for the result, and says that it is loading", async () => {
      const answer = holdResult();

      renderScreen();

      expect(getResultMock).toHaveBeenCalledTimes(1);
      expect(getResultMock).toHaveBeenCalledWith(RESULT_ID, {
        signal: expect.any(AbortSignal),
      });
      expect(screen.getByRole("status")).toHaveTextContent("Wczytujemy wynik…");
      expect(getSurveyMock).not.toHaveBeenCalled();

      await answer(CALCULATED);
    });
  });

  describe("given a calculated result", () => {
    it("asks for its survey, then draws the screen", async () => {
      await renderReady();

      expect(getSurveyMock).toHaveBeenCalledTimes(1);
      expect(getSurveyMock).toHaveBeenCalledWith(SURVEY_ID, "pl", {
        signal: expect.any(AbortSignal),
      });
      expect(getHeading(LEADER)).toBeInTheDocument();
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    it("stays loading while the survey is on the way", async () => {
      getSurveyMock.mockReturnValue(new Promise(() => undefined));

      await renderReady();

      expect(screen.getByRole("status")).toHaveTextContent("Wczytujemy wynik…");
    });
  });

  describe("given a result that exists and is not calculated yet", () => {
    it("asks for it again every second, loading all the while, and draws it once it is calculated", async () => {
      getResultMock
        .mockResolvedValueOnce(PENDING)
        .mockResolvedValueOnce(PENDING)
        .mockResolvedValueOnce(CALCULATED);

      await renderReady();

      expect(getResultMock).toHaveBeenCalledTimes(1);
      expect(screen.getByRole("status")).toHaveTextContent("Wczytujemy wynik…");

      await pass(RESULT_READ_INTERVAL_MS);

      expect(getResultMock).toHaveBeenCalledTimes(2);
      expect(screen.getByRole("status")).toBeInTheDocument();

      await pass(RESULT_READ_INTERVAL_MS);

      expect(getResultMock).toHaveBeenCalledTimes(3);
      expect(getHeading(LEADER)).toBeInTheDocument();
    });

    it("says that it is not ready after 30 seconds, with a retry", async () => {
      getResultMock.mockResolvedValue(PENDING);

      await renderReady();
      await pass(RESULT_WAIT_MS - 1);

      expect(screen.getByRole("status")).toBeInTheDocument();

      await pass(1);

      expect(getHeading("Wynik nie jest jeszcze gotowy")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: RETRY })).toBeEnabled();
      expect(getSurveyMock).not.toHaveBeenCalled();
    });
  });

  describe("given a result the API does not have", () => {
    it("says that it was not found, with no retry", async () => {
      getResultMock.mockResolvedValue({ status: ResultLoadStatus.NotFound });

      await renderReady();

      expect(getHeading("Nie znaleźliśmy takiego wyniku")).toBeInTheDocument();
      expect(
        screen.getByText("Sprawdź, czy adres jest pełny."),
      ).toBeInTheDocument();
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
  });

  describe("given an identifier that is not a result identifier in form", () => {
    it("says that it was not found, without asking the API", async () => {
      renderScreen("wyniki");
      await settle();

      expect(getHeading("Nie znaleźliśmy takiego wyniku")).toBeInTheDocument();
      expect(getResultMock).not.toHaveBeenCalled();
    });
  });

  describe("given a failure", () => {
    it.each([
      [
        "the result cannot be read",
        () =>
          getResultMock.mockResolvedValue({ status: ResultLoadStatus.Failed }),
      ],
      [
        "the survey of the result cannot be read",
        () =>
          getSurveyMock.mockResolvedValue({ status: SurveyLoadStatus.Failed }),
      ],
      [
        "the survey of the result is no longer public",
        () =>
          getSurveyMock.mockResolvedValue({
            status: SurveyLoadStatus.NotFound,
          }),
      ],
    ])("says that the result could not be loaded, with a retry: %s", async (_, fail) => {
      fail();

      await renderReady();

      expect(getHeading("Nie udało się wczytać wyniku")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: RETRY })).toBeEnabled();
    });
  });

  describe("when the retry is used", () => {
    it("starts loading again from the result, and draws it when it can be read", async () => {
      getResultMock.mockResolvedValueOnce({ status: ResultLoadStatus.Failed });

      await renderReady();

      const answer = holdResult();

      fireEvent.click(screen.getByRole("button", { name: RETRY }));

      expect(screen.getByRole("status")).toHaveTextContent("Wczytujemy wynik…");
      expect(getResultMock).toHaveBeenCalledTimes(2);
      expect(getSurveyMock).not.toHaveBeenCalled();

      await answer(CALCULATED);

      expect(getSurveyMock).toHaveBeenCalledTimes(1);
      expect(getHeading(LEADER)).toBeInTheDocument();
    });

    it("waits for the result again after it was not ready", async () => {
      getResultMock.mockResolvedValue(PENDING);

      await renderReady();
      await pass(RESULT_WAIT_MS);

      const reads = getResultMock.mock.calls.length;

      getResultMock.mockResolvedValue(CALCULATED);
      fireEvent.click(screen.getByRole("button", { name: RETRY }));
      await settle();

      expect(getResultMock).toHaveBeenCalledTimes(reads + 1);
      expect(getHeading(LEADER)).toBeInTheDocument();
    });
  });

  describe("given a quiz with no result modules", () => {
    it("says that the quiz has no result view yet, with nothing to press", async () => {
      getSurveyMock.mockResolvedValue({
        status: SurveyLoadStatus.Ready,
        survey: createSurvey({ id: SURVEY_ID }),
      });

      await renderReady();

      expect(
        getHeading("Ten quiz nie ma jeszcze widoku wyników"),
      ).toBeInTheDocument();
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
  });

  describe("given a ready result of the identity quiz", () => {
    it("names the leader in the header", async () => {
      await renderReady();

      expect(getHeading(LEADER)).toBeInTheDocument();
      expect(screen.getByText("100% pewności")).toBeInTheDocument();
      expect(screen.getByRole("tablist")).toBeInTheDocument();
    });

    it("draws each module of the list as a region named by its title", async () => {
      await renderReady();

      for (const name of ["Ideologie", "Partie", "Tożsamość"]) {
        expect(screen.getByRole("region", { name })).toBeInTheDocument();
      }

      expect(screen.getAllByRole("region")).toHaveLength(4);
    });

    it("stands them in two columns, in the order of the spec", async () => {
      await renderReady();

      const getColumn = (column: string) =>
        [...document.querySelectorAll(`[data-column="${column}"] section`)].map(
          (region) => region.getAttribute("aria-label"),
        );

      expect(getColumn("start")).toEqual(["Ideologie"]);
      expect(getColumn("end")).toEqual(["Tożsamość", "Lewicowy", "Partie"]);
    });

    it("shows the name of the quiz, and titles the document with it", async () => {
      await renderReady();

      expect(screen.getByText(QUIZ_NAME)).toBeVisible();
      expect(document.title).toBe(QUIZ_NAME);
    });

    it("gives the document its own title back when the screen is gone", async () => {
      const { unmount } = await renderReady();

      unmount();

      expect(document.title).toBe("mypolitics");
    });

    it("offers no statistics, and the info action only for the records with a description", async () => {
      await renderReady();

      expect(
        screen.queryByRole("button", { name: /^Statystyki/ }),
      ).not.toBeInTheDocument();
      expect(
        screen
          .getAllByRole("button", { name: /^Informacje/ })
          .map((button) => button.getAttribute("aria-label")),
      ).toEqual(["Informacje: Ideologie", "Informacje: Partie"]);
    });
  });

  describe("when the info action of a record with a description is used", () => {
    it("shows a dialog with the title and the description, and closing it returns focus to the action", async () => {
      await renderReady();

      const action = screen.getByRole("button", { name: "Informacje: Partie" });

      action.focus();
      fireEvent.click(action);

      const dialog = screen.getByRole("dialog", { name: "Partie" });

      expect(within(dialog).getByText(PARTIES_DESCRIPTION)).toBeVisible();
      expect(dialog).toContainElement(document.activeElement as HTMLElement);

      fireEvent.click(within(dialog).getByRole("button", { name: "Zamknij" }));

      expect(action).toHaveFocus();
    });
  });

  describe("given a module that throws while drawing", () => {
    it("does not draw that module, and keeps the rest of the screen", async () => {
      vi.spyOn(console, "error").mockImplementation(() => undefined);
      nolanFailure.isOn = true;

      await renderReady();

      expect(getHeading(LEADER)).toBeInTheDocument();
      expect(
        screen
          .getAllByRole("region")
          .map((region) => region.getAttribute("aria-label")),
      ).toEqual(["Ideologie", "Tożsamość", "Partie"]);
      expect(screen.getByText(QUIZ_NAME)).toBeVisible();
    });
  });

  describe("when the address changes to another result", () => {
    it("loads the other result, and shows nothing of the one before in the meantime", async () => {
      const { rerender } = await renderReady();
      const otherId = "0b9f3c1e-5a7d-4e2b-9c41-7f6a2d8e1b35";
      const answer = holdResult();

      rerender(
        <I18nProvider i18n={i18n}>
          <ResultsScreen resultId={otherId} />
        </I18nProvider>,
      );

      expect(screen.getByRole("status")).toHaveTextContent("Wczytujemy wynik…");
      expect(screen.queryByRole("heading", { name: LEADER })).toBeNull();
      expect(getResultMock).toHaveBeenLastCalledWith(otherId, {
        signal: expect.any(AbortSignal),
      });

      await answer({ status: ResultLoadStatus.NotFound });

      expect(getHeading("Nie znaleźliśmy takiego wyniku")).toBeInTheDocument();
    });
  });
});

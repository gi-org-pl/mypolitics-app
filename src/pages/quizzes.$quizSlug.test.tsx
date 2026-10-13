import { act, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_LANGUAGE } from "@/constants/common";
import { PATHS } from "@/constants/paths";
import { QUIZ_PROJECT_IDS } from "@/constants/survey";
import { createResult } from "@/services/api/client/createResult";
import { getLatestSurvey } from "@/services/api/client/getLatestSurvey";
import { getResult } from "@/services/api/client/getResult";
import {
  CreateResultOutcome,
  type SurveyLoadResult,
  SurveyLoadStatus,
} from "@/types/survey";
import { getSurveySessionStore } from "@/utils/survey/session/getSurveySessionStore";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";
import { createResultLoad } from "@/utils/vitest/survey/createResultLoad";
import { createStartedSession } from "@/utils/vitest/survey/createStartedSession";
import { createSurvey } from "@/utils/vitest/survey/createSurvey";

import QuizPage from "./quizzes.$quizSlug";

vi.mock("@/services/api/client/createResult");
vi.mock("@/services/api/client/getLatestSurvey");
vi.mock("@/services/api/client/getResult");

const NOT_FOUND_HEADING = /to jest błąd 404/i;
const PROMPT = "Wybierz 1 najważniejszy dla Ciebie temat.";
const RESULT_PAGE = "Strona wyniku";
// The stay of the loader: five lines, one every 1.2 seconds.
const LOADER_STAY_MS = 5 * 1200;

const getLatestSurveyMock = vi.mocked(getLatestSurvey);

// A reading that the test ends by hand.
const holdReading = () => {
  let finish: (result: SurveyLoadResult) => void = () => undefined;

  getLatestSurveyMock.mockImplementationOnce(
    () =>
      new Promise<SurveyLoadResult>((resolve) => {
        finish = resolve;
      }),
  );

  return (result: SurveyLoadResult) => act(async () => finish(result));
};

const renderPage = (address: string) => {
  const router = createMemoryRouter(
    [
      { path: "/quizzes/:quizSlug", element: <QuizPage /> },
      { path: "/results/:resultId", element: <p>{RESULT_PAGE}</p> },
    ],
    { initialEntries: [address] },
  );

  renderWithI18n(<RouterProvider router={router} />);

  return router;
};

describe("<QuizPage />", () => {
  beforeEach(() => {
    getLatestSurveyMock.mockResolvedValue({ status: SurveyLoadStatus.Failed });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
    sessionStorage.clear();
  });

  describe("given a slug that is not in the map", () => {
    it("shows the not-found page, and reads nothing", () => {
      renderPage("/quizzes/nie-ma-takiego-quizu");

      expect(
        screen.getByRole("heading", { level: 1, name: NOT_FOUND_HEADING }),
      ).toBeInTheDocument();
      expect(getLatestSurveyMock).not.toHaveBeenCalled();
    });
  });

  describe("given a known slug", () => {
    it("reads the quiz of the slug in the language of the app, once", async () => {
      const finish = holdReading();

      renderPage("/quizzes/mypolitics");

      expect(getLatestSurveyMock).toHaveBeenCalledTimes(1);
      expect(getLatestSurveyMock).toHaveBeenCalledWith(
        QUIZ_PROJECT_IDS.mypolitics,
        DEFAULT_LANGUAGE,
        { signal: expect.any(AbortSignal) },
      );

      await finish({ status: SurveyLoadStatus.Failed });

      expect(getLatestSurveyMock).toHaveBeenCalledTimes(1);
    });

    it("reads the quiz whatever the letter case of the slug, and leaves the address as typed", async () => {
      const finish = holdReading();
      const router = renderPage("/quizzes/Prezydencki2025");

      expect(getLatestSurveyMock).toHaveBeenCalledWith(
        QUIZ_PROJECT_IDS.prezydencki2025,
        DEFAULT_LANGUAGE,
        { signal: expect.any(AbortSignal) },
      );
      expect(router.state.location.pathname).toBe("/quizzes/Prezydencki2025");

      await finish({ status: SurveyLoadStatus.Failed });
    });

    it("shows the screen while the quiz loads", async () => {
      const finish = holdReading();

      renderPage("/quizzes/mypolitics");

      expect(screen.getByRole("status")).toHaveTextContent("Wczytywanie quizu");
      expect(
        screen.queryByRole("heading", { name: NOT_FOUND_HEADING }),
      ).not.toBeInTheDocument();

      await finish({ status: SurveyLoadStatus.Failed });
    });

    it("shows the screen when the quiz failed to load, and reads it again on retry", async () => {
      renderPage("/quizzes/mypolitics");

      const retryButton = await screen.findByRole("button", {
        name: "Spróbuj ponownie",
      });
      const finish = holdReading();

      act(() => retryButton.click());

      expect(screen.getByRole("status")).toHaveTextContent("Wczytywanie quizu");
      expect(getLatestSurveyMock).toHaveBeenCalledTimes(2);

      await finish({
        status: SurveyLoadStatus.Ready,
        survey: createSurvey({ id: crypto.randomUUID() }),
      });

      expect(screen.getByRole("group", { name: PROMPT })).toBeInTheDocument();
    });

    it("shows the screen when the quiz is ready", async () => {
      getLatestSurveyMock.mockResolvedValue({
        status: SurveyLoadStatus.Ready,
        survey: createSurvey({ id: crypto.randomUUID() }),
      });

      renderPage("/quizzes/mypolitics");

      expect(
        await screen.findByRole("group", { name: PROMPT }),
      ).toBeInTheDocument();
      expect(screen.getByText("Quiz testowy")).toBeVisible();
    });

    it("shows the not-found page when the quiz does not exist", async () => {
      getLatestSurveyMock.mockResolvedValue({
        status: SurveyLoadStatus.NotFound,
      });

      renderPage("/quizzes/mypolitics");

      expect(
        await screen.findByRole("heading", {
          level: 1,
          name: NOT_FOUND_HEADING,
        }),
      ).toBeInTheDocument();
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
  });

  describe("when the result of the taker is calculated", () => {
    it("opens the address of that result inside the app, as an ordinary step of the history", async () => {
      vi.useFakeTimers();
      vi.mocked(createResult).mockResolvedValue(CreateResultOutcome.Stored);
      vi.mocked(getResult).mockResolvedValue(
        createResultLoad({ isCalculated: true }),
      );

      const survey = createSurvey({ id: crypto.randomUUID() });
      const store = getSurveySessionStore(survey);

      store.setState(
        {
          ...createStartedSession(survey, survey.questions.length),
          phase: "results-calculation",
        },
        true,
      );

      const { id } = store.getState();

      getLatestSurveyMock.mockResolvedValue({
        status: SurveyLoadStatus.Ready,
        survey,
      });

      const router = renderPage("/quizzes/mypolitics");

      // The quiz is read first; the loader starts once it is there.
      await act(async () => undefined);

      expect(router.state.location.pathname).toBe("/quizzes/mypolitics");

      for (let elapsed = 0; elapsed < LOADER_STAY_MS; elapsed += 1200) {
        await act(() => vi.advanceTimersByTimeAsync(1200));
      }

      expect(router.state.location.pathname).toBe(PATHS.result(id));
      expect(router.state.location.pathname).toBe(`/results/${id}`);
      expect(router.state.historyAction).toBe("PUSH");
      expect(screen.getByText(RESULT_PAGE)).toBeInTheDocument();
    });
  });

  describe("when the address changes to another quiz", () => {
    it("reads the other quiz", async () => {
      const router = renderPage("/quizzes/mypolitics");

      await screen.findByRole("button", { name: "Spróbuj ponownie" });
      await act(() => router.navigate("/quizzes/prezydencki2025"));

      await waitFor(() =>
        expect(getLatestSurveyMock).toHaveBeenLastCalledWith(
          QUIZ_PROJECT_IDS.prezydencki2025,
          DEFAULT_LANGUAGE,
          { signal: expect.any(AbortSignal) },
        ),
      );
    });
  });
});

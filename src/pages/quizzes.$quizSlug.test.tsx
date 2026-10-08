import { act, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_LANGUAGE } from "@/constants/common";
import { QUIZ_SURVEY_IDS } from "@/constants/survey";
import { getSurvey } from "@/services/api/client/getSurvey";
import type { SurveyLoadResult } from "@/types/survey";
import { createSurvey } from "@/utils/vitest/createSurvey";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import QuizPage from "./quizzes.$quizSlug";

vi.mock("@/services/api/client/getSurvey");

const NOT_FOUND_HEADING = /to jest błąd 404/i;
const PROMPT = "Wybierz 1 najważniejszy dla Ciebie temat.";

const getSurveyMock = vi.mocked(getSurvey);

// A reading that the test ends by hand.
const holdReading = () => {
  let finish: (result: SurveyLoadResult) => void = () => undefined;

  getSurveyMock.mockImplementationOnce(
    () =>
      new Promise<SurveyLoadResult>((resolve) => {
        finish = resolve;
      }),
  );

  return (result: SurveyLoadResult) => act(async () => finish(result));
};

const renderPage = (address: string) => {
  const router = createMemoryRouter(
    [{ path: "/quizzes/:quizSlug", element: <QuizPage /> }],
    { initialEntries: [address] },
  );

  renderWithI18n(<RouterProvider router={router} />);

  return router;
};

describe("<QuizPage />", () => {
  beforeEach(() => {
    getSurveyMock.mockResolvedValue({ status: "failed" });
  });

  afterEach(() => {
    vi.resetAllMocks();
    sessionStorage.clear();
  });

  describe("given a slug that is not in the map", () => {
    it("shows the not-found page, and reads nothing", () => {
      renderPage("/quizzes/nie-ma-takiego-quizu");

      expect(
        screen.getByRole("heading", { level: 1, name: NOT_FOUND_HEADING }),
      ).toBeInTheDocument();
      expect(getSurveyMock).not.toHaveBeenCalled();
    });
  });

  describe("given a known slug", () => {
    it("reads the quiz of the slug in the language of the app, once", async () => {
      const finish = holdReading();

      renderPage("/quizzes/mypolitics");

      expect(getSurveyMock).toHaveBeenCalledTimes(1);
      expect(getSurveyMock).toHaveBeenCalledWith(
        QUIZ_SURVEY_IDS.mypolitics,
        DEFAULT_LANGUAGE,
        { signal: expect.any(AbortSignal) },
      );

      await finish({ status: "failed" });

      expect(getSurveyMock).toHaveBeenCalledTimes(1);
    });

    it("reads the quiz whatever the letter case of the slug, and leaves the address as typed", async () => {
      const finish = holdReading();
      const router = renderPage("/quizzes/Prezydencki2025");

      expect(getSurveyMock).toHaveBeenCalledWith(
        QUIZ_SURVEY_IDS.prezydencki2025,
        DEFAULT_LANGUAGE,
        { signal: expect.any(AbortSignal) },
      );
      expect(router.state.location.pathname).toBe("/quizzes/Prezydencki2025");

      await finish({ status: "failed" });
    });

    it("shows the screen while the quiz loads", async () => {
      const finish = holdReading();

      renderPage("/quizzes/mypolitics");

      expect(screen.getByRole("status")).toHaveTextContent("Wczytywanie quizu");
      expect(
        screen.queryByRole("heading", { name: NOT_FOUND_HEADING }),
      ).not.toBeInTheDocument();

      await finish({ status: "failed" });
    });

    it("shows the screen when the quiz failed to load, and reads it again on retry", async () => {
      renderPage("/quizzes/mypolitics");

      const retryButton = await screen.findByRole("button", {
        name: "Spróbuj ponownie",
      });
      const finish = holdReading();

      act(() => retryButton.click());

      expect(screen.getByRole("status")).toHaveTextContent("Wczytywanie quizu");
      expect(getSurveyMock).toHaveBeenCalledTimes(2);

      await finish({
        status: "ready",
        survey: createSurvey({ id: crypto.randomUUID() }),
      });

      expect(screen.getByRole("group", { name: PROMPT })).toBeInTheDocument();
    });

    it("shows the screen when the quiz is ready", async () => {
      getSurveyMock.mockResolvedValue({
        status: "ready",
        survey: createSurvey({ id: crypto.randomUUID() }),
      });

      renderPage("/quizzes/mypolitics");

      expect(
        await screen.findByRole("group", { name: PROMPT }),
      ).toBeInTheDocument();
      expect(screen.getByText("Quiz testowy")).toBeVisible();
    });

    it("shows the not-found page when the quiz does not exist", async () => {
      getSurveyMock.mockResolvedValue({ status: "not-found" });

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

  describe("when the address changes to another quiz", () => {
    it("reads the other quiz", async () => {
      const router = renderPage("/quizzes/mypolitics");

      await screen.findByRole("button", { name: "Spróbuj ponownie" });
      await act(() => router.navigate("/quizzes/prezydencki2025"));

      await waitFor(() =>
        expect(getSurveyMock).toHaveBeenLastCalledWith(
          QUIZ_SURVEY_IDS.prezydencki2025,
          DEFAULT_LANGUAGE,
          { signal: expect.any(AbortSignal) },
        ),
      );
    });
  });
});

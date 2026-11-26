import { act, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getResult } from "@/services/api/client/getResult";
import { getSurvey } from "@/services/api/client/getSurvey";
import { ResultLoadStatus, SurveyLoadStatus } from "@/types/survey";
import {
  identityQuizResult,
  identityResultQuiz,
} from "@/utils/result-modules/identityQuizResult.fixtures";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";
import { createResultLoad } from "@/utils/vitest/survey/createResultLoad";

import ResultsPage, { meta } from "./results.$resultId";

vi.mock("@/services/api/client/getResult");
vi.mock("@/services/api/client/getSurvey");

const RESULT_ID = "3f0c2a52-6f7b-4d53-9a55-0d5f1b9f3c11";
const OTHER_RESULT_ID = "0b9f3c1e-5a7d-4e2b-9c41-7f6a2d8e1b35";

const getResultMock = vi.mocked(getResult);
const getSurveyMock = vi.mocked(getSurvey);

const renderPage = (address: string) => {
  const router = createMemoryRouter(
    [{ path: "/results/:resultId", element: <ResultsPage /> }],
    { initialEntries: [address] },
  );

  renderWithI18n(<RouterProvider router={router} />);

  return router;
};

describe("<ResultsPage />", () => {
  beforeEach(() => {
    getResultMock.mockResolvedValue(
      createResultLoad({
        id: RESULT_ID,
        isCalculated: true,
        surveyId: identityResultQuiz.id,
        ...identityQuizResult,
      }),
    );
    getSurveyMock.mockResolvedValue({
      status: SurveyLoadStatus.Ready,
      survey: identityResultQuiz,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("given the address of a result", () => {
    it("reads the result the address names", async () => {
      renderPage(`/results/${RESULT_ID}`);

      expect(getResultMock).toHaveBeenCalledWith(RESULT_ID, {
        signal: expect.any(AbortSignal),
      });

      await screen.findByRole("heading", { level: 1 });
    });

    it("shows the screen of that result", async () => {
      renderPage(`/results/${RESULT_ID}`);

      expect(
        await screen.findByRole("heading", {
          level: 1,
          name: "Zielony postępowiec",
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("region", { name: "Ideologie" }),
      ).toBeInTheDocument();
    });

    it("titles the document with the name of the quiz once it is known", async () => {
      document.title = "mypolitics";

      renderPage(`/results/${RESULT_ID}`);

      expect(document.title).toBe("mypolitics");

      // The title is set by an effect, which React may run a task after the
      // heading is drawn, so the test waits for the title itself.
      await waitFor(() => expect(document.title).toBe(identityResultQuiz.name));
    });
  });

  describe("given an address that names no result", () => {
    it("says that the result was not found, without asking the API", async () => {
      renderPage("/results/wyniki");

      expect(
        await screen.findByRole("heading", {
          level: 1,
          name: "Nie znaleźliśmy takiego wyniku",
        }),
      ).toBeInTheDocument();
      expect(getResultMock).not.toHaveBeenCalled();
    });
  });

  describe("when the address changes to another result", () => {
    it("reads the other result", async () => {
      const router = renderPage(`/results/${RESULT_ID}`);

      await screen.findByRole("heading", { level: 1 });

      getResultMock.mockResolvedValue({ status: ResultLoadStatus.NotFound });
      await act(() => router.navigate(`/results/${OTHER_RESULT_ID}`));

      expect(getResultMock).toHaveBeenLastCalledWith(OTHER_RESULT_ID, {
        signal: expect.any(AbortSignal),
      });
      expect(
        await screen.findByRole("heading", {
          level: 1,
          name: "Nie znaleźliśmy takiego wyniku",
        }),
      ).toBeInTheDocument();
    });
  });

  describe("meta", () => {
    it("asks search engines not to index the address", () => {
      expect(meta()).toEqual([{ name: "robots", content: "noindex" }]);
    });
  });
});

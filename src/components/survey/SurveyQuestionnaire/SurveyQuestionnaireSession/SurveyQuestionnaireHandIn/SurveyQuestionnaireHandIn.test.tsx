import { act, fireEvent, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createResult } from "@/services/api/client/createResult";
import {
  CreateResultOutcome,
  type Survey,
  SurveyResultState,
} from "@/types/survey";
import { buildResultInput } from "@/utils/survey/result/buildResultInput";
import { createStartedSession } from "@/utils/vitest/createStartedSession";
import { createSurvey } from "@/utils/vitest/createSurvey";
import { renderPhaseContent } from "@/utils/vitest/renderPhaseContent";

import { SurveyQuestionnaireHandIn } from "./SurveyQuestionnaireHandIn";

vi.mock("@/services/api/client/createResult");

const WAITING = "Liczymy Twoje wyniki";
const FAILURE =
  "Nie udało się zapisać Twoich odpowiedzi. Sprawdź połączenie i spróbuj ponownie.";

const createResultMock = vi.mocked(createResult);

// A request that the test ends by hand.
const holdRequest = () => {
  let finish: (outcome: CreateResultOutcome) => void = () => undefined;

  createResultMock.mockImplementationOnce(
    () =>
      new Promise<CreateResultOutcome>((resolve) => {
        finish = resolve;
      }),
  );

  return (outcome: CreateResultOutcome) => act(async () => finish(outcome));
};

const renderPhase = () => {
  // The stores live as long as the module does: a quiz of its own.
  const survey: Survey = createSurvey({ id: crypto.randomUUID() });
  const session = {
    ...createStartedSession(survey, survey.questions.length),
    phase: "results-calculation" as const,
  };

  return {
    ...renderPhaseContent(SurveyQuestionnaireHandIn, survey, session),
    input: buildResultInput(survey, session),
  };
};

const getRetryButton = () =>
  screen.getByRole("button", { name: "Spróbuj ponownie" });

describe("<SurveyQuestionnaireHandIn />", () => {
  beforeEach(() => {
    createResultMock.mockResolvedValue(CreateResultOutcome.Stored);
  });

  afterEach(() => {
    vi.resetAllMocks();
    sessionStorage.clear();
  });

  describe("when the phase opens", () => {
    it('shows and announces "Liczymy Twoje wyniki", with nothing to press', () => {
      const finish = holdRequest();

      renderPhase();

      expect(screen.getByRole("status")).toHaveTextContent(WAITING);
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();

      return finish(CreateResultOutcome.Stored);
    });

    it("sends the hand-in of the session once", () => {
      const finish = holdRequest();
      const { input } = renderPhase();

      expect(createResultMock).toHaveBeenCalledTimes(1);
      expect(createResultMock).toHaveBeenCalledWith(input, {
        signal: expect.any(AbortSignal),
      });

      return finish(CreateResultOutcome.Stored);
    });

    it("sets the result state to sending", () => {
      const finish = holdRequest();
      const { getSession } = renderPhase();

      expect(getSession().resultState).toBe(SurveyResultState.Sending);

      return finish(CreateResultOutcome.Stored);
    });
  });

  describe("given a stored result", () => {
    it("sets the result state to created and leaves, still showing the waiting line", async () => {
      const finish = holdRequest();
      const { getSession, onLeave } = renderPhase();

      await finish(CreateResultOutcome.Stored);

      expect(getSession().resultState).toBe(SurveyResultState.Created);
      expect(onLeave).toHaveBeenCalledTimes(1);
      expect(screen.getByRole("status")).toHaveTextContent(WAITING);
    });
  });

  describe.each([
    CreateResultOutcome.Refused,
    CreateResultOutcome.Unreachable,
  ] satisfies CreateResultOutcome[])("given a hand-in that is %s", (outcome) => {
    it("sets the result state to failed", async () => {
      const finish = holdRequest();
      const { getSession, onLeave } = renderPhase();

      await finish(outcome);

      expect(getSession().resultState).toBe(SurveyResultState.Failed);
      expect(onLeave).not.toHaveBeenCalled();
    });

    it("shows the message and the retry button, and announces them", async () => {
      const finish = holdRequest();

      renderPhase();
      await finish(outcome);

      expect(screen.getByRole("alert")).toHaveTextContent(FAILURE);
      expect(screen.getByRole("alert")).toContainElement(getRetryButton());
      expect(screen.queryByText(WAITING)).not.toBeInTheDocument();
    });
  });

  describe("when retry is pressed", () => {
    it("shows the waiting state and sends the same hand-in again", async () => {
      const finishFirst = holdRequest();
      const { input, getSession, onLeave } = renderPhase();

      await finishFirst(CreateResultOutcome.Unreachable);

      const finishSecond = holdRequest();

      fireEvent.click(getRetryButton());

      expect(screen.getByRole("status")).toHaveTextContent(WAITING);
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(getSession().resultState).toBe(SurveyResultState.Sending);
      expect(createResultMock).toHaveBeenCalledTimes(2);
      expect(createResultMock.mock.calls[1][0]).toEqual(input);

      await finishSecond(CreateResultOutcome.Stored);

      expect(onLeave).toHaveBeenCalledTimes(1);
    });

    it("sends one request when pressed twice", async () => {
      const finishFirst = holdRequest();

      renderPhase();
      await finishFirst(CreateResultOutcome.Refused);

      const finishSecond = holdRequest();
      const retryButton = getRetryButton();

      fireEvent.click(retryButton);
      fireEvent.click(retryButton);

      expect(createResultMock).toHaveBeenCalledTimes(2);

      await finishSecond(CreateResultOutcome.Stored);
    });
  });

  describe("when unmounted while the request is on its way", () => {
    it("cancels it and ignores its outcome", async () => {
      const finish = holdRequest();
      const { unmount, getSession, onLeave } = renderPhase();
      const signal = createResultMock.mock.calls[0][1]?.signal;

      unmount();

      expect(signal?.aborted).toBe(true);

      await finish(CreateResultOutcome.Stored);

      expect(getSession().resultState).toBe(SurveyResultState.Sending);
      expect(onLeave).not.toHaveBeenCalled();
    });
  });
});

import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SURVEY_SESSION_CONFIG } from "@/constants/survey";
import { createResult } from "@/services/api/client/createResult";
import { getResult } from "@/services/api/client/getResult";
import { requestResultLink } from "@/services/api/client/requestResultLink";
import type {
  ResultLinkOutcome,
  Survey,
  SurveyEmail,
  SurveyResult,
  SurveySession,
} from "@/types/survey";
import { getSessionStorageKey } from "@/utils/survey/session/getSessionStorageKey";
import { getSurveySessionStore } from "@/utils/survey/session/getSurveySessionStore";
import { useSurveySession } from "@/utils/survey/session/useSurveySession";
import { createStartedSession } from "@/utils/vitest/createStartedSession";
import { createSurvey } from "@/utils/vitest/createSurvey";

import {
  LINE_INTERVAL_MS,
  MAX_LINES,
  MIN_LINES,
  RESULT_READ_INTERVAL_MS,
  RESULT_WAIT_MS,
  RESULTS_CALCULATION_POOL,
} from "../SurveyQuestionnaireResultsCalculation.constants";
import { getLoaderLines } from "./getLoaderLines";
import { useResultsCalculation } from "./useResultsCalculation";

vi.mock("@/services/api/client/createResult");
vi.mock("@/services/api/client/getResult");
vi.mock("@/services/api/client/requestResultLink");

const EMAIL: SurveyEmail = {
  address: "biuro@mypolitics.pl",
  hasConsent: false,
};
const MIN_STAY_MS = MIN_LINES * LINE_INTERVAL_MS;

const createResultMock = vi.mocked(createResult);
const getResultMock = vi.mocked(getResult);
const requestResultLinkMock = vi.mocked(requestResultLink);

const toResult = (isCalculated: boolean): SurveyResult => ({
  id: "result",
  isCalculated,
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider i18n={i18n}>{children}</I18nProvider>
);

// Time passes one line at a time: the next line is timed only once the one
// before has arrived.
const pass = async (milliseconds: number) => {
  for (let left = milliseconds; left > 0; left -= LINE_INTERVAL_MS) {
    await act(() =>
      vi.advanceTimersByTimeAsync(Math.min(left, LINE_INTERVAL_MS)),
    );
  }
};

const settle = () => act(() => vi.advanceTimersByTimeAsync(0));

// A link request that the test answers by hand.
const holdLinkRequest = () => {
  let answer: (outcome: ResultLinkOutcome) => void = () => undefined;

  requestResultLinkMock.mockImplementationOnce(
    () =>
      new Promise<ResultLinkOutcome>((resolve) => {
        answer = resolve;
      }),
  );

  return (outcome: ResultLinkOutcome) =>
    act(async () => {
      answer(outcome);
      await vi.advanceTimersByTimeAsync(0);
    });
};

const renderCalculation = (email: SurveyEmail | null = null) => {
  // The stores live as long as the module does: a quiz of its own.
  const survey: Survey = createSurvey({ id: crypto.randomUUID() });
  const session: SurveySession = {
    ...createStartedSession(survey, survey.questions.length),
    phase: "results-calculation",
    email,
  };
  const store = getSurveySessionStore(survey);
  const lock = vi.fn();
  const onLeave = vi.fn();
  const leave = vi.fn();

  store.setState(session, true);

  const view = renderHook(
    () =>
      useResultsCalculation({
        survey,
        session: { ...useSurveySession(survey), leave },
        lock,
        onLeave,
      }),
    { wrapper },
  );

  return {
    ...view,
    survey,
    session,
    onLeave,
    leave,
    getSession: store.getState,
  };
};

describe("useResultsCalculation()", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(
      SURVEY_SESSION_CONFIG,
      "isEmailSendingSetUp",
      "get",
    ).mockReturnValue(true);
    createResultMock.mockResolvedValue("stored");
    getResultMock.mockResolvedValue(toResult(true));
    requestResultLinkMock.mockResolvedValue("accepted");
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.resetAllMocks();
    sessionStorage.clear();
  });

  describe("when the phase appears", () => {
    it("starts a run when the phase appears", async () => {
      createResultMock.mockReturnValue(new Promise(() => undefined));

      const { result, session, getSession } = renderCalculation();
      const order = getLoaderLines(
        RESULTS_CALCULATION_POOL.map((line) => i18n._(line)),
        session.id,
      );

      // The first line and the hand-in start together: the line does not wait.
      expect(result.current.state).toBe("running");
      expect(result.current.lines).toEqual([order[0]]);
      expect(createResultMock).toHaveBeenCalledTimes(1);
      expect(getSession().resultState).toBe("sending");

      await pass(LINE_INTERVAL_MS * 2);

      expect(result.current.lines).toEqual(order.slice(0, 3));
    });

    it("holds the eighth line until the result is there", async () => {
      getResultMock.mockResolvedValue(toResult(false));

      const { result, onLeave } = renderCalculation();

      await pass(LINE_INTERVAL_MS * (MAX_LINES + 4));

      expect(result.current.state).toBe("running");
      expect(result.current.lines).toHaveLength(MAX_LINES);
      expect(onLeave).not.toHaveBeenCalled();

      getResultMock.mockResolvedValue(toResult(true));
      await pass(RESULT_READ_INTERVAL_MS);

      expect(onLeave).toHaveBeenCalledTimes(1);
    });
  });

  describe("when the run is ready", () => {
    it("leaves once when the run is ready and no notice is due", async () => {
      const { result, onLeave, getSession } = renderCalculation();

      await pass(MIN_STAY_MS);

      expect(onLeave).toHaveBeenCalledTimes(1);
      expect(result.current.state).toBe("running");
      expect(getSession().resultState).toBe("calculated");

      await pass(RESULT_WAIT_MS);

      expect(onLeave).toHaveBeenCalledTimes(1);
      expect(requestResultLinkMock).not.toHaveBeenCalled();
    });

    it("does not leave before the minimum stay, however fast the result is", async () => {
      const { result, onLeave, getSession } = renderCalculation();

      await pass(MIN_STAY_MS - 1);

      expect(getSession().resultState).toBe("calculated");
      expect(result.current.state).toBe("running");
      expect(result.current.lines).toHaveLength(MIN_LINES);
      expect(onLeave).not.toHaveBeenCalled();

      await pass(1);

      expect(onLeave).toHaveBeenCalledTimes(1);
    });

    it("leaves the moment the result is there when the stay is already over", async () => {
      getResultMock.mockResolvedValue(toResult(false));

      const { onLeave } = renderCalculation();

      await pass(MIN_STAY_MS + LINE_INTERVAL_MS);

      expect(onLeave).not.toHaveBeenCalled();

      getResultMock.mockResolvedValue(toResult(true));
      await pass(RESULT_READ_INTERVAL_MS);

      expect(onLeave).toHaveBeenCalledTimes(1);
    });
  });

  describe("given an e-mail in the session", () => {
    it("requests the link after the result is stored, never before", async () => {
      let finishHandIn: () => void = () => undefined;

      createResultMock.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            finishHandIn = () => resolve("stored");
          }),
      );

      const { session, getSession } = renderCalculation(EMAIL);

      await pass(LINE_INTERVAL_MS);

      expect(requestResultLinkMock).not.toHaveBeenCalled();
      expect(getSession().email).toEqual(EMAIL);

      finishHandIn();
      await settle();

      expect(requestResultLinkMock).toHaveBeenCalledTimes(1);
      expect(requestResultLinkMock).toHaveBeenCalledWith({
        email: EMAIL.address,
        resultId: session.id,
        marketingConsent: false,
        language: "pl",
      });
      expect(getSession().email).toBeNull();
      expect(JSON.stringify(createResultMock.mock.calls)).not.toContain(
        "biuro",
      );
    });

    it("waits for a pending link request before leaving", async () => {
      const answer = holdLinkRequest();
      const { result, onLeave } = renderCalculation(EMAIL);

      await pass(MIN_STAY_MS + LINE_INTERVAL_MS);

      expect(result.current.state).toBe("running");
      expect(onLeave).not.toHaveBeenCalled();

      await answer("accepted");

      expect(onLeave).toHaveBeenCalledTimes(1);
      expect(result.current.state).toBe("running");
    });

    it("shows the notice instead of leaving when the link was not sent", async () => {
      requestResultLinkMock.mockResolvedValue("unavailable");

      const { result, onLeave, getSession } = renderCalculation(EMAIL);

      await pass(MIN_STAY_MS - 1);

      // Not before the run is ready to leave.
      expect(result.current.state).toBe("running");

      await pass(1);

      expect(result.current.state).toBe("link-not-sent");
      expect(onLeave).not.toHaveBeenCalled();
      // The notice turns reset on for nobody: nothing failed.
      expect(getSession().resultState).toBe("calculated");

      // It does not time out, and does not leave by itself.
      await pass(RESULT_WAIT_MS * 2);

      expect(result.current.state).toBe("link-not-sent");
      expect(onLeave).not.toHaveBeenCalled();
      expect(requestResultLinkMock).toHaveBeenCalledTimes(1);
    });

    it('leaves when "Zobacz wyniki" is pressed, once when pressed twice', async () => {
      requestResultLinkMock.mockResolvedValue("limited");

      const { result, onLeave } = renderCalculation(EMAIL);

      await pass(MIN_STAY_MS);

      act(() => result.current.onSeeResults());
      act(() => result.current.onSeeResults());

      expect(onLeave).toHaveBeenCalledTimes(1);
    });
  });

  describe("given a run that failed", () => {
    it("shows the failure and does not leave", async () => {
      createResultMock.mockResolvedValue("refused");

      const { result, onLeave, getSession } = renderCalculation();

      await settle();

      expect(result.current.state).toBe("failed-not-saved");
      expect(getSession().resultState).toBe("failed");

      await pass(RESULT_WAIT_MS);

      expect(result.current.state).toBe("failed-not-saved");
      expect(onLeave).not.toHaveBeenCalled();
    });

    it("shows that the result is not ready in time", async () => {
      getResultMock.mockResolvedValue(toResult(false));

      const { result, onLeave } = renderCalculation();

      await pass(RESULT_WAIT_MS);

      expect(result.current.state).toBe("failed-not-ready");
      expect(onLeave).not.toHaveBeenCalled();
    });

    it("starts one new run when retry is pressed twice", async () => {
      createResultMock.mockResolvedValueOnce("refused");

      const { result, session, getSession } = renderCalculation();
      const order = getLoaderLines(
        RESULTS_CALCULATION_POOL.map((line) => i18n._(line)),
        session.id,
      );

      await pass(LINE_INTERVAL_MS * 2);

      expect(result.current.state).toBe("failed-not-saved");

      createResultMock.mockReturnValue(new Promise(() => undefined));
      act(() => result.current.onRetry());
      act(() => result.current.onRetry());

      // The message goes, the first line of the same order is back, and the
      // hand-in is sent once more.
      expect(result.current.state).toBe("running");
      expect(result.current.lines).toEqual([order[0]]);
      expect(createResultMock).toHaveBeenCalledTimes(2);
      expect(createResultMock.mock.calls[1][0]).toBe(
        createResultMock.mock.calls[0][0],
      );
      expect(getSession().resultState).toBe("sending");
    });

    it("ignores retry while a run is under way", async () => {
      createResultMock.mockReturnValue(new Promise(() => undefined));

      const { result } = renderCalculation();

      act(() => result.current.onRetry());
      await pass(LINE_INTERVAL_MS);

      expect(createResultMock).toHaveBeenCalledTimes(1);
      expect(result.current.lines).toHaveLength(2);
    });

    it("leaves as soon as the result is calculated on a run that follows a failure", async () => {
      createResultMock.mockResolvedValueOnce("refused");

      const { result, onLeave } = renderCalculation();

      await settle();

      expect(result.current.state).toBe("failed-not-saved");

      act(() => result.current.onRetry());
      await settle();

      // No minimum stay is owed: the first line is all the run shows.
      expect(onLeave).toHaveBeenCalledTimes(1);
      expect(result.current.lines).toHaveLength(1);
    });

    it("fails again the same way, with no limit on retries", async () => {
      createResultMock.mockResolvedValue("refused");

      const { result, onLeave } = renderCalculation();

      await settle();

      for (let retry = 1; retry <= 3; retry += 1) {
        act(() => result.current.onRetry());

        expect(result.current.state).toBe("running");

        await settle();

        expect(result.current.state).toBe("failed-not-saved");
        expect(createResultMock).toHaveBeenCalledTimes(retry + 1);
      }

      expect(onLeave).not.toHaveBeenCalled();
    });

    it("shows the notice after a failed run and a retry, when the link was not sent", async () => {
      requestResultLinkMock.mockResolvedValue("unavailable");
      getResultMock.mockResolvedValue(toResult(false));

      const { result, onLeave } = renderCalculation(EMAIL);

      await pass(RESULT_WAIT_MS);

      // The failure is shown first.
      expect(result.current.state).toBe("failed-not-ready");
      expect(requestResultLinkMock).toHaveBeenCalledTimes(1);

      getResultMock.mockResolvedValue(toResult(true));
      act(() => result.current.onRetry());
      await settle();

      expect(result.current.state).toBe("link-not-sent");
      expect(onLeave).not.toHaveBeenCalled();
      // One session asks for one link at most.
      expect(requestResultLinkMock).toHaveBeenCalledTimes(1);

      act(() => result.current.onSeeResults());

      expect(onLeave).toHaveBeenCalledTimes(1);
    });

    it("keeps the e-mail for the run that stores the result", async () => {
      createResultMock.mockResolvedValueOnce("refused");

      const { result, onLeave, getSession } = renderCalculation(EMAIL);

      await settle();

      expect(requestResultLinkMock).not.toHaveBeenCalled();
      expect(getSession().email).toEqual(EMAIL);

      act(() => result.current.onRetry());
      await settle();

      expect(requestResultLinkMock).toHaveBeenCalledTimes(1);
      expect(getSession().email).toBeNull();
      expect(onLeave).toHaveBeenCalledTimes(1);
    });
  });

  describe("in every run", () => {
    it("never calls leave of the session itself", async () => {
      createResultMock.mockResolvedValueOnce("refused");

      const { result, survey, leave, onLeave } = renderCalculation();
      const storageKey = getSessionStorageKey(survey.id);

      await settle();
      act(() => result.current.onRetry());
      await pass(MIN_STAY_MS);

      expect(onLeave).toHaveBeenCalledTimes(1);
      expect(leave).not.toHaveBeenCalled();
      // The stored session is still there: removing it is `onLeave`'s.
      expect(sessionStorage.getItem(storageKey)).not.toBeNull();
    });
  });

  describe("when unmounted during a run", () => {
    it("leaves no timer running and does not leave", async () => {
      getResultMock.mockResolvedValue(toResult(false));

      const { unmount, onLeave } = renderCalculation();

      await pass(LINE_INTERVAL_MS);
      unmount();

      expect(vi.getTimerCount()).toBe(0);

      await pass(RESULT_WAIT_MS);

      expect(onLeave).not.toHaveBeenCalled();
    });
  });
});

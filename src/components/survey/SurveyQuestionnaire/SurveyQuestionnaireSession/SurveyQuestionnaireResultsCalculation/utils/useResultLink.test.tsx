import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_LANGUAGE } from "@/constants/common";
import { SURVEY_SESSION_CONFIG } from "@/constants/survey";
import { requestResultLink } from "@/services/api/client/requestResultLink";
import {
  ResultLinkOutcome,
  type Survey,
  type SurveyEmail,
  type SurveySession,
} from "@/types/survey";
import { getSessionStorageKey } from "@/utils/survey/session/getSessionStorageKey";
import { getSurveySessionStore } from "@/utils/survey/session/getSurveySessionStore";
import { useSurveySession } from "@/utils/survey/session/useSurveySession";
import { createStartedSession } from "@/utils/vitest/createStartedSession";
import { createSurvey } from "@/utils/vitest/createSurvey";
import {
  HandInState,
  ResultLinkState,
} from "../SurveyQuestionnaireResultsCalculation.types";
import { useResultLink } from "./useResultLink";

vi.mock("@/services/api/client/requestResultLink");

const EMAIL: SurveyEmail = { address: "biuro@mypolitics.pl", hasConsent: true };

const requestResultLinkMock = vi.mocked(requestResultLink);

const wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider i18n={i18n}>{children}</I18nProvider>
);

// A request that the test answers by hand.
const holdRequest = () => {
  let answer: (outcome: ResultLinkOutcome) => void = () => undefined;

  requestResultLinkMock.mockImplementationOnce(
    () =>
      new Promise<ResultLinkOutcome>((resolve) => {
        answer = resolve;
      }),
  );

  return (outcome: ResultLinkOutcome) => act(async () => answer(outcome));
};

const finishRequests = () => act(async () => undefined);

const renderLink = (
  email: SurveyEmail | null = EMAIL,
  firstHandIn: HandInState = HandInState.Sending,
) => {
  // The stores live as long as the module does: a quiz of its own.
  const survey: Survey = createSurvey({ id: crypto.randomUUID() });
  const session: SurveySession = {
    ...createStartedSession(survey, survey.questions.length),
    phase: "results-calculation",
    email,
  };
  const store = getSurveySessionStore(survey);

  store.setState(session, true);

  const view = renderHook(
    ({ handIn }) => useResultLink(useSurveySession(survey), handIn),
    { wrapper, initialProps: { handIn: firstHandIn } },
  );

  return { ...view, survey, session, getSession: store.getState };
};

describe("useResultLink()", () => {
  beforeEach(() => {
    vi.spyOn(
      SURVEY_SESSION_CONFIG,
      "isEmailSendingSetUp",
      "get",
    ).mockReturnValue(true);
    requestResultLinkMock.mockResolvedValue(ResultLinkOutcome.Accepted);
  });

  afterEach(() => {
    act(() => i18n.activate(DEFAULT_LANGUAGE));
    vi.restoreAllMocks();
    vi.resetAllMocks();
    sessionStorage.clear();
  });

  describe("given a result that is not stored yet", () => {
    it("asks for nothing before the result is stored", () => {
      const { result, getSession } = renderLink();

      expect(result.current).toBe(ResultLinkState.None);
      expect(requestResultLinkMock).not.toHaveBeenCalled();
      expect(getSession().email).toEqual(EMAIL);
    });
  });

  describe("given a session with no e-mail", () => {
    it("asks for nothing when the session holds no e-mail", async () => {
      const { result, rerender } = renderLink(null);

      rerender({ handIn: HandInState.Created });
      rerender({ handIn: HandInState.Calculated });
      await finishRequests();

      expect(result.current).toBe(ResultLinkState.None);
      expect(requestResultLinkMock).not.toHaveBeenCalled();
    });
  });

  describe("given sending that is not set up", () => {
    it("asks for nothing when sending is not set up, and reports no link", async () => {
      vi.spyOn(
        SURVEY_SESSION_CONFIG,
        "isEmailSendingSetUp",
        "get",
      ).mockReturnValue(false);

      const { result, rerender, getSession } = renderLink();

      rerender({ handIn: HandInState.Created });
      rerender({ handIn: HandInState.Calculated });
      await finishRequests();

      expect(result.current).toBe(ResultLinkState.None);
      expect(requestResultLinkMock).not.toHaveBeenCalled();
      expect(getSession().email).toEqual(EMAIL);
    });
  });

  describe("given a stored result and an e-mail", () => {
    it("requests the link once, with the input of the session", async () => {
      const answer = holdRequest();
      const { rerender, session } = renderLink();

      rerender({ handIn: HandInState.Created });
      rerender({ handIn: HandInState.Created });
      rerender({ handIn: HandInState.Calculated });

      expect(requestResultLinkMock).toHaveBeenCalledTimes(1);
      expect(requestResultLinkMock).toHaveBeenCalledWith({
        email: EMAIL.address,
        resultId: session.id,
        marketingConsent: true,
        language: "pl",
      });

      await answer(ResultLinkOutcome.Accepted);

      expect(requestResultLinkMock).toHaveBeenCalledTimes(1);
    });

    it("asks in English when the app runs in English", async () => {
      const { rerender } = renderLink();

      act(() => {
        i18n.load("en", {});
        i18n.activate("en");
      });
      rerender({ handIn: HandInState.Created });
      await finishRequests();

      expect(requestResultLinkMock).toHaveBeenCalledTimes(1);
      expect(requestResultLinkMock.mock.calls[0][0].language).toBe("en");
    });

    it("asks as soon as the result is stored, also when the first thing heard is that it is calculated", async () => {
      const { result, rerender } = renderLink();

      rerender({ handIn: HandInState.Calculated });
      await finishRequests();

      expect(requestResultLinkMock).toHaveBeenCalledTimes(1);
      expect(result.current).toBe(ResultLinkState.Accepted);
    });

    it("takes the e-mail out of the session when the request is made", async () => {
      const answer = holdRequest();
      const { rerender, getSession, survey } = renderLink();

      expect(getSession().email).toEqual(EMAIL);

      rerender({ handIn: HandInState.Created });

      expect(getSession().email).toBeNull();
      expect(
        sessionStorage.getItem(getSessionStorageKey(survey.id)),
      ).not.toContain("biuro");

      await answer(ResultLinkOutcome.Accepted);

      expect(getSession().email).toBeNull();
    });

    it("is pending until the call resolves", async () => {
      const answer = holdRequest();
      const { result, rerender } = renderLink();

      rerender({ handIn: HandInState.Created });

      expect(result.current).toBe(ResultLinkState.Pending);

      rerender({ handIn: HandInState.Calculated });

      expect(result.current).toBe(ResultLinkState.Pending);

      await answer(ResultLinkOutcome.Accepted);

      expect(result.current).not.toBe(ResultLinkState.Pending);
    });

    it("is accepted when the endpoint accepts", async () => {
      const { result, rerender } = renderLink();

      rerender({ handIn: HandInState.Created });
      await finishRequests();

      expect(result.current).toBe(ResultLinkState.Accepted);
    });

    it.each([
      ResultLinkOutcome.Invalid,
      ResultLinkOutcome.Limited,
      ResultLinkOutcome.Unavailable,
    ] satisfies ResultLinkOutcome[])("is not-sent for invalid, limited and unavailable: %s", async (outcome) => {
      requestResultLinkMock.mockResolvedValue(outcome);

      const { result, rerender } = renderLink();

      rerender({ handIn: HandInState.Created });
      await finishRequests();

      expect(result.current).toBe(ResultLinkState.NotSent);
      expect(requestResultLinkMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("when another run starts after the link was requested", () => {
    it("makes no second request and keeps what the first one ended with", async () => {
      requestResultLinkMock.mockResolvedValue(ResultLinkOutcome.Unavailable);

      const { result, rerender } = renderLink();

      rerender({ handIn: HandInState.Created });
      await finishRequests();
      rerender({ handIn: HandInState.NotReady });

      expect(result.current).toBe(ResultLinkState.NotSent);

      rerender({ handIn: HandInState.Sending });
      rerender({ handIn: HandInState.Created });
      rerender({ handIn: HandInState.Calculated });
      await finishRequests();

      expect(requestResultLinkMock).toHaveBeenCalledTimes(1);
      expect(result.current).toBe(ResultLinkState.NotSent);
    });
  });

  describe("when the hand-in failed", () => {
    it("makes no request and leaves the e-mail in the session", async () => {
      const { result, rerender, getSession } = renderLink();

      rerender({ handIn: HandInState.NotSaved });
      await finishRequests();

      expect(result.current).toBe(ResultLinkState.None);
      expect(requestResultLinkMock).not.toHaveBeenCalled();
      expect(getSession().email).toEqual(EMAIL);
    });

    it("asks in the run that stores the result", async () => {
      const { result, rerender, getSession } = renderLink();

      rerender({ handIn: HandInState.NotSaved });
      rerender({ handIn: HandInState.Sending });
      rerender({ handIn: HandInState.Created });
      await finishRequests();

      expect(requestResultLinkMock).toHaveBeenCalledTimes(1);
      expect(result.current).toBe(ResultLinkState.Accepted);
      expect(getSession().email).toBeNull();
    });
  });

  describe("when unmounted while the request is on its way", () => {
    it("does not cancel it", async () => {
      const answer = holdRequest();
      const { rerender, unmount, getSession } = renderLink();

      rerender({ handIn: HandInState.Created });
      unmount();

      // The call was handed nothing to cancel it with.
      expect(requestResultLinkMock.mock.calls[0]).toHaveLength(1);

      await answer(ResultLinkOutcome.Accepted);

      expect(requestResultLinkMock).toHaveBeenCalledTimes(1);
      expect(getSession().email).toBeNull();
    });
  });

  describe("when mounted again after the link was requested", () => {
    it("finds no address and asks for nothing", async () => {
      const first = renderLink();

      first.rerender({ handIn: HandInState.Created });
      await finishRequests();
      first.unmount();

      const initialProps: { handIn: HandInState } = {
        handIn: HandInState.Sending,
      };
      const second = renderHook(
        ({ handIn }) => useResultLink(useSurveySession(first.survey), handIn),
        { wrapper, initialProps },
      );

      second.rerender({ handIn: HandInState.Created });
      await finishRequests();

      expect(second.result.current).toBe(ResultLinkState.None);
      expect(requestResultLinkMock).toHaveBeenCalledTimes(1);
    });
  });
});

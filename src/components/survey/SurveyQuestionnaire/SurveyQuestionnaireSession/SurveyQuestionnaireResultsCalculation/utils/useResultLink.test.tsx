import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_LANGUAGE } from "@/constants/common";
import { SURVEY_SESSION_CONFIG } from "@/constants/survey";
import { requestResultLink } from "@/services/api/client/requestResultLink";
import type {
  ResultLinkOutcome,
  Survey,
  SurveyEmail,
  SurveySession,
} from "@/types/survey";
import { getSessionStorageKey } from "@/utils/survey/getSessionStorageKey";
import { getSurveySessionStore } from "@/utils/survey/getSurveySessionStore";
import { useSurveySession } from "@/utils/survey/useSurveySession";
import { createStartedSession } from "@/utils/vitest/createStartedSession";
import { createSurvey } from "@/utils/vitest/createSurvey";

import type { HandInState } from "../SurveyQuestionnaireResultsCalculation.types";
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
  firstHandIn: HandInState = "sending",
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
    requestResultLinkMock.mockResolvedValue("accepted");
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

      expect(result.current).toBe("none");
      expect(requestResultLinkMock).not.toHaveBeenCalled();
      expect(getSession().email).toEqual(EMAIL);
    });
  });

  describe("given a session with no e-mail", () => {
    it("asks for nothing when the session holds no e-mail", async () => {
      const { result, rerender } = renderLink(null);

      rerender({ handIn: "created" });
      rerender({ handIn: "calculated" });
      await finishRequests();

      expect(result.current).toBe("none");
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

      rerender({ handIn: "created" });
      rerender({ handIn: "calculated" });
      await finishRequests();

      expect(result.current).toBe("none");
      expect(requestResultLinkMock).not.toHaveBeenCalled();
      expect(getSession().email).toEqual(EMAIL);
    });
  });

  describe("given a stored result and an e-mail", () => {
    it("requests the link once, with the input of the session", async () => {
      const answer = holdRequest();
      const { rerender, session } = renderLink();

      rerender({ handIn: "created" });
      rerender({ handIn: "created" });
      rerender({ handIn: "calculated" });

      expect(requestResultLinkMock).toHaveBeenCalledTimes(1);
      expect(requestResultLinkMock).toHaveBeenCalledWith({
        email: EMAIL.address,
        resultId: session.id,
        marketingConsent: true,
        language: "pl",
      });

      await answer("accepted");

      expect(requestResultLinkMock).toHaveBeenCalledTimes(1);
    });

    it("asks in English when the app runs in English", async () => {
      const { rerender } = renderLink();

      act(() => {
        i18n.load("en", {});
        i18n.activate("en");
      });
      rerender({ handIn: "created" });
      await finishRequests();

      expect(requestResultLinkMock).toHaveBeenCalledTimes(1);
      expect(requestResultLinkMock.mock.calls[0][0].language).toBe("en");
    });

    it("asks as soon as the result is stored, also when the first thing heard is that it is calculated", async () => {
      const { result, rerender } = renderLink();

      rerender({ handIn: "calculated" });
      await finishRequests();

      expect(requestResultLinkMock).toHaveBeenCalledTimes(1);
      expect(result.current).toBe("accepted");
    });

    it("takes the e-mail out of the session when the request is made", async () => {
      const answer = holdRequest();
      const { rerender, getSession, survey } = renderLink();

      expect(getSession().email).toEqual(EMAIL);

      rerender({ handIn: "created" });

      expect(getSession().email).toBeNull();
      expect(
        sessionStorage.getItem(getSessionStorageKey(survey.id)),
      ).not.toContain("biuro");

      await answer("accepted");

      expect(getSession().email).toBeNull();
    });

    it("is pending until the call resolves", async () => {
      const answer = holdRequest();
      const { result, rerender } = renderLink();

      rerender({ handIn: "created" });

      expect(result.current).toBe("pending");

      rerender({ handIn: "calculated" });

      expect(result.current).toBe("pending");

      await answer("accepted");

      expect(result.current).not.toBe("pending");
    });

    it("is accepted when the endpoint accepts", async () => {
      const { result, rerender } = renderLink();

      rerender({ handIn: "created" });
      await finishRequests();

      expect(result.current).toBe("accepted");
    });

    it.each([
      "invalid",
      "limited",
      "unavailable",
    ] satisfies ResultLinkOutcome[])("is not-sent for invalid, limited and unavailable: %s", async (outcome) => {
      requestResultLinkMock.mockResolvedValue(outcome);

      const { result, rerender } = renderLink();

      rerender({ handIn: "created" });
      await finishRequests();

      expect(result.current).toBe("not-sent");
      expect(requestResultLinkMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("when another run starts after the link was requested", () => {
    it("makes no second request and keeps what the first one ended with", async () => {
      requestResultLinkMock.mockResolvedValue("unavailable");

      const { result, rerender } = renderLink();

      rerender({ handIn: "created" });
      await finishRequests();
      rerender({ handIn: "not-ready" });

      expect(result.current).toBe("not-sent");

      rerender({ handIn: "sending" });
      rerender({ handIn: "created" });
      rerender({ handIn: "calculated" });
      await finishRequests();

      expect(requestResultLinkMock).toHaveBeenCalledTimes(1);
      expect(result.current).toBe("not-sent");
    });
  });

  describe("when the hand-in failed", () => {
    it("makes no request and leaves the e-mail in the session", async () => {
      const { result, rerender, getSession } = renderLink();

      rerender({ handIn: "not-saved" });
      await finishRequests();

      expect(result.current).toBe("none");
      expect(requestResultLinkMock).not.toHaveBeenCalled();
      expect(getSession().email).toEqual(EMAIL);
    });

    it("asks in the run that stores the result", async () => {
      const { result, rerender, getSession } = renderLink();

      rerender({ handIn: "not-saved" });
      rerender({ handIn: "sending" });
      rerender({ handIn: "created" });
      await finishRequests();

      expect(requestResultLinkMock).toHaveBeenCalledTimes(1);
      expect(result.current).toBe("accepted");
      expect(getSession().email).toBeNull();
    });
  });

  describe("when unmounted while the request is on its way", () => {
    it("does not cancel it", async () => {
      const answer = holdRequest();
      const { rerender, unmount, getSession } = renderLink();

      rerender({ handIn: "created" });
      unmount();

      // The call was handed nothing to cancel it with.
      expect(requestResultLinkMock.mock.calls[0]).toHaveLength(1);

      await answer("accepted");

      expect(requestResultLinkMock).toHaveBeenCalledTimes(1);
      expect(getSession().email).toBeNull();
    });
  });

  describe("when mounted again after the link was requested", () => {
    it("finds no address and asks for nothing", async () => {
      const first = renderLink();

      first.rerender({ handIn: "created" });
      await finishRequests();
      first.unmount();

      const second = renderHook(
        ({ handIn }: { handIn: HandInState }) =>
          useResultLink(useSurveySession(first.survey), handIn),
        { wrapper, initialProps: { handIn: "sending" } },
      );

      second.rerender({ handIn: "created" });
      await finishRequests();

      expect(second.result.current).toBe("none");
      expect(requestResultLinkMock).toHaveBeenCalledTimes(1);
    });
  });
});

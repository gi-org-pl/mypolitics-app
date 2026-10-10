import { describe, expect, it } from "vitest";

import { SurveyResultState, type SurveySession } from "@/types/survey";
import { leaveSessionDemographics } from "@/utils/survey/demographics/leaveSessionDemographics";
import { createStartedSession } from "@/utils/vitest/survey/createStartedSession";
import { createSurvey } from "@/utils/vitest/survey/createSurvey";
import { leaveSessionEmailCapture } from "./leaveSessionEmailCapture";
import { setSessionEmail } from "./setSessionEmail";

const EMAIL = { address: "jan@example.com", hasConsent: true };

describe("leaveSessionEmailCapture()", () => {
  const survey = createSurvey();
  const onDemographics = createStartedSession(survey, 5);
  const onEmail = leaveSessionDemographics(survey, onDemographics, false, {
    isEmailSendingSetUp: true,
  });
  const withEmail = setSessionEmail(survey, onEmail, EMAIL);

  describe('when the card is left with "Wyślij i zobacz wyniki"', () => {
    it("keeps the e-mail when it is given", () => {
      const session = leaveSessionEmailCapture(survey, withEmail, true);

      expect(session).toEqual({ ...withEmail, phase: "results-calculation" });
      expect(session.email).toEqual(EMAIL);
    });

    it('treats "given" with no e-mail held as skipped', () => {
      const session = leaveSessionEmailCapture(survey, onEmail, true);

      expect(session.phase).toBe("results-calculation");
      expect(session.email).toBeNull();
    });
  });

  describe('when the card is left with "Pomiń"', () => {
    it("drops the e-mail when it is skipped", () => {
      const session = leaveSessionEmailCapture(survey, withEmail, false);

      expect(session.phase).toBe("results-calculation");
      expect(session.email).toBeNull();
    });
  });

  describe("when results calculation starts", () => {
    it("sets the result state to not-sent", () => {
      const stale: SurveySession = {
        ...withEmail,
        resultState: SurveyResultState.Failed,
      };

      expect(leaveSessionEmailCapture(survey, stale, true).resultState).toBe(
        SurveyResultState.NotSent,
      );
      expect(leaveSessionEmailCapture(survey, stale, false).resultState).toBe(
        SurveyResultState.NotSent,
      );
    });
  });

  describe("when the session is anywhere else", () => {
    it("changes nothing", () => {
      const calculating = leaveSessionEmailCapture(survey, withEmail, true);

      expect(leaveSessionEmailCapture(survey, onDemographics, true)).toBe(
        onDemographics,
      );
      expect(leaveSessionEmailCapture(survey, calculating, false)).toBe(
        calculating,
      );
    });
  });
});

import { describe, expect, it } from "vitest";

import {
  type DemographicsValues,
  SurveyResultState,
  type SurveySession,
} from "@/types/survey";
import { createStartedSession } from "@/utils/vitest/createStartedSession";
import { createSurvey } from "@/utils/vitest/createSurvey";

import { leaveSessionDemographics } from "./leaveSessionDemographics";
import { setSessionDemographics } from "./setSessionDemographics";
import { setSessionEmail } from "./setSessionEmail";
import { stepBack } from "./stepBack";

const EMAIL_ON = { isEmailSendingSetUp: true };
const EMAIL_OFF = { isEmailSendingSetUp: false };

const COMPLETE: DemographicsValues = {
  age: "42",
  gender: "female",
  residenceAreaSize: "village",
  education: "higher",
};

describe("leaveSessionDemographics()", () => {
  const survey = createSurvey();
  const onDemographics = createStartedSession(survey, 5);
  const withValues = (values: DemographicsValues): SurveySession =>
    setSessionDemographics(survey, onDemographics, values);

  describe('when the card is left with "Zobacz wyniki"', () => {
    it("does not give demographics with fewer than four fields", () => {
      const empty = onDemographics;
      const partial = withValues({ ...COMPLETE, education: undefined });

      expect(leaveSessionDemographics(survey, empty, true, EMAIL_ON)).toBe(
        empty,
      );
      expect(leaveSessionDemographics(survey, partial, true, EMAIL_ON)).toBe(
        partial,
      );
    });

    it("marks them given and moves on", () => {
      const complete = withValues(COMPLETE);
      const session = leaveSessionDemographics(
        survey,
        complete,
        true,
        EMAIL_OFF,
      );

      expect(session.areDemographicsGiven).toBe(true);
      expect(session.demographics).toEqual(COMPLETE);
      expect(session.phase).toBe("results-calculation");
    });
  });

  describe('when the card is left with "Pomiń"', () => {
    it("marks them not given on skip and keeps the picked values", () => {
      const session = leaveSessionDemographics(
        survey,
        withValues(COMPLETE),
        false,
        EMAIL_OFF,
      );

      expect(session.areDemographicsGiven).toBe(false);
      expect(session.demographics).toEqual(COMPLETE);
      expect(session.phase).toBe("results-calculation");
    });

    it("works with nothing picked and with some fields picked", () => {
      const partial = withValues({ age: "30" });

      expect(
        leaveSessionDemographics(survey, onDemographics, false, EMAIL_OFF)
          .phase,
      ).toBe("results-calculation");
      expect(
        leaveSessionDemographics(survey, partial, false, EMAIL_OFF),
      ).toEqual({ ...partial, phase: "results-calculation" });
    });

    it("decides again when the taker came back from the e-mail card", () => {
      const given = leaveSessionDemographics(
        survey,
        withValues(COMPLETE),
        true,
        EMAIL_ON,
      );
      const session = leaveSessionDemographics(
        survey,
        stepBack(survey, given),
        false,
        EMAIL_ON,
      );

      expect(given.areDemographicsGiven).toBe(true);
      expect(session.areDemographicsGiven).toBe(false);
      expect(session.phase).toBe("email-capture");
    });
  });

  describe("when e-mail capture is part of the session", () => {
    it("moves to e-mail capture when it is part of the session", () => {
      const adult = withValues(COMPLETE);
      const eighteen = withValues({ ...COMPLETE, age: "18" });

      expect(
        leaveSessionDemographics(survey, adult, true, EMAIL_ON).phase,
      ).toBe("email-capture");
      expect(
        leaveSessionDemographics(survey, eighteen, false, EMAIL_ON).phase,
      ).toBe("email-capture");
      expect(
        leaveSessionDemographics(survey, onDemographics, false, EMAIL_ON).phase,
      ).toBe("email-capture");
    });

    it("keeps an e-mail that was held, for the card the taker returns to", () => {
      const onEmail = setSessionEmail(
        survey,
        leaveSessionDemographics(survey, withValues(COMPLETE), true, EMAIL_ON),
        { address: "jan@example.com", hasConsent: false },
      );
      const session = leaveSessionDemographics(
        survey,
        stepBack(survey, onEmail),
        true,
        EMAIL_ON,
      );

      expect(session.phase).toBe("email-capture");
      expect(session.email).toEqual({
        address: "jan@example.com",
        hasConsent: false,
      });
    });
  });

  describe("when e-mail capture is not part of the session", () => {
    it("moves to results calculation otherwise, and drops a held e-mail", () => {
      const onEmail = setSessionEmail(
        survey,
        leaveSessionDemographics(survey, withValues(COMPLETE), true, EMAIL_ON),
        { address: "jan@example.com", hasConsent: true },
      );
      const minor = setSessionDemographics(survey, stepBack(survey, onEmail), {
        ...COMPLETE,
        age: "17",
      });
      const given = leaveSessionDemographics(survey, minor, true, EMAIL_ON);
      const skipped = leaveSessionDemographics(survey, minor, false, EMAIL_ON);

      expect(minor.email).toEqual({
        address: "jan@example.com",
        hasConsent: true,
      });
      expect(given.phase).toBe("results-calculation");
      expect(given.email).toBeNull();
      expect(skipped.phase).toBe("results-calculation");
      expect(skipped.email).toBeNull();
    });

    it("moves to results calculation while sending is not set up", () => {
      expect(
        leaveSessionDemographics(survey, withValues(COMPLETE), true, EMAIL_OFF)
          .phase,
      ).toBe("results-calculation");
    });

    it("sets the result state to not-sent on entering results calculation", () => {
      const stale: SurveySession = {
        ...withValues(COMPLETE),
        resultState: SurveyResultState.Failed,
      };

      expect(
        leaveSessionDemographics(survey, stale, true, EMAIL_OFF).resultState,
      ).toBe(SurveyResultState.NotSent);
      expect(
        leaveSessionDemographics(survey, stale, false, EMAIL_OFF).resultState,
      ).toBe(SurveyResultState.NotSent);
    });
  });

  describe("when no setting is passed", () => {
    it("follows the setting of the app, where sending is not set up", () => {
      expect(
        leaveSessionDemographics(survey, withValues(COMPLETE), true).phase,
      ).toBe("results-calculation");
    });
  });

  describe("when the session is anywhere else", () => {
    it("changes nothing outside demographics", () => {
      const onQuestions = createStartedSession(survey, 2);
      const calculating = leaveSessionDemographics(
        survey,
        onDemographics,
        false,
        EMAIL_OFF,
      );

      expect(leaveSessionDemographics(survey, onQuestions, false)).toBe(
        onQuestions,
      );
      expect(leaveSessionDemographics(survey, calculating, false)).toBe(
        calculating,
      );
    });
  });
});

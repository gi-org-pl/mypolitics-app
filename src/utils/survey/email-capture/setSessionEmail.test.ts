import { describe, expect, it } from "vitest";
import { leaveSessionDemographics } from "@/utils/survey/demographics/leaveSessionDemographics";
import { createStartedSession } from "@/utils/vitest/createStartedSession";
import { createSurvey } from "@/utils/vitest/createSurvey";
import { leaveSessionEmailCapture } from "./leaveSessionEmailCapture";
import { setSessionEmail } from "./setSessionEmail";

const EMAIL = { address: "jan@example.com", hasConsent: true };

describe("setSessionEmail()", () => {
  const survey = createSurvey();
  const onDemographics = createStartedSession(survey, 5);
  const onEmail = leaveSessionDemographics(survey, onDemographics, false, {
    isEmailSendingSetUp: true,
  });

  describe("when the session is on e-mail capture", () => {
    it("holds the address and the consent", () => {
      const session = setSessionEmail(survey, onEmail, EMAIL);

      expect(session).toEqual({ ...onEmail, email: EMAIL });
    });

    it("holds an address without consent", () => {
      const email = { address: "jan@example.com", hasConsent: false };

      expect(setSessionEmail(survey, onEmail, email).email).toEqual(email);
    });

    it("drops them when handed nothing", () => {
      const held = setSessionEmail(survey, onEmail, EMAIL);

      expect(setSessionEmail(survey, held, null).email).toBeNull();
    });
  });

  describe("when the session is in results calculation", () => {
    it("drops the e-mail once the request that follows the result is done", () => {
      const calculating = leaveSessionEmailCapture(
        survey,
        setSessionEmail(survey, onEmail, EMAIL),
        true,
      );

      expect(calculating.email).toEqual(EMAIL);
      expect(setSessionEmail(survey, calculating, null).email).toBeNull();
    });
  });

  describe("when the session is anywhere else", () => {
    it("changes nothing", () => {
      const onQuestions = createStartedSession(survey, 2);

      expect(setSessionEmail(survey, onQuestions, EMAIL)).toBe(onQuestions);
      expect(setSessionEmail(survey, onDemographics, EMAIL)).toBe(
        onDemographics,
      );
    });
  });
});

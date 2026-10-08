import { describe, expect, it } from "vitest";

import { SURVEY_PHASES } from "@/constants/survey";
import type { SurveySession } from "@/types/survey";
import { createStartedSession } from "@/utils/vitest/createStartedSession";
import { createSurvey } from "@/utils/vitest/createSurvey";
import { createSurveyCategory } from "@/utils/vitest/createSurveyCategory";

import { createSession } from "./createSession";
import { isPhaseInSession } from "./isPhaseInSession";
import { leaveSessionDemographics } from "./leaveSessionDemographics";
import { setSessionDemographics } from "./setSessionDemographics";
import { turnSessionCheckpointsOff } from "./turnSessionCheckpointsOff";

const EMAIL_ON = { isEmailSendingSetUp: true };
const EMAIL_OFF = { isEmailSendingSetUp: false };

describe("isPhaseInSession()", () => {
  const survey = createSurvey();
  const session = createSession(survey);
  const withAge = (age?: string): SurveySession =>
    setSessionDemographics(survey, createStartedSession(survey, 5), { age });

  describe("given the category select phase", () => {
    it("has category-select only with two or more visible categories", () => {
      const withOne = createSurvey({
        categories: [
          createSurveyCategory("only"),
          createSurveyCategory("hidden", { isHidden: true }),
        ],
      });
      const withNone = createSurvey({ categories: [] });

      expect(
        isPhaseInSession("category-select", survey, session, EMAIL_OFF),
      ).toBe(true);
      expect(
        isPhaseInSession(
          "category-select",
          withOne,
          createSession(withOne),
          EMAIL_OFF,
        ),
      ).toBe(false);
      expect(
        isPhaseInSession(
          "category-select",
          withNone,
          createSession(withNone),
          EMAIL_OFF,
        ),
      ).toBe(false);
    });
  });

  describe("given a phase every session has", () => {
    it("always has questions, demographics and results-calculation", () => {
      const bare = createSurvey({ categories: [] });
      const optedOut = turnSessionCheckpointsOff(bare, createSession(bare));

      for (const phase of [
        "questions",
        "demographics",
        "results-calculation",
      ] as const) {
        expect(isPhaseInSession(phase, survey, session, EMAIL_ON)).toBe(true);
        expect(isPhaseInSession(phase, bare, optedOut, EMAIL_OFF)).toBe(true);
      }
    });
  });

  describe("given the checkpoints phase", () => {
    it("has checkpoints until they are turned off", () => {
      expect(isPhaseInSession("checkpoints", survey, session, EMAIL_OFF)).toBe(
        true,
      );
      expect(
        isPhaseInSession(
          "checkpoints",
          survey,
          turnSessionCheckpointsOff(survey, session),
          EMAIL_OFF,
        ),
      ).toBe(false);
    });
  });

  describe("given the e-mail capture phase", () => {
    it("has no email-capture while sending is not set up", () => {
      expect(
        isPhaseInSession("email-capture", survey, session, EMAIL_OFF),
      ).toBe(false);
      expect(
        isPhaseInSession("email-capture", survey, withAge("30"), EMAIL_OFF),
      ).toBe(false);
    });

    it("has no email-capture for an age under 18, whichever way demographics was left", () => {
      const minor = setSessionDemographics(
        survey,
        createStartedSession(survey, 5),
        {
          age: "17",
          gender: "female",
          residenceAreaSize: "village",
          education: "primary",
        },
      );
      const given = leaveSessionDemographics(survey, minor, true, EMAIL_ON);
      const skipped = leaveSessionDemographics(survey, minor, false, EMAIL_ON);

      expect(given.areDemographicsGiven).toBe(true);
      expect(skipped.areDemographicsGiven).toBe(false);
      expect(isPhaseInSession("email-capture", survey, given, EMAIL_ON)).toBe(
        false,
      );
      expect(isPhaseInSession("email-capture", survey, skipped, EMAIL_ON)).toBe(
        false,
      );
    });

    it("has no email-capture for any age from 13 to 17", () => {
      for (const age of ["13", "14", "15", "16", "17"]) {
        expect(
          isPhaseInSession("email-capture", survey, withAge(age), EMAIL_ON),
        ).toBe(false);
      }
    });

    it("has email-capture for an age of 18 or more, and for no age", () => {
      for (const age of ["18", "19", "42", "99", undefined]) {
        expect(
          isPhaseInSession("email-capture", survey, withAge(age), EMAIL_ON),
        ).toBe(true);
      }

      expect(isPhaseInSession("email-capture", survey, session, EMAIL_ON)).toBe(
        true,
      );
    });

    it("counts an age that is no number as no age", () => {
      const odd: SurveySession = { ...session, demographics: { age: "" } };

      expect(isPhaseInSession("email-capture", survey, odd, EMAIL_ON)).toBe(
        true,
      );
    });
  });

  describe("given the short results phase", () => {
    it("never has short-results", () => {
      expect(isPhaseInSession("short-results", survey, session, EMAIL_ON)).toBe(
        false,
      );
      expect(
        isPhaseInSession(
          "short-results",
          survey,
          createStartedSession(survey, 5),
          EMAIL_OFF,
        ),
      ).toBe(false);
    });
  });

  describe("given each of the seven phases", () => {
    it("answers for every phase of the list", () => {
      expect(
        SURVEY_PHASES.map((phase) =>
          isPhaseInSession(phase, survey, session, EMAIL_ON),
        ),
      ).toEqual([true, true, true, true, true, true, false]);
    });
  });
});

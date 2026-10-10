import { describe, expect, it } from "vitest";

import type { DemographicsValues } from "@/types/survey";
import { stepBack } from "@/utils/survey/phases/stepBack";
import { createStartedSession } from "@/utils/vitest/createStartedSession";
import { createSurvey } from "@/utils/vitest/createSurvey";
import { leaveSessionDemographics } from "./leaveSessionDemographics";
import { setSessionDemographics } from "./setSessionDemographics";

const COMPLETE: DemographicsValues = {
  age: "42",
  gender: "female",
  residenceAreaSize: "village",
  education: "higher",
};

describe("setSessionDemographics()", () => {
  const survey = createSurvey();
  const onDemographics = createStartedSession(survey, 5);

  describe("when the session is on demographics", () => {
    it("keeps only values of the lists", () => {
      const session = setSessionDemographics(survey, onDemographics, {
        age: "12",
        gender: "female",
        residenceAreaSize: "Wieś",
        education: "higher",
        region: "mazowieckie",
      } as DemographicsValues);

      expect(session.demographics).toEqual({
        gender: "female",
        education: "higher",
      });
    });

    it("replaces the values that were picked", () => {
      const picked = setSessionDemographics(survey, onDemographics, COMPLETE);
      const changed = setSessionDemographics(survey, picked, {
        ...COMPLETE,
        age: "17",
      });

      expect(changed.demographics).toEqual({ ...COMPLETE, age: "17" });
      expect(picked.demographics).toEqual(COMPLETE);
    });

    it("gives nothing: the values are picked, not given", () => {
      const session = setSessionDemographics(survey, onDemographics, COMPLETE);

      expect(session.areDemographicsGiven).toBe(false);
      expect(session.phase).toBe("demographics");
    });

    it("takes back what was given once a value is picked again", () => {
      const given = leaveSessionDemographics(
        survey,
        setSessionDemographics(survey, onDemographics, COMPLETE),
        true,
        { isEmailSendingSetUp: true },
      );
      const back = stepBack(survey, given);
      const session = setSessionDemographics(survey, back, {
        ...COMPLETE,
        age: "50",
      });

      expect(back.phase).toBe("demographics");
      expect(back.areDemographicsGiven).toBe(true);
      expect(session.areDemographicsGiven).toBe(false);
    });
  });

  describe("when the session is anywhere else", () => {
    it("changes nothing outside demographics", () => {
      const onQuestions = createStartedSession(survey, 2);
      const calculating = leaveSessionDemographics(
        survey,
        onDemographics,
        false,
        { isEmailSendingSetUp: false },
      );

      expect(setSessionDemographics(survey, onQuestions, COMPLETE)).toBe(
        onQuestions,
      );
      expect(setSessionDemographics(survey, calculating, COMPLETE)).toBe(
        calculating,
      );
    });
  });
});

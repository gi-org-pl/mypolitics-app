import { describe, expect, it } from "vitest";

import type { DemographicsValues, SurveySession } from "@/types/survey";
import { confirmSessionCategories } from "@/utils/survey/categories/confirmSessionCategories";
import { setSessionCategories } from "@/utils/survey/categories/setSessionCategories";
import { leaveSessionDemographics } from "@/utils/survey/demographics/leaveSessionDemographics";
import { setSessionDemographics } from "@/utils/survey/demographics/setSessionDemographics";
import { leaveSessionEmailCapture } from "@/utils/survey/email-capture/leaveSessionEmailCapture";
import { setSessionEmail } from "@/utils/survey/email-capture/setSessionEmail";
import { answerQuestion } from "@/utils/survey/questions/answerQuestion";
import { skipQuestion } from "@/utils/survey/questions/skipQuestion";
import { createSession } from "@/utils/survey/session/createSession";
import { createStartedSession } from "@/utils/vitest/survey/createStartedSession";
import { createSurvey } from "@/utils/vitest/survey/createSurvey";
import { createSurveyCategory } from "@/utils/vitest/survey/createSurveyCategory";
import { buildResultInput } from "./buildResultInput";

const EMAIL_ON = { isEmailSendingSetUp: true };
const EMAIL_OFF = { isEmailSendingSetUp: false };

const COMPLETE: DemographicsValues = {
  age: "42",
  gender: "female",
  residenceAreaSize: "city_below_50k",
  education: "secondary",
};

describe("buildResultInput()", () => {
  const survey = createSurvey();
  const onDemographics = createStartedSession(survey, 5);

  describe("given any session", () => {
    it("holds the quiz identifier and the session identifier", () => {
      const session = createStartedSession(survey, 2);
      const input = buildResultInput(survey, session);

      expect(input.surveyId).toBe("survey");
      expect(input.sessionId).toBe(session.id);
    });

    it("builds the same input when it is called twice", () => {
      const session = leaveSessionDemographics(
        survey,
        setSessionDemographics(survey, onDemographics, COMPLETE),
        true,
        EMAIL_OFF,
      );

      expect(buildResultInput(survey, session)).toEqual(
        buildResultInput(survey, session),
      );
    });
  });

  describe("given answers and skips", () => {
    it("leaves skips out of the answers", () => {
      const answered = answerQuestion(
        survey,
        skipQuestion(
          survey,
          answerQuestion(survey, createStartedSession(survey), "q1-agree"),
        ),
        "q3-disagree",
      );

      expect(buildResultInput(survey, answered).answers).toEqual([
        { questionId: "q1", answerId: "q1-agree" },
        { questionId: "q3", answerId: "q3-disagree" },
      ]);
    });

    it("holds a question at most once", () => {
      const session: SurveySession = {
        ...onDemographics,
        entries: [
          { questionId: "q1", answerId: "q1-agree" },
          { questionId: "q1", answerId: "q1-disagree" },
          { questionId: "q2" },
          { questionId: "q2", answerId: "q2-coal" },
          { questionId: "q3", answerId: "q3-agree" },
        ],
      };

      expect(buildResultInput(survey, session).answers).toEqual([
        { questionId: "q1", answerId: "q1-agree" },
        { questionId: "q3", answerId: "q3-agree" },
      ]);
    });

    it("builds an input with no answers when every question was skipped", () => {
      const input = buildResultInput(survey, onDemographics);

      expect(input).toEqual({
        surveyId: "survey",
        sessionId: onDemographics.id,
        prioritizedCategories: [],
        answers: [],
      });
    });

    it("sends nothing but the two identifiers of an answer", () => {
      const session = answerQuestion(
        survey,
        createStartedSession(survey),
        "q1-agree",
        12,
      );

      expect(Object.keys(buildResultInput(survey, session).answers[0])).toEqual(
        ["questionId", "answerId"],
      );
    });
  });

  describe("given picked categories", () => {
    const withFiveCategories = createSurvey({
      categories: ["a", "b", "c", "d", "e"].map((id) =>
        createSurveyCategory(id),
      ),
    });

    it("sends confirmed categories, and an empty list when there are none", () => {
      const confirmed = confirmSessionCategories(
        withFiveCategories,
        setSessionCategories(
          withFiveCategories,
          createSession(withFiveCategories),
          ["c", "a"],
        ),
      );

      expect(
        buildResultInput(withFiveCategories, confirmed).prioritizedCategories,
      ).toEqual(["c", "a"]);
      expect(
        buildResultInput(survey, createStartedSession(survey))
          .prioritizedCategories,
      ).toEqual([]);
    });

    it("sends no categories that were picked and never confirmed", () => {
      const picked = setSessionCategories(
        withFiveCategories,
        createSession(withFiveCategories),
        ["c", "a"],
      );

      expect(
        buildResultInput(withFiveCategories, picked).prioritizedCategories,
      ).toEqual([]);
    });

    it("hands over a list of its own", () => {
      const confirmed = confirmSessionCategories(
        survey,
        setSessionCategories(survey, createSession(survey), ["economy"]),
      );

      expect(
        buildResultInput(survey, confirmed).prioritizedCategories,
      ).not.toBe(confirmed.prioritizedCategoryIds);
    });
  });

  describe("given demographics", () => {
    it("sends all four demographics, with the age as a number, when they are given", () => {
      const session = leaveSessionDemographics(
        survey,
        setSessionDemographics(survey, onDemographics, COMPLETE),
        true,
        EMAIL_OFF,
      );

      expect(buildResultInput(survey, session).demographics).toEqual({
        gender: "female",
        age: 42,
        residenceAreaSize: "city_below_50k",
        education: "secondary",
      });
    });

    it("leaves demographics out when they were skipped, even if all four are picked", () => {
      const session = leaveSessionDemographics(
        survey,
        setSessionDemographics(survey, onDemographics, COMPLETE),
        false,
        EMAIL_OFF,
      );

      expect(session.demographics).toEqual(COMPLETE);
      expect(buildResultInput(survey, session)).not.toHaveProperty(
        "demographics",
      );
    });

    it("leaves demographics out when fewer than four are picked", () => {
      const partial: SurveySession = {
        ...onDemographics,
        demographics: { ...COMPLETE, education: undefined },
        areDemographicsGiven: true,
      };
      const invalid: SurveySession = {
        ...onDemographics,
        demographics: { ...COMPLETE, age: "12" },
        areDemographicsGiven: true,
      };

      expect(buildResultInput(survey, partial)).not.toHaveProperty(
        "demographics",
      );
      expect(buildResultInput(survey, invalid)).not.toHaveProperty(
        "demographics",
      );
    });
  });

  describe("given an e-mail", () => {
    it("never holds the e-mail", () => {
      const onEmail = setSessionEmail(
        survey,
        leaveSessionDemographics(
          survey,
          setSessionDemographics(survey, onDemographics, COMPLETE),
          true,
          EMAIL_ON,
        ),
        { address: "jan@example.com", hasConsent: true },
      );
      const calculating = leaveSessionEmailCapture(survey, onEmail, true);
      const input = buildResultInput(survey, calculating);

      expect(calculating.email?.address).toBe("jan@example.com");
      expect(Object.keys(input)).toEqual([
        "surveyId",
        "sessionId",
        "prioritizedCategories",
        "demographics",
        "answers",
      ]);
      expect(JSON.stringify(input)).not.toContain("jan@example.com");
      expect(JSON.stringify(input)).not.toContain("hasConsent");
    });
  });
});

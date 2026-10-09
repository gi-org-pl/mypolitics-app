import { describe, expect, it } from "vitest";

import {
  type DemographicsValues,
  SurveyResultState,
  type SurveySession,
  type UnfittedSurveySession,
} from "@/types/survey";
import { createStartedSession } from "@/utils/vitest/createStartedSession";
import { createSurvey } from "@/utils/vitest/createSurvey";
import { createSurveyCategory } from "@/utils/vitest/createSurveyCategory";

import { answerQuestion } from "./answerQuestion";
import { confirmSessionCategories } from "./confirmSessionCategories";
import { createSession } from "./createSession";
import { fitSession } from "./fitSession";
import { leaveSessionDemographics } from "./leaveSessionDemographics";
import { leaveSessionEmailCapture } from "./leaveSessionEmailCapture";
import { setSessionCategories } from "./setSessionCategories";
import { setSessionDemographics } from "./setSessionDemographics";
import { setSessionEmail } from "./setSessionEmail";
import { showSessionCheckpoint } from "./showSessionCheckpoint";
import { skipQuestion } from "./skipQuestion";

const EMAIL_ON = { isEmailSendingSetUp: true };
const EMAIL_OFF = { isEmailSendingSetUp: false };

const COMPLETE: DemographicsValues = {
  age: "42",
  gender: "female",
  residenceAreaSize: "village",
  education: "higher",
};

describe("fitSession()", () => {
  const survey = createSurvey();
  const picking = setSessionCategories(survey, createSession(survey), [
    "ecology",
  ]);
  const midway = skipQuestion(
    survey,
    answerQuestion(
      survey,
      confirmSessionCategories(survey, picking),
      "q1-agree",
      3,
    ),
    5,
  );
  const onCard = showSessionCheckpoint(survey, midway, { type: "halfway" });
  const done = createStartedSession(survey, 5);
  const onDemographics = setSessionDemographics(survey, done, COMPLETE);
  const onEmail = setSessionEmail(
    survey,
    leaveSessionDemographics(survey, onDemographics, true, EMAIL_ON),
    { address: "jan@example.com", hasConsent: true },
  );
  const calculating: SurveySession = {
    ...leaveSessionEmailCapture(survey, onEmail, true),
    resultState: SurveyResultState.Created,
  };

  describe("given a session that fits the quiz", () => {
    it.each([
      ["a new session", createSession(survey)],
      ["category select with a topic picked", picking],
      ["the questions", midway],
      ["a card", onCard],
      ["demographics", onDemographics],
      ["e-mail capture", onEmail],
      ["results calculation", calculating],
    ])("returns %s with the same content", (_name, session) => {
      expect(fitSession(survey, session, EMAIL_ON)).toEqual(session);
    });

    it("never touches the identifier, the e-mail and the result state", () => {
      const session = fitSession(survey, calculating, EMAIL_ON);

      expect(session.id).toBe(calculating.id);
      expect(session.email).toEqual({
        address: "jan@example.com",
        hasConsent: true,
      });
      expect(session.resultState).toBe(SurveyResultState.Created);
    });

    it("leaves the session it was handed as it was", () => {
      const shorter = createSurvey({ questions: survey.questions.slice(0, 1) });

      fitSession(shorter, midway, EMAIL_OFF);

      expect(midway.entries).toHaveLength(2);
      expect(midway.phase).toBe("questions");
    });
  });

  describe("given a quiz that was read again with other questions", () => {
    const withoutSecond = createSurvey({
      questions: survey.questions.filter(({ id }) => id !== "q2"),
    });

    it("leaves out the entries from the first question that moved, with their time samples", () => {
      const session = fitSession(
        withoutSecond,
        createStartedSession(survey, 3),
        EMAIL_OFF,
      );
      const timed = fitSession(withoutSecond, midway, EMAIL_OFF);

      expect(session.entries).toEqual([{ questionId: "q1" }]);
      expect(session.phase).toBe("questions");
      expect(timed.entries).toEqual([
        { questionId: "q1", answerId: "q1-agree" },
      ]);
      expect(timed.checkpointRecord.timeSamples).toEqual([
        { questionId: "q1", seconds: 3 },
      ]);
    });

    it("continues in the questions, whatever phase the session was in", () => {
      expect(fitSession(withoutSecond, onCard, EMAIL_ON).phase).toBe(
        "questions",
      );
      expect(fitSession(withoutSecond, onEmail, EMAIL_ON).phase).toBe(
        "questions",
      );
      expect(fitSession(withoutSecond, calculating, EMAIL_ON).phase).toBe(
        "questions",
      );
    });

    it("continues on demographics when the quiz has no more questions than the entries left", () => {
      const shorter = createSurvey({ questions: survey.questions.slice(0, 2) });
      const session = fitSession(
        shorter,
        createStartedSession(survey, 3),
        EMAIL_OFF,
      );

      expect(session.entries).toEqual([
        { questionId: "q1" },
        { questionId: "q2" },
      ]);
      expect(session.phase).toBe("demographics");
    });

    it("moves a session on the questions to demographics when the quiz ends where its entries do", () => {
      const shorter = createSurvey({ questions: survey.questions.slice(0, 2) });
      const session = fitSession(shorter, midway, EMAIL_OFF);

      expect(session.entries).toHaveLength(2);
      expect(session.phase).toBe("demographics");
    });

    it("moves a finished session back to the questions when the quiz got longer", () => {
      const shorter = createSurvey({ questions: survey.questions.slice(0, 2) });
      const finished = createStartedSession(shorter, 2);
      const session = fitSession(survey, finished, EMAIL_OFF);

      expect(finished.phase).toBe("demographics");
      expect(session.entries).toHaveLength(2);
      expect(session.phase).toBe("questions");
    });

    it("leaves out an answer the question no longer has, and what came after it", () => {
      const [first, ...rest] = survey.questions;
      const reworded = createSurvey({
        questions: [
          {
            ...first,
            possibleAnswers: first.possibleAnswers.filter(
              ({ id }) => id !== "q1-agree",
            ),
          },
          ...rest,
        ],
      });

      expect(fitSession(reworded, midway, EMAIL_OFF).entries).toEqual([]);
    });
  });

  describe("given a quiz that was read again with other categories", () => {
    it("drops a topic that is no longer a visible category", () => {
      const withFive = createSurvey({
        categories: ["a", "b", "c", "d", "e"].map((id) =>
          createSurveyCategory(id),
        ),
      });
      const unnamed = createSurvey({
        categories: withFive.categories.map((category) =>
          category.id === "b" ? { ...category, name: undefined } : category,
        ),
      });
      const confirmed = confirmSessionCategories(
        withFive,
        setSessionCategories(withFive, createSession(withFive), [
          "a",
          "b",
          "c",
        ]),
      );
      const session = fitSession(unnamed, confirmed, EMAIL_OFF);

      expect(session.topicIds).toEqual(["a", "c"]);
      expect(session.areTopicsConfirmed).toBe(true);
      expect(session.phase).toBe("questions");
    });

    it("leaves category select when the quiz no longer has that phase", () => {
      const withOne = createSurvey({
        categories: [createSurveyCategory("ecology")],
      });
      const session = fitSession(withOne, picking, EMAIL_OFF);

      expect(session.phase).toBe("questions");
      expect(session.topicIds).toEqual([]);
    });
  });

  describe("given a session whose content was never checked", () => {
    const unchecked: UnfittedSurveySession = {
      ...midway,
      entries: [midway.entries[0], undefined, { questionId: "q3" }],
      topicIds: ["ecology", 7, null, "gone", "ecology"],
      phase: undefined,
      demographics: { ...COMPLETE, age: 42, region: "mazowieckie" },
      areDemographicsGiven: true,
      checkpointRecord: {
        cardsShown: ["card"],
        timeSamples: [
          { questionId: "q1", seconds: 3 },
          undefined,
          { questionId: "q1", seconds: 30 },
          { questionId: "q3", seconds: 9 },
        ],
      },
    };

    it("ends the entries at one that could not be read", () => {
      expect(fitSession(survey, unchecked, EMAIL_OFF).entries).toEqual([
        { questionId: "q1", answerId: "q1-agree" },
      ]);
    });

    it("keeps the topics that are visible categories, once each", () => {
      expect(fitSession(survey, unchecked, EMAIL_OFF).topicIds).toEqual([
        "ecology",
      ]);
    });

    it("keeps the demographic values of the lists, and takes back given when one is missing", () => {
      const session = fitSession(survey, unchecked, EMAIL_OFF);

      expect(session.demographics).toEqual({
        gender: "female",
        residenceAreaSize: "village",
        education: "higher",
      });
      expect(session.areDemographicsGiven).toBe(false);
    });

    it("keeps one time sample per done question, and the cards as they are", () => {
      expect(fitSession(survey, unchecked, EMAIL_OFF).checkpointRecord).toEqual(
        {
          cardsShown: ["card"],
          timeSamples: [{ questionId: "q1", seconds: 3 }],
        },
      );
    });

    it("finds the phase by the entries when none was read", () => {
      expect(fitSession(survey, unchecked, EMAIL_OFF).phase).toBe("questions");
      expect(
        fitSession(survey, { ...done, phase: undefined }, EMAIL_OFF).phase,
      ).toBe("demographics");
    });

    it("names the quiz it was fitted to", () => {
      expect(fitSession(survey, unchecked, EMAIL_OFF).surveyId).toBe("survey");
    });
  });

  describe("given a phase that is not part of the session", () => {
    it("moves e-mail capture to demographics while sending is not set up, and keeps the e-mail", () => {
      const session = fitSession(survey, onEmail, EMAIL_OFF);

      expect(session.phase).toBe("demographics");
      expect(session.email).toEqual(onEmail.email);
      expect(session.areDemographicsGiven).toBe(true);
    });

    it("does not leave the topics confirmed on category select", () => {
      const session = fitSession(
        survey,
        { ...picking, areTopicsConfirmed: true },
        EMAIL_OFF,
      );

      expect(session.phase).toBe("category-select");
      expect(session.areTopicsConfirmed).toBe(false);
    });
  });
});

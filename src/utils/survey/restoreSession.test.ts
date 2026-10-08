import { describe, expect, it } from "vitest";

import { SURVEY_SESSION_VERSION } from "@/constants/survey";
import type { DemographicsValues, SurveySession } from "@/types/survey";
import { createStartedSession } from "@/utils/vitest/createStartedSession";
import { createSurvey } from "@/utils/vitest/createSurvey";
import { createSurveyCategory } from "@/utils/vitest/createSurveyCategory";

import { answerQuestion } from "./answerQuestion";
import { createSession } from "./createSession";
import { leaveSessionDemographics } from "./leaveSessionDemographics";
import { restoreSession } from "./restoreSession";
import { setSessionDemographics } from "./setSessionDemographics";
import { setSessionEmail } from "./setSessionEmail";
import { setSessionTopics } from "./setSessionTopics";
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

// The record of a session as it comes back from storage: what the store
// writes, through JSON. Any part of the stored state can be replaced.
const toStored = (
  session: SurveySession,
  overrides: Record<string, unknown> = {},
): unknown => {
  const { email, resultState, ...state } = session;

  return JSON.parse(
    JSON.stringify({
      state: { ...state, ...overrides },
      version: SURVEY_SESSION_VERSION,
    }),
  );
};

describe("restoreSession()", () => {
  const survey = createSurvey();
  const midway = skipQuestion(
    survey,
    answerQuestion(survey, createStartedSession(survey), "q1-agree", 3),
    5,
  );
  const done = createStartedSession(survey, 5);

  describe("given nothing stored", () => {
    it("starts a new session when nothing is stored", () => {
      const session = restoreSession(survey, undefined, EMAIL_OFF);

      expect(session).toEqual({ ...createSession(survey), id: session.id });
      expect(session.phase).toBe("category-select");
    });
  });

  describe("given a record that cannot be used", () => {
    it("throws away a record that is not an object, has another version or is for another quiz", () => {
      const otherQuiz = createSurvey({ id: "other" });
      const records = [
        "record",
        7,
        null,
        [],
        {},
        { state: midway },
        { ...(toStored(midway) as object), version: 2 },
        toStored(createStartedSession(otherQuiz, 2)),
      ];

      for (const record of records) {
        const session = restoreSession(survey, record, EMAIL_OFF);

        expect(session.id).not.toBe(midway.id);
        expect(session.entries).toEqual([]);
        expect(session.phase).toBe("category-select");
        expect(session.surveyId).toBe("survey");
      }
    });

    it("throws away a record that is not in the shape the store writes", () => {
      const records = [
        toStored(midway, { id: "session-1" }),
        toStored(midway, { entries: "q1" }),
        toStored(midway, { topicIds: null }),
        toStored(midway, { areCheckpointsOff: "no" }),
        toStored(midway, { demographics: null }),
      ];

      for (const record of records) {
        expect(restoreSession(survey, record, EMAIL_OFF).entries).toEqual([]);
      }
    });
  });

  describe("given a valid record", () => {
    it("restores a valid record with the same identifier, entries and phase", () => {
      const session = restoreSession(survey, toStored(midway), EMAIL_OFF);

      expect(session).toEqual(midway);
      expect(session.id).toBe(midway.id);
      expect(session.entries).toEqual([
        { questionId: "q1", answerId: "q1-agree" },
        { questionId: "q2" },
      ]);
      expect(session.checkpointRecord.timeSamples).toEqual([
        { questionId: "q1", seconds: 3 },
        { questionId: "q2", seconds: 5 },
      ]);
      expect(session.phase).toBe("questions");
    });

    it("restores a session on category select with the topics that were picked", () => {
      const picking = setSessionTopics(survey, createSession(survey), [
        "ecology",
      ]);

      expect(restoreSession(survey, toStored(picking), EMAIL_OFF)).toEqual(
        picking,
      );
    });

    it("restores a closing card with its demographics", () => {
      const picked = setSessionDemographics(survey, done, COMPLETE);
      const given = leaveSessionDemographics(survey, picked, true, EMAIL_ON);

      expect(restoreSession(survey, toStored(picked), EMAIL_ON)).toEqual(
        picked,
      );
      expect(restoreSession(survey, toStored(given), EMAIL_ON)).toEqual(given);
    });

    it("restores with no e-mail and result state not-sent", () => {
      const onEmail = setSessionEmail(
        survey,
        leaveSessionDemographics(survey, done, false, EMAIL_ON),
        { address: "jan@example.com", hasConsent: true },
      );
      const failed: SurveySession = {
        ...done,
        phase: "results-calculation",
        resultState: "failed",
      };
      const tampered = {
        ...(toStored(failed) as { state: object }).state,
        email: { address: "jan@example.com", hasConsent: true },
        resultState: "failed",
      };

      expect(restoreSession(survey, toStored(onEmail), EMAIL_ON).email).toBe(
        null,
      );
      expect(
        restoreSession(survey, toStored(failed), EMAIL_ON).resultState,
      ).toBe("not-sent");
      expect(
        restoreSession(
          survey,
          { state: tampered, version: SURVEY_SESSION_VERSION },
          EMAIL_ON,
        ),
      ).toEqual({ ...failed, email: null, resultState: "not-sent" });
    });

    it("keeps the checkpoint opt-out", () => {
      const optedOut = { ...midway, areCheckpointsOff: true };

      expect(
        restoreSession(survey, toStored(optedOut), EMAIL_OFF).areCheckpointsOff,
      ).toBe(true);
    });
  });

  describe("given entries that do not fit the quiz as read now", () => {
    it("cuts the entries at the first one that does not fit the quiz, and continues in questions", () => {
      const timed = survey.questions.reduce(
        (session) => skipQuestion(survey, session, 2),
        createStartedSession(survey),
      );
      const shorter = createSurvey({
        questions: survey.questions.filter(({ id }) => id !== "q3"),
      });
      const session = restoreSession(shorter, toStored(timed), EMAIL_OFF);

      expect(timed.phase).toBe("demographics");
      expect(session.id).toBe(timed.id);
      expect(session.entries).toEqual([
        { questionId: "q1" },
        { questionId: "q2" },
      ]);
      expect(session.checkpointRecord.timeSamples).toEqual([
        { questionId: "q1", seconds: 2 },
        { questionId: "q2", seconds: 2 },
      ]);
      expect(session.phase).toBe("questions");
    });

    it("cuts at an answer the question does not have", () => {
      const stored = toStored(done, {
        entries: [
          { questionId: "q1", answerId: "q1-agree" },
          { questionId: "q2", answerId: "q2-gas" },
          { questionId: "q3" },
        ],
      });
      const session = restoreSession(survey, stored, EMAIL_OFF);

      expect(session.entries).toEqual([
        { questionId: "q1", answerId: "q1-agree" },
      ]);
      expect(session.phase).toBe("questions");
    });

    it("continues in questions from the first question when nothing fits", () => {
      const stored = toStored(midway, { entries: [7, { questionId: "q2" }] });
      const session = restoreSession(survey, stored, EMAIL_OFF);

      expect(session.entries).toEqual([]);
      expect(session.checkpointRecord.timeSamples).toEqual([]);
      expect(session.phase).toBe("questions");
    });

    it("continues on demographics when the entries left are all the quiz has", () => {
      const stored = toStored(done, {
        entries: [...done.entries, { questionId: "q6" }],
        phase: "results-calculation",
      });
      const session = restoreSession(survey, stored, EMAIL_OFF);

      expect(session.entries).toHaveLength(5);
      expect(session.phase).toBe("demographics");
    });
  });

  describe("given topics that do not fit the quiz as read now", () => {
    it("drops a topic that is not a visible category, and topics over the limit", () => {
      const withFiveCategories = createSurvey({
        categories: [
          ...["a", "b", "c", "d", "e"].map((id) => createSurveyCategory(id)),
          createSurveyCategory("hidden", { isHidden: true }),
        ],
      });
      const stored = toStored(createStartedSession(withFiveCategories, 1), {
        topicIds: ["a", "hidden", "gone", "b", 7, "c", "d"],
      });

      expect(
        restoreSession(withFiveCategories, stored, EMAIL_OFF).topicIds,
      ).toEqual(["a", "b", "c"]);
    });
  });

  describe("given demographics that do not fit the lists", () => {
    it("empties a demographic value that is not in its list, and marks them not given", () => {
      const stored = toStored(done, {
        demographics: { ...COMPLETE, age: "12", region: "mazowieckie" },
        areDemographicsGiven: true,
      });
      const session = restoreSession(survey, stored, EMAIL_OFF);

      expect(session.demographics).toEqual({
        gender: "female",
        residenceAreaSize: "village",
        education: "higher",
      });
      expect(session.areDemographicsGiven).toBe(false);
      expect(session.phase).toBe("demographics");
    });

    it("marks demographics with fewer than four values as not given", () => {
      const stored = toStored(done, {
        demographics: { age: "42", gender: "female" },
        areDemographicsGiven: true,
      });
      const session = restoreSession(survey, stored, EMAIL_OFF);

      expect(session.demographics).toEqual({ age: "42", gender: "female" });
      expect(session.areDemographicsGiven).toBe(false);
    });

    it("keeps complete demographics that were not given as not given", () => {
      const stored = toStored(done, { demographics: COMPLETE });

      expect(
        restoreSession(survey, stored, EMAIL_OFF).areDemographicsGiven,
      ).toBe(false);
    });
  });

  describe("given a checkpoint record that does not fit", () => {
    it("replaces an unreadable checkpoint record with an empty one", () => {
      for (const checkpointRecord of [
        "record",
        null,
        { cardsShown: "card", timeSamples: [] },
      ]) {
        const session = restoreSession(
          survey,
          toStored(midway, { checkpointRecord }),
          EMAIL_OFF,
        );

        expect(session.checkpointRecord).toEqual({
          cardsShown: [],
          timeSamples: [],
        });
        expect(session.id).toBe(midway.id);
        expect(session.entries).toEqual(midway.entries);
        expect(session.phase).toBe("questions");
      }
    });

    it("drops a time sample of a question that has no entry", () => {
      const stored = toStored(midway, {
        checkpointRecord: {
          cardsShown: ["card"],
          timeSamples: [
            { questionId: "q1", seconds: 3 },
            { questionId: "q3", seconds: 9 },
            { questionId: "gone", seconds: 1 },
          ],
        },
      });

      expect(
        restoreSession(survey, stored, EMAIL_OFF).checkpointRecord,
      ).toEqual({
        cardsShown: ["card"],
        timeSamples: [{ questionId: "q1", seconds: 3 }],
      });
    });

    it("drops a second sample of one question and a sample that cannot be read", () => {
      const stored = toStored(midway, {
        checkpointRecord: {
          cardsShown: [],
          timeSamples: [
            { questionId: "q2", seconds: 5 },
            { questionId: "q1", seconds: 3 },
            { questionId: "q2", seconds: 50 },
            { questionId: "q1", seconds: -1 },
            "q1",
          ],
        },
      });

      expect(
        restoreSession(survey, stored, EMAIL_OFF).checkpointRecord.timeSamples,
      ).toEqual([
        { questionId: "q2", seconds: 5 },
        { questionId: "q1", seconds: 3 },
      ]);
    });

    it("keeps the cards that were shown as they were stored", () => {
      const cardsShown = [{ type: "halfway", minutesLeft: 4 }, "card", 7];
      const stored = toStored(midway, {
        checkpointRecord: { cardsShown, timeSamples: [] },
      });

      expect(
        restoreSession(survey, stored, EMAIL_OFF).checkpointRecord.cardsShown,
      ).toEqual(cardsShown);
    });
  });

  describe("given a phase that does not fit", () => {
    it("repairs a phase the entries do not allow: questions when a question is open, demographics when none is", () => {
      const cases: [SurveySession, string, string][] = [
        [midway, "category-select", "questions"],
        [midway, "demographics", "questions"],
        [midway, "email-capture", "questions"],
        [midway, "results-calculation", "questions"],
        [midway, "checkpoints", "questions"],
        [midway, "short-results", "questions"],
        [midway, "summary", "questions"],
        [done, "category-select", "demographics"],
        [done, "questions", "demographics"],
        [done, "checkpoints", "demographics"],
        [done, "short-results", "demographics"],
        [done, "summary", "demographics"],
      ];

      for (const [stored, phase, expected] of cases) {
        const session = restoreSession(
          survey,
          toStored(stored, { phase }),
          EMAIL_ON,
        );

        expect(session.phase).toBe(expected);
        expect(session.id).toBe(stored.id);
        expect(session.entries).toEqual(stored.entries);
      }
    });

    it("repairs category select in a quiz that no longer has that phase", () => {
      const withoutCategorySelect = createSurvey({
        categories: [createSurveyCategory("economy")],
      });
      const stored = toStored(
        setSessionTopics(survey, createSession(survey), ["economy"]),
      );
      const session = restoreSession(withoutCategorySelect, stored, EMAIL_OFF);

      expect(session.phase).toBe("questions");
      expect(session.topicIds).toEqual([]);
    });

    it("repairs a card phase with no card on record, or with checkpoints off", () => {
      const onCard = showSessionCheckpoint(survey, midway, "card");

      expect(
        restoreSession(
          survey,
          toStored(onCard, { checkpointRecord: "broken" }),
          EMAIL_OFF,
        ).phase,
      ).toBe("questions");
      expect(
        restoreSession(
          survey,
          toStored(onCard, { areCheckpointsOff: true }),
          EMAIL_OFF,
        ).phase,
      ).toBe("questions");
    });

    it("keeps a card phase that has a card on record", () => {
      const onCard = showSessionCheckpoint(survey, midway, { type: "halfway" });
      const session = restoreSession(survey, toStored(onCard), EMAIL_OFF);

      expect(session).toEqual(onCard);
      expect(session.phase).toBe("checkpoints");
      expect(session.checkpointRecord.cardsShown.at(-1)).toEqual({
        type: "halfway",
      });
    });

    it("moves a stored e-mail phase to demographics when that phase is not part of the session", () => {
      const onEmail = leaveSessionDemographics(survey, done, false, EMAIL_ON);
      const minor = toStored(onEmail, { demographics: { age: "17" } });

      expect(onEmail.phase).toBe("email-capture");
      expect(restoreSession(survey, toStored(onEmail), EMAIL_OFF).phase).toBe(
        "demographics",
      );
      expect(restoreSession(survey, minor, EMAIL_ON).phase).toBe(
        "demographics",
      );
    });

    it("keeps a stored e-mail phase that is part of the session", () => {
      const onEmail = leaveSessionDemographics(survey, done, false, EMAIL_ON);
      const adult = toStored(onEmail, { demographics: { age: "18" } });

      expect(restoreSession(survey, toStored(onEmail), EMAIL_ON).phase).toBe(
        "email-capture",
      );
      expect(restoreSession(survey, adult, EMAIL_ON).phase).toBe(
        "email-capture",
      );
    });

    it("keeps results calculation when every question is done", () => {
      const calculating = leaveSessionDemographics(
        survey,
        setSessionDemographics(survey, done, COMPLETE),
        true,
        EMAIL_OFF,
      );
      const session = restoreSession(survey, toStored(calculating), EMAIL_OFF);

      expect(session).toEqual(calculating);
      expect(session.phase).toBe("results-calculation");
      expect(session.id).toBe(calculating.id);
    });

    it("does not leave the topics confirmed on category select", () => {
      const stored = toStored(createSession(survey), {
        areTopicsConfirmed: true,
      });
      const session = restoreSession(survey, stored, EMAIL_OFF);

      expect(session.phase).toBe("category-select");
      expect(session.areTopicsConfirmed).toBe(false);
    });
  });

  describe("given anything at all", () => {
    it.each([
      [undefined],
      [null],
      [Number.NaN],
      [""],
      ["{"],
      [true],
      [() => "session"],
      [Symbol("session")],
      [[[]]],
      [{ state: undefined, version: 1 }],
      [{ state: { id: {} }, version: 1 }],
      [{ state: { entries: [{ questionId: {} }] }, version: 1 }],
      [{ state: Object.create(null), version: 1 }],
      [new Map([["state", {}]])],
      [new Date(0)],
    ])("never throws, whatever it is handed: %s", (stored) => {
      const session = restoreSession(survey, stored, EMAIL_ON);

      expect(session.phase).toBe("category-select");
      expect(session.entries).toEqual([]);
      expect(session.email).toBeNull();
      expect(session.resultState).toBe("not-sent");
    });

    it("never throws on a record whose every part is of the wrong kind", () => {
      const stored = toStored(midway, {
        entries: [null, 7, "q1", [], {}],
        topicIds: [null, 7, {}, []],
        phase: 7,
        demographics: { age: {}, gender: [], residenceAreaSize: 7 },
        checkpointRecord: { cardsShown: [null], timeSamples: [null, 7, {}] },
      });
      const session = restoreSession(survey, stored, EMAIL_ON);

      expect(session).toEqual({
        ...createSession(survey),
        id: midway.id,
        areTopicsConfirmed: true,
        phase: "questions",
        checkpointRecord: { cardsShown: [null], timeSamples: [] },
      });
    });
  });
});

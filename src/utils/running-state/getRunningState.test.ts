import { describe, expect, it } from "vitest";

import type { RunningState, RunningStateSession } from "@/types/checkpoint";
import type { Survey, SurveyQuestion, SurveySession } from "@/types/survey";
import { answerQuestion } from "@/utils/survey/answerQuestion";
import { skipQuestion } from "@/utils/survey/skipQuestion";
import { stepBack } from "@/utils/survey/stepBack";
import { createOrientation } from "@/utils/vitest/createOrientation";
import { createScoredQuestion } from "@/utils/vitest/createScoredQuestion";
import { createStartedSession } from "@/utils/vitest/createStartedSession";
import { createSurvey } from "@/utils/vitest/createSurvey";
import { createSurveyAxis } from "@/utils/vitest/createSurveyAxis";
import { createSurveyCategory } from "@/utils/vitest/createSurveyCategory";

import { getFedOrientationIds } from "./getFedOrientationIds";
import { getRunningState } from "./getRunningState";
import {
  workedAnswerIds,
  workedQuiz,
  workedTopicIds,
} from "./getRunningState.fixtures";
import { identityQuiz } from "./identityQuiz.fixtures";

const toSession = (
  session: Partial<RunningStateSession> = {},
): RunningStateSession => ({
  entries: [],
  topicIds: [],
  checkpointRecord: { cardsShown: [], timeSamples: [] },
  ...session,
});

const workedSession = toSession({
  entries: workedQuiz.questions.map(({ id }, index) => ({
    questionId: id,
    answerId: workedAnswerIds[index],
  })),
  topicIds: workedTopicIds,
});

const SECONDS_PER_QUESTION = 8;

// The sessions of a quiz taken from the first question to the last, through
// the session's own events: the one before the first question, then one per
// boundary. `pick` chooses the answer, by its place among the possible
// answers; without a place the question is skipped.
const replay = (
  survey: Survey,
  pick: (question: SurveyQuestion, index: number) => number | undefined,
): SurveySession[] => {
  const sessions = [createStartedSession(survey)];

  for (const [index, question] of survey.questions.entries()) {
    const place = pick(question, index);
    const session = sessions[index];

    sessions.push(
      place === undefined
        ? skipQuestion(survey, session, SECONDS_PER_QUESTION)
        : answerQuestion(
            survey,
            session,
            question.possibleAnswers[place % question.possibleAnswers.length]
              .id,
            SECONDS_PER_QUESTION,
          ),
    );
  }

  return sessions;
};

const toStates = (survey: Survey, sessions: SurveySession[]): RunningState[] =>
  sessions.flatMap((session) => getRunningState(survey, session) ?? []);

describe("getRunningState()", () => {
  describe("given a quiz with no questions", () => {
    it("returns null", () => {
      expect(
        getRunningState(createSurvey({ questions: [] }), toSession()),
      ).toBeNull();
    });
  });

  describe("given the three done questions of the spec", () => {
    const state = getRunningState(workedQuiz, workedSession);

    it("puts every part of the state together", () => {
      expect(state).toEqual({
        progress: {
          all: 3,
          done: 3,
          answered: 2,
          skipped: 1,
          left: 0,
          share: 1,
          midpointBoundary: 2,
        },
        timing: {
          timedQuestions: 0,
          averagePace: undefined,
          minutesLeft: undefined,
        },
        scores: {
          x: { points: 4.75, maximum: 5.75, value: (4.75 / 5.75) * 100 },
          y: { points: 0, maximum: 4, value: 0 },
          z: { points: 0, maximum: 7.25, value: 0 },
          u: { points: 0, maximum: 0, value: undefined },
        },
        axes: [],
        archetypes: [],
        unlockedTraits: [],
        compass: null,
      });
    });

    it("reads the prioritised categories of the session", () => {
      const plain = getRunningState(workedQuiz, {
        ...workedSession,
        topicIds: [],
      });

      expect(plain?.scores.x).toMatchObject({ points: 4, maximum: 5 });
    });

    it("reads the time samples of the session", () => {
      const timed = getRunningState(workedQuiz, {
        ...workedSession,
        checkpointRecord: {
          cardsShown: [],
          timeSamples: [
            { questionId: "q1", seconds: 4 },
            { questionId: "q2", seconds: 90 },
          ],
        },
      });

      expect(timed?.timing).toMatchObject({
        timedQuestions: 2,
        averagePace: 32,
      });
    });

    it("unlocks a trait of the sources once its every question is answered at its highest weight", () => {
      const sources = { traitIds: ["x", "y"] };
      // A1 and B1 carry the highest weight for X; C1, which Y needs, is skipped.
      const lined = toSession({
        entries: [
          { questionId: "q1", answerId: "q1-a1" },
          { questionId: "q2", answerId: "q2-a1" },
          { questionId: "q3" },
        ],
      });

      expect(
        getRunningState(workedQuiz, lined, sources)?.unlockedTraits,
      ).toMatchObject([{ id: "x", name: "X" }]);
      expect(
        getRunningState(workedQuiz, workedSession, sources)?.unlockedTraits,
      ).toEqual([]);
      expect(getRunningState(workedQuiz, lined)?.unlockedTraits).toEqual([]);
    });
  });

  describe("given the same quiz, session and sources twice", () => {
    it("returns equal states", () => {
      const sources = { traitIds: ["x"] };
      const first = getRunningState(workedQuiz, workedSession, sources);
      const second = getRunningState(workedQuiz, workedSession, sources);

      expect(first).toEqual(second);
      expect(first).not.toBe(second);
    });

    it("leaves the quiz and the session as they were", () => {
      const quizBefore = structuredClone(workedQuiz);
      const sessionBefore = structuredClone(workedSession);

      getRunningState(workedQuiz, workedSession);

      expect(workedQuiz).toEqual(quizBefore);
      expect(workedSession).toEqual(sessionBefore);
    });
  });

  describe("given malformed quiz data", () => {
    // q1  views    an answer with a doubled orientation and one the quiz
    //              lacks; four answers whose weight does not count
    // q2           no possible answers
    // q3  economy  well formed, weight 2 when prioritised
    // q4           well formed, not done
    const quiz = createSurvey({
      averageFinishTime: Number.NaN,
      orientations: [
        createOrientation("left", "Lewica"),
        createOrientation("right", "Prawica"),
        createOrientation("unfed", "Bez pytań", { type: "identity" }),
      ],
      categories: [
        createSurveyCategory("views", { weight: Number.NaN }),
        createSurveyCategory("economy", { weight: 2 }),
      ],
      axes: [
        createSurveyAxis("unknown-type", ["left"], ["right"], {
          type: "radar",
        }),
        createSurveyAxis("ghost-side", ["left"], ["ghost"]),
        createSurveyAxis("same-on-both", ["left"], ["left"]),
        createSurveyAxis("well-formed", ["left"], ["right"]),
        createSurveyAxis("x1", ["left"], ["right"], { type: "compass_x_axis" }),
        createSurveyAxis("x2", ["right"], ["left"], { type: "compass_x_axis" }),
      ],
      questions: [
        createScoredQuestion(
          "q1",
          [
            [2, ["left", "left", "ghost"]],
            [undefined as unknown as number, ["right"]],
            [Number.NaN, ["right"]],
            [-3, ["right"]],
            [0, ["right"]],
          ],
          { categoryId: "views" },
        ),
        createScoredQuestion("q2", []),
        createScoredQuestion(
          "q3",
          [
            [1, ["left"]],
            [4, ["right"]],
          ],
          { categoryId: "economy" },
        ),
        createScoredQuestion("q4", [[1, ["right"]]]),
      ],
    });
    const session = toSession({
      entries: [
        { questionId: "ghost", answerId: "q1-a1" },
        { questionId: "q1", answerId: "q1-a2" },
        { questionId: "q2" },
        { questionId: "q3", answerId: "q1-a1" },
        { questionId: "q1", answerId: "q1-a1" },
      ],
      topicIds: ["views", "ghost", "economy"],
      checkpointRecord: {
        cardsShown: [],
        timeSamples: [
          { questionId: "q1", seconds: -5 },
          { questionId: "q2", seconds: Number.NaN },
          { questionId: "q3", seconds: 30 },
          { questionId: "ghost", seconds: 10 },
        ],
      },
    });
    const sources = { traitIds: ["ghost", "unfed"] };

    it("never throws", () => {
      expect(() => getRunningState(quiz, session, sources)).not.toThrow();
    });

    it("still computes the state of the well-formed questions", () => {
      expect(getRunningState(quiz, session, sources)).toMatchObject({
        progress: {
          all: 4,
          done: 3,
          answered: 1,
          skipped: 2,
          left: 1,
          share: 0.75,
          midpointBoundary: 2,
        },
        timing: {
          timedQuestions: 1,
          averagePace: 30,
          minutesLeft: undefined,
        },
        scores: {
          left: { points: 2, maximum: 4, value: 50 },
          right: { points: 0, maximum: 8, value: 0 },
          unfed: { points: 0, maximum: 0, value: undefined },
        },
        axes: [
          {
            id: "ghost-side",
            kind: "single",
            answered: 1,
            entry: { orientation: { id: "left" }, value: 50 },
            lean: 0,
          },
          {
            id: "well-formed",
            kind: "two-sided",
            answered: 1,
            start: { orientation: { id: "left" }, value: 50 },
            end: { orientation: { id: "right" }, value: 0 },
            lean: 50,
            leadingSide: "start",
          },
        ],
        archetypes: [],
        unlockedTraits: [],
        compass: null,
      });
    });

    it("has a score for the orientations of the quiz and for no other", () => {
      expect(
        Object.keys(getRunningState(quiz, session, sources)?.scores ?? {}),
      ).toEqual(["left", "right", "unfed"]);
    });
  });

  describe("given the identity quiz as the API sends it", () => {
    // Every ninth question is skipped, from the sixth on: 11 of the 102.
    const sessions = replay(identityQuiz, (_question, index) =>
      index % 9 === 5 ? undefined : index,
    );
    const states = toStates(identityQuiz, sessions);
    const [firstState] = states;
    const lastState = states[states.length - 1];

    it("has 102 questions", () => {
      expect(identityQuiz.questions).toHaveLength(102);
      expect(identityQuiz.orientations).toHaveLength(58);
      expect(identityQuiz.axes).toHaveLength(18);
      expect(identityQuiz.categories).toHaveLength(5);
      expect(states).toHaveLength(103);
      expect(firstState.progress).toMatchObject({
        all: 102,
        done: 0,
        left: 102,
        share: 0,
        midpointBoundary: 51,
      });
    });

    it('has 15 two-sided axes and one single axis, "Decentralizacja-Centralizacja"', () => {
      const singleAxes = lastState.axes.filter(({ kind }) => kind === "single");

      expect(
        lastState.axes.filter(({ kind }) => kind === "two-sided"),
      ).toHaveLength(15);
      expect(singleAxes).toMatchObject([
        { kind: "single", entry: { orientation: { name: "Decentralizacja" } } },
      ]);
      expect(
        identityQuiz.axes.find(({ id }) => id === singleAxes[0].id)?.name,
      ).toBe("Decentralizacja-Centralizacja");
      expect(firstState.axes.map(({ id, kind }) => [id, kind])).toEqual(
        lastState.axes.map(({ id, kind }) => [id, kind]),
      );
    });

    it("has 15 archetypes and no unlocked trait", () => {
      for (const state of [firstState, lastState]) {
        expect(state.archetypes).toHaveLength(15);
        expect(state.unlockedTraits).toEqual([]);
      }

      expect(firstState.archetypes[0]).toEqual({
        orientation: expect.objectContaining({
          type: "identity",
          name: "Międzynarodowy socjalista",
        }),
        value: undefined,
      });
    });

    it("ranks the archetypes by their closeness, closest first", () => {
      const values = lastState.archetypes.map(({ value }) => value ?? -1);

      expect(values.every((value) => value >= 0 && value <= 100)).toBe(true);
      expect(values).toEqual(
        [...values].sort((first, second) => second - first),
      );
    });

    it("has a compass, and no point on its trail before the first question that feeds it", () => {
      const [horizontal, vertical] = ["compass_x_axis", "compass_y_axis"].map(
        (type) => identityQuiz.axes.find((axis) => axis.type === type),
      );
      const sides = [
        horizontal?.negativeOrientationIds,
        horizontal?.positiveOrientationIds,
        vertical?.negativeOrientationIds,
        vertical?.positiveOrientationIds,
      ];
      // The first boundary at which every side has been fed by a question.
      const firstBoundary = Math.max(
        ...sides.map(
          (side) =>
            identityQuiz.questions.findIndex((question) =>
              side?.some((id) =>
                getFedOrientationIds({
                  ...identityQuiz,
                  questions: [question],
                }).has(id),
              ),
            ) + 1,
        ),
      );

      expect(firstBoundary).toBe(41);

      for (const state of states.slice(0, firstBoundary)) {
        expect(state.compass).toEqual({ trail: [], quadrantsVisited: [] });
      }

      expect(states[firstBoundary].compass?.trail).toMatchObject([
        { done: firstBoundary },
      ]);
      expect(lastState.compass?.trail.at(-1)?.done).toBe(102);
    });

    it("adds one point to the trail per answered question, and none for a skip", () => {
      for (const [boundary, state] of states.entries()) {
        const before = states[Math.max(boundary - 1, 0)];
        const isAnswered = state.progress.answered > before.progress.answered;
        const added =
          (state.compass?.trail.length ?? 0) -
          (before.compass?.trail.length ?? 0);

        expect(added).toBe(isAnswered && boundary >= 41 ? 1 : 0);
      }
    });

    it("reaches a share of 1 and no questions left when every question is done", () => {
      expect(lastState.progress).toEqual({
        all: 102,
        done: 102,
        answered: 91,
        skipped: 11,
        left: 0,
        share: 1,
        midpointBoundary: 51,
      });
      expect(states[51].progress.share).toBe(0.5);
    });

    it("estimates the time left from the survey average, then from the taker's pace", () => {
      expect(firstState.timing).toEqual({
        timedQuestions: 0,
        averagePace: undefined,
        minutesLeft: 15,
      });
      expect(states[51].timing).toEqual({
        timedQuestions: 51,
        averagePace: SECONDS_PER_QUESTION,
        minutesLeft: 7,
      });
    });

    it("keeps every score within its maximum at every boundary", () => {
      for (const state of states) {
        for (const { points, maximum, value } of Object.values(state.scores)) {
          expect(points).toBeGreaterThanOrEqual(0);
          expect(points).toBeLessThanOrEqual(maximum);
          expect(value ?? 0).toBeGreaterThanOrEqual(0);
          expect(value ?? 0).toBeLessThanOrEqual(100);
        }
      }
    });

    it("never lowers a maximum as questions are done", () => {
      for (const [boundary, state] of states.entries()) {
        const before = states[Math.max(boundary - 1, 0)];

        for (const [id, { maximum }] of Object.entries(state.scores)) {
          expect(maximum).toBeGreaterThanOrEqual(before.scores[id].maximum);
        }
      }
    });

    it("returns to the earlier state when the last entry is removed", () => {
      for (const boundary of [1, 41, 60, 102]) {
        expect(
          getRunningState(
            identityQuiz,
            stepBack(identityQuiz, sessions[boundary]),
          ),
        ).toEqual(states[boundary - 1]);
      }
    });
  });
});

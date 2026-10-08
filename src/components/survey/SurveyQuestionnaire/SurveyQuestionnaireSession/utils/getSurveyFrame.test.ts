import { describe, expect, it } from "vitest";

import type { Survey, SurveyPhase, SurveySession } from "@/types/survey";
import { canReset } from "@/utils/survey/canReset";
import { canStepBack } from "@/utils/survey/canStepBack";
import { createSession } from "@/utils/survey/createSession";
import { createStartedSession } from "@/utils/vitest/createStartedSession";
import { createSurvey } from "@/utils/vitest/createSurvey";

import {
  ALMOST_DONE_LABEL,
  ALMOST_READY_LABEL,
  GO_BACK_LABEL,
} from "../SurveyQuestionnaireSession.constants";
import { getSurveyFrame } from "./getSurveyFrame";

// q1 economy, q2 ecology, q3 economy, q4 hidden, q5 ecology
const survey = createSurvey();
const allDone = survey.questions.length;

const inPhase = (
  phase: SurveyPhase,
  done: number,
  overrides: Partial<SurveySession> = {},
): SurveySession => ({
  ...createStartedSession(survey, done),
  phase,
  ...overrides,
});

const withQuestions = (questions: Survey["questions"]): Survey =>
  createSurvey({ questions });

describe("getSurveyFrame()", () => {
  describe("given category select", () => {
    it("draws an empty bar, the quiz name and both controls off", () => {
      const session = {
        ...createSession(survey),
        topicIds: ["economy"],
      };

      expect(getSurveyFrame(survey, session)).toEqual({
        progress: { done: 0, all: allDone },
        canStepBack: false,
        canReset: false,
      });
    });
  });

  describe("given questions", () => {
    it("draws the bar at the progress of the session", () => {
      expect(
        getSurveyFrame(survey, createStartedSession(survey, 2)).progress,
      ).toEqual({ done: 2, all: allDone });
    });

    it("shows the category and the questions left for a question of a visible category", () => {
      const frame = getSurveyFrame(survey, createStartedSession(survey, 0));

      expect(frame.categoryName).toBe("Gospodarka");
      expect(frame.questionsLeft).toBe(2);
      expect(frame.label).toBeUndefined();
    });

    it("shows 1 on the last question of a category", () => {
      const frame = getSurveyFrame(survey, createStartedSession(survey, 2));

      expect(frame.categoryName).toBe("Gospodarka");
      expect(frame.questionsLeft).toBe(1);
    });

    it("shows the quiz name and no number for a hidden category", () => {
      const frame = getSurveyFrame(survey, createStartedSession(survey, 3));

      expect(frame.categoryName).toBeUndefined();
      expect(frame.questionsLeft).toBeUndefined();
      expect(frame.label).toBeUndefined();
    });

    it("shows the quiz name and no number for a nameless category", () => {
      const nameless = createSurvey({
        categories: [
          { id: "economy", name: "   ", weight: 1, isHidden: false },
        ],
      });
      const frame = getSurveyFrame(nameless, createSession(nameless));

      expect(frame.categoryName).toBeUndefined();
      expect(frame.questionsLeft).toBeUndefined();
    });

    it("shows the quiz name and no number for a missing category", () => {
      const [first] = survey.questions;
      const orphan = withQuestions([
        { ...first, categoryId: undefined },
        { ...first, id: "other", categoryId: "unknown" },
      ]);

      for (const done of [0, 1]) {
        const frame = getSurveyFrame(
          orphan,
          createStartedSession(orphan, done),
        );

        expect(frame.categoryName).toBeUndefined();
        expect(frame.questionsLeft).toBeUndefined();
      }
    });

    it("takes back and reset from canStepBack and canReset", () => {
      const first = createStartedSession(survey, 0);
      const third = createStartedSession(survey, 2);
      const withTopics = {
        ...first,
        topicIds: ["economy"],
        areTopicsConfirmed: true,
      };

      for (const session of [first, third, withTopics]) {
        const frame = getSurveyFrame(survey, session);

        expect(frame.canStepBack).toBe(canStepBack(session));
        expect(frame.canReset).toBe(canReset(session));
      }

      expect(getSurveyFrame(survey, first)).toMatchObject({
        canStepBack: false,
        canReset: false,
      });
      expect(getSurveyFrame(survey, third)).toMatchObject({
        canStepBack: true,
        canReset: true,
      });
      expect(getSurveyFrame(survey, withTopics)).toMatchObject({
        canStepBack: false,
        canReset: true,
      });
    });
  });

  describe("given a card", () => {
    it("keeps the bar and the pill of the next question, back off and reset on", () => {
      expect(getSurveyFrame(survey, inPhase("checkpoints", 1))).toEqual({
        progress: { done: 1, all: allDone },
        categoryName: "Ekologia",
        questionsLeft: 2,
        canStepBack: false,
        canReset: true,
      });
    });

    it("shows the quiz name when the next question has no visible category", () => {
      expect(getSurveyFrame(survey, inPhase("checkpoints", 3))).toEqual({
        progress: { done: 3, all: allDone },
        canStepBack: false,
        canReset: true,
      });
    });
  });

  describe("given demographics", () => {
    it('draws no bar and "Prawie koniec!"', () => {
      expect(getSurveyFrame(survey, inPhase("demographics", allDone))).toEqual({
        label: ALMOST_DONE_LABEL,
        canStepBack: true,
        canReset: true,
      });
      expect(ALMOST_DONE_LABEL.message).toBe("Prawie koniec!");
    });
  });

  describe("given e-mail capture", () => {
    it('draws a full bar, "Prawie koniec!" and a back control named "Wróć"', () => {
      expect(getSurveyFrame(survey, inPhase("email-capture", allDone))).toEqual(
        {
          progress: { done: allDone, all: allDone },
          label: ALMOST_DONE_LABEL,
          previousLabel: GO_BACK_LABEL,
          canStepBack: true,
          canReset: true,
        },
      );
      expect(GO_BACK_LABEL.message).toBe("Wróć");
    });
  });

  describe("given results calculation", () => {
    it('draws no bar and "Prawie gotowe", with reset on only when it failed', () => {
      expect(
        getSurveyFrame(
          survey,
          inPhase("results-calculation", allDone, { resultState: "sending" }),
        ),
      ).toEqual({
        label: ALMOST_READY_LABEL,
        canStepBack: false,
        canReset: false,
      });
      expect(
        getSurveyFrame(
          survey,
          inPhase("results-calculation", allDone, { resultState: "failed" }),
        ),
      ).toEqual({
        label: ALMOST_READY_LABEL,
        canStepBack: false,
        canReset: true,
      });
      expect(ALMOST_READY_LABEL.message).toBe("Prawie gotowe");
    });
  });

  describe("given short results", () => {
    it("draws no bar, the quiz name and both controls off", () => {
      expect(getSurveyFrame(survey, inPhase("short-results", allDone))).toEqual(
        { canStepBack: false, canReset: false },
      );
    });
  });
});

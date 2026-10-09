import { describe, expect, it } from "vitest";

import { SurveyResultState, type SurveySession } from "@/types/survey";
import { createStartedSession } from "@/utils/vitest/createStartedSession";
import { createSurvey } from "@/utils/vitest/createSurvey";

import { canReset } from "./canReset";
import { confirmSessionTopics } from "./confirmSessionTopics";
import { createSession } from "./createSession";
import { leaveSessionDemographics } from "./leaveSessionDemographics";
import { setSessionTopics } from "./setSessionTopics";
import { showSessionCheckpoint } from "./showSessionCheckpoint";

describe("canReset()", () => {
  const survey = createSurvey();
  const onDemographics = createStartedSession(survey, 5);

  describe("given a session on category select", () => {
    it("cannot reset on category select, even with topics picked", () => {
      const session = createSession(survey);

      expect(canReset(session)).toBe(false);
      expect(canReset(setSessionTopics(survey, session, ["economy"]))).toBe(
        false,
      );
    });
  });

  describe("given a session on the questions", () => {
    it("cannot reset on the first question with nothing to clear", () => {
      const withoutCategorySelect = createSurvey({ categories: [] });

      expect(canReset(createSession(withoutCategorySelect))).toBe(false);
      expect(canReset(createStartedSession(survey))).toBe(false);
    });

    it("can reset on the first question after topics were confirmed", () => {
      const session = confirmSessionTopics(
        survey,
        setSessionTopics(survey, createSession(survey), ["economy"]),
      );

      expect(session.entries).toEqual([]);
      expect(canReset(session)).toBe(true);
    });

    it("can reset once a question is done, answered or skipped", () => {
      expect(canReset(createStartedSession(survey, 1))).toBe(true);
      expect(canReset(createStartedSession(survey, 4))).toBe(true);
    });

    it("does not count topics that were never confirmed", () => {
      const session: SurveySession = {
        ...createStartedSession(survey),
        topicIds: ["economy"],
        areTopicsConfirmed: false,
      };

      expect(canReset(session)).toBe(false);
    });
  });

  describe("given a session on a card or on a closing card", () => {
    it("can reset on a card, on demographics and on e-mail capture", () => {
      const onCard = showSessionCheckpoint(
        survey,
        createStartedSession(survey, 1),
        "card",
      );
      const onEmail = leaveSessionDemographics(survey, onDemographics, false, {
        isEmailSendingSetUp: true,
      });

      expect(canReset(onCard)).toBe(true);
      expect(canReset(onDemographics)).toBe(true);
      expect(canReset(onEmail)).toBe(true);
    });
  });

  describe("given a session in results calculation", () => {
    it("can reset in results calculation only when it has failed", () => {
      const states: [SurveyResultState, boolean][] = [
        [SurveyResultState.NotSent, false],
        [SurveyResultState.Sending, false],
        [SurveyResultState.Created, false],
        [SurveyResultState.Calculated, false],
        [SurveyResultState.Failed, true],
      ];

      for (const [resultState, expected] of states) {
        const session: SurveySession = {
          ...onDemographics,
          phase: "results-calculation",
          resultState,
        };

        expect(canReset(session)).toBe(expected);
      }
    });
  });

  describe("given a session on short results", () => {
    it("cannot reset, even when the result state says failed", () => {
      expect(canReset({ ...onDemographics, phase: "short-results" })).toBe(
        false,
      );
      expect(
        canReset({
          ...onDemographics,
          phase: "short-results",
          resultState: SurveyResultState.Failed,
        }),
      ).toBe(false);
    });
  });
});

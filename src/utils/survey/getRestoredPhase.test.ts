import { describe, expect, it } from "vitest";

import type { SurveyPhase, SurveySession } from "@/types/survey";
import { createStartedSession } from "@/utils/vitest/createStartedSession";
import { createSurvey } from "@/utils/vitest/createSurvey";

import { createSession } from "./createSession";
import { getRestoredPhase } from "./getRestoredPhase";

const EMAIL_ON = { isEmailSendingSetUp: true };
const EMAIL_OFF = { isEmailSendingSetUp: false };

const withCard = (session: SurveySession): SurveySession => ({
  ...session,
  checkpointRecord: { ...session.checkpointRecord, cardsShown: ["card"] },
});

describe("getRestoredPhase()", () => {
  const survey = createSurvey();
  const fresh = createSession(survey);
  const midway = createStartedSession(survey, 2);
  const done = createStartedSession(survey, 5);

  describe("given a phase the entries allow", () => {
    it("keeps category select in a session with no entries", () => {
      expect(
        getRestoredPhase(survey, fresh, "category-select", EMAIL_OFF),
      ).toBe("category-select");
    });

    it("keeps the questions while a question is open", () => {
      expect(getRestoredPhase(survey, fresh, "questions", EMAIL_OFF)).toBe(
        "questions",
      );
      expect(getRestoredPhase(survey, midway, "questions", EMAIL_OFF)).toBe(
        "questions",
      );
    });

    it("keeps a card phase that has a card on record", () => {
      expect(
        getRestoredPhase(survey, withCard(midway), "checkpoints", EMAIL_OFF),
      ).toBe("checkpoints");
    });

    it("keeps the closing phases when every question is done", () => {
      expect(getRestoredPhase(survey, done, "demographics", EMAIL_ON)).toBe(
        "demographics",
      );
      expect(getRestoredPhase(survey, done, "email-capture", EMAIL_ON)).toBe(
        "email-capture",
      );
      expect(
        getRestoredPhase(survey, done, "results-calculation", EMAIL_ON),
      ).toBe("results-calculation");
    });

    it("does not read the phase of the session it is handed", () => {
      expect(done.phase).toBe("demographics");
      expect(
        getRestoredPhase(survey, done, "results-calculation", EMAIL_OFF),
      ).toBe("results-calculation");
    });
  });

  describe("given a phase the entries do not allow", () => {
    it("repairs category select with entries", () => {
      expect(
        getRestoredPhase(survey, midway, "category-select", EMAIL_OFF),
      ).toBe("questions");
      expect(getRestoredPhase(survey, done, "category-select", EMAIL_OFF)).toBe(
        "demographics",
      );
    });

    it("repairs the questions with no question open", () => {
      expect(getRestoredPhase(survey, done, "questions", EMAIL_OFF)).toBe(
        "demographics",
      );
    });

    it("repairs a card with no question open, with no card on record or with no question done", () => {
      expect(
        getRestoredPhase(survey, withCard(done), "checkpoints", EMAIL_OFF),
      ).toBe("demographics");
      expect(getRestoredPhase(survey, midway, "checkpoints", EMAIL_OFF)).toBe(
        "questions",
      );
      expect(
        getRestoredPhase(
          survey,
          withCard(createStartedSession(survey)),
          "checkpoints",
          EMAIL_OFF,
        ),
      ).toBe("questions");
    });

    it.each<[SurveyPhase]>([
      ["demographics"],
      ["email-capture"],
      ["results-calculation"],
    ])("repairs %s with open questions", (phase) => {
      expect(getRestoredPhase(survey, midway, phase, EMAIL_ON)).toBe(
        "questions",
      );
      expect(getRestoredPhase(survey, fresh, phase, EMAIL_ON)).toBe(
        "questions",
      );
    });

    it("repairs short results, which this code never writes", () => {
      expect(getRestoredPhase(survey, midway, "short-results", EMAIL_ON)).toBe(
        "questions",
      );
      expect(getRestoredPhase(survey, done, "short-results", EMAIL_ON)).toBe(
        "demographics",
      );
    });
  });

  describe("given no phase", () => {
    it("is the questions when a question is open, demographics when none is", () => {
      expect(getRestoredPhase(survey, fresh, undefined, EMAIL_ON)).toBe(
        "questions",
      );
      expect(getRestoredPhase(survey, midway, undefined, EMAIL_ON)).toBe(
        "questions",
      );
      expect(getRestoredPhase(survey, done, undefined, EMAIL_ON)).toBe(
        "demographics",
      );
    });
  });

  describe("given a phase that is not part of the session", () => {
    it("repairs category select in a quiz that no longer has that phase", () => {
      const withoutCategorySelect = createSurvey({ categories: [] });

      expect(
        getRestoredPhase(
          withoutCategorySelect,
          createSession(withoutCategorySelect),
          "category-select",
          EMAIL_OFF,
        ),
      ).toBe("questions");
    });

    it("repairs a card while checkpoints are off", () => {
      const optedOut = { ...withCard(midway), areCheckpointsOff: true };

      expect(getRestoredPhase(survey, optedOut, "checkpoints", EMAIL_OFF)).toBe(
        "questions",
      );
    });

    it("moves e-mail capture to demographics while sending is not set up", () => {
      expect(getRestoredPhase(survey, done, "email-capture", EMAIL_OFF)).toBe(
        "demographics",
      );
    });

    it("moves e-mail capture to demographics for an age under 18", () => {
      const minor = { ...done, demographics: { age: "17" } };
      const adult = { ...done, demographics: { age: "18" } };

      expect(getRestoredPhase(survey, minor, "email-capture", EMAIL_ON)).toBe(
        "demographics",
      );
      expect(getRestoredPhase(survey, adult, "email-capture", EMAIL_ON)).toBe(
        "email-capture",
      );
    });
  });
});

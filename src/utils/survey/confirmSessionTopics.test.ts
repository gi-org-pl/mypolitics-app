import { describe, expect, it } from "vitest";

import { createStartedSession } from "@/utils/vitest/createStartedSession";
import { createSurvey } from "@/utils/vitest/createSurvey";

import { confirmSessionTopics } from "./confirmSessionTopics";
import { createSession } from "./createSession";
import { setSessionTopics } from "./setSessionTopics";

describe("confirmSessionTopics()", () => {
  const survey = createSurvey();

  describe("when a topic is picked on category select", () => {
    it("confirms the topics and moves to questions", () => {
      const picked = setSessionTopics(survey, createSession(survey), [
        "ecology",
      ]);
      const session = confirmSessionTopics(survey, picked);

      expect(session).toEqual({
        ...picked,
        areTopicsConfirmed: true,
        phase: "questions",
      });
      expect(session.topicIds).toEqual(["ecology"]);
    });

    it("changes nothing when it is called again", () => {
      const confirmed = confirmSessionTopics(
        survey,
        setSessionTopics(survey, createSession(survey), ["ecology"]),
      );

      expect(confirmSessionTopics(survey, confirmed)).toBe(confirmed);
    });
  });

  describe("when no topic is picked", () => {
    it("does not confirm with no topic picked", () => {
      const session = createSession(survey);

      expect(confirmSessionTopics(survey, session)).toBe(session);
    });
  });

  describe("when the session is anywhere else", () => {
    it("changes nothing outside category select", () => {
      const session = createStartedSession(survey, 2);

      expect(confirmSessionTopics(survey, session)).toBe(session);
    });
  });
});

import { describe, expect, it } from "vitest";

import { createSurvey } from "@/utils/vitest/createSurvey";

import { createSession } from "./createSession";
import { setSessionTopics } from "./setSessionTopics";
import { skipSessionTopics } from "./skipSessionTopics";

describe("skipSessionTopics()", () => {
  const survey = createSurvey();

  describe("when the session is on category select", () => {
    it("empties the topics on skip and moves to questions", () => {
      const picked = setSessionTopics(survey, createSession(survey), [
        "ecology",
      ]);
      const session = skipSessionTopics(survey, picked);

      expect(session).toEqual({
        ...picked,
        topicIds: [],
        areTopicsConfirmed: true,
        phase: "questions",
      });
    });

    it("works with no topic picked", () => {
      const session = skipSessionTopics(survey, createSession(survey));

      expect(session.phase).toBe("questions");
      expect(session.areTopicsConfirmed).toBe(true);
      expect(session.topicIds).toEqual([]);
    });
  });

  describe("when the session is anywhere else", () => {
    it("changes nothing outside category select", () => {
      const skipped = skipSessionTopics(survey, createSession(survey));

      expect(skipSessionTopics(survey, skipped)).toBe(skipped);
    });
  });
});

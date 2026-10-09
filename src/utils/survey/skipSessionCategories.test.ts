import { describe, expect, it } from "vitest";

import { createSurvey } from "@/utils/vitest/createSurvey";

import { createSession } from "./createSession";
import { setSessionCategories } from "./setSessionCategories";
import { skipSessionCategories } from "./skipSessionCategories";

describe("skipSessionCategories()", () => {
  const survey = createSurvey();

  describe("when the session is on category select", () => {
    it("empties the topics on skip and moves to questions", () => {
      const picked = setSessionCategories(survey, createSession(survey), [
        "ecology",
      ]);
      const session = skipSessionCategories(survey, picked);

      expect(session).toEqual({
        ...picked,
        topicIds: [],
        areTopicsConfirmed: true,
        phase: "questions",
      });
    });

    it("works with no topic picked", () => {
      const session = skipSessionCategories(survey, createSession(survey));

      expect(session.phase).toBe("questions");
      expect(session.areTopicsConfirmed).toBe(true);
      expect(session.topicIds).toEqual([]);
    });
  });

  describe("when the session is anywhere else", () => {
    it("changes nothing outside category select", () => {
      const skipped = skipSessionCategories(survey, createSession(survey));

      expect(skipSessionCategories(survey, skipped)).toBe(skipped);
    });
  });
});

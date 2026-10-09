import { describe, expect, it } from "vitest";

import { createStartedSession } from "@/utils/vitest/createStartedSession";
import { createSurvey } from "@/utils/vitest/createSurvey";
import { createSurveyCategory } from "@/utils/vitest/createSurveyCategory";

import { createSession } from "./createSession";
import { setSessionCategories } from "./setSessionCategories";

// Five visible categories and a hidden one: the limit is three.
const survey = createSurvey({
  categories: [
    ...["a", "b", "c", "d", "e"].map((id) => createSurveyCategory(id)),
    createSurveyCategory("hidden", { isHidden: true }),
  ],
});

describe("setSessionCategories()", () => {
  describe("when the session is on category select", () => {
    it("keeps visible categories, once each, in the order given", () => {
      const session = setSessionCategories(survey, createSession(survey), [
        "c",
        "hidden",
        "a",
        "c",
        "unknown",
      ]);

      expect(session.topicIds).toEqual(["c", "a"]);
    });

    it("cuts the topics to the limit", () => {
      const session = setSessionCategories(survey, createSession(survey), [
        "a",
        "b",
        "c",
        "d",
      ]);

      expect(session.topicIds).toEqual(["a", "b", "c"]);
    });

    it("replaces the topics that were picked, so that a topic can be dropped", () => {
      const picked = setSessionCategories(survey, createSession(survey), [
        "a",
        "b",
      ]);

      expect(setSessionCategories(survey, picked, ["b"]).topicIds).toEqual([
        "b",
      ]);
      expect(setSessionCategories(survey, picked, []).topicIds).toEqual([]);
    });

    it("confirms nothing and stays on category select", () => {
      const session = setSessionCategories(survey, createSession(survey), [
        "a",
      ]);

      expect(session.areTopicsConfirmed).toBe(false);
      expect(session.phase).toBe("category-select");
    });
  });

  describe("when the session is anywhere else", () => {
    it("changes nothing outside category select", () => {
      const onQuestions = createStartedSession(survey, 1);
      const onDemographics = createStartedSession(survey, 5);

      expect(setSessionCategories(survey, onQuestions, ["a"])).toBe(
        onQuestions,
      );
      expect(setSessionCategories(survey, onDemographics, ["a"])).toBe(
        onDemographics,
      );
    });
  });
});

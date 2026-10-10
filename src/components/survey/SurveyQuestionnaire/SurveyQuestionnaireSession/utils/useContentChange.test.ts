import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { SurveySession } from "@/types/survey";
import { setSessionCategories } from "@/utils/survey/categories/setSessionCategories";
import { skipSessionCategories } from "@/utils/survey/categories/skipSessionCategories";
import { stepBack } from "@/utils/survey/phases/stepBack";
import { skipQuestion } from "@/utils/survey/questions/skipQuestion";
import { createSession } from "@/utils/survey/session/createSession";
import { createSurvey } from "@/utils/vitest/survey/createSurvey";

import { getContentKey } from "./getContentKey";
import { useContentChange } from "./useContentChange";

const survey = createSurvey();

const renderChange = (session: SurveySession) =>
  renderHook(({ shownSession }) => useContentChange(shownSession), {
    initialProps: { shownSession: session },
  });

describe("useContentChange()", () => {
  describe("when the screen appears", () => {
    it("returns the key of the content and no direction", () => {
      const session = createSession(survey);
      const { result } = renderChange(session);

      expect(result.current).toEqual({
        contentKey: getContentKey(session),
        direction: undefined,
      });
    });
  });

  describe("when the session changes and the content does not", () => {
    it("keeps the key and still has no direction", () => {
      const session = createSession(survey);
      const { result, rerender } = renderChange(session);

      rerender({
        shownSession: setSessionCategories(survey, session, ["economy"]),
      });

      expect(result.current).toEqual({
        contentKey: getContentKey(session),
        direction: undefined,
      });
    });
  });

  describe("when the content changes", () => {
    it("moves forwards after a step forwards, in the same render", () => {
      const session = createSession(survey);
      const firstQuestion = skipSessionCategories(survey, session);
      const { result, rerender } = renderChange(session);

      rerender({ shownSession: firstQuestion });

      expect(result.current).toEqual({
        contentKey: getContentKey(firstQuestion),
        direction: "forwards",
      });
    });

    it("moves backwards after a step back", () => {
      const first = skipSessionCategories(survey, createSession(survey));
      const second = skipQuestion(survey, first);
      const { result, rerender } = renderChange(first);

      rerender({ shownSession: second });
      rerender({ shownSession: stepBack(survey, second) });

      expect(result.current).toEqual({
        contentKey: getContentKey(first),
        direction: "backwards",
      });
    });

    it("keeps the direction while the new content stays", () => {
      const first = skipSessionCategories(survey, createSession(survey));
      const second = skipQuestion(survey, first);
      const { result, rerender } = renderChange(second);

      rerender({ shownSession: stepBack(survey, second) });
      rerender({ shownSession: { ...first } });

      expect(result.current.direction).toBe("backwards");
    });
  });
});

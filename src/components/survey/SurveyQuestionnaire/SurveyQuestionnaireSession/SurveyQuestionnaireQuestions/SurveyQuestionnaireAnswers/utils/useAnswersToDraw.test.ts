import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { getAnswersToDraw } from "@/utils/survey/getAnswersToDraw";
import { createSurvey } from "@/utils/vitest/createSurvey";

import { useAnswersToDraw } from "./useAnswersToDraw";

const [scaleQuestion, customQuestion] = createSurvey().questions;

describe("useAnswersToDraw()", () => {
  describe("given a question", () => {
    it("returns its answers as getAnswersToDraw gives them", () => {
      const { result } = renderHook(() => useAnswersToDraw(scaleQuestion));

      expect(result.current).toEqual(getAnswersToDraw(scaleQuestion));
    });
  });

  describe("when rendered again with the same question", () => {
    it("works the answers out once", () => {
      const { result, rerender } = renderHook(() =>
        useAnswersToDraw(scaleQuestion),
      );
      const answers = result.current;

      rerender();

      expect(result.current).toBe(answers);
    });
  });

  describe("when the question changes", () => {
    it("returns the answers of the new question", () => {
      const { result, rerender } = renderHook(
        ({ question }) => useAnswersToDraw(question),
        { initialProps: { question: scaleQuestion } },
      );

      rerender({ question: customQuestion });

      expect(result.current).toEqual(getAnswersToDraw(customQuestion));
    });
  });
});

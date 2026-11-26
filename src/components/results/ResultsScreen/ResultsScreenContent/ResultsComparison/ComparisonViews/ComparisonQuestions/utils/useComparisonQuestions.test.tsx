import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { OtherSide } from "@/types/comparison";

import {
  exampleAnswers,
  exampleFriendSide,
  exampleOrientationSide,
  exampleQuiz,
} from "../ComparisonQuestions.fixtures";
import type { ComparisonQuestionsControls } from "../ComparisonQuestions.types";
import { useComparisonQuestions } from "./useComparisonQuestions";

const renderView = (other: OtherSide = exampleOrientationSide) =>
  renderHook(
    ({ side }) => useComparisonQuestions(exampleQuiz, exampleAnswers, side),
    { initialProps: { side: other } },
  );

const getIds = (view: ComparisonQuestionsControls) =>
  view.listed.map(({ question }) => question.id);

describe("useComparisonQuestions()", () => {
  describe("when the view is first shown", () => {
    it("lists every question of the quiz, in the order of the quiz", () => {
      const { result } = renderView();

      expect(getIds(result.current)).toEqual(
        exampleQuiz.questions.map(({ id }) => id),
      );
    });

    it("searches for nothing, lists agreement too, and has no row open", () => {
      const { result } = renderView();

      expect(result.current.search).toBe("");
      expect(result.current.isOnlyDisagreement).toBe(false);
      expect(result.current.openIds).toEqual([]);
    });

    it("compares the taker with the other side it is given", () => {
      const withOrientation = renderView(exampleOrientationSide);
      const withFriend = renderView(exampleFriendSide);

      // The orientation lists two answers of "prices"; the friend chose one.
      expect(
        withOrientation.result.current.listed[5].otherAnswers,
      ).toHaveLength(2);
      expect(withFriend.result.current.listed[5].otherAnswers).toHaveLength(1);
    });
  });

  describe("when something is searched for", () => {
    it("keeps the text as typed, and narrows the list by it", () => {
      const { result } = renderView();

      act(() => result.current.setSearch(" UNI"));

      expect(result.current.search).toBe(" UNI");
      expect(getIds(result.current)).toEqual(["democracy", "future"]);
    });

    it("lists every question again when the text is cleared", () => {
      const { result } = renderView();

      act(() => result.current.setSearch("unia"));
      act(() => result.current.setSearch(""));

      expect(result.current.listed).toHaveLength(exampleQuiz.questions.length);
    });
  });

  describe("when only disagreement is turned on", () => {
    it("lists the questions the two disagree on", () => {
      const { result } = renderView();

      act(() => result.current.setIsOnlyDisagreement(true));

      expect(result.current.isOnlyDisagreement).toBe(true);
      expect(getIds(result.current)).toEqual(["breadwinner", "housing"]);
    });

    it("lists every question again when it is turned off", () => {
      const { result } = renderView();

      act(() => result.current.setIsOnlyDisagreement(true));
      act(() => result.current.setIsOnlyDisagreement(false));

      expect(result.current.listed).toHaveLength(exampleQuiz.questions.length);
    });
  });

  describe("when the search and the filter are both on", () => {
    it("lists the questions that pass both, and nothing when none does", () => {
      const { result } = renderView();

      act(() => {
        result.current.setSearch("mieszka");
        result.current.setIsOnlyDisagreement(true);
      });

      expect(getIds(result.current)).toEqual(["housing"]);

      act(() => result.current.setSearch("unia"));

      expect(result.current.listed).toEqual([]);
    });
  });

  describe("when a row is pressed", () => {
    it("opens it, and leaves the others as they are", () => {
      const { result } = renderView();

      act(() => result.current.toggleQuestion("housing"));
      act(() => result.current.toggleQuestion("prices"));

      expect(result.current.openIds).toEqual(["housing", "prices"]);
    });

    it("closes it when it is pressed again", () => {
      const { result } = renderView();

      act(() => result.current.toggleQuestion("housing"));
      act(() => result.current.toggleQuestion("prices"));
      act(() => result.current.toggleQuestion("housing"));

      expect(result.current.openIds).toEqual(["prices"]);
    });

    it("keeps it open while the search takes it off the list", () => {
      const { result } = renderView();

      act(() => result.current.toggleQuestion("housing"));
      act(() => result.current.setSearch("unia"));

      expect(getIds(result.current)).toEqual(["democracy"]);
      expect(result.current.openIds).toEqual(["housing"]);
    });
  });

  describe("when it is drawn again with nothing changed", () => {
    it("hands out the same list and the same action", () => {
      const { result, rerender } = renderView();
      const { listed, toggleQuestion } = result.current;

      rerender({ side: exampleOrientationSide });

      expect(result.current.listed).toBe(listed);
      expect(result.current.toggleQuestion).toBe(toggleQuestion);
    });
  });

  describe("when the other side changes", () => {
    it("compares the taker with the new one", () => {
      const { result, rerender } = renderView(exampleOrientationSide);

      act(() => result.current.setIsOnlyDisagreement(true));
      rerender({ side: exampleFriendSide });

      expect(getIds(result.current)).toEqual(["future", "housing", "prices"]);
    });
  });
});

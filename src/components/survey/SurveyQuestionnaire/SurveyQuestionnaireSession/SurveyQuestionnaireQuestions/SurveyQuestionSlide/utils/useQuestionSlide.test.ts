import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { SurveyQuestion } from "@/types/survey";
import { createSurvey } from "@/utils/vitest/createSurvey";

import { useQuestionSlide } from "./useQuestionSlide";

const DURATION_MS = 300;
const [first, second, third] = createSurvey().questions;

const renderSlide = (question: SurveyQuestion = first, position = 0) =>
  renderHook(
    (props: { question: SurveyQuestion; position: number }) =>
      useQuestionSlide(props.question, props.position, DURATION_MS),
    { initialProps: { question, position } },
  );

const stubReducedMotion = (matches: boolean) =>
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({ matches })),
  );

describe("useQuestionSlide()", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    stubReducedMotion(false);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  describe("when the question appears", () => {
    it("is the only one, and came from nowhere", () => {
      const { result } = renderSlide();

      expect(result.current).toEqual({
        current: first,
        direction: undefined,
        leaving: undefined,
      });
      expect(vi.getTimerCount()).toBe(0);
    });
  });

  describe("when the next question takes its place", () => {
    it("arrives forwards while the question before leaves, from the same render on", () => {
      const { result, rerender } = renderSlide();

      rerender({ question: second, position: 1 });

      expect(result.current).toEqual({
        current: second,
        direction: "forwards",
        leaving: first,
      });
    });

    it("is alone again when the slide is over, and keeps the way it arrived", () => {
      const { result, rerender } = renderSlide();

      rerender({ question: second, position: 1 });
      act(() => vi.advanceTimersByTime(DURATION_MS - 1));

      expect(result.current.leaving).toBe(first);

      act(() => vi.advanceTimersByTime(1));

      expect(result.current).toEqual({
        current: second,
        direction: "forwards",
        leaving: undefined,
      });
      expect(vi.getTimerCount()).toBe(0);
    });
  });

  describe("when the question before takes its place", () => {
    it("arrives backwards", () => {
      const { result, rerender } = renderSlide(second, 1);

      rerender({ question: first, position: 0 });

      expect(result.current).toEqual({
        current: first,
        direction: "backwards",
        leaving: second,
      });
    });
  });

  describe("when another question takes its place at the same position", () => {
    it("arrives forwards", () => {
      const { result, rerender } = renderSlide(first, 2);

      rerender({ question: third, position: 2 });

      expect(result.current.direction).toBe("forwards");
      expect(result.current.leaving).toBe(first);
    });
  });

  describe("when the same question is handed in again", () => {
    it("shows it as it is now, and nothing leaves", () => {
      const { result, rerender } = renderSlide();
      const translated = { ...first, text: "Taxes should be lower." };

      rerender({ question: translated, position: 0 });

      expect(result.current).toEqual({
        current: translated,
        direction: undefined,
        leaving: undefined,
      });
      expect(vi.getTimerCount()).toBe(0);
    });

    it("does not start the slide again while one is under way", () => {
      const { result, rerender } = renderSlide();

      rerender({ question: second, position: 1 });
      act(() => vi.advanceTimersByTime(DURATION_MS - 100));
      rerender({ question: second, position: 1 });
      act(() => vi.advanceTimersByTime(100));

      expect(result.current.leaving).toBeUndefined();
    });
  });

  describe("when a question arrives while another is still leaving", () => {
    it("lets the one that was arriving leave: there are never more than two", () => {
      const { result, rerender } = renderSlide();

      rerender({ question: second, position: 1 });
      act(() => vi.advanceTimersByTime(DURATION_MS / 2));
      rerender({ question: third, position: 2 });

      expect(result.current).toEqual({
        current: third,
        direction: "forwards",
        leaving: second,
      });
    });

    it("gives the new slide its whole time", () => {
      const { result, rerender } = renderSlide();

      rerender({ question: second, position: 1 });
      act(() => vi.advanceTimersByTime(DURATION_MS / 2));
      rerender({ question: third, position: 2 });
      act(() => vi.advanceTimersByTime(DURATION_MS - 1));

      expect(result.current.leaving).toBe(second);

      act(() => vi.advanceTimersByTime(1));

      expect(result.current.leaving).toBeUndefined();
      expect(vi.getTimerCount()).toBe(0);
    });

    it("turns round when the taker steps back in the middle of a slide", () => {
      const { result, rerender } = renderSlide();

      rerender({ question: second, position: 1 });
      act(() => vi.advanceTimersByTime(DURATION_MS / 2));
      rerender({ question: first, position: 0 });

      expect(result.current).toEqual({
        current: first,
        direction: "backwards",
        leaving: second,
      });

      act(() => vi.advanceTimersByTime(DURATION_MS));

      expect(result.current.leaving).toBeUndefined();
    });
  });

  describe("given a taker who asked for less movement", () => {
    it("replaces the question at once: nothing leaves and nothing has a direction", () => {
      stubReducedMotion(true);

      const { result, rerender } = renderSlide();

      rerender({ question: second, position: 1 });

      expect(result.current).toEqual({
        current: second,
        direction: undefined,
        leaving: undefined,
      });
      expect(vi.getTimerCount()).toBe(0);
    });

    it("forgets the way an earlier question arrived", () => {
      const { result, rerender } = renderSlide();

      rerender({ question: second, position: 1 });
      act(() => vi.advanceTimersByTime(DURATION_MS));
      stubReducedMotion(true);
      rerender({ question: third, position: 2 });

      expect(result.current.direction).toBeUndefined();
      expect(result.current.leaving).toBeUndefined();
    });
  });

  describe("given nothing that can say what the taker asked for", () => {
    it("replaces the question at once", () => {
      vi.stubGlobal("matchMedia", undefined);

      const { result, rerender } = renderSlide();

      rerender({ question: second, position: 1 });

      expect(result.current.leaving).toBeUndefined();
      expect(result.current.direction).toBeUndefined();
    });
  });

  describe("when taken off screen in the middle of a slide", () => {
    it("leaves no timer running", () => {
      const { rerender, unmount } = renderSlide();

      rerender({ question: second, position: 1 });

      expect(vi.getTimerCount()).toBe(1);

      unmount();

      expect(vi.getTimerCount()).toBe(0);
    });
  });
});

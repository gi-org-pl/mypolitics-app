import { renderHook } from "@testing-library/react";
import { StrictMode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useFirstViewVisit } from "./useFirstViewVisit";

const HOME = "routes/_index";
const QUIZ = "routes/quizzes.$quizSlug";

type Props = { routeId?: string };

const renderVisit = (routeId?: string, options?: { strict?: boolean }) =>
  renderHook(({ routeId: id }: Props) => useFirstViewVisit(id), {
    initialProps: { routeId } as Props,
    wrapper: options?.strict ? StrictMode : undefined,
  });

describe("useFirstViewVisit()", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe("given the first visit of a view in the session", () => {
    it("answers no on the first render, before the storage is read", () => {
      const answers: boolean[] = [];

      renderHook(() => {
        const answer = useFirstViewVisit(HOME);

        answers.push(answer);

        return answer;
      });

      expect(answers).toEqual([false, true]);
    });

    it("is a first visit after mount", () => {
      const { result } = renderVisit(HOME);

      expect(result.current).toBe(true);
    });

    it("is a first visit in strict mode too, where the effect runs twice", () => {
      const { result } = renderVisit(HOME, { strict: true });

      expect(result.current).toBe(true);
    });
  });

  describe("given a later visit of the view in the same session", () => {
    it("is not a first visit", () => {
      renderVisit(HOME).unmount();

      const { result } = renderVisit(HOME);

      expect(result.current).toBe(false);
    });
  });

  describe("given a move to another view and back", () => {
    it("answers for each view on its own", () => {
      const { result, rerender } = renderVisit(HOME);

      rerender({ routeId: QUIZ });
      expect(result.current).toBe(true);

      rerender({ routeId: HOME });
      expect(result.current).toBe(false);

      rerender({ routeId: QUIZ });
      expect(result.current).toBe(false);
    });

    it("answers no for a view that was seen, even after no view at all", () => {
      const { result, rerender } = renderVisit(HOME);

      rerender({ routeId: undefined });
      expect(result.current).toBe(false);

      rerender({ routeId: HOME });
      expect(result.current).toBe(false);
    });
  });

  describe("given no route", () => {
    it("is not a first visit", () => {
      const { result } = renderVisit(undefined);

      expect(result.current).toBe(false);
    });
  });

  describe("given a browser that refuses the storage", () => {
    it("is never a first visit", () => {
      vi.stubGlobal("sessionStorage", undefined);

      const { result } = renderVisit(HOME);

      expect(result.current).toBe(false);
    });
  });
});

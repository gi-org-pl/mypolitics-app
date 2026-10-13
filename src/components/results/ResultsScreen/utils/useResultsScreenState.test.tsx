import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { act, cleanup, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_LANGUAGE } from "@/constants/common";

import {
  type ResultsScreenState,
  ResultsScreenStatus,
} from "../ResultsScreen.types";
import { loadResultsScreen } from "./loadResultsScreen";
import { useResultsScreenState } from "./useResultsScreenState";

vi.mock("./loadResultsScreen");

const RESULT_ID = "3f0c2a52-6f7b-4d53-9a55-0d5f1b9f3c11";
const OTHER_RESULT_ID = "0b9f3c1e-5a7d-4e2b-9c41-7f6a2d8e1b35";

const LOADING: ResultsScreenState = { status: ResultsScreenStatus.Loading };
const FAILED: ResultsScreenState = { status: ResultsScreenStatus.Failed };
const NOT_FOUND: ResultsScreenState = { status: ResultsScreenStatus.NotFound };

const loadMock = vi.mocked(loadResultsScreen);

const wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider i18n={i18n}>{children}</I18nProvider>
);

const renderState = (resultId = RESULT_ID) =>
  renderHook(({ id }) => useResultsScreenState(id), {
    initialProps: { id: resultId },
    wrapper,
  });

// A loading that the test ends by hand.
const holdLoading = () => {
  let finish: (state: ResultsScreenState) => void = () => undefined;

  loadMock.mockImplementationOnce(
    () =>
      new Promise<ResultsScreenState>((resolve) => {
        finish = resolve;
      }),
  );

  return (state: ResultsScreenState) => act(async () => finish(state));
};

const getSignal = (call: number): AbortSignal => loadMock.mock.calls[call][2];

describe("useResultsScreenState()", () => {
  beforeEach(() => {
    loadMock.mockResolvedValue(FAILED);
  });

  afterEach(() => {
    cleanup();
    i18n.activate(DEFAULT_LANGUAGE);
    vi.resetAllMocks();
  });

  describe("when the address is opened", () => {
    it("loads the result of the address in the language of the app, once", async () => {
      const finish = holdLoading();

      renderState();

      expect(loadMock).toHaveBeenCalledTimes(1);
      expect(loadMock).toHaveBeenCalledWith(
        RESULT_ID,
        DEFAULT_LANGUAGE,
        expect.any(AbortSignal),
      );

      await finish(FAILED);

      expect(loadMock).toHaveBeenCalledTimes(1);
    });

    it("is loading until the loading has ended, then in the state it ended with", async () => {
      const finish = holdLoading();
      const { result } = renderState();

      expect(result.current.state).toEqual(LOADING);

      await finish(NOT_FOUND);

      expect(result.current.state).toBe(NOT_FOUND);
    });
  });

  describe("when the retry is used", () => {
    it("starts loading again from the result, and is loading from the same render on", async () => {
      const { result } = renderState();

      await act(async () => undefined);

      expect(result.current.state).toBe(FAILED);

      const finish = holdLoading();

      act(() => result.current.retry());

      expect(result.current.state).toEqual(LOADING);
      expect(loadMock).toHaveBeenCalledTimes(2);
      expect(loadMock).toHaveBeenLastCalledWith(
        RESULT_ID,
        DEFAULT_LANGUAGE,
        expect.any(AbortSignal),
      );

      await finish(NOT_FOUND);

      expect(result.current.state).toBe(NOT_FOUND);
    });

    it("keeps the same retry between renders", async () => {
      const { result, rerender } = renderState();
      const { retry } = result.current;

      await act(async () => undefined);
      rerender({ id: RESULT_ID });

      expect(result.current.retry).toBe(retry);
    });
  });

  describe("when the address changes to another result", () => {
    it("loads the other result, cancels the loading that was left and ignores its outcome", async () => {
      const finishFirst = holdLoading();
      const finishSecond = holdLoading();
      const { result, rerender } = renderState();

      rerender({ id: OTHER_RESULT_ID });

      expect(loadMock).toHaveBeenLastCalledWith(
        OTHER_RESULT_ID,
        DEFAULT_LANGUAGE,
        expect.any(AbortSignal),
      );
      expect(getSignal(0).aborted).toBe(true);
      expect(getSignal(1).aborted).toBe(false);

      await finishFirst(NOT_FOUND);

      expect(result.current.state).toEqual(LOADING);

      await finishSecond(FAILED);

      expect(result.current.state).toBe(FAILED);
    });

    it("is loading from the render the address changed in", async () => {
      const { result, rerender } = renderState();

      await act(async () => undefined);

      expect(result.current.state).toBe(FAILED);

      holdLoading();
      rerender({ id: OTHER_RESULT_ID });

      expect(result.current.state).toEqual(LOADING);
    });
  });

  describe("when the language of the app changes", () => {
    it("loads the result again in that language, and is loading meanwhile", async () => {
      const { result } = renderState();

      await act(async () => undefined);

      const finish = holdLoading();

      act(() => i18n.activate("en"));

      expect(result.current.state).toEqual(LOADING);
      expect(loadMock).toHaveBeenCalledTimes(2);
      expect(loadMock).toHaveBeenLastCalledWith(
        RESULT_ID,
        "en",
        expect.any(AbortSignal),
      );

      await finish(NOT_FOUND);

      expect(result.current.state).toBe(NOT_FOUND);
    });
  });

  describe("when unmounted", () => {
    it("cancels the loading on its way", () => {
      holdLoading();

      const { unmount } = renderState();

      unmount();

      expect(getSignal(0).aborted).toBe(true);
    });
  });
});

import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_LANGUAGE } from "@/constants/common";
import { getLatestSurvey } from "@/services/api/client/getLatestSurvey";
import type { SurveyLoadResult } from "@/types/survey";
import { createSurvey } from "@/utils/vitest/createSurvey";

import { useSurvey } from "./useSurvey";

vi.mock("@/services/api/client/getLatestSurvey");

const PROJECT_ID = "project";
const OTHER_LANGUAGE = "en";

const survey = createSurvey();
const getLatestSurveyMock = vi.mocked(getLatestSurvey);

const wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider i18n={i18n}>{children}</I18nProvider>
);

const renderSurvey = (projectId?: string) =>
  renderHook(({ id }) => useSurvey(id), {
    wrapper,
    initialProps: { id: projectId },
  });

// A reading that the test ends by hand.
const holdReading = () => {
  let finish: (result: SurveyLoadResult) => void = () => undefined;

  getLatestSurveyMock.mockImplementationOnce(
    () =>
      new Promise<SurveyLoadResult>((resolve) => {
        finish = resolve;
      }),
  );

  return (result: SurveyLoadResult) => act(async () => finish(result));
};

describe("useSurvey()", () => {
  beforeEach(() => {
    getLatestSurveyMock.mockResolvedValue({ status: "ready", survey });
  });

  afterEach(() => {
    cleanup();
    i18n.activate(DEFAULT_LANGUAGE);
    vi.resetAllMocks();
  });

  describe("given no project identifier", () => {
    it("is not-found and reads nothing", () => {
      const { result } = renderSurvey();

      expect(result.current.load).toEqual({ status: "not-found" });
      expect(getLatestSurveyMock).not.toHaveBeenCalled();
    });
  });

  describe("given a project identifier", () => {
    it("is loading, then ready with the quiz", async () => {
      const { result } = renderSurvey(PROJECT_ID);

      expect(result.current.load).toEqual({ status: "loading" });

      await waitFor(() =>
        expect(result.current.load).toEqual({ status: "ready", survey }),
      );
    });

    it("asks for the quiz in the language of the app", async () => {
      const { result } = renderSurvey(PROJECT_ID);

      await waitFor(() => expect(result.current.load.status).toBe("ready"));

      expect(getLatestSurveyMock).toHaveBeenCalledTimes(1);
      expect(getLatestSurveyMock).toHaveBeenCalledWith(
        PROJECT_ID,
        DEFAULT_LANGUAGE,
        {
          signal: expect.any(AbortSignal),
        },
      );
    });

    it("is not-found when the quiz does not exist", async () => {
      getLatestSurveyMock.mockResolvedValue({ status: "not-found" });

      const { result } = renderSurvey(PROJECT_ID);

      await waitFor(() =>
        expect(result.current.load).toEqual({ status: "not-found" }),
      );
    });

    it("is failed when the quiz cannot be read", async () => {
      getLatestSurveyMock.mockResolvedValue({ status: "failed" });

      const { result } = renderSurvey(PROJECT_ID);

      await waitFor(() =>
        expect(result.current.load).toEqual({ status: "failed" }),
      );
    });

    it("does not read the quiz again while it is ready", async () => {
      const { result, rerender } = renderSurvey(PROJECT_ID);

      await waitFor(() => expect(result.current.load.status).toBe("ready"));

      rerender({ id: PROJECT_ID });
      rerender({ id: PROJECT_ID });

      expect(result.current.load).toEqual({ status: "ready", survey });
      expect(getLatestSurveyMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("when retry is called", () => {
    it("is loading again and reads the quiz again", async () => {
      getLatestSurveyMock.mockResolvedValueOnce({ status: "failed" });

      const { result } = renderSurvey(PROJECT_ID);

      await waitFor(() => expect(result.current.load.status).toBe("failed"));

      const finish = holdReading();

      act(() => result.current.retry());

      expect(result.current.load).toEqual({ status: "loading" });
      expect(getLatestSurveyMock).toHaveBeenCalledTimes(2);

      await finish({ status: "ready", survey });

      expect(result.current.load).toEqual({ status: "ready", survey });
    });

    it("keeps the same function between renders", async () => {
      const { result, rerender } = renderSurvey(PROJECT_ID);
      const { retry } = result.current;

      await waitFor(() => expect(result.current.load.status).toBe("ready"));
      rerender({ id: PROJECT_ID });

      expect(result.current.retry).toBe(retry);
    });
  });

  describe("when the language of the app changes", () => {
    it("reads the quiz again, and is loading until it arrives", async () => {
      const { result } = renderSurvey(PROJECT_ID);

      await waitFor(() => expect(result.current.load.status).toBe("ready"));

      const translatedSurvey = createSurvey({ name: "Test quiz" });
      const finish = holdReading();

      act(() => i18n.activate(OTHER_LANGUAGE));

      expect(result.current.load).toEqual({ status: "loading" });
      expect(getLatestSurveyMock).toHaveBeenLastCalledWith(
        PROJECT_ID,
        OTHER_LANGUAGE,
        { signal: expect.any(AbortSignal) },
      );

      await finish({ status: "ready", survey: translatedSurvey });

      expect(result.current.load).toEqual({
        status: "ready",
        survey: translatedSurvey,
      });
    });
  });

  describe("when the identifier changes", () => {
    it("reads the other quiz, and is loading until it arrives", async () => {
      const { result, rerender } = renderSurvey(PROJECT_ID);

      await waitFor(() => expect(result.current.load.status).toBe("ready"));

      const finish = holdReading();

      rerender({ id: "other" });

      expect(result.current.load).toEqual({ status: "loading" });

      await finish({ status: "not-found" });

      expect(result.current.load).toEqual({ status: "not-found" });
    });
  });

  describe("when unmounted while the quiz is on its way", () => {
    it("cancels the request and ignores its result", async () => {
      const finish = holdReading();
      const { result, unmount } = renderSurvey(PROJECT_ID);
      const signal = getLatestSurveyMock.mock.calls[0][2]?.signal;

      expect(signal?.aborted).toBe(false);

      unmount();

      expect(signal?.aborted).toBe(true);

      await finish({ status: "ready", survey });

      expect(result.current.load).toEqual({ status: "loading" });
    });
  });

  describe("when a reading is replaced before it arrives", () => {
    it("ignores the result of the reading that was left", async () => {
      const finishFirst = holdReading();
      const { result } = renderSurvey(PROJECT_ID);
      const finishSecond = holdReading();

      act(() => result.current.retry());

      await finishFirst({ status: "failed" });

      expect(result.current.load).toEqual({ status: "loading" });

      await finishSecond({ status: "ready", survey });

      expect(result.current.load).toEqual({ status: "ready", survey });
    });
  });
});

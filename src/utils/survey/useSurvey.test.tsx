import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_LANGUAGE } from "@/constants/common";
import { getSurvey } from "@/services/api/client/getSurvey";
import type { SurveyLoadResult } from "@/types/survey";
import { createSurvey } from "@/utils/vitest/createSurvey";

import { useSurvey } from "./useSurvey";

vi.mock("@/services/api/client/getSurvey");

const SURVEY_ID = "survey";
const OTHER_LANGUAGE = "en";

const survey = createSurvey();
const getSurveyMock = vi.mocked(getSurvey);

const wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider i18n={i18n}>{children}</I18nProvider>
);

const renderSurvey = (surveyId?: string) =>
  renderHook(({ id }) => useSurvey(id), {
    wrapper,
    initialProps: { id: surveyId },
  });

// A reading that the test ends by hand.
const holdReading = () => {
  let finish: (result: SurveyLoadResult) => void = () => undefined;

  getSurveyMock.mockImplementationOnce(
    () =>
      new Promise<SurveyLoadResult>((resolve) => {
        finish = resolve;
      }),
  );

  return (result: SurveyLoadResult) => act(async () => finish(result));
};

describe("useSurvey()", () => {
  beforeEach(() => {
    getSurveyMock.mockResolvedValue({ status: "ready", survey });
  });

  afterEach(() => {
    cleanup();
    i18n.activate(DEFAULT_LANGUAGE);
    vi.resetAllMocks();
  });

  describe("given no quiz identifier", () => {
    it("is not-found and reads nothing", () => {
      const { result } = renderSurvey();

      expect(result.current.load).toEqual({ status: "not-found" });
      expect(getSurveyMock).not.toHaveBeenCalled();
    });
  });

  describe("given a quiz identifier", () => {
    it("is loading, then ready with the quiz", async () => {
      const { result } = renderSurvey(SURVEY_ID);

      expect(result.current.load).toEqual({ status: "loading" });

      await waitFor(() =>
        expect(result.current.load).toEqual({ status: "ready", survey }),
      );
    });

    it("asks for the quiz in the language of the app", async () => {
      const { result } = renderSurvey(SURVEY_ID);

      await waitFor(() => expect(result.current.load.status).toBe("ready"));

      expect(getSurveyMock).toHaveBeenCalledTimes(1);
      expect(getSurveyMock).toHaveBeenCalledWith(SURVEY_ID, DEFAULT_LANGUAGE, {
        signal: expect.any(AbortSignal),
      });
    });

    it("is not-found when the quiz does not exist", async () => {
      getSurveyMock.mockResolvedValue({ status: "not-found" });

      const { result } = renderSurvey(SURVEY_ID);

      await waitFor(() =>
        expect(result.current.load).toEqual({ status: "not-found" }),
      );
    });

    it("is failed when the quiz cannot be read", async () => {
      getSurveyMock.mockResolvedValue({ status: "failed" });

      const { result } = renderSurvey(SURVEY_ID);

      await waitFor(() =>
        expect(result.current.load).toEqual({ status: "failed" }),
      );
    });

    it("does not read the quiz again while it is ready", async () => {
      const { result, rerender } = renderSurvey(SURVEY_ID);

      await waitFor(() => expect(result.current.load.status).toBe("ready"));

      rerender({ id: SURVEY_ID });
      rerender({ id: SURVEY_ID });

      expect(result.current.load).toEqual({ status: "ready", survey });
      expect(getSurveyMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("when retry is called", () => {
    it("is loading again and reads the quiz again", async () => {
      getSurveyMock.mockResolvedValueOnce({ status: "failed" });

      const { result } = renderSurvey(SURVEY_ID);

      await waitFor(() => expect(result.current.load.status).toBe("failed"));

      const finish = holdReading();

      act(() => result.current.retry());

      expect(result.current.load).toEqual({ status: "loading" });
      expect(getSurveyMock).toHaveBeenCalledTimes(2);

      await finish({ status: "ready", survey });

      expect(result.current.load).toEqual({ status: "ready", survey });
    });

    it("keeps the same function between renders", async () => {
      const { result, rerender } = renderSurvey(SURVEY_ID);
      const { retry } = result.current;

      await waitFor(() => expect(result.current.load.status).toBe("ready"));
      rerender({ id: SURVEY_ID });

      expect(result.current.retry).toBe(retry);
    });
  });

  describe("when the language of the app changes", () => {
    it("reads the quiz again, and is loading until it arrives", async () => {
      const { result } = renderSurvey(SURVEY_ID);

      await waitFor(() => expect(result.current.load.status).toBe("ready"));

      const translatedSurvey = createSurvey({ name: "Test quiz" });
      const finish = holdReading();

      act(() => i18n.activate(OTHER_LANGUAGE));

      expect(result.current.load).toEqual({ status: "loading" });
      expect(getSurveyMock).toHaveBeenLastCalledWith(
        SURVEY_ID,
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
      const { result, rerender } = renderSurvey(SURVEY_ID);

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
      const { result, unmount } = renderSurvey(SURVEY_ID);
      const signal = getSurveyMock.mock.calls[0][2]?.signal;

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
      const { result } = renderSurvey(SURVEY_ID);
      const finishSecond = holdReading();

      act(() => result.current.retry());

      await finishFirst({ status: "failed" });

      expect(result.current.load).toEqual({ status: "loading" });

      await finishSecond({ status: "ready", survey });

      expect(result.current.load).toEqual({ status: "ready", survey });
    });
  });
});

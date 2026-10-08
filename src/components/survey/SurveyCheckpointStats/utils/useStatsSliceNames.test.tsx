import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it } from "vitest";

import { DEFAULT_LANGUAGE } from "@/constants/common";
import { messages as enMessages } from "@/locales/en/messages";

import { useStatsSliceNames } from "./useStatsSliceNames";

const wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider i18n={i18n}>{children}</I18nProvider>
);

describe("useStatsSliceNames()", () => {
  afterEach(() => {
    act(() => i18n.activate(DEFAULT_LANGUAGE));
  });

  it("names the three slices in Polish", () => {
    const { result } = renderHook(() => useStatsSliceNames(), { wrapper });

    expect(result.current).toEqual({
      for: "Za",
      against: "Przeciw",
      noAnswer: "Brak odpowiedzi",
    });
  });

  it("names them in the other language when the language changes", () => {
    const { result } = renderHook(() => useStatsSliceNames(), { wrapper });

    act(() => {
      i18n.load("en", enMessages);
      i18n.activate("en");
    });

    expect(result.current).toEqual({
      for: "For",
      against: "Against",
      noAnswer: "No answer",
    });
  });
});

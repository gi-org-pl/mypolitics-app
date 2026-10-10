import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it } from "vitest";

import { DEFAULT_LANGUAGE } from "@/constants/common";
import { messages as enMessages } from "@/locales/en/messages";
import type { StatsCheckpointCard } from "@/types/checkpoint";

import { useStatsDescription } from "./useStatsDescription";

const wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider i18n={i18n}>{children}</I18nProvider>
);

const createCard = (
  overrides: Partial<StatsCheckpointCard> = {},
): StatsCheckpointCard => ({
  type: "stats",
  boundary: 5,
  line: { pool: "stats-for", index: 0 },
  questionId: "q5",
  thesis: "Podatki powinny być niższe.",
  side: "for",
  counts: { for: 100, against: 600, noAnswer: 300 },
  percent: 10,
  ...overrides,
});

const describeCard = (overrides: Partial<StatsCheckpointCard> = {}) =>
  renderHook(() => useStatsDescription(createCard(overrides)), { wrapper });

describe("useStatsDescription()", () => {
  afterEach(() => {
    act(() => i18n.activate(DEFAULT_LANGUAGE));
  });

  it("lists the three slices with their percents, in the order of the legend", () => {
    expect(describeCard().result.current).toBe(
      "Za: 10%, Przeciw: 60%, Brak odpowiedzi: 30%",
    );
  });

  it("gives the taker's side the percent of the statement", () => {
    expect(
      describeCard({
        side: "against",
        counts: { for: 870, against: 0, noAnswer: 130 },
        percent: 1,
      }).result.current,
    ).toBe("Za: 87%, Przeciw: 1%, Brak odpowiedzi: 13%");
  });

  it("lists them in the other language when the language changes", () => {
    const { result } = describeCard();

    act(() => {
      i18n.load("en", enMessages);
      i18n.activate("en");
    });

    expect(result.current).toBe("For: 10%, Against: 60%, No answer: 30%");
  });

  it("returns nothing when there are no shares", () => {
    expect(
      describeCard({ counts: { for: 0, against: 0, noAnswer: 0 } }).result
        .current,
    ).toBeUndefined();
    expect(
      describeCard({ counts: { for: -1, against: 600, noAnswer: 300 } }).result
        .current,
    ).toBeUndefined();
  });
});

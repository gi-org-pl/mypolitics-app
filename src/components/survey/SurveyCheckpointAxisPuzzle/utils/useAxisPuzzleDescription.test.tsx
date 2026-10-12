import { type I18n, setupI18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { messages as enMessages } from "@/locales/en/messages";
import { messages as plMessages } from "@/locales/pl/messages";
import type { AxisPuzzleCheckpointCard } from "@/types/checkpoint";
import type { CheckpointGuessState } from "@/utils/checkpoint/useCheckpointGuess";
import { createAxisPair } from "@/utils/vitest/createAxisPair";

import { useAxisPuzzleDescription } from "./useAxisPuzzleDescription";

// The catalogs of the app, as `root.tsx` loads them.
const createI18n = (locale: "pl" | "en" = "pl"): I18n =>
  setupI18n({ locale, messages: { en: enMessages, pl: plMessages } });

const createCard = (
  leadingSide: "start" | "end",
  startName = "Interwencjonizm",
  endName = "Wolny rynek",
): AxisPuzzleCheckpointCard => {
  const { start, end } = createAxisPair(
    "economy",
    startName,
    endName,
    leadingSide === "start" ? 73 : 27,
    leadingSide === "start" ? 27 : 73,
  );

  return {
    type: "axis-puzzle",
    boundary: 11,
    axisId: "economy",
    start,
    end,
    leadingSide,
    line: { pool: "axis-puzzle-ask", index: 0 },
  };
};

const renderDescription = (
  card: AxisPuzzleCheckpointCard,
  state: CheckpointGuessState,
  i18n = createI18n(),
) =>
  renderHook(() => useAxisPuzzleDescription(card, state), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <I18nProvider i18n={i18n}>{children}</I18nProvider>
    ),
  });

const describeBar = (
  card: AxisPuzzleCheckpointCard,
  state: CheckpointGuessState,
  i18n?: I18n,
) => renderDescription(card, state, i18n).result.current;

describe("useAxisPuzzleDescription()", () => {
  describe("given the ask state", () => {
    it("names both poles and says the reading is hidden", () => {
      expect(describeBar(createCard("end"), "ask")).toBe(
        "„Interwencjonizm” i „Wolny rynek”: wynik ukryty",
      );
      expect(describeBar(createCard("end"), "ask", createI18n("en"))).toBe(
        "“Interwencjonizm” and “Wolny rynek”: the reading is hidden",
      );
    });

    it("carries no number and does not name the leading pole apart", () => {
      const whenStartLeads = describeBar(createCard("start"), "ask");
      const whenEndLeads = describeBar(createCard("end"), "ask");

      expect(whenStartLeads).toBe(whenEndLeads);
      expect(whenStartLeads).not.toMatch(/[\d%]/);
      expect(
        describeBar(createCard("start"), "ask", createI18n("en")),
      ).not.toMatch(/[\d%]/);
    });
  });

  describe("given the hit or the miss state", () => {
    it("names both poles and says which one the taker is closer to", () => {
      for (const state of ["hit", "miss"] as const) {
        expect(describeBar(createCard("end"), state)).toBe(
          "„Interwencjonizm” i „Wolny rynek”: bliżej Ci do strony „Wolny rynek”",
        );
        expect(describeBar(createCard("start"), state)).toBe(
          "„Interwencjonizm” i „Wolny rynek”: bliżej Ci do strony „Interwencjonizm”",
        );
      }

      expect(describeBar(createCard("end"), "hit", createI18n("en"))).toBe(
        "“Interwencjonizm” and “Wolny rynek”: you are closer to the “Wolny rynek” side",
      );
    });

    it("carries no number", () => {
      for (const state of ["hit", "miss"] as const) {
        expect(describeBar(createCard("end"), state)).not.toMatch(/[\d%]/);
        expect(
          describeBar(createCard("start"), state, createI18n("en")),
        ).not.toMatch(/[\d%]/);
      }
    });
  });

  it("collapses line breaks and doubled spaces in a name", () => {
    const card = createCard(
      "end",
      "Interwencjonizm \n państwowy",
      "Wolny   rynek",
    );

    expect(describeBar(card, "ask")).toBe(
      "„Interwencjonizm państwowy” i „Wolny rynek”: wynik ukryty",
    );
    expect(describeBar(card, "miss")).toBe(
      "„Interwencjonizm państwowy” i „Wolny rynek”: bliżej Ci do strony „Wolny rynek”",
    );
  });

  it("places a name as written, in full", () => {
    const longName = `PAŃSTWO „minimum” {x} ${"bardzo ".repeat(20)}długie`;

    expect(describeBar(createCard("start", longName), "hit")).toBe(
      `„${longName}” i „Wolny rynek”: bliżej Ci do strony „${longName}”`,
    );
  });

  it("follows the state and the language when they change", () => {
    const i18n = createI18n();
    const card = createCard("end");
    const { result, rerender } = renderHook(
      ({ state }: { state: CheckpointGuessState }) =>
        useAxisPuzzleDescription(card, state),
      {
        initialProps: { state: "ask" as CheckpointGuessState },
        wrapper: ({ children }: { children: ReactNode }) => (
          <I18nProvider i18n={i18n}>{children}</I18nProvider>
        ),
      },
    );

    rerender({ state: "hit" });

    expect(result.current).toBe(
      "„Interwencjonizm” i „Wolny rynek”: bliżej Ci do strony „Wolny rynek”",
    );

    act(() => i18n.activate("en"));

    expect(result.current).toBe(
      "“Interwencjonizm” and “Wolny rynek”: you are closer to the “Wolny rynek” side",
    );
  });

  it("is blank, without throwing, for a card that cannot be read", () => {
    const broken = {
      ...createCard("end"),
      start: undefined,
    } as unknown as AxisPuzzleCheckpointCard;

    expect(describeBar(broken, "ask")).toBe("");
    expect(describeBar(broken, "hit")).toBe("");
  });
});

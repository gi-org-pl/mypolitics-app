import { type I18n, setupI18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { messages as enMessages } from "@/locales/en/messages";
import { messages as plMessages } from "@/locales/pl/messages";
import type { AxisClosenessCheckpointCard } from "@/types/checkpoint";
import { createAxisPair } from "@/utils/vitest/createAxisPair";
import { createOrientation } from "@/utils/vitest/createOrientation";

import { useAxisClosenessDescription } from "./useAxisClosenessDescription";

// The catalogs of the app, as `root.tsx` loads them.
const createI18n = (locale: "pl" | "en" = "pl"): I18n =>
  setupI18n({ locale, messages: { en: enMessages, pl: plMessages } });

const createSingleCard = (name?: string): AxisClosenessCheckpointCard => ({
  type: "axis-closeness",
  variant: "single",
  boundary: 5,
  axisId: "radicalism",
  entry: { orientation: createOrientation("radicalism", name), value: 80 },
  line: { pool: "axis-closeness-single", index: 0 },
});

const createDoubleCard = (
  leadingSide: "start" | "end",
  startName = "Eurosceptycyzm",
  endName = "Federacjonizm",
): AxisClosenessCheckpointCard => {
  const { start, end } = createAxisPair(
    "union",
    startName,
    endName,
    leadingSide === "start" ? 69 : 31,
    leadingSide === "start" ? 31 : 69,
  );

  return {
    type: "axis-closeness",
    variant: "double",
    boundary: 5,
    axisId: "union",
    start,
    end,
    leadingSide,
    line: { pool: "axis-closeness-double", index: 0 },
  };
};

const renderDescription = (
  card: AxisClosenessCheckpointCard,
  i18n = createI18n(),
) =>
  renderHook(() => useAxisClosenessDescription(card), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <I18nProvider i18n={i18n}>{children}</I18nProvider>
    ),
  });

const describeCard = (card: AxisClosenessCheckpointCard, i18n?: I18n) =>
  renderDescription(card, i18n).result.current;

describe("useAxisClosenessDescription()", () => {
  it("names the orientation and says its score is high for the single variant", () => {
    expect(describeCard(createSingleCard("Radykalizm"))).toBe(
      "Skala „Radykalizm”: wysoki wynik",
    );
  });

  it("names both sides in the bar's order and the side that is ahead for the double variant", () => {
    expect(describeCard(createDoubleCard("start"))).toBe(
      "„Eurosceptycyzm” i „Federacjonizm”: wyższy wynik po stronie „Eurosceptycyzm”",
    );
    expect(describeCard(createDoubleCard("end"))).toBe(
      "„Eurosceptycyzm” i „Federacjonizm”: wyższy wynik po stronie „Federacjonizm”",
    );
  });

  it("contains no digit and no percent sign", () => {
    for (const card of [
      createSingleCard("Radykalizm"),
      createDoubleCard("start"),
      createDoubleCard("end"),
    ]) {
      expect(describeCard(card)).not.toMatch(/[\d%]/);
      expect(describeCard(card, createI18n("en"))).not.toMatch(/[\d%]/);
    }
  });

  it("places a name as written", () => {
    expect(describeCard(createSingleCard("PAŃSTWO „minimum”"))).toBe(
      "Skala „PAŃSTWO „minimum””: wysoki wynik",
    );
    expect(
      describeCard(createDoubleCard("end", "religijność", "Świeckość {x}")),
    ).toBe(
      "„religijność” i „Świeckość {x}”: wyższy wynik po stronie „Świeckość {x}”",
    );
  });

  it("puts a name with line breaks or doubled spaces on one line, in full", () => {
    const longName = `Bardzo  długa \n nazwa ${"orientacji ".repeat(20)}autorskiej`;

    expect(describeCard(createSingleCard(longName))).toBe(
      `Skala „Bardzo długa nazwa ${"orientacji ".repeat(20)}autorskiej”: wysoki wynik`,
    );
  });

  it("describes the bar in English when the app runs in English", () => {
    expect(describeCard(createSingleCard("Radykalizm"), createI18n("en"))).toBe(
      "The “Radykalizm” scale: a high score",
    );
    expect(describeCard(createDoubleCard("end"), createI18n("en"))).toBe(
      "“Eurosceptycyzm” and “Federacjonizm”: the higher score is on the “Federacjonizm” side",
    );
  });

  it("follows the language when it changes", () => {
    const i18n = createI18n();
    const { result } = renderDescription(createSingleCard("Radykalizm"), i18n);

    act(() => i18n.activate("en"));

    expect(result.current).toBe("The “Radykalizm” scale: a high score");
  });

  it("is blank, without throwing, for a card that cannot be read", () => {
    const broken = {
      ...createSingleCard("Radykalizm"),
      entry: undefined,
    } as unknown as AxisClosenessCheckpointCard;

    expect(describeCard(broken)).toBe("");
  });
});

import { i18n as appI18n, type I18n, setupI18n } from "@lingui/core";
import { describe, expect, it } from "vitest";

import { CHECKPOINT_POOLS } from "@/constants/checkpoint";
import { messages as enMessages } from "@/locales/en/messages";
import { messages as plMessages } from "@/locales/pl/messages";
import type { CheckpointCard, CheckpointLine } from "@/types/checkpoint";
import {
  allCards,
  axisPuzzleCard,
  doubleClosenessCard,
  halfwayCard,
  newTraitCard,
  positionPuzzleCard,
  statsAgainstCard,
  statsForCard,
} from "@/utils/checkpoint/engine/getNextCheckpoint.fixtures";
import { createOrientation } from "@/utils/vitest/createOrientation";
import { getCardPoolIds } from "./getCardPoolIds";
import { getCheckpointText } from "./getCheckpointText";

// The catalogs of the app, as `root.tsx` loads them.
const createI18n = (locale: "pl" | "en"): I18n =>
  setupI18n({ locale, messages: { en: enMessages, pl: plMessages } });

describe("getCheckpointText()", () => {
  it("returns the lead-in and the statement of the card's line with its slots filled", () => {
    expect(getCheckpointText(createI18n("pl"), halfwayCard)).toEqual({
      leadIn: "Jesteś na półmetku",
      statement: "To już prawie koniec, pozostałe pytania zajmą ok. 7 min.",
    });
    expect(getCheckpointText(createI18n("pl"), doubleClosenessCard)).toEqual({
      leadIn: "Szala się przechyla",
      statement:
        "Jak dotąd strona „Eurosceptycyzm” wyprzedza u Ciebie stronę „Federalizm”.",
    });
    expect(getCheckpointText(createI18n("pl"), statsForCard)).toEqual({
      leadIn: "Rzadki okaz",
      statement:
        "Należysz do 8% osób, które popierają tezę „Podatki powinny być niższe”.",
    });
    expect(getCheckpointText(createI18n("pl"), statsAgainstCard)).toEqual({
      leadIn: "Jesteś w małej grupie",
      statement:
        "Tylko 8% osób jest przeciw tezie „Podatki powinny być niższe”.",
    });
  });

  it("returns the text of another line of the card when one is passed", () => {
    const i18n = createI18n("pl");

    expect(
      getCheckpointText(i18n, axisPuzzleCard, {
        pool: "axis-puzzle-hit",
        index: 0,
      }),
    ).toEqual({
      leadIn: "Trafione!",
      statement: "Na tym etapie quizu bliżej Ci do strony „Wolny rynek”.",
    });
    expect(
      getCheckpointText(i18n, axisPuzzleCard, {
        pool: "axis-puzzle-miss",
        index: 0,
      }),
    ).toEqual({
      leadIn: "A to ciekawe!",
      statement: "Wyszło inaczej, niż się spodziewasz.",
    });
    expect(
      getCheckpointText(i18n, positionPuzzleCard, {
        pool: "position-puzzle-hit",
        index: 1,
      }),
    ).toEqual({
      leadIn: "Jest!",
      statement: "Na tym etapie quizu najbliżej Ciebie jest Postać 1.",
    });
  });

  it("places a value with braces or markup in it as plain text", () => {
    const name = "{trait} <b>„Trzecia” {minutes, plural, one {#}}</b> 'RP'";
    const card = { ...newTraitCard, trait: createOrientation("trait", name) };

    expect(getCheckpointText(createI18n("pl"), card)?.statement).toBe(
      `Masz nową cechę: „${name}”... to dobrze, niedobrze?`,
    );
    expect(getCheckpointText(createI18n("en"), card)?.statement).toBe(
      `You have a new trait: “${name}”... good, bad?`,
    );
  });

  it("returns the same line in English when the language changes", () => {
    const i18n = createI18n("pl");

    i18n.activate("en");

    expect(getCheckpointText(i18n, halfwayCard)).toEqual({
      leadIn: "You are halfway there",
      statement: "Almost done, the remaining questions will take about 7 min.",
    });
    expect(
      getCheckpointText(i18n, positionPuzzleCard, {
        pool: "position-puzzle-hit",
        index: 0,
      }),
    ).toEqual({
      leadIn: "Spot on!",
      statement: "Postać 1 is very close to you at this stage of the quiz.",
    });
  });

  it("returns the Polish source when no catalog is loaded", () => {
    expect(getCheckpointText(appI18n, halfwayCard)).toEqual({
      leadIn: "Jesteś na półmetku",
      statement: "To już prawie koniec, pozostałe pytania zajmą ok. 7 min.",
    });
  });

  it("finishes every line of every pool a card can draw from, in both languages", () => {
    for (const locale of ["pl", "en"] as const) {
      const i18n = createI18n(locale);

      for (const card of allCards) {
        for (const pool of getCardPoolIds(card)) {
          for (const index of CHECKPOINT_POOLS[pool].keys()) {
            const text = getCheckpointText(i18n, card, { pool, index });

            expect(text?.leadIn).toMatch(/\S/);
            expect(text?.statement).toMatch(/\S/);
            expect(`${text?.leadIn}${text?.statement}`).not.toMatch(/[{}]/);
          }
        }
      }
    }
  });

  it("returns nothing when the slots cannot be filled or the line does not exist", () => {
    const i18n = createI18n("pl");

    expect(
      getCheckpointText(i18n, { ...halfwayCard, minutes: 0 }),
    ).toBeUndefined();
    expect(
      getCheckpointText(i18n, halfwayCard, { pool: "halfway", index: 3 }),
    ).toBeUndefined();
    expect(
      getCheckpointText(i18n, halfwayCard, { pool: "new-trait", index: 0 }),
    ).toBeUndefined();
    expect(
      getCheckpointText(i18n, halfwayCard, {
        pool: "unknown",
        index: 0,
      } as unknown as CheckpointLine),
    ).toBeUndefined();
    expect(
      getCheckpointText(i18n, halfwayCard, null as unknown as CheckpointLine),
    ).toBeUndefined();
  });

  it("returns nothing, and does not throw, when the text cannot be read", () => {
    const failing = {
      _: () => {
        throw new Error("no locale");
      },
    } as unknown as I18n;

    expect(getCheckpointText(failing, halfwayCard)).toBeUndefined();
    expect(
      getCheckpointText(createI18n("pl"), {
        ...halfwayCard,
        line: undefined,
      } as unknown as CheckpointCard),
    ).toBeUndefined();
  });
});

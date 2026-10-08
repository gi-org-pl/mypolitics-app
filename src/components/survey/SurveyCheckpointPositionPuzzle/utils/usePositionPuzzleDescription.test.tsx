import { type I18n, setupI18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { messages as enMessages } from "@/locales/en/messages";
import { messages as plMessages } from "@/locales/pl/messages";
import type { PositionPuzzleCheckpointCard } from "@/types/checkpoint";
import type { CheckpointGuessState } from "@/utils/checkpoint/useCheckpointGuess";
import { createOrientation } from "@/utils/vitest/createOrientation";

import { usePositionPuzzleDescription } from "./usePositionPuzzleDescription";

const LEADER_NAME = "Zielony postępowiec";
const HIDDEN = "Ukryta postać jest blisko Ciebie";
const HIDDEN_EN = "A hidden character is close to you";

// The catalogs of the app, as `root.tsx` loads them.
const createI18n = (locale: "pl" | "en" = "pl"): I18n =>
  setupI18n({ locale, messages: { en: enMessages, pl: plMessages } });

const createCard = (
  name: string | undefined = LEADER_NAME,
  closeness = 79,
): PositionPuzzleCheckpointCard => {
  const leader = createOrientation("green", name, { type: "identity" });

  return {
    type: "position-puzzle",
    boundary: 5,
    leader,
    closeness,
    options: [
      createOrientation("national", "Narodowy konserwatysta"),
      leader,
      createOrientation("sovereign", "Suwerenny patriota"),
    ],
    line: { pool: "position-puzzle-ask", index: 0 },
  };
};

const describeBar = (
  card: PositionPuzzleCheckpointCard,
  state: CheckpointGuessState,
  i18n = createI18n(),
) =>
  renderHook(() => usePositionPuzzleDescription(card, state), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <I18nProvider i18n={i18n}>{children}</I18nProvider>
    ),
  }).result.current;

describe("usePositionPuzzleDescription()", () => {
  describe("given the ask or the miss state", () => {
    it("says a hidden character is close, with no name and no number", () => {
      for (const state of ["ask", "miss"] as const) {
        expect(describeBar(createCard(), state)).toBe(HIDDEN);
        expect(describeBar(createCard(), state, createI18n("en"))).toBe(
          HIDDEN_EN,
        );
        expect(describeBar(createCard(), state)).not.toMatch(/[\d%]/);
        expect(describeBar(createCard(), state)).not.toContain(LEADER_NAME);
      }
    });

    it("is the same whoever the leader is and however close", () => {
      expect(describeBar(createCard("Suwerenny patriota", 55), "ask")).toBe(
        describeBar(createCard(LEADER_NAME, 99), "miss"),
      );
    });

    it("says so even for a card that cannot be read", () => {
      const broken = {
        ...createCard(),
        leader: undefined,
      } as unknown as PositionPuzzleCheckpointCard;

      expect(describeBar(broken, "ask")).toBe(HIDDEN);
    });
  });

  describe("given the hit state", () => {
    it("names the leader, with no number", () => {
      expect(describeBar(createCard(), "hit")).toBe(
        `${LEADER_NAME} jest blisko Ciebie`,
      );
      expect(describeBar(createCard(), "hit", createI18n("en"))).toBe(
        `${LEADER_NAME} is close to you`,
      );
      expect(describeBar(createCard(LEADER_NAME, 86), "hit")).not.toMatch(
        /[\d%]/,
      );
    });

    it("places the name as written, on one line", () => {
      const name = `ZIELONY „postępowiec” {x} \n ${"bardzo ".repeat(12)}długi`;

      expect(describeBar(createCard(name), "hit")).toBe(
        `${name.replace(/\s+/g, " ")} jest blisko Ciebie`,
      );
    });

    it("is blank, without throwing, for a card that cannot be read", () => {
      const broken = {
        ...createCard(),
        leader: undefined,
      } as unknown as PositionPuzzleCheckpointCard;

      expect(describeBar(broken, "hit")).toBe("");
    });
  });

  it("follows the state and the language when they change", () => {
    const i18n = createI18n();
    const card = createCard();
    const { result, rerender } = renderHook(
      ({ state }: { state: CheckpointGuessState }) =>
        usePositionPuzzleDescription(card, state),
      {
        initialProps: { state: "ask" as CheckpointGuessState },
        wrapper: ({ children }: { children: ReactNode }) => (
          <I18nProvider i18n={i18n}>{children}</I18nProvider>
        ),
      },
    );

    expect(result.current).toBe(HIDDEN);

    rerender({ state: "hit" });

    expect(result.current).toBe(`${LEADER_NAME} jest blisko Ciebie`);

    act(() => i18n.activate("en"));

    expect(result.current).toBe(`${LEADER_NAME} is close to you`);
  });
});

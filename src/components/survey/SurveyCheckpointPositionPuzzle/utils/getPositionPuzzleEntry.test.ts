import { describe, expect, it } from "vitest";

import { MATCH_BAND_COLORS } from "@/constants/results";
import type { PositionPuzzleCheckpointCard } from "@/types/checkpoint";
import { createOrientation } from "@/utils/vitest/createOrientation";

import { HIDDEN_BAR_COLOR } from "../SurveyCheckpointPositionPuzzle.constants";
import { getPositionPuzzleEntry } from "./getPositionPuzzleEntry";

const OWN_COLOR = "#e91e63";
const IMAGE = "https://example.com/green.png";
const LEADER = createOrientation("green", "Zielony postępowiec", {
  type: "identity",
  color: OWN_COLOR,
  imageUrl: IMAGE,
});

const createCard = (closeness: number): PositionPuzzleCheckpointCard => ({
  type: "position-puzzle",
  boundary: 5,
  leader: LEADER,
  closeness,
  options: [
    createOrientation("national", "Narodowy konserwatysta"),
    LEADER,
    createOrientation("sovereign", "Suwerenny patriota"),
  ],
  line: { pool: "position-puzzle-ask", index: 0 },
});

describe("getPositionPuzzleEntry()", () => {
  describe("given the ask or the miss state", () => {
    it("returns the closeness of the card as the value", () => {
      expect(getPositionPuzzleEntry(createCard(79), "ask").value).toBe(79);
      expect(getPositionPuzzleEntry(createCard(63.5), "miss").value).toBe(63.5);
    });

    it("returns an orientation with the neutral colour and no name, no image and not the leader's identifier", () => {
      for (const state of ["ask", "miss"] as const) {
        const { orientation } = getPositionPuzzleEntry(createCard(79), state);

        expect(orientation.color).toBe(HIDDEN_BAR_COLOR);
        expect(orientation.name).toBeUndefined();
        expect(orientation.imageUrl).toBeUndefined();
        expect(orientation.id).not.toBe(LEADER.id);
        expect(JSON.stringify(orientation)).not.toMatch(
          /green|Zielony|example|identity|e91e63/,
        );
      }
    });

    it("is the same whatever the closeness says about the band", () => {
      expect(getPositionPuzzleEntry(createCard(55), "ask").orientation).toEqual(
        getPositionPuzzleEntry(createCard(95), "miss").orientation,
      );
    });

    it("uses the literal of a palette token, not a CSS variable", () => {
      expect(HIDDEN_BAR_COLOR).toMatch(/^oklch\(/);
      expect(HIDDEN_BAR_COLOR).not.toMatch(/var\(/);
      expect(Object.values(MATCH_BAND_COLORS)).not.toContain(HIDDEN_BAR_COLOR);
    });
  });

  describe("given the hit state", () => {
    it("returns the same value", () => {
      expect(getPositionPuzzleEntry(createCard(79), "hit").value).toBe(
        getPositionPuzzleEntry(createCard(79), "ask").value,
      );
    });

    it("returns the leader with its name and image", () => {
      const { orientation } = getPositionPuzzleEntry(createCard(79), "hit");

      expect(orientation.id).toBe(LEADER.id);
      expect(orientation.name).toBe("Zielony postępowiec");
      expect(orientation.imageUrl).toBe(IMAGE);
      expect(orientation.type).toBe("identity");
    });

    it("gives it the match colour at 80 and above", () => {
      for (const closeness of [80, 86, 100, 140]) {
        expect(
          getPositionPuzzleEntry(createCard(closeness), "hit").orientation
            .color,
        ).toBe(MATCH_BAND_COLORS.match);
      }
    });

    it("gives it the partial match colour from 50 up to 80", () => {
      for (const closeness of [50, 64, 79.99]) {
        expect(
          getPositionPuzzleEntry(createCard(closeness), "hit").orientation
            .color,
        ).toBe(MATCH_BAND_COLORS.partial);
      }
    });

    it("never keeps the leader's own colour", () => {
      for (const closeness of [50, 79, 80, 100]) {
        expect(
          getPositionPuzzleEntry(createCard(closeness), "hit").orientation
            .color,
        ).not.toBe(OWN_COLOR);
      }
    });

    it("does not change the card it was given", () => {
      const card = createCard(86);
      const before = JSON.stringify(card);

      getPositionPuzzleEntry(card, "hit");

      expect(JSON.stringify(card)).toBe(before);
      expect(card.leader.color).toBe(OWN_COLOR);
    });
  });
});

import { describe, expect, it } from "vitest";

import { messages as enMessages } from "@/locales/en/messages";
import { messages as plMessages } from "@/locales/pl/messages";
import type { CheckpointPoolId } from "@/types/checkpoint";

import {
  CHECKPOINT_POOLS,
  CHECKPOINT_PRIORITY,
  CHECKPOINT_REVEAL_POOLS,
  GENERIC_CHECKPOINT_TYPE,
} from "./checkpoint";

// The slots a statement of each pool may use.
const POOL_SLOTS: Record<CheckpointPoolId, string[]> = {
  halfway: ["minutes"],
  "axis-closeness-single": ["orientation"],
  "axis-closeness-double": ["leading", "other"],
  "new-trait": ["trait"],
  "nolan-path-partial": ["count"],
  "nolan-path-full": [],
  "stats-for": ["percent", "thesis"],
  "stats-against": ["percent", "thesis"],
  "axis-puzzle-ask": [],
  "axis-puzzle-hit": ["leading"],
  "axis-puzzle-miss": ["leading"],
  "position-puzzle-ask": [],
  "position-puzzle-hit": ["position"],
  "position-puzzle-miss": [],
};

const POOL_IDS = Object.keys(POOL_SLOTS) as CheckpointPoolId[];

// The slots of a message as the catalog compiled it: every part that is not
// plain text names a slot.
const getCatalogSlots = (compiled: unknown): string[] =>
  Array.isArray(compiled)
    ? compiled.filter(Array.isArray).map(([name]) => String(name))
    : [];

// The same message as plain text, each slot back in its braces.
const getCatalogText = (compiled: unknown): string =>
  Array.isArray(compiled)
    ? compiled
        .map((part) => (Array.isArray(part) ? `{${part[0]}}` : part))
        .join("")
    : String(compiled);

const getSourceSlots = (message = ""): string[] =>
  [...message.matchAll(/\{(\w+)\}/g)].map(([, name]) => name);

const lines = POOL_IDS.flatMap((pool) =>
  CHECKPOINT_POOLS[pool].map((line, index) => ({ pool, index, ...line })),
);

describe("the constants of the checkpoint engine", () => {
  describe("CHECKPOINT_PRIORITY", () => {
    it("holds the seven card types, the highest priority first", () => {
      expect(CHECKPOINT_PRIORITY).toEqual([
        "stats",
        "new-trait",
        "position-puzzle",
        "nolan-path",
        "axis-closeness",
        "axis-puzzle",
        "halfway",
      ]);
      expect(GENERIC_CHECKPOINT_TYPE).toBe("halfway");
    });
  });

  describe("CHECKPOINT_REVEAL_POOLS", () => {
    it("gives the two puzzles a hit and a miss pool, and no other type", () => {
      expect(CHECKPOINT_REVEAL_POOLS).toEqual({
        "axis-puzzle": { hit: "axis-puzzle-hit", miss: "axis-puzzle-miss" },
        "position-puzzle": {
          hit: "position-puzzle-hit",
          miss: "position-puzzle-miss",
        },
      });
    });
  });

  describe("CHECKPOINT_POOLS", () => {
    it("has fourteen pools of three lines each", () => {
      expect(Object.keys(CHECKPOINT_POOLS).sort()).toEqual(
        [...POOL_IDS].sort(),
      );
      expect(POOL_IDS).toHaveLength(14);

      for (const pool of POOL_IDS) {
        expect(CHECKPOINT_POOLS[pool]).toHaveLength(3);
      }

      expect(lines).toHaveLength(42);
    });

    it("has no slot in any lead-in", () => {
      for (const { leadIn } of lines) {
        expect(getSourceSlots(leadIn.message)).toEqual([]);
        expect(leadIn.message).not.toMatch(/[{}]/);
        expect(getCatalogSlots(plMessages[leadIn.id])).toEqual([]);
        expect(getCatalogSlots(enMessages[leadIn.id])).toEqual([]);
      }
    });

    it("ends no lead-in with a full stop", () => {
      for (const { leadIn } of lines) {
        expect(leadIn.message).toMatch(/[^.\s]$/);
        expect(getCatalogText(enMessages[leadIn.id])).toMatch(/[^.\s]$/);
      }
    });

    it("uses only the slots of its pool in every statement", () => {
      for (const { pool, statement } of lines) {
        const allowed = POOL_SLOTS[pool];

        for (const slot of [
          ...getSourceSlots(statement.message),
          ...getCatalogSlots(plMessages[statement.id]),
          ...getCatalogSlots(enMessages[statement.id]),
        ]) {
          expect(allowed).toContain(slot);
        }
      }
    });

    it("has an English counterpart for every line", () => {
      for (const { leadIn, statement } of lines) {
        for (const message of [leadIn, statement]) {
          const english = getCatalogText(enMessages[message.id]);

          expect(enMessages[message.id]).toBeDefined();
          expect(english).toMatch(/\S/);
          expect(english).not.toBe(message.message);
          expect(getCatalogText(plMessages[message.id])).toBe(message.message);
          // The English line prints the same values as the Polish one.
          expect(getCatalogSlots(enMessages[message.id]).sort()).toEqual(
            getSourceSlots(message.message).sort(),
          );
        }
      }
    });

    it("keeps a message for every line apart, also equal texts of two pools", () => {
      const ids = lines.flatMap(({ leadIn, statement }) => [
        leadIn.id,
        statement.id,
      ]);

      expect(new Set(ids).size).toBe(84);
      expect(CHECKPOINT_POOLS["axis-puzzle-ask"][0].leadIn.message).toBe(
        CHECKPOINT_POOLS["position-puzzle-ask"][0].leadIn.message,
      );
      expect(CHECKPOINT_POOLS["stats-for"][0].leadIn.message).toBe(
        CHECKPOINT_POOLS["stats-against"][0].leadIn.message,
      );
    });

    it("starts every pool with the line of the spec", () => {
      expect(
        POOL_IDS.map((pool) => CHECKPOINT_POOLS[pool][0].leadIn.message),
      ).toEqual([
        "Jesteś na półmetku",
        "To już wiemy",
        "Tego już jesteśmy pewni",
        "A to niespodzianka!",
        "Co ja tu robię?",
        "Wielka przeprawa!",
        "Rzadki okaz",
        "Rzadki okaz",
        "Jak myślisz?",
        "Trafione!",
        "A to ciekawe!",
        "Jak myślisz?",
        "Trafione!",
        "Pudło!",
      ]);
    });

    it("puts a name used as a label in the quotation marks of its language", () => {
      for (const { pool, statement } of lines) {
        const labels = POOL_SLOTS[pool].filter(
          (slot) => !["minutes", "count", "percent", "position"].includes(slot),
        );

        for (const label of labels) {
          const polish = statement.message ?? "";
          const english = getCatalogText(enMessages[statement.id]);

          if (polish.includes(`{${label}}`)) {
            expect(polish).toContain(`„{${label}}”`);
            expect(english).toContain(`“{${label}}”`);
          }
        }
      }
    });
  });
});

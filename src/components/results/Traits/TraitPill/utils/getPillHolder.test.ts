import { describe, expect, it } from "vitest";

import type { Orientation } from "@/types/orientation";

import { getPillHolder } from "./getPillHolder";

const friend: Orientation = { id: "friend", type: "person", name: "Ania" };

describe("getPillHolder()", () => {
  describe("given the other side", () => {
    it.each([
      "taker",
      "both",
      "other",
    ] as const)("keeps the holder %s", (holder) => {
      expect(getPillHolder(holder, friend)).toBe(holder);
    });
  });

  describe("given no other side", () => {
    it.each([
      "taker",
      "both",
      "other",
    ] as const)("treats %s as the taker own", (holder) => {
      expect(getPillHolder(holder)).toBe("taker");
    });
  });
});

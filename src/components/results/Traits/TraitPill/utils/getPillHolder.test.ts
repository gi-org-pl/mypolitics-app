import { describe, expect, it } from "vitest";

import type { AxisOrientation } from "@/types/axis";

import { getPillHolder } from "./getPillHolder";

const friend: AxisOrientation = { id: "friend", name: "Ania" };

describe("getPillHolder()", () => {
  describe("given a party", () => {
    it.each([
      "taker",
      "both",
      "other",
    ] as const)("keeps the holder %s", (holder) => {
      expect(getPillHolder(holder, friend)).toBe(holder);
    });
  });

  describe("given no party", () => {
    it.each([
      "taker",
      "both",
      "other",
    ] as const)("treats %s as the taker own", (holder) => {
      expect(getPillHolder(holder)).toBe("taker");
    });
  });
});

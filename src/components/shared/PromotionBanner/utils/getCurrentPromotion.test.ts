import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Promotion } from "../PromotionBanner.types";
import { getCurrentPromotion } from "./getCurrentPromotion";

const NOW = new Date("2026-06-15T12:00:00.000Z");

const createPromotion = (name: string, start: string, end: string) =>
  ({
    name,
    url: "https://example.com",
    date: { start: new Date(start), end: new Date(end) },
    imageUrl: {
      mobile: "mobile.png",
      tablet: "tablet.png",
      desktop: "desktop.png",
    },
  }) satisfies Promotion;

const FIRST = createPromotion("First", "2026-01-01", "2026-12-31");
const SECOND = createPromotion("Second", "2026-06-01", "2026-06-30");
const EXPIRED = createPromotion("Expired", "2025-01-01", "2025-12-31");
const FUTURE = createPromotion("Future", "2027-01-01", "2027-12-31");

describe("getCurrentPromotion", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe("when one promotion runs today", () => {
    it("returns it", () => {
      expect(getCurrentPromotion([EXPIRED, FIRST, FUTURE])).toBe(FIRST);
    });
  });

  describe("when several promotions run today", () => {
    it("returns the first one for the lowest random number", () => {
      vi.spyOn(Math, "random").mockReturnValue(0);

      expect(getCurrentPromotion([FIRST, SECOND])).toBe(FIRST);
    });

    it("returns the last one for the highest random number", () => {
      vi.spyOn(Math, "random").mockReturnValue(0.99);

      expect(getCurrentPromotion([FIRST, SECOND])).toBe(SECOND);
    });
  });

  describe("when a promotion starts or ends at this very moment", () => {
    it("counts it as running", () => {
      const starting = { ...FIRST, date: { start: NOW, end: FUTURE.date.end } };
      const ending = {
        ...FIRST,
        date: { start: EXPIRED.date.start, end: NOW },
      };

      expect(getCurrentPromotion([starting])).toBe(starting);
      expect(getCurrentPromotion([ending])).toBe(ending);
    });
  });

  describe("when no promotion runs today", () => {
    it("returns null for expired and future promotions", () => {
      expect(getCurrentPromotion([EXPIRED, FUTURE])).toBeNull();
    });

    it("returns null for an empty list", () => {
      expect(getCurrentPromotion([])).toBeNull();
    });
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  VIEW_VISIT_STORAGE_KEY_PREFIX,
  VIEW_VISITED,
} from "@/constants/storage";

import { claimFirstViewVisit } from "./claimFirstViewVisit";

const ROUTE_ID = "routes/_index";
const KEY = `${VIEW_VISIT_STORAGE_KEY_PREFIX}${ROUTE_ID}`;

describe("claimFirstViewVisit()", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe("given a view the session has not seen", () => {
    it("is the first visit, and notes it", () => {
      expect(claimFirstViewVisit(ROUTE_ID)).toBe(true);
      expect(sessionStorage.getItem(KEY)).toBe(VIEW_VISITED);
    });
  });

  describe("given a view the session has seen", () => {
    it("is a later visit", () => {
      claimFirstViewVisit(ROUTE_ID);

      expect(claimFirstViewVisit(ROUTE_ID)).toBe(false);
    });

    it("does not count for another view", () => {
      claimFirstViewVisit(ROUTE_ID);

      expect(claimFirstViewVisit("routes/quizzes.$quizSlug")).toBe(true);
    });
  });

  describe("given a browser that refuses the storage", () => {
    it("is never the first visit", () => {
      vi.stubGlobal("sessionStorage", undefined);

      expect(claimFirstViewVisit(ROUTE_ID)).toBe(false);
    });
  });

  describe("given a storage that throws on every call", () => {
    it("is never the first visit", () => {
      vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("SecurityError");
      });
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("SecurityError");
      });

      expect(claimFirstViewVisit(ROUTE_ID)).toBe(false);
    });
  });

  describe("given a storage that drops the note", () => {
    it("is not the first visit, so the next visit is not one either", () => {
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("QuotaExceededError");
      });

      expect(claimFirstViewVisit(ROUTE_ID)).toBe(false);
      expect(claimFirstViewVisit(ROUTE_ID)).toBe(false);
    });
  });
});

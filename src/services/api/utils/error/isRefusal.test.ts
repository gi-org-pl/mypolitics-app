import { describe, expect, it } from "vitest";

import type { ApiFailure } from "@/types/api";

import { isRefusal } from "./isRefusal";

describe("isRefusal()", () => {
  describe("given a reply with a 4xx status other than 404", () => {
    it.each([
      400, 401, 403, 409, 422, 429, 499,
    ])("returns true for %i", (status) => {
      expect(isRefusal({ kind: "http", status })).toBe(true);
    });
  });

  describe("given a 404", () => {
    it("returns false", () => {
      expect(isRefusal({ kind: "http", status: 404 })).toBe(false);
    });
  });

  describe("given a reply with any other status", () => {
    it.each([304, 399, 500, 502, 503])("returns false for %i", (status) => {
      expect(isRefusal({ kind: "http", status })).toBe(false);
    });
  });

  describe("given a request with no reply", () => {
    it.each<ApiFailure>([
      { kind: "network" },
      { kind: "timeout" },
      { kind: "aborted" },
    ])("returns false for %j", (failure) => {
      expect(isRefusal(failure)).toBe(false);
    });
  });
});

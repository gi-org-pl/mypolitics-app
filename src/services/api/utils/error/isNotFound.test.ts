import { describe, expect, it } from "vitest";

import { type ApiFailure, ApiFailureKind } from "@/types/api";

import { isNotFound } from "./isNotFound";

describe("isNotFound()", () => {
  describe("given a 404", () => {
    it("returns true", () => {
      expect(isNotFound({ kind: ApiFailureKind.Http, status: 404 })).toBe(true);
    });
  });

  describe("given a reply with any other status", () => {
    it.each([
      304, 400, 401, 403, 410, 422, 500, 503,
    ])("returns false for %i", (status) => {
      expect(isNotFound({ kind: ApiFailureKind.Http, status })).toBe(false);
    });
  });

  describe("given a request with no reply", () => {
    it.each<ApiFailure>([
      { kind: ApiFailureKind.Network },
      { kind: ApiFailureKind.Timeout },
      { kind: ApiFailureKind.Aborted },
    ])("returns false for %j", (failure) => {
      expect(isNotFound(failure)).toBe(false);
    });
  });
});

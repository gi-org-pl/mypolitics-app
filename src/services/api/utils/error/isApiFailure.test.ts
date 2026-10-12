import { describe, expect, it } from "vitest";

import { ApiFailureKind } from "@/types/api";

import { isApiFailure } from "./isApiFailure";

describe("isApiFailure()", () => {
  describe("given a failure of the API", () => {
    it.each([
      [{ kind: ApiFailureKind.Http, status: 404 }],
      [{ kind: ApiFailureKind.Http, status: 500 }],
      [{ kind: ApiFailureKind.Network }],
      [{ kind: ApiFailureKind.Timeout }],
      [{ kind: ApiFailureKind.Aborted }],
    ])("returns true for %j", (value) => {
      expect(isApiFailure(value)).toBe(true);
    });
  });

  describe("given anything else", () => {
    it.each([
      [undefined],
      [null],
      [ApiFailureKind.Network],
      [404],
      [[]],
      [{}],
      [{ kind: ApiFailureKind.Http }],
      [{ kind: ApiFailureKind.Http, status: "404" }],
      [{ kind: "unknown" }],
      [{ status: 404 }],
      [new Error("network")],
    ])("returns false for %j", (value) => {
      expect(isApiFailure(value)).toBe(false);
    });
  });
});

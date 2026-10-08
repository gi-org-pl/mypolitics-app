import { describe, expect, it } from "vitest";

import { isApiFailure } from "./isApiFailure";

describe("isApiFailure()", () => {
  describe("given a failure of the API", () => {
    it.each([
      [{ kind: "http", status: 404 }],
      [{ kind: "http", status: 500 }],
      [{ kind: "network" }],
      [{ kind: "timeout" }],
      [{ kind: "aborted" }],
    ])("returns true for %j", (value) => {
      expect(isApiFailure(value)).toBe(true);
    });
  });

  describe("given anything else", () => {
    it.each([
      [undefined],
      [null],
      ["network"],
      [404],
      [[]],
      [{}],
      [{ kind: "http" }],
      [{ kind: "http", status: "404" }],
      [{ kind: "unknown" }],
      [{ status: 404 }],
      [new Error("network")],
    ])("returns false for %j", (value) => {
      expect(isApiFailure(value)).toBe(false);
    });
  });
});

import { describe, expect, it } from "vitest";

import type { IdentityProvider } from "@/types/auth";

import { AUTH_PROVIDERS, getAuthProvider } from "./auth";

describe("getAuthProvider()", () => {
  describe("given a known provider", () => {
    it("returns its entry", () => {
      expect(getAuthProvider("x").name).toBe("X");
    });
  });

  describe("given an identifier that is not a provider", () => {
    it("falls back to the first provider instead of failing", () => {
      expect(getAuthProvider("apple" as IdentityProvider)).toBe(
        AUTH_PROVIDERS[0],
      );
    });
  });
});

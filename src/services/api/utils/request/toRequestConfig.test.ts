import { describe, expect, it } from "vitest";

import { toRequestConfig } from "./toRequestConfig";

describe("toRequestConfig()", () => {
  describe("given no options", () => {
    it("sets neither a signal nor a time limit", () => {
      expect(toRequestConfig()).toEqual({});
      expect(toRequestConfig({})).toEqual({});
    });
  });

  describe("given a signal", () => {
    it("passes it on", () => {
      const { signal } = new AbortController();

      expect(toRequestConfig({ signal }).signal).toBe(signal);
    });
  });

  describe("given a time limit", () => {
    it("passes it on as the timeout of the request", () => {
      expect(toRequestConfig({ timeoutMs: 5000 })).toEqual({ timeout: 5000 });
    });
  });
});

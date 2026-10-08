import { describe, expect, it } from "vitest";

import { API_TIMEOUT_MS } from "@/constants/api";

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

  describe("given a time limit shorter than the limit of the client", () => {
    it("passes it on as the timeout of the request", () => {
      expect(toRequestConfig({ timeoutMs: 5000 })).toEqual({ timeout: 5000 });
      expect(toRequestConfig({ timeoutMs: 1 }).timeout).toBe(1);
      expect(toRequestConfig({ timeoutMs: 0.5 }).timeout).toBe(1);
      expect(toRequestConfig({ timeoutMs: API_TIMEOUT_MS }).timeout).toBe(
        API_TIMEOUT_MS,
      );
    });
  });

  describe("given a time limit longer than the limit of the client", () => {
    it("cuts it to the limit of the client", () => {
      expect(toRequestConfig({ timeoutMs: API_TIMEOUT_MS + 1 }).timeout).toBe(
        API_TIMEOUT_MS,
      );
      expect(toRequestConfig({ timeoutMs: 120_000 }).timeout).toBe(
        API_TIMEOUT_MS,
      );
      expect(
        toRequestConfig({ timeoutMs: Number.POSITIVE_INFINITY }).timeout,
      ).toBe(API_TIMEOUT_MS);
    });
  });

  describe("given a time limit of zero or below", () => {
    it("never switches the time limit off: the request gets the shortest one", () => {
      expect(toRequestConfig({ timeoutMs: 0 }).timeout).toBe(1);
      expect(toRequestConfig({ timeoutMs: -250 }).timeout).toBe(1);
      expect(
        toRequestConfig({ timeoutMs: Number.NEGATIVE_INFINITY }).timeout,
      ).toBe(1);
    });
  });

  describe("given a time limit that is not a number", () => {
    it("sets no time limit, so the limit of the client stays", () => {
      expect(toRequestConfig({ timeoutMs: Number.NaN })).toEqual({});
      expect(toRequestConfig({ timeoutMs: undefined })).toEqual({});
    });
  });
});

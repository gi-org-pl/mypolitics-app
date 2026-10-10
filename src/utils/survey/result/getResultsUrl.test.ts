import { describe, expect, it } from "vitest";

import { RESULTS_URL } from "@/constants/survey";

import { getResultsUrl } from "./getResultsUrl";

const SESSION_ID = "3f0c2a52-6f7b-4d53-9a55-0d5f1b9f3c11";

describe("getResultsUrl()", () => {
  describe("given a session identifier", () => {
    it("ends the results address with the session identifier", () => {
      expect(getResultsUrl(SESSION_ID)).toBe(
        "https://mypolitics.pl/results/3f0c2a52-6f7b-4d53-9a55-0d5f1b9f3c11",
      );
      expect(getResultsUrl(SESSION_ID)).toBe(`${RESULTS_URL}/${SESSION_ID}`);
    });
  });

  describe("given an identifier with characters an address gives a meaning to", () => {
    it("keeps them from changing the address", () => {
      expect(getResultsUrl("a/b?c#d")).toBe(`${RESULTS_URL}/a%2Fb%3Fc%23d`);
    });
  });
});

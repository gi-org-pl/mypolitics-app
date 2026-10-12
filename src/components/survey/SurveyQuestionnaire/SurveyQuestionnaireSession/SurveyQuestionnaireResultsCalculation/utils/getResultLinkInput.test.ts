import { describe, expect, it } from "vitest";

import type { SurveySession } from "@/types/survey";
import { createSession } from "@/utils/survey/session/createSession";
import { createSurvey } from "@/utils/vitest/survey/createSurvey";

import { getResultLinkInput } from "./getResultLinkInput";

const ADDRESS = "biuro@mypolitics.pl";

const createSessionWith = (email: SurveySession["email"]): SurveySession => ({
  ...createSession(createSurvey()),
  phase: "results-calculation",
  email,
});

describe("getResultLinkInput()", () => {
  describe("given a session with no e-mail", () => {
    it("returns nothing when the session holds no e-mail", () => {
      expect(getResultLinkInput(createSessionWith(null), "pl")).toBeUndefined();
    });
  });

  describe("given a session with an e-mail", () => {
    it("takes the address and the consent from the session, and the session identifier as the result", () => {
      const session = createSessionWith({ address: ADDRESS, hasConsent: true });

      expect(getResultLinkInput(session, "pl")).toEqual({
        email: ADDRESS,
        resultId: session.id,
        marketingConsent: true,
        language: "pl",
      });
    });

    it("says so when the consent was not given", () => {
      const session = createSessionWith({
        address: ADDRESS,
        hasConsent: false,
      });

      expect(getResultLinkInput(session, "pl")?.marketingConsent).toBe(false);
    });

    it("carries nothing else of the session: no answer and no demographics", () => {
      const session = createSessionWith({ address: ADDRESS, hasConsent: true });

      expect(
        Object.keys(getResultLinkInput(session, "pl") ?? {}).sort(),
      ).toEqual(["email", "language", "marketingConsent", "resultId"]);
    });

    it.each([
      ["en", "en"],
      ["pl", "pl"],
      ["de", "pl"],
      ["en-GB", "pl"],
      ["", "pl"],
    ])("sends en when the app runs in English and pl otherwise: %s", (locale, language) => {
      const session = createSessionWith({ address: ADDRESS, hasConsent: true });

      expect(getResultLinkInput(session, locale)?.language).toBe(language);
    });
  });
});

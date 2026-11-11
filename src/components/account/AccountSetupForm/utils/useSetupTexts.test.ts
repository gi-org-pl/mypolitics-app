import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { renderHook } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { useSetupTexts } from "./useSetupTexts";

const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(I18nProvider, { i18n }, children);

describe("useSetupTexts()", () => {
  describe.each([
    ["google", "Dane z konta Google"],
    ["facebook", "Dane z konta na Facebooku"],
    ["x", "Dane z konta X"],
  ] as const)("given a sign-in with %s", (provider, words) => {
    it("names the provider in the promise", () => {
      const { result } = renderHook(() => useSetupTexts(provider), {
        wrapper,
      });

      expect(result.current.promise).toContain(words);
    });
  });

  describe("given any provider", () => {
    it("has a message for every issue", () => {
      const { result } = renderHook(() => useSetupTexts("google"), {
        wrapper,
      });

      expect(result.current.messages).toEqual({
        "name-missing": "Wpisz nazwę, którą podpiszemy Twoje quizy.",
        "name-too-short": "Nazwa musi mieć co najmniej 2 znaki.",
        "age-not-declared":
          "Konto mogą założyć osoby, które mają ukończone 16 lat.",
        "terms-not-accepted":
          "Żeby założyć konto, zaakceptuj Regulamin i Politykę prywatności.",
      });
    });
  });
});

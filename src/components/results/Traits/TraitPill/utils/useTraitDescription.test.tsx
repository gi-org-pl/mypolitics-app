import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import type { TraitHolder } from "../../Traits.types";
import { useTraitDescription } from "./useTraitDescription";

const wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider i18n={i18n}>{children}</I18nProvider>
);

const describeTrait = (holder: TraitHolder, otherName?: string) =>
  renderHook(() => useTraitDescription("Anarchizm", holder, otherName), {
    wrapper,
  }).result.current;

describe("useTraitDescription()", () => {
  describe("given a trait both hold", () => {
    it("says it is shared with the other side", () => {
      expect(describeTrait("both", "Ania")).toBe("Anarchizm - wspólna z: Ania");
    });
  });

  describe("given a trait only the other side holds", () => {
    it("says it is only theirs", () => {
      expect(describeTrait("other", "Ania")).toBe("Anarchizm - tylko Ania");
    });

    it("collapses the other name with line breaks into one line", () => {
      expect(describeTrait("other", " Ania\n\nNowak ")).toBe(
        "Anarchizm - tylko Ania Nowak",
      );
    });
  });

  describe("given a trait only the taker holds", () => {
    it("returns nothing", () => {
      expect(describeTrait("taker", "Ania")).toBeUndefined();
      expect(describeTrait("taker")).toBeUndefined();
    });
  });
});

import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import type { Orientation } from "@/types/orientation";

import { useDoubleAxisTitle } from "./useDoubleAxisTitle";

const euroscepticism: Orientation = {
  id: "euroscepticism",
  type: "ideology",
  name: "Eurosceptycyzm",
  imageUrl: "https://example.com/euroscepticism.svg",
  color: "#b57459",
};

const federalism: Orientation = {
  id: "federalism",
  type: "ideology",
  name: "Federacjonizm",
  imageUrl: "https://example.com/federalism.svg",
  color: "#1976be",
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider i18n={i18n}>{children}</I18nProvider>
);

const getTitle = (
  startValue?: number,
  endValue?: number,
  start: Orientation = euroscepticism,
  end: Orientation = federalism,
) =>
  renderHook(
    () =>
      useDoubleAxisTitle(
        { orientation: start, value: startValue },
        { orientation: end, value: endValue },
      ),
    { wrapper },
  ).result.current;

describe("useDoubleAxisTitle()", () => {
  describe("given a lead", () => {
    it("returns an emphasised chip of the leading start orientation", () => {
      expect(getTitle(69, 31)).toEqual({
        name: "Eurosceptycyzm",
        chip: {
          name: "Eurosceptycyzm",
          imageUrl: "https://example.com/euroscepticism.svg",
          color: "#b57459",
          look: "emphasised",
        },
      });
    });

    it("returns an emphasised chip of the leading end orientation", () => {
      expect(getTitle(31, 69)).toEqual({
        name: "Federacjonizm",
        chip: {
          name: "Federacjonizm",
          imageUrl: "https://example.com/federalism.svg",
          color: "#1976be",
          look: "emphasised",
        },
      });
    });

    it("names the side that has a value when the other is absent", () => {
      expect(getTitle(undefined, 31).name).toBe("Federacjonizm");
    });

    it("writes the name on a single line", () => {
      expect(
        getTitle(69, 31, { ...euroscepticism, name: "  Euro\nsceptycyzm " })
          .name,
      ).toBe("Euro sceptycyzm");
    });
  });

  describe("given a leading orientation without a name", () => {
    it.each([
      "",
      "   ",
      undefined,
    ])("returns a chip with the image alone for %j", (name) => {
      const title = getTitle(69, 31, { ...euroscepticism, name });

      expect(title.name).toBe("");
      expect(title.chip).toMatchObject({
        name: "",
        imageUrl: "https://example.com/euroscepticism.svg",
      });
    });

    it("returns no chip when there is no image either", () => {
      expect(
        getTitle(69, 31, { ...euroscepticism, name: "", imageUrl: undefined }),
      ).toEqual({ name: "", chip: undefined });
    });
  });

  describe("given a tie", () => {
    it("names the card after both poles, start first", () => {
      expect(getTitle(50, 50).name).toBe("Eurosceptycyzm / Federacjonizm");
    });

    it("returns a neutral chip with each pole as a name of its own, start first", () => {
      expect(getTitle(50, 50).chip).toMatchObject({
        name: "Eurosceptycyzm",
        secondName: "Federacjonizm",
        look: "neutral",
      });
    });

    it("gives the chip the word for a tie as its short name", () => {
      expect(getTitle(50, 50).chip?.shortName).toBe("Remis");
    });

    it("passes no image and no colour to the chip", () => {
      expect(getTitle(50, 50).chip).toEqual({
        name: "Eurosceptycyzm",
        secondName: "Federacjonizm",
        shortName: "Remis",
        look: "neutral",
      });
    });

    it("writes each name on a single line", () => {
      const title = getTitle(
        50,
        50,
        { ...euroscepticism, name: " Euro\nsceptycyzm " },
        { ...federalism, name: "Federa  cjonizm" },
      );

      expect(title.name).toBe("Euro sceptycyzm / Federa cjonizm");
      expect(title.chip).toMatchObject({
        name: "Euro sceptycyzm",
        secondName: "Federa cjonizm",
      });
    });

    it("is a tie when the values round to the same number", () => {
      expect(getTitle(50.4, 49.6).chip?.look).toBe("neutral");
    });

    it("is a tie when both values are absent", () => {
      expect(getTitle().chip?.look).toBe("neutral");
    });
  });

  describe("given a tie with a missing name", () => {
    const TIE_TITLE = {
      name: "Remis",
      chip: { name: "Remis", look: "neutral" },
    };

    it.each([
      "",
      " ",
      undefined,
    ])("returns the word for a tie, never the end pole alone, for a start name of %j", (name) => {
      expect(getTitle(50, 50, { ...euroscepticism, name })).toEqual(TIE_TITLE);
    });

    it.each([
      "",
      " ",
      undefined,
    ])("returns the word for a tie, never the start pole alone, for an end name of %j", (name) => {
      expect(getTitle(50, 50, euroscepticism, { ...federalism, name })).toEqual(
        TIE_TITLE,
      );
    });

    it("returns the word for a tie when both names are missing", () => {
      expect(
        getTitle(
          50,
          50,
          { ...euroscepticism, name: "" },
          { ...federalism, name: "" },
        ),
      ).toEqual(TIE_TITLE);
    });

    it("returns the word for a tie when both values are absent too", () => {
      expect(
        getTitle(undefined, undefined, { ...euroscepticism, name: "" }),
      ).toEqual(TIE_TITLE);
    });
  });
});

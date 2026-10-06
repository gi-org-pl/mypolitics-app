import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import type { AxisOrientation } from "@/types/axis";

import { useDoubleAxisTitle } from "./useDoubleAxisTitle";

const euroscepticism: AxisOrientation = {
  id: "euroscepticism",
  name: "Eurosceptycyzm",
  imageUrl: "https://example.com/euroscepticism.svg",
  color: "#b57459",
};

const federalism: AxisOrientation = {
  id: "federalism",
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
  start: AxisOrientation = euroscepticism,
  end: AxisOrientation = federalism,
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
      undefined as unknown as string,
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
    it("returns a neutral chip naming both poles, start first", () => {
      const name = "Eurosceptycyzm / Federacjonizm";

      expect(getTitle(50, 50)).toEqual({
        name,
        chip: { name, look: "neutral" },
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
    it("names the pole that has a name, without a separator", () => {
      expect(getTitle(50, 50, { ...euroscepticism, name: "" }).name).toBe(
        "Federacjonizm",
      );
      expect(
        getTitle(50, 50, euroscepticism, { ...federalism, name: " " }).name,
      ).toBe("Eurosceptycyzm");
    });

    it("returns no chip when both names are missing", () => {
      expect(
        getTitle(
          50,
          50,
          { ...euroscepticism, name: "" },
          { ...federalism, name: "" },
        ),
      ).toEqual({ name: "", chip: undefined });
    });
  });
});

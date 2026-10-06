import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import type { NolanQuadrants } from "../NolanChart.types";
import { getNolanPosition } from "./getNolanPosition";
import {
  type MapDescriptionInput,
  useMapDescription,
} from "./useMapDescription";

const wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider i18n={i18n}>{children}</I18nProvider>
);

const quadrants: Partial<NolanQuadrants> = {
  topLeft: { names: { extreme: "Skrajna czerwona" } },
};

const POSITION = getNolanPosition(
  { start: 77, end: 23 },
  { start: 67, end: 33 },
);
const OTHER_EXTREME = getNolanPosition(
  { start: 100, end: 0 },
  { start: 0, end: 100 },
);
const OTHER_CENTRE = getNolanPosition(
  { start: 50, end: 50 },
  { start: 50, end: 50 },
);

const describeMap = (input: Partial<MapDescriptionInput> = {}) =>
  renderHook(
    () =>
      useMapDescription({
        title: "Umiarkowana zielona",
        horizontalName: "Gospodarka",
        verticalName: "Światopogląd",
        position: POSITION,
        otherPosition: null,
        quadrants,
        centreName: "Centrum",
        ...input,
      }),
    { wrapper },
  ).result.current;

describe("useMapDescription()", () => {
  describe("given a position", () => {
    it("returns the title and both axes with their coordinates", () => {
      expect(describeMap()).toBe(
        "Umiarkowana zielona. Gospodarka: -0.54, Światopogląd: -0.34",
      );
    });

    it("leaves the title out when there is none", () => {
      expect(describeMap({ title: "" })).toBe(
        "Gospodarka: -0.54, Światopogląd: -0.34",
      );
    });
  });

  describe("given no position", () => {
    it("returns the title alone", () => {
      expect(describeMap({ title: "Brak wyniku", position: null })).toBe(
        "Brak wyniku",
      );
    });
  });

  describe("given the other party", () => {
    it("adds their quadrant name", () => {
      expect(
        describeMap({ otherName: " Rafał ", otherPosition: OTHER_EXTREME }),
      ).toBe(
        "Umiarkowana zielona. Gospodarka: -0.54, Światopogląd: -0.34. Rafał: Skrajna czerwona",
      );
    });

    it("names them by the centre name at the centre or in an unnamed quadrant", () => {
      expect(
        describeMap({ otherName: "Rafał", otherPosition: OTHER_CENTRE }),
      ).toContain("Rafał: Centrum");
      expect(
        describeMap({
          otherName: "Rafał",
          otherPosition: OTHER_EXTREME,
          quadrants: {},
        }),
      ).toContain("Rafał: Centrum");
    });

    it("leaves them out without a position, a name or a quadrant name", () => {
      const plain =
        "Umiarkowana zielona. Gospodarka: -0.54, Światopogląd: -0.34";

      expect(describeMap({ otherName: "Rafał" })).toBe(plain);
      expect(describeMap({ otherPosition: OTHER_EXTREME })).toBe(plain);
      expect(
        describeMap({
          otherName: "Rafał",
          otherPosition: OTHER_CENTRE,
          centreName: undefined,
        }),
      ).toBe(plain);
    });
  });
});

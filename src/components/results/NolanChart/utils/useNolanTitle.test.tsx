import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import type { NolanPosition } from "@/types/results";
import { getNolanPosition } from "@/utils/results/getNolanPosition";

import type { NolanQuadrants } from "../NolanChart.types";
import { useNolanTitle } from "./useNolanTitle";

const wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider i18n={i18n}>{children}</I18nProvider>
);

const quadrants: Partial<NolanQuadrants> = {
  bottomLeft: {
    color: "#36db8b",
    names: {
      moderate: "Umiarkowana zielona",
      moderateShort: "Um. zielona",
      extreme: "Skrajna zielona",
    },
  },
};

const CENTRE_NAME = " Centrum ";
const CENTRE = getNolanPosition({ start: 50, end: 50 }, { start: 50, end: 50 });
const MODERATE = getNolanPosition(
  { start: 77, end: 23 },
  { start: 67, end: 33 },
);
const EXTREME = getNolanPosition(
  { start: 100, end: 0 },
  { start: 100, end: 0 },
);

const getTitle = (
  position: NolanPosition | null,
  usedQuadrants?: Partial<NolanQuadrants>,
  centreName?: string,
) =>
  renderHook(() => useNolanTitle(position, usedQuadrants, centreName), {
    wrapper,
  }).result.current;

describe("useNolanTitle()", () => {
  describe("given no position", () => {
    it("returns the no result wording in the plain look", () => {
      expect(getTitle(null, quadrants, CENTRE_NAME)).toEqual({
        name: "Brak wyniku",
        shortName: "",
        look: "plain",
      });
    });
  });

  describe("given a centre position", () => {
    it("returns the centre name in the plain look, without a colour", () => {
      expect(getTitle(CENTRE, quadrants, CENTRE_NAME)).toEqual({
        name: "Centrum",
        shortName: "",
        look: "plain",
      });
    });

    it("returns an empty name when the centre name is missing", () => {
      expect(getTitle(CENTRE, quadrants).name).toBe("");
    });
  });

  describe("given a moderate position", () => {
    it("returns the quadrant names, look and colour", () => {
      expect(getTitle(MODERATE, quadrants, CENTRE_NAME)).toEqual({
        name: "Umiarkowana zielona",
        shortName: "Um. zielona",
        look: "moderate",
        color: "#36db8b",
      });
    });
  });

  describe("given an extreme position", () => {
    it("returns the extreme name in the extreme look", () => {
      expect(getTitle(EXTREME, quadrants, CENTRE_NAME)).toEqual({
        name: "Skrajna zielona",
        shortName: "",
        look: "extreme",
        color: "#36db8b",
      });
    });
  });

  describe("given a quadrant without names", () => {
    it("falls back to the centre name in the plain look", () => {
      expect(
        getTitle(MODERATE, { bottomLeft: { color: "#36db8b" } }, CENTRE_NAME),
      ).toEqual({
        name: "Centrum",
        shortName: "",
        look: "plain",
      });
      expect(getTitle(EXTREME).look).toBe("plain");
    });
  });
});

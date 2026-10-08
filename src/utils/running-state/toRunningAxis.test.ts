import { describe, expect, it } from "vitest";

import type { AxisEntry } from "@/types/axis";
import { createOrientation } from "@/utils/vitest/createOrientation";

import { toRunningAxis } from "./toRunningAxis";

const toEntry = (id: string, value?: number): AxisEntry => ({
  orientation: createOrientation(id, id),
  value,
});

describe("toRunningAxis()", () => {
  const axis = { id: "economy", answered: 7 };

  describe("given both sides", () => {
    it("is two-sided, with the lean of the higher value over the lower one", () => {
      expect(
        toRunningAxis(axis, toEntry("left", 60), toEntry("right", 20)),
      ).toEqual({
        id: "economy",
        answered: 7,
        kind: "two-sided",
        start: toEntry("left", 60),
        end: toEntry("right", 20),
        lean: 40,
        leadingSide: "start",
      });
    });

    it("names the end as the leading side when its value is higher", () => {
      expect(
        toRunningAxis(axis, toEntry("left", 20.5), toEntry("right", 61)),
      ).toMatchObject({ lean: 40.5, leadingSide: "end" });
    });

    it("has a lean of 0 and no leading side at equal values", () => {
      expect(
        toRunningAxis(axis, toEntry("left", 47), toEntry("right", 47)),
      ).toMatchObject({ kind: "two-sided", lean: 0, leadingSide: undefined });
    });

    it("has no lean and no leading side while a value is absent", () => {
      for (const runningAxis of [
        toRunningAxis(axis, toEntry("left"), toEntry("right", 20)),
        toRunningAxis(axis, toEntry("left", 60), toEntry("right")),
        toRunningAxis(axis, toEntry("left"), toEntry("right")),
      ]) {
        expect(runningAxis).toMatchObject({
          kind: "two-sided",
          lean: undefined,
          leadingSide: undefined,
        });
      }
    });

    it("leans by a difference too small to show", () => {
      expect(
        toRunningAxis(axis, toEntry("left", 50.4), toEntry("right", 50.1)),
      ).toMatchObject({ leadingSide: "start" });
    });
  });

  describe("given one side", () => {
    it("is single, about that side", () => {
      expect(toRunningAxis(axis, toEntry("left", 83))).toEqual({
        id: "economy",
        answered: 7,
        kind: "single",
        entry: toEntry("left", 83),
        lean: 33,
      });
      expect(
        toRunningAxis(axis, undefined, toEntry("right", 83)),
      ).toMatchObject({ kind: "single", entry: toEntry("right", 83) });
    });

    it("leans below zero under the midpoint", () => {
      expect(toRunningAxis(axis, toEntry("left", 40))).toMatchObject({
        lean: -10,
      });
    });

    it("has no lean while the value is absent", () => {
      expect(toRunningAxis(axis, toEntry("left"))).toMatchObject({
        kind: "single",
        lean: undefined,
      });
    });
  });

  describe("given no side", () => {
    it("returns nothing", () => {
      expect(toRunningAxis(axis)).toBeUndefined();
    });
  });
});

import { describe, expect, it } from "vitest";
import { createAxisPair } from "@/utils/vitest/createAxisPair";
import type { AxisGroup } from "../MultiAxisChart.types";
import { getDrawnGroups } from "./getDrawnGroups";

const economy: AxisGroup = {
  name: "Gospodarka",
  axes: [createAxisPair("economy", "Interwencjonizm", "Wolny rynek", 31, 69)],
};

const system: AxisGroup = {
  name: "Ustrój",
  axes: [createAxisPair("system", "Demokracja", "Autorytaryzm", 60, 40)],
};

describe("getDrawnGroups()", () => {
  describe("given groups with axes", () => {
    it("returns every group, in the given order", () => {
      expect(getDrawnGroups([system, economy])).toEqual([system, economy]);
    });
  });

  describe("given a group with no axes", () => {
    it("leaves it out", () => {
      expect(
        getDrawnGroups([
          { name: "Pusta", axes: [] },
          { name: "Bez osi" } as unknown as AxisGroup,
          null as unknown as AxisGroup,
          economy,
        ]),
      ).toEqual([economy]);
    });
  });

  describe("given groups that are not a list", () => {
    it("returns no groups", () => {
      expect(getDrawnGroups(undefined as unknown as AxisGroup[])).toEqual([]);
      expect(getDrawnGroups({} as unknown as AxisGroup[])).toEqual([]);
    });
  });
});

import { describe, expect, it } from "vitest";

import { resolvedModules } from "@/utils/result-modules/resolvedModules.fixtures";
import { getColumnSlots } from "./getColumnSlots";

const toIds = (column: "start" | "end") =>
  getColumnSlots(resolvedModules, column).map(
    ({ module, order }) => [module.id, order] as const,
  );

describe("getColumnSlots()", () => {
  describe("given modules that name both columns", () => {
    it("keeps the modules of the column, in the order of the list, each with its place in the whole list", () => {
      expect(toIds("start")).toEqual([
        ["ecology", 1],
        ["ideologies", 3],
        ["parties", 4],
        ["traits", 6],
      ]);
      expect(toIds("end")).toEqual([
        ["identity", 0],
        ["economy", 2],
        ["compass", 5],
      ]);
    });

    it("hands the modules over as they are", () => {
      expect(getColumnSlots(resolvedModules, "end")[0].module).toBe(
        resolvedModules[0],
      );
    });
  });

  describe("given modules that all name the same column", () => {
    it("leaves the other column with nothing", () => {
      const modules = resolvedModules.map((module) => ({
        ...module,
        column: "start" as const,
      }));

      expect(getColumnSlots(modules, "start")).toHaveLength(modules.length);
      expect(getColumnSlots(modules, "end")).toEqual([]);
    });
  });

  describe("given no module", () => {
    it("has nothing for either column", () => {
      expect(getColumnSlots([], "start")).toEqual([]);
      expect(getColumnSlots([], "end")).toEqual([]);
    });
  });
});

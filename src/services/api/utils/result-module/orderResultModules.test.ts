import { describe, expect, it } from "vitest";

import type { ResultModule } from "@/types/results";
import { createResultModule } from "@/utils/vitest/results/createResultModule";

import { orderResultModules } from "./orderResultModules";

const getIds = (modules: ResultModule[]): string[] =>
  orderResultModules(modules).map(({ id }) => id);

describe("orderResultModules()", () => {
  describe("given no records", () => {
    it("returns an empty list", () => {
      expect(orderResultModules([])).toEqual([]);
    });
  });

  describe("given records in any order", () => {
    it("puts them by position, lowest first", () => {
      expect(
        getIds([
          createResultModule("c", "traits", { position: 7 }),
          createResultModule("a", "single_axis", { position: -1 }),
          createResultModule("b", "archetype", { position: 2.5 }),
        ]),
      ).toEqual(["a", "b", "c"]);
    });

    it("leaves the list it was given as it was", () => {
      const modules = [
        createResultModule("b", "traits", { position: 2 }),
        createResultModule("a", "archetype", { position: 1 }),
      ];

      orderResultModules(modules);

      expect(modules.map(({ id }) => id)).toEqual(["b", "a"]);
    });
  });

  describe("given records with the same position", () => {
    it("keeps them in the order of the list", () => {
      expect(
        getIds([
          createResultModule("b", "traits", { position: 1 }),
          createResultModule("c", "archetype", { position: 1 }),
          createResultModule("a", "multi_axis", { position: 0 }),
          createResultModule("d", "nolan_chart", { position: 1 }),
        ]),
      ).toEqual(["a", "b", "c", "d"]);
    });
  });

  describe("given a header record", () => {
    it("puts it first whatever its position", () => {
      expect(
        getIds([
          createResultModule("a", "multi_axis", { position: 0 }),
          createResultModule("b", "horizontal_bar", { position: 1 }),
          createResultModule("header", "header", { position: 9 }),
        ]),
      ).toEqual(["header", "a", "b"]);
    });

    it("hands the record over unchanged", () => {
      const header = createResultModule("header", "header", { position: 9 });

      expect(
        orderResultModules([createResultModule("a", "traits"), header])[0],
      ).toBe(header);
    });
  });

  describe("given more than one header record", () => {
    it("keeps the one with the lowest position and drops the others", () => {
      expect(
        getIds([
          createResultModule("late", "header", { position: 5 }),
          createResultModule("a", "archetype", { position: 3 }),
          createResultModule("early", "header", { position: 4 }),
        ]),
      ).toEqual(["early", "a"]);
    });

    it("keeps the first of the list when their positions are equal", () => {
      expect(
        getIds([
          createResultModule("first", "header", { position: 2 }),
          createResultModule("second", "header", { position: 2 }),
        ]),
      ).toEqual(["first"]);
    });
  });
});

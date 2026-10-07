import { describe, expect, it } from "vitest";

import type { RankedCategory } from "../../HorizontalBarChart.types";
import { getCategoryItems } from "./getCategoryItems";

const category = (name?: string, id?: string): RankedCategory => ({
  id,
  name,
  entries: [
    { orientation: { id: "a", type: "ideology", name: "Alfa" }, value: 40 },
  ],
});

const keys = (categories: RankedCategory[]): string[] =>
  getCategoryItems(categories).map(({ key }) => key);

describe("getCategoryItems()", () => {
  describe("given categories", () => {
    it("returns one item per category in the given order, with its ranking", () => {
      const items = getCategoryItems([
        category("Prawo"),
        category("Gospodarka"),
      ]);

      expect(items.map(({ name }) => name)).toEqual(["Prawo", "Gospodarka"]);
      expect(items[0].leader?.orientation.id).toBe("a");
      expect(items[0].rest).toEqual([]);
    });

    it("gives every item a different key", () => {
      const result = keys([
        category("Prawo"),
        category("Prawo"),
        category(),
        category(),
        category("Prawo", "Prawo"),
      ]);

      expect(new Set(result).size).toBe(5);
    });
  });

  describe("given the same categories in another order, or with one removed", () => {
    it("keeps the key of each category", () => {
      const prawo = category("Prawo");
      const gospodarka = category("Gospodarka");
      const [prawoKey, gospodarkaKey] = keys([prawo, gospodarka]);

      expect(keys([gospodarka, prawo])).toEqual([gospodarkaKey, prawoKey]);
      expect(keys([gospodarka])).toEqual([gospodarkaKey]);
      expect(keys([category("Nowa"), prawo, gospodarka]).slice(1)).toEqual([
        prawoKey,
        gospodarkaKey,
      ]);
    });
  });

  describe("given categories with ids", () => {
    it("keeps the key when the name changes", () => {
      expect(keys([category("Gospodarka", "economy")])).toEqual(
        keys([category("Finanse", "economy")]),
      );
    });
  });

  describe("given an empty list", () => {
    it("returns an empty list", () => {
      expect(getCategoryItems([])).toEqual([]);
    });
  });
});

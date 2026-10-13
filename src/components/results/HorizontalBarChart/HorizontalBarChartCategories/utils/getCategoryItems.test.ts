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

  describe("given a comparison", () => {
    const ania = { id: "ania", type: "person" as const, name: "Ania" };

    it("gives every item the comparison when it has no values by category", () => {
      const comparison = { orientation: ania, values: { a: 10 } };
      const items = getCategoryItems(
        [category("Prawo", "law"), category("Gospodarka", "economy")],
        comparison,
      );

      expect(items.map((item) => item.comparison)).toEqual([
        comparison,
        comparison,
      ]);
    });

    it("gives every item the values of its own category", () => {
      const items = getCategoryItems(
        [category("Prawo", "law"), category("Gospodarka", "economy")],
        {
          orientation: ania,
          values: { a: 10 },
          categoryValues: { economy: { a: 70 } },
        },
      );

      expect(items.map((item) => item.comparison?.values)).toEqual([
        {},
        { a: 70 },
      ]);
    });
  });

  describe("given no comparison", () => {
    it("gives no item one", () => {
      expect(
        getCategoryItems([category("Prawo")])[0].comparison,
      ).toBeUndefined();
    });
  });

  describe("given an empty list", () => {
    it("returns an empty list", () => {
      expect(getCategoryItems([])).toEqual([]);
    });
  });
});

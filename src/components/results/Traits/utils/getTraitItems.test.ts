import { describe, expect, it } from "vitest";

import type { Orientation } from "@/types/orientation";

import type { TraitsComparison } from "../Traits.types";
import { getTraitItems } from "./getTraitItems";

const anarchism: Orientation = {
  id: "anarchism",
  type: "ideology",
  name: "Anarchizm",
  imageUrl: "https://example.com/anarchism.svg",
  color: "#192430",
};
const proChoice: Orientation = {
  id: "pro-choice",
  type: "ideology",
  name: "Pro-choice",
  color: "#851c22",
};
const proEuro: Orientation = {
  id: "pro-euro",
  type: "ideology",
  name: "Pro-Euro",
};
const monarchism: Orientation = {
  id: "monarchism",
  type: "ideology",
  name: "Monarchizm",
};

const traits = [proChoice, proEuro, anarchism, monarchism];

const friend: Orientation = { id: "friend", type: "person", name: "Ania" };

const compareWith = (earnedIds: string[]): TraitsComparison => ({
  orientation: friend,
  earnedIds,
});

const getIds = (items: ReturnType<typeof getTraitItems>) =>
  items.map((item) => item.orientation.id);

describe("getTraitItems()", () => {
  describe("given no comparison", () => {
    it("returns the traits the taker earned, in the order of the definitions", () => {
      const items = getTraitItems({
        traits,
        earnedIds: ["monarchism", "anarchism", "pro-choice"],
      });

      expect(items).toEqual([
        { orientation: proChoice, holder: "taker" },
        { orientation: anarchism, holder: "taker" },
        { orientation: monarchism, holder: "taker" },
      ]);
    });

    it("ignores an earned id that no trait has", () => {
      const items = getTraitItems({
        traits,
        earnedIds: ["anarchism", "unknown"],
      });

      expect(getIds(items)).toEqual(["anarchism"]);
    });

    it("drops a trait without a name", () => {
      const items = getTraitItems({
        traits: [
          { ...proChoice, name: "   " },
          { ...proEuro, name: undefined },
          anarchism,
        ],
        earnedIds: ["pro-choice", "pro-euro", "anarchism"],
      });

      expect(getIds(items)).toEqual(["anarchism"]);
    });

    it("returns a trait defined twice once", () => {
      const items = getTraitItems({
        traits: [anarchism, proChoice, { ...anarchism, name: "Anarchizm 2" }],
        earnedIds: ["anarchism", "pro-choice"],
      });

      expect(items.map((item) => item.orientation.name)).toEqual([
        "Anarchizm",
        "Pro-choice",
      ]);
    });

    it("collapses a name with line breaks into one line", () => {
      const items = getTraitItems({
        traits: [{ ...anarchism, name: " Anarchizm\n\nteraz " }],
        earnedIds: ["anarchism"],
      });

      expect(items[0].orientation.name).toBe("Anarchizm teraz");
    });

    it("returns nothing when nothing was earned", () => {
      expect(getTraitItems({ traits, earnedIds: [] })).toEqual([]);
    });

    it("returns nothing for input that is not a list", () => {
      expect(
        getTraitItems({
          traits: undefined as unknown as Orientation[],
          earnedIds: undefined as unknown as string[],
        }),
      ).toEqual([]);
      expect(
        getTraitItems({
          traits: [null as unknown as Orientation, anarchism],
          earnedIds: "anarchism" as unknown as string[],
        }),
      ).toEqual([]);
    });
  });

  describe("given a comparison", () => {
    it("marks a trait both earned as shared", () => {
      const items = getTraitItems({
        traits,
        earnedIds: ["pro-choice"],
        comparison: compareWith(["pro-choice"]),
      });

      expect(items).toHaveLength(1);
      expect(items[0].holder).toBe("both");
    });

    it("marks a trait only the taker earned as the taker own", () => {
      const items = getTraitItems({
        traits,
        earnedIds: ["anarchism"],
        comparison: compareWith(["pro-choice"]),
      });

      expect(
        items.find((item) => item.orientation.id === "anarchism")?.holder,
      ).toBe("taker");
    });

    it("marks a trait only the other side earned as theirs", () => {
      const items = getTraitItems({
        traits,
        earnedIds: ["anarchism"],
        comparison: compareWith(["pro-euro"]),
      });

      expect(
        items.find((item) => item.orientation.id === "pro-euro")?.holder,
      ).toBe("other");
    });

    it("drops a trait neither earned", () => {
      const items = getTraitItems({
        traits,
        earnedIds: ["anarchism"],
        comparison: compareWith(["pro-euro"]),
      });

      expect(getIds(items)).not.toContain("monarchism");
      expect(getIds(items)).not.toContain("pro-choice");
    });

    it("keeps the order of the definitions", () => {
      const items = getTraitItems({
        traits,
        earnedIds: ["monarchism", "anarchism"],
        comparison: compareWith(["pro-euro", "pro-choice", "anarchism"]),
      });

      expect(
        items.map(({ orientation, holder }) => [orientation.id, holder]),
      ).toEqual([
        ["pro-choice", "other"],
        ["pro-euro", "other"],
        ["anarchism", "both"],
        ["monarchism", "taker"],
      ]);
    });

    it("returns only theirs when the taker earned none", () => {
      const items = getTraitItems({
        traits,
        earnedIds: [],
        comparison: compareWith(["pro-euro", "monarchism"]),
      });

      expect(
        items.map(({ orientation, holder }) => [orientation.id, holder]),
      ).toEqual([
        ["pro-euro", "other"],
        ["monarchism", "other"],
      ]);
    });

    it("treats missing earnedIds as nothing earned", () => {
      const items = getTraitItems({
        traits,
        earnedIds: ["anarchism"],
        comparison: { orientation: friend } as TraitsComparison,
      });

      expect(
        items.map(({ orientation, holder }) => [orientation.id, holder]),
      ).toEqual([["anarchism", "taker"]]);
    });

    it("ignores an id of theirs that no trait has", () => {
      const items = getTraitItems({
        traits,
        earnedIds: [],
        comparison: compareWith(["unknown"]),
      });

      expect(items).toEqual([]);
    });

    it("ignores a comparison without an orientation", () => {
      const items = getTraitItems({
        traits,
        earnedIds: ["anarchism"],
        comparison: {
          earnedIds: ["anarchism", "pro-euro"],
        } as TraitsComparison,
      });

      expect(
        items.map(({ orientation, holder }) => [orientation.id, holder]),
      ).toEqual([["anarchism", "taker"]]);
    });
  });
});

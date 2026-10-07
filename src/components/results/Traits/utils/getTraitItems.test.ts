import { describe, expect, it } from "vitest";

import type { AxisOrientation } from "@/types/axis";

import type { TraitsComparison } from "../Traits.types";
import { getTraitItems } from "./getTraitItems";

const anarchism: AxisOrientation = {
  id: "anarchism",
  name: "Anarchizm",
  imageUrl: "https://example.com/anarchism.svg",
  color: "#192430",
};
const proChoice: AxisOrientation = {
  id: "pro-choice",
  name: "Pro-choice",
  color: "#851c22",
};
const proEuro: AxisOrientation = { id: "pro-euro", name: "Pro-Euro" };
const monarchism: AxisOrientation = { id: "monarchism", name: "Monarchizm" };

const traits = [proChoice, proEuro, anarchism, monarchism];

const friend: AxisOrientation = { id: "friend", name: "Ania" };

const compareWith = (earnedIds: string[]): TraitsComparison => ({
  party: friend,
  earnedIds,
});

const getIds = (items: ReturnType<typeof getTraitItems>) =>
  items.map((item) => item.id);

describe("getTraitItems()", () => {
  describe("given no comparison", () => {
    it("returns the traits the taker earned, in the order of the definitions", () => {
      const items = getTraitItems({
        traits,
        earnedIds: ["monarchism", "anarchism", "pro-choice"],
      });

      expect(items).toEqual([
        { ...proChoice, imageUrl: undefined, holder: "taker" },
        { ...anarchism, holder: "taker" },
        {
          ...monarchism,
          imageUrl: undefined,
          color: undefined,
          holder: "taker",
        },
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
          { ...proEuro, name: undefined as unknown as string },
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

      expect(items.map((item) => item.name)).toEqual([
        "Anarchizm",
        "Pro-choice",
      ]);
    });

    it("collapses a name with line breaks into one line", () => {
      const items = getTraitItems({
        traits: [{ ...anarchism, name: " Anarchizm\n\nteraz " }],
        earnedIds: ["anarchism"],
      });

      expect(items[0].name).toBe("Anarchizm teraz");
    });

    it("returns nothing when nothing was earned", () => {
      expect(getTraitItems({ traits, earnedIds: [] })).toEqual([]);
    });

    it("returns nothing for input that is not a list", () => {
      expect(
        getTraitItems({
          traits: undefined as unknown as AxisOrientation[],
          earnedIds: undefined as unknown as string[],
        }),
      ).toEqual([]);
      expect(
        getTraitItems({
          traits: [null as unknown as AxisOrientation, anarchism],
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

      expect(items.find((item) => item.id === "anarchism")?.holder).toBe(
        "taker",
      );
    });

    it("marks a trait only the other party earned as theirs", () => {
      const items = getTraitItems({
        traits,
        earnedIds: ["anarchism"],
        comparison: compareWith(["pro-euro"]),
      });

      expect(items.find((item) => item.id === "pro-euro")?.holder).toBe(
        "other",
      );
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

      expect(items.map(({ id, holder }) => [id, holder])).toEqual([
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

      expect(items.map(({ id, holder }) => [id, holder])).toEqual([
        ["pro-euro", "other"],
        ["monarchism", "other"],
      ]);
    });

    it("treats missing earnedIds as nothing earned", () => {
      const items = getTraitItems({
        traits,
        earnedIds: ["anarchism"],
        comparison: { party: friend } as TraitsComparison,
      });

      expect(items.map(({ id, holder }) => [id, holder])).toEqual([
        ["anarchism", "taker"],
      ]);
    });

    it("ignores an id of theirs that no trait has", () => {
      const items = getTraitItems({
        traits,
        earnedIds: [],
        comparison: compareWith(["unknown"]),
      });

      expect(items).toEqual([]);
    });

    it("ignores a comparison without a party", () => {
      const items = getTraitItems({
        traits,
        earnedIds: ["anarchism"],
        comparison: {
          earnedIds: ["anarchism", "pro-euro"],
        } as TraitsComparison,
      });

      expect(items.map(({ id, holder }) => [id, holder])).toEqual([
        ["anarchism", "taker"],
      ]);
    });
  });
});

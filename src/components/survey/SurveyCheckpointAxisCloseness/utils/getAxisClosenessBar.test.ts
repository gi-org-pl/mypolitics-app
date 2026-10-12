import { describe, expect, it } from "vitest";

import type {
  AxisClosenessCheckpointCard,
  AxisClosenessDoubleCheckpointCard,
  AxisClosenessSingleCheckpointCard,
} from "@/types/checkpoint";
import { createAxisPair } from "@/utils/vitest/createAxisPair";
import { createOrientation } from "@/utils/vitest/createOrientation";

import { getAxisClosenessBar } from "./getAxisClosenessBar";

const createSingleCard = (
  name?: string,
): AxisClosenessSingleCheckpointCard => ({
  type: "axis-closeness",
  variant: "single",
  boundary: 5,
  axisId: "radicalism",
  entry: { orientation: createOrientation("radicalism", name), value: 80 },
  line: { pool: "axis-closeness-single", index: 0 },
});

const createDoubleCard = (
  leadingSide: "start" | "end",
  startName = "Eurosceptycyzm",
  endName = "Federacjonizm",
): AxisClosenessDoubleCheckpointCard => {
  const { start, end } = createAxisPair(
    "union",
    startName,
    endName,
    leadingSide === "start" ? 69 : 31,
    leadingSide === "start" ? 31 : 69,
  );

  return {
    type: "axis-closeness",
    variant: "double",
    boundary: 5,
    axisId: "union",
    start,
    end,
    leadingSide,
    line: { pool: "axis-closeness-double", index: 0 },
  };
};

describe("getAxisClosenessBar()", () => {
  describe("given the single variant", () => {
    it("returns the entry as the start entry and its name as the title", () => {
      const card = createSingleCard("Radykalizm");

      expect(getAxisClosenessBar(card)).toEqual({
        title: "Radykalizm",
        start: card.entry,
      });
      expect(getAxisClosenessBar(card)?.end).toBeUndefined();
    });
  });

  describe("given the double variant", () => {
    it("returns both entries and the name of the leading side as the title", () => {
      const card = createDoubleCard("start");

      expect(getAxisClosenessBar(card)).toEqual({
        title: "Eurosceptycyzm",
        start: card.start,
        end: card.end,
      });
    });

    it("never swaps the sides", () => {
      const card = createDoubleCard("end");
      const bar = getAxisClosenessBar(card);

      expect(bar?.title).toBe("Federacjonizm");
      expect(bar?.start).toBe(card.start);
      expect(bar?.end).toBe(card.end);
    });
  });

  describe("given a name as a quiz may write it", () => {
    it("collapses a name to one line", () => {
      expect(
        getAxisClosenessBar(createSingleCard("  Państwo \n  minimum  "))?.title,
      ).toBe("Państwo minimum");
      expect(
        getAxisClosenessBar(
          createDoubleCard(
            "end",
            "Eurosceptycyzm",
            "Federacjonizm\n\teuropejski",
          ),
        )?.title,
      ).toBe("Federacjonizm europejski");
    });

    it("keeps a name as written: its case, its quotation marks and its length", () => {
      const name = `PAŃSTWO „minimum” ${"bardzo ".repeat(30)}długie`;

      expect(getAxisClosenessBar(createSingleCard(name))?.title).toBe(name);
    });
  });

  describe("given a name that is missing or blank", () => {
    it("returns nothing when it is the name the title needs", () => {
      expect(getAxisClosenessBar(createSingleCard())).toBeUndefined();
      expect(getAxisClosenessBar(createSingleCard(" \n "))).toBeUndefined();
      expect(
        getAxisClosenessBar(createDoubleCard("start", "", "Federacjonizm")),
      ).toBeUndefined();
      expect(
        getAxisClosenessBar(createDoubleCard("end", "Eurosceptycyzm", "  ")),
      ).toBeUndefined();
    });

    it("returns the bar when only the name of the other side is missing", () => {
      expect(
        getAxisClosenessBar(createDoubleCard("start", "Eurosceptycyzm", ""))
          ?.title,
      ).toBe("Eurosceptycyzm");
    });
  });

  describe("given a card that cannot be read", () => {
    it("returns nothing, without throwing", () => {
      const broken = {
        ...createSingleCard("Radykalizm"),
        entry: undefined,
      } as unknown as AxisClosenessCheckpointCard;

      expect(getAxisClosenessBar(broken)).toBeUndefined();
      expect(
        getAxisClosenessBar(
          undefined as unknown as AxisClosenessCheckpointCard,
        ),
      ).toBeUndefined();
    });
  });
});

import { describe, expect, it } from "vitest";

import verifiedIcon from "@/assets/icons/verified.svg";
import { findModule } from "@/utils/result-modules/resolvedModules.fixtures";
import { createOrientation } from "@/utils/vitest/createOrientation";
import { MODULE_TEXTS } from "../../ModuleDrawing.fixtures";
import { toHorizontalBarProps } from "./toHorizontalBarProps";

const VERIFIED = { iconUrl: verifiedIcon, label: "Zweryfikowany" };

const green = createOrientation("party-green", "Zieloni", { type: "party" });
const left = createOrientation("party-left", "Lewica", {
  type: "party",
  isOfficial: true,
});

describe("toHorizontalBarProps()", () => {
  describe("given a resolved ranking with entries", () => {
    it("hands over the title, the rows and the visible rows; an official entry carries the verified badge", () => {
      expect(
        toHorizontalBarProps(findModule("horizontal_bar"), MODULE_TEXTS),
      ).toEqual({
        title: "Partie",
        visibleRows: 2,
        entries: [
          { orientation: green, value: undefined, badge: undefined },
          { orientation: left, value: undefined, badge: VERIFIED },
        ],
      });
    });

    it("hands over no categories", () => {
      expect(
        toHorizontalBarProps(findModule("horizontal_bar"), MODULE_TEXTS),
      ).not.toHaveProperty("categories");
    });
  });

  describe("given a resolved ranking grouped by category", () => {
    const props = toHorizontalBarProps(
      {
        id: "parties",
        type: "horizontal_bar",
        position: 5,
        column: "start",
        title: "Partie",
        visibleRows: 2,
        categories: [
          {
            id: "economy",
            name: "Gospodarka",
            entries: [
              { orientation: left, value: 70, isOfficial: true },
              { orientation: green, value: 40, isOfficial: false },
            ],
          },
          { id: "society", entries: [] },
        ],
      },
      MODULE_TEXTS,
    );

    it("hands over one list per category, each with its rows", () => {
      expect(props.categories).toEqual([
        {
          id: "economy",
          name: "Gospodarka",
          entries: [
            { orientation: left, value: 70, badge: VERIFIED },
            { orientation: green, value: 40, badge: undefined },
          ],
        },
        { id: "society", name: undefined, entries: [] },
      ]);
    });

    it("hands over no flat list, and keeps the title and the visible rows", () => {
      expect(props).not.toHaveProperty("entries");
      expect(props).toMatchObject({ title: "Partie", visibleRows: 2 });
    });
  });
});

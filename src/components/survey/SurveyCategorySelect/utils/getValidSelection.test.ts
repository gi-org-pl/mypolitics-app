import { describe, expect, it } from "vitest";

import type { SurveyCategory } from "../SurveyCategorySelect.types";
import { getValidSelection } from "./getValidSelection";

const CATEGORIES: SurveyCategory[] = [
  { id: "worldview", name: "Światopogląd" },
  { id: "system", name: "Ustrój" },
  { id: "economy", name: "Gospodarka" },
];

describe("getValidSelection()", () => {
  describe("given ids that all match a category", () => {
    it("returns them in the order they were selected", () => {
      expect(getValidSelection(["economy", "worldview"], CATEGORIES)).toEqual([
        "economy",
        "worldview",
      ]);
    });
  });

  describe("given an id that matches no category", () => {
    it("leaves it out", () => {
      expect(getValidSelection(["worldview", "ghost"], CATEGORIES)).toEqual([
        "worldview",
      ]);
    });
  });

  describe("given the same id twice", () => {
    it("keeps it once, at its first position", () => {
      expect(
        getValidSelection(["system", "worldview", "system"], CATEGORIES),
      ).toEqual(["system", "worldview"]);
    });
  });

  describe("given no selected ids", () => {
    it("returns an empty list", () => {
      expect(getValidSelection([], CATEGORIES)).toEqual([]);
    });
  });

  describe("given no categories", () => {
    it("returns an empty list", () => {
      expect(getValidSelection(["worldview"], [])).toEqual([]);
    });
  });
});

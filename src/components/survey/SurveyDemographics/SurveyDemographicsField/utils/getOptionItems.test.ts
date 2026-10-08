import { describe, expect, it, vi } from "vitest";

import type { DemographicsOption } from "../../SurveyDemographics.types";
import { getOptionItems } from "./getOptionItems";

const options: DemographicsOption[] = [
  { value: "male", label: "Mężczyzna" },
  { value: "female", label: "Kobieta" },
];

describe("getOptionItems()", () => {
  describe("given options", () => {
    it("returns one item per option, in the order given, labelled like it", () => {
      const items = getOptionItems(options, vi.fn());

      expect(items.map((item) => item.label)).toEqual(["Mężczyzna", "Kobieta"]);
    });

    it("does not call the handler by itself", () => {
      const onChange = vi.fn();

      getOptionItems(options, onChange);

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe("when an item is activated", () => {
    it("calls the handler with the value of its option", () => {
      const onChange = vi.fn();
      const items = getOptionItems(options, onChange);

      items[1].onClick?.();

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith("female");
    });
  });

  describe("given two options with the same value", () => {
    it("keeps both items", () => {
      const items = getOptionItems(
        [
          { value: "same", label: "Pierwsza" },
          { value: "same", label: "Druga" },
        ],
        vi.fn(),
      );

      expect(items.map((item) => item.label)).toEqual(["Pierwsza", "Druga"]);
    });
  });

  describe("given an empty option list", () => {
    it("returns no items", () => {
      expect(getOptionItems([], vi.fn())).toEqual([]);
    });
  });
});

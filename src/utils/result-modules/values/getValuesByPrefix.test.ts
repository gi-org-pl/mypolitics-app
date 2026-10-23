import { describe, expect, it } from "vitest";

import { getValuesByPrefix } from "./getValuesByPrefix";

const values = {
  description: "Dwie osie.",
  "label.centre": "Centrum",
  "label.topLeftModerate": "Lewica",
  "label.topLeftExtreme": undefined,
  "color.topLeft": "#ff0000",
  "color.topRight": undefined,
};

describe("getValuesByPrefix()", () => {
  describe("given values under keys with and without the prefix", () => {
    it("returns the ones under the prefix, each by the name behind it", () => {
      expect(getValuesByPrefix(values, "label.")).toStrictEqual({
        centre: "Centrum",
        topLeftModerate: "Lewica",
      });
      expect(getValuesByPrefix(values, "color.")).toStrictEqual({
        topLeft: "#ff0000",
      });
    });

    it("leaves out a key that has no value", () => {
      expect(getValuesByPrefix(values, "label.")).not.toHaveProperty(
        "topLeftExtreme",
      );
      expect(getValuesByPrefix(values, "color.")).not.toHaveProperty(
        "topRight",
      );
    });

    it("takes the prefix only where a key starts with it", () => {
      expect(
        getValuesByPrefix(
          { "my.label.centre": "x", labelCentre: "y" },
          "label.",
        ),
      ).toStrictEqual({});
    });
  });

  describe("given no key under the prefix", () => {
    it("returns nothing", () => {
      expect(getValuesByPrefix(values, "icon.")).toStrictEqual({});
      expect(getValuesByPrefix({}, "label.")).toStrictEqual({});
    });
  });

  describe("given values", () => {
    it("does not change them", () => {
      const before = { ...values };

      getValuesByPrefix(values, "label.");

      expect(values).toStrictEqual(before);
    });
  });
});

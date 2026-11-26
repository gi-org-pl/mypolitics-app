import { describe, expect, it } from "vitest";

import { toModuleValues } from "./toModuleValues";

describe("toModuleValues()", () => {
  describe("given a list of pairs", () => {
    it("keeps each value by its key, as it was saved", () => {
      expect(
        toModuleValues([
          { key: "title", value: "  Partie\n" },
          { key: "marker", value: 37.5 },
          { key: "isFolded", value: false },
          { key: "nothing", value: null },
          { key: "label.link", value: "" },
        ]),
      ).toStrictEqual({
        title: "  Partie\n",
        marker: 37.5,
        isFolded: false,
        nothing: null,
        "label.link": "",
      });
    });

    it("keeps a key the app does not know, and a value its key does not allow", () => {
      expect(
        toModuleValues([
          { key: "sortBy", value: "name" },
          { key: "marker", value: 250 },
          { key: "color.topLeft", value: "red" },
        ]),
      ).toStrictEqual({ sortBy: "name", marker: 250, "color.topLeft": "red" });
    });
  });

  describe("given a pair with no key", () => {
    it.each([
      ["a pair that leaves the key out", { value: "Partie" }],
      ["an empty key", { key: "", value: "Partie" }],
      ["a blank key", { key: " \n ", value: "Partie" }],
      ["a key that is a number", { key: 7, value: "Partie" }],
      ["a key that is null", { key: null, value: "Partie" }],
    ])("skips %s and keeps the others", (_, pair) => {
      expect(
        toModuleValues([pair, { key: "marker", value: 20 }]),
      ).toStrictEqual({ marker: 20 });
    });
  });

  describe("given a pair with a value that is not a text, a number, a boolean or null", () => {
    it.each([
      ["a pair that leaves the value out", { key: "title" }],
      ["an object", { key: "title", value: { min: 1 } }],
      ["a text per language", { key: "title", value: { pl: "Partie" } }],
      ["a list", { key: "title", value: ["Partie"] }],
      ["a number that is not one", { key: "title", value: Number.NaN }],
    ])("skips %s and keeps the others", (_, pair) => {
      const values = toModuleValues([pair, { key: "marker", value: 20 }]);

      expect(values).toStrictEqual({ marker: 20 });
      expect(values).not.toHaveProperty("title");
    });
  });

  describe("given the same key twice", () => {
    it("keeps the first", () => {
      expect(
        toModuleValues([
          { key: "title", value: "Pierwszy" },
          { key: "marker", value: 20 },
          { key: "title", value: "Drugi" },
          { key: "marker", value: null },
        ]),
      ).toStrictEqual({ title: "Pierwszy", marker: 20 });
    });

    it("keeps the first that can be read", () => {
      expect(
        toModuleValues([
          { key: "title", value: { pl: "Nie do odczytania" } },
          { key: "title", value: "Drugi" },
          { key: "title", value: "Trzeci" },
        ]),
      ).toStrictEqual({ title: "Drugi" });
    });

    it("keeps a value that is nothing, although a later pair holds something", () => {
      expect(
        toModuleValues([
          { key: "marker", value: null },
          { key: "marker", value: 20 },
        ]),
      ).toStrictEqual({ marker: null });
    });
  });

  describe("given items that are not pairs", () => {
    it("never throws, and reads the pairs among them", () => {
      const pairs = [
        undefined,
        null,
        "title",
        7,
        true,
        [],
        ["title", "Partie"],
        {},
        { key: "title", value: "Partie" },
      ];

      expect(() => toModuleValues(pairs)).not.toThrow();
      expect(toModuleValues(pairs)).toStrictEqual({ title: "Partie" });
    });
  });

  describe("given no list, an empty list, or something that is not a list", () => {
    it.each([
      [undefined],
      [null],
      [[]],
      [""],
      ["title"],
      [7],
      [true],
      [{}],
      [{ title: "Partie", marker: 20 }],
      [{ 0: { key: "title", value: "Partie" }, length: 1 }],
    ])("returns no values for %j", (pairs) => {
      expect(toModuleValues(pairs)).toStrictEqual({});
    });
  });

  describe("given a key that an object has by itself", () => {
    it("keeps it as a value of the record, like any other key", () => {
      const values = toModuleValues([
        { key: "__proto__", value: "x" },
        { key: "constructor", value: 7 },
      ]);

      expect(Object.keys(values).sort()).toEqual(["__proto__", "constructor"]);
      expect(Object.getPrototypeOf(values)).toBe(Object.prototype);
    });
  });

  describe("given a list", () => {
    it("does not change it", () => {
      const pairs = [
        { key: "title", value: "Partie" },
        { key: "title", value: "Drugi" },
        { key: "", value: "x" },
      ];
      const before = structuredClone(pairs);

      toModuleValues(pairs);

      expect(pairs).toEqual(before);
    });
  });
});

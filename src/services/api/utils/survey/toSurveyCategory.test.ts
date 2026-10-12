import { describe, expect, it } from "vitest";

import { categoryResponseSchema } from "@/services/api/schemas/survey";

import { toSurveyCategory } from "./toSurveyCategory";

const read = (
  response: Record<string, unknown>,
): ReturnType<typeof toSurveyCategory> =>
  toSurveyCategory(categoryResponseSchema.parse({ id: "c1", ...response }));

describe("toSurveyCategory()", () => {
  describe("given a plain name", () => {
    it("reads a plain name", () => {
      expect(
        read({ id: "9ccd7638", name: "Światopogląd", weight: 1.25 }),
      ).toEqual({
        id: "9ccd7638",
        name: "Światopogląd",
        weight: 1.25,
        isHidden: false,
      });
    });

    it("trims it", () => {
      expect(read({ name: "  Polityka zagraniczna\n" }).name).toBe(
        "Polityka zagraniczna",
      );
    });

    it("reads valid JSON that is not an object as the name", () => {
      expect(read({ name: "2050" }).name).toBe("2050");
    });
  });

  describe("given a packed name", () => {
    it("reads a packed name and its hidden mark", () => {
      expect(
        read({
          id: "8fe79b1c",
          name: '{\n  "name": "Prezydentura",\n  "isHidden": true\n}',
          weight: 1,
        }),
      ).toEqual({
        id: "8fe79b1c",
        name: "Prezydentura",
        weight: 1,
        isHidden: true,
      });
      expect(
        read({ name: '{\n  "name": "Gospodarka",\n  "isHidden": false\n}' }),
      ).toMatchObject({ name: "Gospodarka", isHidden: false });
    });

    it("ignores packed keys it does not know", () => {
      expect(
        read({
          name: '{"name":"Gospodarka","slug":"gospodarka","isMain":true,"category":"Inne"}',
        }),
      ).toEqual({ id: "c1", name: "Gospodarka", weight: 0, isHidden: false });
    });

    it("reads a hidden mark without a name", () => {
      expect(read({ name: '{"isHidden":true}' })).toEqual({
        id: "c1",
        weight: 0,
        isHidden: true,
      });
    });
  });

  describe("given a name that cannot be read", () => {
    it("has no name when it is missing, empty or broken packed text", () => {
      expect(read({}).name).toBeUndefined();
      expect(read({ name: null }).name).toBeUndefined();
      expect(read({ name: "" }).name).toBeUndefined();
      expect(read({ name: " \n " }).name).toBeUndefined();
      expect(read({ name: 7 }).name).toBeUndefined();
      expect(read({ name: '{"name":"Gospodarka"' }).name).toBeUndefined();
      expect(read({ name: "{Gospodarka}" }).name).toBeUndefined();
      expect(read({ name: '{"name":7}' }).name).toBeUndefined();
      expect(read({ name: '{"name":" "}' }).name).toBeUndefined();
      expect(read({ name: "{}" }).name).toBeUndefined();
    });
  });

  describe("given a hidden mark", () => {
    it("is not hidden when the mark is absent or of the wrong sort", () => {
      expect(read({ name: "Gospodarka" }).isHidden).toBe(false);
      expect(read({ name: '{"name":"Gospodarka"}' }).isHidden).toBe(false);
      expect(
        read({ name: '{"name":"Gospodarka","isHidden":"true"}' }).isHidden,
      ).toBe(false);
      expect(
        read({ name: '{"name":"Gospodarka","isHidden":1}' }).isHidden,
      ).toBe(false);
      expect(
        read({ name: '{"name":"Gospodarka","isHidden":null}' }).isHidden,
      ).toBe(false);
      expect(read({ name: "Gospodarka", isHidden: true }).isHidden).toBe(false);
    });
  });

  describe("given a weight", () => {
    it("reads a missing weight as 0", () => {
      expect(read({}).weight).toBe(0);
      expect(read({ weight: null }).weight).toBe(0);
    });

    it("reads a weight that is not a number as 0", () => {
      expect(read({ weight: "1.25" }).weight).toBe(0);
      expect(read({ weight: Number.NaN }).weight).toBe(0);
    });

    it("carries a number as sent", () => {
      expect(read({ weight: 1.25 }).weight).toBe(1.25);
      expect(read({ weight: 0 }).weight).toBe(0);
    });
  });
});

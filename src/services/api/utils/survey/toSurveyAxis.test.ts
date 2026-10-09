import { describe, expect, it } from "vitest";

import { axisResponseSchema } from "@/services/api/schemas/survey";

import { toSurveyAxis } from "./toSurveyAxis";

const quiz = { orientationIds: new Set(["left", "right", "hidden"]) };

const read = (
  response: Record<string, unknown>,
): ReturnType<typeof toSurveyAxis> =>
  toSurveyAxis(axisResponseSchema.parse({ id: "x1", ...response }), quiz);

describe("toSurveyAxis()", () => {
  describe("given a plain name", () => {
    it("reads a plain name", () => {
      expect(
        read({
          id: "8bd5f826",
          name: "gospodarczo",
          type: "compass_x_axis",
          description: "Oś gospodarcza kompasu.",
          positiveOrientations: ["right"],
          negativeOrientations: ["left"],
        }),
      ).toEqual({
        id: "8bd5f826",
        name: "gospodarczo",
        type: "compass_x_axis",
        description: "Oś gospodarcza kompasu.",
        positiveOrientationIds: ["right"],
        negativeOrientationIds: ["left"],
        isMain: false,
      });
    });

    it("trims the name and the description", () => {
      expect(
        read({ name: " światopoglądowo\n", description: "\nOpis osi. " }),
      ).toMatchObject({ name: "światopoglądowo", description: "Opis osi." });
    });
  });

  describe("given a packed name", () => {
    it("reads a packed name, its category and its main mark", () => {
      expect(
        read({
          name: '{"name":"Ekologia Klimatyczna-Antyklimatyzm","category":"Ekologia","isMain":true}',
        }),
      ).toMatchObject({
        name: "Ekologia Klimatyczna-Antyklimatyzm",
        categoryName: "Ekologia",
        isMain: true,
      });
    });

    it("reads a packed name with raw line breaks, as the identity quiz sends it", () => {
      expect(
        read({
          name: '{\n  "name": "Zielona Gospodarka-Industrializm",\n  "category": "Ekologia",\n  "isMain": false\n}',
        }),
      ).toMatchObject({
        name: "Zielona Gospodarka-Industrializm",
        categoryName: "Ekologia",
        isMain: false,
      });
      expect(
        read({
          name: '{\r\n  "name": "Zielona Gospodarka-\nIndustrializm",\r\n  "category": "Ekologia"\r\n}',
        }),
      ).toMatchObject({
        name: "Zielona Gospodarka-\nIndustrializm",
        categoryName: "Ekologia",
      });
    });

    it("ignores packed keys it does not know", () => {
      expect(
        read({ name: '{"name":"Oś","isHidden":true,"slug":"os"}' }),
      ).toEqual({
        id: "x1",
        name: "Oś",
        type: "other",
        positiveOrientationIds: [],
        negativeOrientationIds: [],
        isMain: false,
      });
    });

    it("is not main, and has no category, when they are absent or of the wrong sort", () => {
      expect(read({ name: '{"name":"Oś"}' })).toMatchObject({ isMain: false });
      expect(read({ name: '{"name":"Oś"}' }).categoryName).toBeUndefined();
      expect(
        read({ name: '{"name":"Oś","category":7,"isMain":"true"}' }),
      ).toMatchObject({ name: "Oś", isMain: false });
      expect(
        read({ name: '{"name":"Oś","category":" "}' }).categoryName,
      ).toBeUndefined();
    });
  });

  describe("given a name that cannot be read", () => {
    it("has no name when it is missing, empty or broken packed text", () => {
      expect(read({}).name).toBeUndefined();
      expect(read({ name: "" }).name).toBeUndefined();
      expect(read({ name: null }).name).toBeUndefined();
      expect(read({ name: '{"name":"Oś"' }).name).toBeUndefined();
      expect(read({ name: '{"category":"Ekologia"}' }).name).toBeUndefined();
    });
  });

  describe("given a type", () => {
    it("keeps the type as sent", () => {
      expect(read({ type: "axis" }).type).toBe("axis");
      expect(read({ type: "compass_x_axis" }).type).toBe("compass_x_axis");
      expect(read({ type: "compass_y_axis" }).type).toBe("compass_y_axis");
      expect(read({ type: "RADAR" }).type).toBe("RADAR");
    });

    it("reads a type that is missing, blank or not text as other", () => {
      expect(read({}).type).toBe("other");
      expect(read({ type: null }).type).toBe("other");
      expect(read({ type: " " }).type).toBe("other");
      expect(read({ type: 7 }).type).toBe("other");
    });
  });

  describe("given orientations", () => {
    it("reads missing lists of orientations as empty", () => {
      expect(read({})).toMatchObject({
        positiveOrientationIds: [],
        negativeOrientationIds: [],
      });
      expect(
        read({ positiveOrientations: null, negativeOrientations: "left" }),
      ).toMatchObject({
        positiveOrientationIds: [],
        negativeOrientationIds: [],
      });
    });

    it("keeps the orientations the quiz has, a hidden one included", () => {
      expect(
        read({
          positiveOrientations: ["right", "hidden"],
          negativeOrientations: ["left"],
        }),
      ).toMatchObject({
        positiveOrientationIds: ["right", "hidden"],
        negativeOrientationIds: ["left"],
      });
    });

    it("drops an orientation the quiz does not have", () => {
      expect(
        read({
          positiveOrientations: ["centre", "right", 7],
          negativeOrientations: ["left", null, "far-left"],
        }),
      ).toMatchObject({
        positiveOrientationIds: ["right"],
        negativeOrientationIds: ["left"],
      });
    });
  });
});

import { describe, expect, it } from "vitest";

import { orientationResponseSchema } from "./orientation";

const response = {
  id: "cd7c4031",
  type: "PARTY",
  generalName: "Zieloni",
  logoUrl: "https://example.com/zieloni.png",
  color: "#249668",
  description: "Partia Zieloni to lewicowa partia polityczna.",
  explanation: "Jak czytać ten wynik.",
  linkedOrientations: ["c00d6c51"],
  surveyId: "60beb898",
};

describe("orientationResponseSchema", () => {
  describe("given an orientation with every field", () => {
    it("accepts it as sent", () => {
      expect(orientationResponseSchema.parse(response)).toEqual(response);
    });
  });

  describe("given only an id", () => {
    it("accepts it", () => {
      expect(orientationResponseSchema.parse({ id: "cd7c4031" })).toEqual({
        id: "cd7c4031",
      });
    });
  });

  describe("given null or empty text in a field", () => {
    it("accepts both", () => {
      const nullResponse = {
        id: "cd7c4031",
        type: null,
        generalName: null,
        logoUrl: null,
        color: null,
        description: null,
        explanation: null,
        linkedOrientations: null,
        surveyId: null,
      };
      const emptyResponse = { id: "cd7c4031", logoUrl: "", color: "" };

      expect(orientationResponseSchema.parse(nullResponse)).toEqual(
        nullResponse,
      );
      expect(orientationResponseSchema.parse(emptyResponse)).toEqual(
        emptyResponse,
      );
    });
  });

  describe("given a field of the wrong sort", () => {
    it("keeps the orientation and reads the field as absent", () => {
      const result = orientationResponseSchema.safeParse({
        ...response,
        generalName: 2050,
        color: { hex: "#249668" },
        linkedOrientations: "c00d6c51",
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        ...response,
        generalName: undefined,
        color: undefined,
        linkedOrientations: undefined,
      });
    });

    it("keeps a list of links whatever its items are", () => {
      expect(
        orientationResponseSchema.parse({
          id: "cd7c4031",
          linkedOrientations: ["c00d6c51", 7],
        }).linkedOrientations,
      ).toEqual(["c00d6c51", 7]);
    });
  });

  describe("given a key it does not know", () => {
    it("leaves it out", () => {
      expect(
        orientationResponseSchema.parse({ id: "cd7c4031", slug: "zieloni" }),
      ).not.toHaveProperty("slug");
    });
  });

  describe("given no usable id", () => {
    it.each([
      {},
      { id: undefined },
      { id: null },
      { id: "" },
      { id: 7 },
      { generalName: "Zieloni" },
    ])("rejects %j", (item) => {
      expect(orientationResponseSchema.safeParse(item).success).toBe(false);
    });
  });

  describe("given something that is not an object", () => {
    it.each([
      undefined,
      null,
      "cd7c4031",
      7,
      true,
      ["cd7c4031"],
    ])("rejects %j without throwing", (item) => {
      expect(orientationResponseSchema.safeParse(item).success).toBe(false);
    });
  });
});

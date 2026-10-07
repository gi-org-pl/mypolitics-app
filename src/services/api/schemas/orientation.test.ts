import { describe, expect, it } from "vitest";

import {
  orientationResponseSchema,
  orientationTypeResponseSchema,
} from "./orientation";

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

  describe("given text with space or line breaks around it", () => {
    it("trims it", () => {
      expect(
        orientationResponseSchema.parse({
          id: "cd7c4031",
          generalName: "  Zieloni\n",
          logoUrl: " https://example.com/zieloni.png\n",
          color: " #249668 ",
          description: "\nPartia Zieloni. ",
          explanation: " Jak czytać ten wynik.\n",
        }),
      ).toEqual({
        id: "cd7c4031",
        generalName: "Zieloni",
        logoUrl: "https://example.com/zieloni.png",
        color: "#249668",
        description: "Partia Zieloni.",
        explanation: "Jak czytać ten wynik.",
      });
    });
  });

  describe("given null, empty or blank text in a field", () => {
    it.each([null, "", " \n "])("reads %j as absent", (text) => {
      expect(
        orientationResponseSchema.parse({
          id: "cd7c4031",
          type: text,
          generalName: text,
          logoUrl: text,
          color: text,
          description: text,
          explanation: text,
          linkedOrientations: null,
          surveyId: text,
        }),
      ).toEqual({ id: "cd7c4031" });
    });
  });

  describe("type", () => {
    it.each(orientationTypeResponseSchema.options)("accepts %s", (type) => {
      expect(orientationResponseSchema.parse({ id: "a", type }).type).toBe(
        type,
      );
    });

    it.each([
      "TRAIT",
      "PERSON",
      "party",
      "constructor",
      7,
    ])("reads the unknown type %j as absent", (type) => {
      expect(
        orientationResponseSchema.parse({ id: "a", type }).type,
      ).toBeUndefined();
    });
  });

  describe("given a packed name", () => {
    it("reads the keys it knows and leaves out the others", () => {
      expect(
        orientationResponseSchema.parse({
          id: "a",
          generalName:
            '{"name":"Maciej Maciak","m":"Rodzic","f":"Matka","slogan":" Pokój! ","websiteUrl":"https://example.com","isOfficial":true,"isHidden":false,"slug":"maciak"}',
        }).generalName,
      ).toEqual({
        name: "Maciej Maciak",
        m: "Rodzic",
        f: "Matka",
        slogan: "Pokój!",
        websiteUrl: "https://example.com",
        isOfficial: true,
        isHidden: false,
      });
    });

    it("reads a value of the wrong sort as absent", () => {
      expect(
        orientationResponseSchema.parse({
          id: "a",
          generalName:
            '{"name":2050,"m":null,"f":" ","slogan":["Pokój!"],"websiteUrl":{},"isOfficial":"true","isHidden":1}',
        }).generalName,
      ).toEqual({});
    });
  });

  describe("given a packed image", () => {
    it("reads m and f", () => {
      expect(
        orientationResponseSchema.parse({
          id: "a",
          logoUrl:
            '{"m":"https://example.com/m.png","f":"https://example.com/f.png\n","name":"x"}',
        }).logoUrl,
      ).toEqual({
        m: "https://example.com/m.png",
        f: "https://example.com/f.png",
      });
    });
  });

  describe("given a packed description", () => {
    it("reads both spellings of the short and the long one", () => {
      expect(
        orientationResponseSchema.parse({
          id: "a",
          description:
            '{"short":"Krótki.","shortDescription":"Krótki opis.","long":"Długi.","longDescription":"Długi opis.","medium":"x"}',
        }).description,
      ).toEqual({
        short: "Krótki.",
        shortDescription: "Krótki opis.",
        long: "Długi.",
        longDescription: "Długi opis.",
      });
    });

    it("reads one with raw line breaks inside its values", () => {
      expect(
        orientationResponseSchema.parse({
          id: "a",
          description: '{ "long": "Pierwszy akapit.\n\nDrugi akapit." }',
        }).description,
      ).toEqual({ long: "Pierwszy akapit.\n\nDrugi akapit." });
    });
  });

  describe("given text that opens like packed text and does not parse", () => {
    it("reads it as absent", () => {
      expect(
        orientationResponseSchema.parse({
          id: "a",
          generalName: '{"name":"Zieloni"',
          logoUrl: "{m: 'https://example.com/m.png'}",
          description: "{Zieloni}",
        }),
      ).toEqual({ id: "a" });
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

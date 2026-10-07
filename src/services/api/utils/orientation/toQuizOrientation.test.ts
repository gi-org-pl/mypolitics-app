import { describe, expect, it } from "vitest";

import type { OrientationResponse } from "@/services/api/schemas/orientation";

import { toQuizOrientation } from "./toQuizOrientation";

const official = { isOfficialQuiz: true };
const community = { isOfficialQuiz: false };

const read = (
  response: Partial<OrientationResponse>,
  options = official,
): ReturnType<typeof toQuizOrientation> =>
  toQuizOrientation({ id: "a", ...response }, options);

describe("toQuizOrientation()", () => {
  describe("given plain fields", () => {
    it("maps id, generalName, logoUrl, color, description and explanation", () => {
      expect(
        toQuizOrientation(
          {
            id: "cd7c4031",
            type: "PARTY",
            generalName: "Zieloni",
            logoUrl: "https://example.com/zieloni.png",
            color: "#249668",
            description: "Partia Zieloni.\n\nNależy do Koalicji Obywatelskiej.",
            explanation: "Jak czytać ten wynik.",
            linkedOrientations: [],
          },
          official,
        ),
      ).toEqual({
        id: "cd7c4031",
        type: "party",
        name: "Zieloni",
        imageUrl: "https://example.com/zieloni.png",
        color: "#249668",
        description: "Partia Zieloni.\n\nNależy do Koalicji Obywatelskiej.",
        explanation: "Jak czytać ten wynik.",
        isOfficial: false,
        isHidden: false,
      });
    });

    it("does not carry surveyId", () => {
      expect(read({ surveyId: "60beb898" })).not.toHaveProperty("surveyId");
    });

    it("trims the text of every field", () => {
      expect(
        read({
          generalName: "  Zieloni\n",
          logoUrl: " https://example.com/zieloni.png\n",
          color: " #249668 ",
          description: "\nPartia Zieloni. ",
          explanation: " Jak czytać ten wynik.\n",
        }),
      ).toMatchObject({
        name: "Zieloni",
        imageUrl: "https://example.com/zieloni.png",
        color: "#249668",
        description: "Partia Zieloni.",
        explanation: "Jak czytać ten wynik.",
      });
    });

    it.each([
      undefined,
      null,
      "",
      " \n ",
    ])("treats the text %j as absent", (text) => {
      expect(
        read({ generalName: text, description: text, explanation: text }),
      ).toEqual({ id: "a", type: "other", isOfficial: false, isHidden: false });
    });

    it("keeps a name that is valid JSON but not an object as written", () => {
      expect(read({ generalName: "2050" }).name).toBe("2050");
      expect(read({ generalName: "true" }).name).toBe("true");
    });
  });

  describe("type", () => {
    it.each([
      ["IDEOLOGY", "ideology"],
      ["PARTY", "party"],
      ["IDENTITY", "identity"],
      ["COMPASS", "compass"],
    ])("maps the four API types to their lower-case type: %s", (type, expected) => {
      expect(read({ type }).type).toBe(expected);
    });

    it.each([
      undefined,
      null,
      "",
      "TRAIT",
      "party",
      "constructor",
    ])("maps a missing or unknown type to other: %j", (type) => {
      expect(read({ type }).type).toBe("other");
    });

    it('maps a sent "person" to other', () => {
      expect(read({ type: "PERSON" }).type).toBe("other");
      expect(read({ type: "person" }).type).toBe("other");
    });
  });

  describe("given a packed name with forms", () => {
    it("reads m and f as the two forms and slogan as the slogan", () => {
      const orientation = read({
        generalName:
          '{\n  "m": "Zielony postępowiec",\n  "f": "Zielona postępowczyni",\n  "slogan": "Razem w stronę zielonego świata!"\n}',
      });

      expect(orientation.nameForms).toEqual({
        masculine: "Zielony postępowiec",
        feminine: "Zielona postępowczyni",
      });
      expect(orientation.slogan).toBe("Razem w stronę zielonego świata!");
      expect(orientation.name).toBeUndefined();
    });

    it("keeps a single form as the only form", () => {
      expect(read({ generalName: '{"m":"Rodzic"}' }).nameForms).toEqual({
        masculine: "Rodzic",
      });
      expect(read({ generalName: '{"m":" ","f":"Rodzic"}' }).nameForms).toEqual(
        { feminine: "Rodzic" },
      );
    });

    it("ignores name when a form is present", () => {
      const orientation = read({
        generalName: '{"name":"Osoba rodzicielska","f":"Matka"}',
      });

      expect(orientation.nameForms).toEqual({ feminine: "Matka" });
      expect(orientation.name).toBeUndefined();
    });
  });

  describe("given a packed name without forms", () => {
    it("reads name, slogan, websiteUrl, isOfficial and isHidden", () => {
      expect(
        read({
          generalName:
            '{\n  "name": "Krzysztof Stanowski",\n  "slogan": "#Zerokonkretów",\n  "websiteUrl": "https://stanowski2025.de/",\n  "isOfficial": true,\n  "isHidden": true\n}',
        }),
      ).toEqual({
        id: "a",
        type: "other",
        name: "Krzysztof Stanowski",
        slogan: "#Zerokonkretów",
        websiteUrl: "https://stanowski2025.de/",
        isOfficial: true,
        isHidden: true,
      });
    });

    it("has no name when neither a form nor name is present, and still reads the rest", () => {
      expect(
        read({
          generalName:
            '{"slogan":"Po twojej stronie","websiteUrl":"https://example.com/program","isOfficial":true,"isHidden":true}',
        }),
      ).toEqual({
        id: "a",
        type: "other",
        slogan: "Po twojej stronie",
        websiteUrl: "https://example.com/program",
        isOfficial: true,
        isHidden: true,
      });
    });

    it("treats an empty slogan as absent", () => {
      expect(
        read({ generalName: '{"name":"Maciej Maciak","slogan":""}' }).slogan,
      ).toBeUndefined();
      expect(
        read({ generalName: '{"name":"Maciej Maciak","slogan":" \\n "}' })
          .slogan,
      ).toBeUndefined();
    });

    it("reads no name and no marks from text that opens like packed text and does not parse", () => {
      expect(read({ generalName: '{"name":"Maciej Maciak"' })).toEqual({
        id: "a",
        type: "other",
        isOfficial: false,
        isHidden: false,
      });
    });
  });

  describe("given a packed image", () => {
    it("reads m and f as the two image forms", () => {
      const orientation = read({
        logoUrl:
          '{\n  "m": "https://example.com/zielony-m.png",\n  "f": "https://example.com/zielony-f.png"\n}',
      });

      expect(orientation.imageUrlForms).toEqual({
        masculine: "https://example.com/zielony-m.png",
        feminine: "https://example.com/zielony-f.png",
      });
      expect(orientation.imageUrl).toBeUndefined();
    });

    it("trims a form that ends with a line break", () => {
      expect(
        read({
          logoUrl:
            '{"m":"https://example.com/zielony-m.png\\n","f":" https://example.com/zielony-f.png\n"}',
        }).imageUrlForms,
      ).toEqual({
        masculine: "https://example.com/zielony-m.png",
        feminine: "https://example.com/zielony-f.png",
      });
    });

    it("keeps a single form as the only form", () => {
      expect(
        read({ logoUrl: '{"f":"https://example.com/zielony-f.png"}' })
          .imageUrlForms,
      ).toEqual({ feminine: "https://example.com/zielony-f.png" });
    });

    it("has no image when the packed text holds no form", () => {
      const orientation = read({
        logoUrl: '{"url":"https://example.com/zielony.png"}',
      });

      expect(orientation.imageUrl).toBeUndefined();
      expect(orientation.imageUrlForms).toBeUndefined();
    });
  });

  describe("given a packed description", () => {
    it("reads short and long", () => {
      const orientation = read({
        description:
          '{\n  "short": "Krótki opis.\\n",\n  "long": "Pierwszy akapit.\\n\\nDrugi akapit."\n}',
      });

      expect(orientation.description).toBe("Krótki opis.");
      expect(orientation.fullDescription).toBe(
        "Pierwszy akapit.\n\nDrugi akapit.",
      );
    });

    it("reads shortDescription and longDescription", () => {
      const orientation = read({
        description:
          '{"shortDescription":"Krótki opis.","longDescription":"Długi opis."}',
      });

      expect(orientation.description).toBe("Krótki opis.");
      expect(orientation.fullDescription).toBe("Długi opis.");
    });

    it("prefers the shorter key when both spellings are present", () => {
      const orientation = read({
        description:
          '{"shortDescription":"B","short":"A","longDescription":"D","long":"C"}',
      });

      expect(orientation.description).toBe("A");
      expect(orientation.fullDescription).toBe("C");
    });

    it("has a full description and no description when only long is present", () => {
      const orientation = read({ description: '{"long":"Długi opis."}' });

      expect(orientation.description).toBeUndefined();
      expect(orientation.fullDescription).toBe("Długi opis.");
    });

    it("reads values with raw line breaks and keeps them", () => {
      const orientation = read({
        description:
          '{ "short": "Krótki opis.", "long": "Pierwszy akapit.\n\nDrugi akapit." }',
      });

      expect(orientation.description).toBe("Krótki opis.");
      expect(orientation.fullDescription).toBe(
        "Pierwszy akapit.\n\nDrugi akapit.",
      );
    });

    it("has no description when the text opens like packed text and does not parse", () => {
      const orientation = read({ description: '{"short":"Krótki opis."' });

      expect(orientation.description).toBeUndefined();
      expect(orientation.fullDescription).toBeUndefined();
    });
  });

  describe("given packed text on any type", () => {
    it.each([
      "IDENTITY",
      "PARTY",
      "IDEOLOGY",
    ])("reads a packed name on an identity, a party and an ideology alike: %s", (type) => {
      expect(
        read({
          type,
          generalName:
            '{"m":"Liberał","f":"Liberałka","slogan":"Wolność!","websiteUrl":"https://example.com","isOfficial":true,"isHidden":true}',
        }),
      ).toEqual({
        id: "a",
        type: type.toLowerCase(),
        nameForms: { masculine: "Liberał", feminine: "Liberałka" },
        slogan: "Wolność!",
        websiteUrl: "https://example.com",
        isOfficial: true,
        isHidden: true,
      });
    });

    it("ignores keys it does not know", () => {
      expect(
        read({
          generalName:
            '{"name":"Zieloni","nickname":"Zieloni 2050","short":"Opis","color":"#000000"}',
          logoUrl:
            '{"m":"https://example.com/m.png","url":"https://example.com/x.png"}',
          description: '{"short":"Krótki opis.","medium":"Średni opis."}',
        }),
      ).toEqual({
        id: "a",
        type: "other",
        name: "Zieloni",
        imageUrlForms: { masculine: "https://example.com/m.png" },
        description: "Krótki opis.",
        isOfficial: false,
        isHidden: false,
      });
    });

    it("does not read a key of one field from another field", () => {
      expect(
        read({
          generalName: '{"long":"Długi opis."}',
          logoUrl: '{"name":"Zieloni","slogan":"Razem!"}',
          description: '{"m":"Rodzic","isHidden":true}',
        }),
      ).toEqual({ id: "a", type: "other", isOfficial: false, isHidden: false });
    });

    it("treats a value of the wrong sort as absent, and as false for a mark", () => {
      expect(
        read({
          generalName:
            '{"name":2050,"m":true,"f":null,"slogan":["Razem!"],"websiteUrl":{"url":"https://example.com"},"isOfficial":"true","isHidden":1}',
          logoUrl: '{"m":1,"f":false}',
          description: '{"short":2050,"long":{"text":"Długi opis."}}',
        }),
      ).toEqual({ id: "a", type: "other", isOfficial: false, isHidden: false });
    });
  });

  describe("official", () => {
    it("keeps the mark in an official quiz", () => {
      expect(
        read({ generalName: '{"name":"A","isOfficial":true}' }, official)
          .isOfficial,
      ).toBe(true);
      expect(
        read({ generalName: '{"name":"A","isOfficial":false}' }, official)
          .isOfficial,
      ).toBe(false);
    });

    it("drops the mark in a community quiz", () => {
      expect(
        read({ generalName: '{"name":"A","isOfficial":true}' }, community)
          .isOfficial,
      ).toBe(false);
    });

    it("keeps the hidden mark in both", () => {
      const generalName = '{"name":"A","isHidden":true}';

      expect(read({ generalName }, official).isHidden).toBe(true);
      expect(read({ generalName }, community).isHidden).toBe(true);
    });
  });

  describe("image and website", () => {
    it.each([
      "javascript:alert(1)",
      "data:image/png;base64,AAAA",
      "/icons/zieloni.png",
      "zieloni.png",
    ])("drops an address that is not http or https: %s", (address) => {
      const orientation = read({
        logoUrl: address,
        generalName: JSON.stringify({ name: "A", websiteUrl: address }),
      });

      expect(orientation.imageUrl).toBeUndefined();
      expect(orientation.websiteUrl).toBeUndefined();
      expect(
        read({ logoUrl: JSON.stringify({ m: address, f: address }) })
          .imageUrlForms,
      ).toBeUndefined();
    });

    it("keeps the form that is an address when the other is not", () => {
      expect(
        read({
          logoUrl:
            '{"m":"javascript:alert(1)","f":"https://example.com/f.png"}',
        }).imageUrlForms,
      ).toEqual({ feminine: "https://example.com/f.png" });
    });

    it('treats null and "" as absent', () => {
      expect(read({ logoUrl: null }).imageUrl).toBeUndefined();
      expect(read({ logoUrl: "" }).imageUrl).toBeUndefined();
      expect(
        read({ generalName: '{"name":"A","websiteUrl":null}' }).websiteUrl,
      ).toBeUndefined();
      expect(
        read({ generalName: '{"name":"A","websiteUrl":""}' }).websiteUrl,
      ).toBeUndefined();
    });
  });

  describe("colour", () => {
    it("keeps a valid colour", () => {
      expect(read({ color: "#B5123F" }).color).toBe("#B5123F");
    });

    it.each([
      undefined,
      null,
      "",
      "red",
      "#12345",
      "var(--gi-primary)",
    ])("drops a missing or invalid colour: %j", (color) => {
      expect(read({ color }).color).toBeUndefined();
    });

    it.each([
      "#FFF",
      "#fff",
      "#FFFFFF",
      "#ffffff",
      "#FfFfFf",
    ])("drops white in any spelling: %s", (color) => {
      expect(read({ color }).color).toBeUndefined();
    });
  });
});

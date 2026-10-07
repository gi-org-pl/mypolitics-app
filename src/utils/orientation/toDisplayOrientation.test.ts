import { describe, expect, it } from "vitest";

import type { DeclaredGender, QuizOrientation } from "@/types/orientation";

import { toDisplayOrientation } from "./toDisplayOrientation";

const GENDERS: (DeclaredGender | undefined)[] = [
  "female",
  "male",
  "other",
  "prefer_not_to_share",
  undefined,
];

const identity: QuizOrientation = {
  id: "99681a0e",
  type: "identity",
  nameForms: {
    masculine: "Zielony postępowiec",
    feminine: "Zielona postępowczyni",
  },
  imageUrlForms: {
    masculine: "https://example.com/zielony-m.png",
    feminine: "https://example.com/zielony-f.png",
  },
};

describe("toDisplayOrientation()", () => {
  describe("given no forms", () => {
    it.each(
      GENDERS,
    )("returns the name and the image as they are for %s", (gender) => {
      const orientation = toDisplayOrientation(
        {
          id: "cd7c4031",
          type: "party",
          name: "Zieloni",
          imageUrl: "https://example.com/zieloni.png",
        },
        gender,
      );

      expect(orientation.name).toBe("Zieloni");
      expect(orientation.imageUrl).toBe("https://example.com/zieloni.png");
    });

    it("leaves a missing name and image missing", () => {
      const orientation = toDisplayOrientation(
        { id: "cd7c4031", type: "party", nameForms: {}, imageUrlForms: {} },
        "female",
      );

      expect(orientation.name).toBeUndefined();
      expect(orientation.imageUrl).toBeUndefined();
    });
  });

  describe("given one form", () => {
    it.each(GENDERS)("uses it for every gender: %s", (gender) => {
      const masculineOnly = toDisplayOrientation(
        {
          id: "a",
          type: "identity",
          nameForms: { masculine: "Rodzic" },
          imageUrlForms: { masculine: "https://example.com/rodzic.png" },
        },
        gender,
      );
      const feminineOnly = toDisplayOrientation(
        {
          id: "a",
          type: "identity",
          nameForms: { feminine: "Osoba" },
          imageUrlForms: { feminine: "https://example.com/osoba.png" },
        },
        gender,
      );

      expect(masculineOnly.name).toBe("Rodzic");
      expect(masculineOnly.imageUrl).toBe("https://example.com/rodzic.png");
      expect(feminineOnly.name).toBe("Osoba");
      expect(feminineOnly.imageUrl).toBe("https://example.com/osoba.png");
    });
  });

  describe("given two forms", () => {
    it("uses the feminine form for female", () => {
      const orientation = toDisplayOrientation(identity, "female");

      expect(orientation.name).toBe("Zielona postępowczyni");
      expect(orientation.imageUrl).toBe("https://example.com/zielony-f.png");
    });

    it("uses the masculine form for male", () => {
      const orientation = toDisplayOrientation(identity, "male");

      expect(orientation.name).toBe("Zielony postępowiec");
      expect(orientation.imageUrl).toBe("https://example.com/zielony-m.png");
    });

    it("uses the masculine form for other, prefer_not_to_share and undefined", () => {
      expect(toDisplayOrientation(identity, "other").name).toBe(
        "Zielony postępowiec",
      );
      expect(toDisplayOrientation(identity, "prefer_not_to_share").name).toBe(
        "Zielony postępowiec",
      );
      expect(toDisplayOrientation(identity).name).toBe("Zielony postępowiec");
      expect(toDisplayOrientation(identity).imageUrl).toBe(
        "https://example.com/zielony-m.png",
      );
    });

    it("chooses the name and the image independently", () => {
      const twoNames = toDisplayOrientation(
        {
          ...identity,
          imageUrlForms: undefined,
          imageUrl: "https://example.com/zielony.png",
        },
        "female",
      );
      const twoImages = toDisplayOrientation(
        { ...identity, nameForms: { masculine: "Zielony postępowiec" } },
        "female",
      );

      expect(twoNames.name).toBe("Zielona postępowczyni");
      expect(twoNames.imageUrl).toBe("https://example.com/zielony.png");
      expect(twoImages.name).toBe("Zielony postępowiec");
      expect(twoImages.imageUrl).toBe("https://example.com/zielony-f.png");
    });

    it("uses the forms and not the name beside them", () => {
      expect(
        toDisplayOrientation({ ...identity, name: "Zielona osoba" }, "female")
          .name,
      ).toBe("Zielona postępowczyni");
    });
  });

  it("carries every other property unchanged and leaves no forms on the result", () => {
    const rest = {
      id: "99681a0e",
      type: "identity",
      color: "#249668",
      description: "Krótki opis.",
      fullDescription: "Pierwszy akapit.\n\nDrugi akapit.",
      slogan: "Razem w stronę zielonego świata!",
      websiteUrl: "https://example.com/program",
      isOfficial: true,
      isHidden: true,
      explanation: "Jak czytać ten wynik.",
      linkedOrientationIds: ["cd7c4031", "c00d6c51"],
    } as const;
    const quizOrientation: QuizOrientation = {
      ...rest,
      linkedOrientationIds: [...rest.linkedOrientationIds],
      nameForms: identity.nameForms,
      imageUrlForms: identity.imageUrlForms,
    };

    const orientation = toDisplayOrientation(quizOrientation, "female");

    expect(orientation).toStrictEqual({
      ...rest,
      name: "Zielona postępowczyni",
      imageUrl: "https://example.com/zielony-f.png",
    });
    expect(orientation).not.toHaveProperty("nameForms");
    expect(orientation).not.toHaveProperty("imageUrlForms");
    expect(quizOrientation.nameForms).toEqual(identity.nameForms);
  });
});

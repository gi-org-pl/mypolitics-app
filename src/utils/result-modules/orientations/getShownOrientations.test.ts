import { describe, expect, it } from "vitest";

import type { DeclaredGender } from "@/types/orientation";
import { moduleQuiz } from "@/utils/result-modules/resolveResult.fixtures";

import { getShownOrientations } from "./getShownOrientations";

const getNames = (
  orientationIds: string[],
  gender?: DeclaredGender,
): (string | undefined)[] =>
  getShownOrientations(orientationIds, { survey: moduleQuiz, gender }).map(
    ({ name }) => name,
  );

describe("getShownOrientations()", () => {
  describe("given identifiers of orientations of the quiz", () => {
    it("returns the orientations in the order listed", () => {
      expect(getNames(["right", "green", "left"])).toEqual([
        "Wolny rynek",
        "Ekologia",
        "Interwencjonizm",
      ]);
    });

    it("returns each with everything it carries", () => {
      expect(
        getShownOrientations(["party-left"], { survey: moduleQuiz }),
      ).toEqual([
        {
          id: "party-left",
          type: "party",
          name: "Lewica",
          imageUrl: undefined,
          isOfficial: true,
        },
      ]);
    });
  });

  describe("given an orientation whose name has two forms", () => {
    it("returns the form of the declared gender", () => {
      expect(getNames(["socialist"], "female")).toEqual(["Socjalistka"]);
      expect(getNames(["socialist"], "male")).toEqual(["Socjalista"]);
    });

    it("returns the masculine form when no gender is declared", () => {
      expect(getNames(["socialist"])).toEqual(["Socjalista"]);
    });

    it("returns one name and no forms", () => {
      const [socialist] = getShownOrientations(["socialist"], {
        survey: moduleQuiz,
        gender: "female",
      });

      expect(socialist).not.toHaveProperty("nameForms");
      expect(socialist).not.toHaveProperty("imageUrlForms");
    });
  });

  describe("given an identifier of a hidden orientation", () => {
    it("leaves it out", () => {
      expect(getNames(["anarchist", "liberal", "secret"])).toEqual(["Liberał"]);
    });
  });

  describe("given an identifier of an orientation the quiz does not have", () => {
    it("leaves it out", () => {
      expect(getNames(["ghost", "liberal"])).toEqual(["Liberał"]);
    });
  });

  describe("given no identifiers", () => {
    it("returns an empty list", () => {
      expect(getNames([])).toEqual([]);
    });
  });
});

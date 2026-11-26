import { describe, expect, it } from "vitest";

import type { ResultModule } from "@/types/results";
import {
  moduleQuiz,
  moduleQuizContext,
  moduleQuizResult,
} from "@/utils/result-modules/resolveResult.fixtures";
import { createResultModule } from "@/utils/vitest/results/createResultModule";

import { resolveHeader } from "./resolveHeader";

const resolveWith = (
  resultModules: ResultModule[],
  result = moduleQuizResult,
) => resolveHeader({ survey: { ...moduleQuiz, resultModules }, result });

const toHeader = (overrides: Partial<ResultModule>): ResultModule =>
  createResultModule("header", "header", overrides);

describe("resolveHeader()", () => {
  describe("given a header record that lists orientations with values", () => {
    it("returns the one with the highest value, that value and the label of the link", () => {
      expect(resolveHeader(moduleQuizContext)).toEqual({
        orientation: expect.objectContaining({
          id: "socialist",
          name: "Socjalista",
          slogan: "Razem",
        }),
        confidence: 100,
        linkLabel: "Zobacz stronę",
      });
    });

    it("returns the orientation in the form of the declared gender", () => {
      expect(
        resolveHeader({ ...moduleQuizContext, gender: "female" })?.orientation
          ?.name,
      ).toBe("Socjalistka");
    });

    it("never returns a hidden orientation, whatever its value", () => {
      const result = {
        ...moduleQuizResult,
        scores: {
          ...moduleQuizResult.scores,
          socialist: { points: 1, maximum: 4 },
        },
      };

      // The hidden anarchist stands at 100, the socialist at 25, the liberal at 20.
      expect(
        resolveWith(
          [toHeader({ orientationIds: ["anarchist", "liberal", "socialist"] })],
          result,
        ),
      ).toMatchObject({ orientation: { id: "socialist" }, confidence: 25 });
    });
  });

  describe("given two orientations that share the highest value", () => {
    it("returns the one the record lists first", () => {
      expect(
        resolveWith([toHeader({ orientationIds: ["green", "socialist"] })])
          ?.orientation?.id,
      ).toBe("green");
      expect(
        resolveWith([toHeader({ orientationIds: ["socialist", "green"] })])
          ?.orientation?.id,
      ).toBe("socialist");
    });
  });

  describe("given a header record none of whose orientations has a value", () => {
    it("returns a header with no orientation and no confidence", () => {
      const header = resolveWith([
        toHeader({
          orientationIds: ["party-left", "party-right"],
          values: { "label.link": "Zobacz stronę" },
        }),
      ]);

      expect(header).toEqual({ linkLabel: "Zobacz stronę" });
      expect(header?.orientation).toBeUndefined();
      expect(header?.confidence).toBeUndefined();
    });

    it("returns the same for a record that lists no orientation", () => {
      expect(resolveWith([toHeader({})])).toEqual({});
    });
  });

  describe("given a header record with no label for the link", () => {
    it("returns no link label", () => {
      expect(
        resolveWith([toHeader({ orientationIds: ["socialist"] })])?.linkLabel,
      ).toBeUndefined();
    });
  });

  describe("given a quiz with no header record", () => {
    it("returns nothing", () => {
      expect(resolveWith([])).toBeUndefined();
      expect(
        resolveWith([
          createResultModule("identity", "archetype", {
            orientationIds: ["socialist"],
          }),
        ]),
      ).toBeUndefined();
    });
  });
});

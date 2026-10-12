import { describe, expect, it } from "vitest";

import { seededShuffle } from "@/utils/checkpoint/random/seededShuffle";

import {
  RESULTS_CALCULATION_DRAW,
  RESULTS_CALCULATION_POOL,
} from "../SurveyQuestionnaireResultsCalculation.constants";
import { getLoaderLines } from "./getLoaderLines";

const SEED = "0b9f3c1e-5a7d-4e2b-9c41-7f6a2d8e1b35";
const OTHER_SEED = "7d1c9a52-3e4f-4b6a-8c0d-2f5e1a9b7c34";
const POOL = RESULTS_CALCULATION_POOL.map(({ message }) => message ?? "");

describe("getLoaderLines()", () => {
  describe("given the pool and the seed of a session", () => {
    it("returns every line of the pool exactly once", () => {
      const lines = getLoaderLines(POOL, SEED);

      expect(lines).toHaveLength(17);
      expect([...lines].sort()).toEqual([...POOL].sort());
    });

    it("returns the same order for the same seed", () => {
      expect(getLoaderLines(POOL, SEED)).toEqual(getLoaderLines(POOL, SEED));
    });

    it("returns another order for another seed", () => {
      expect(getLoaderLines(POOL, OTHER_SEED)).not.toEqual(
        getLoaderLines(POOL, SEED),
      );
    });

    it("shuffles the pool: the order is not the order it was written in", () => {
      expect(getLoaderLines(POOL, SEED)).not.toEqual(POOL);
    });

    it("draws with the purpose of the loader", () => {
      expect(getLoaderLines(POOL, SEED)).toEqual(
        seededShuffle(POOL, SEED, RESULTS_CALCULATION_DRAW),
      );
    });

    it("does not change the pool it was given", () => {
      const pool = [...POOL];

      getLoaderLines(pool, SEED);

      expect(pool).toEqual(POOL);
    });
  });

  describe("given a line that is empty or only space", () => {
    it("leaves out a line that is empty or only space", () => {
      const lines = getLoaderLines(["a", "", "b", "   ", "c", "\t\n"], SEED);

      expect([...lines].sort()).toEqual(["a", "b", "c"]);
    });

    it("keeps the order of the other lines when one is left out", () => {
      const withLine = getLoaderLines(["a", "b", "c", "d", "e"], SEED);
      const withoutLine = getLoaderLines(["a", "b", " ", "d", "e"], SEED);

      expect(withoutLine).toEqual(withLine.filter((line) => line !== "c"));
    });
  });

  describe("given an empty pool", () => {
    it("returns no lines for an empty pool", () => {
      expect(getLoaderLines([], SEED)).toEqual([]);
    });
  });
});

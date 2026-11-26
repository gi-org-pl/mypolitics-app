import { describe, expect, it } from "vitest";

import { RESULT_MODULE_TYPES } from "@/constants/results";
import type { ResolutionContext, ResultModule } from "@/types/results";
import { getLeader } from "@/utils/result-modules/leader/getLeader";
import { resolveHeader } from "@/utils/result-modules/leader/resolveHeader";
import {
  moduleQuiz,
  moduleQuizContext,
} from "@/utils/result-modules/resolveResult.fixtures";
import { createResultModule } from "@/utils/vitest/results/createResultModule";

import { resolveModule } from "./resolveModule";

const context: ResolutionContext = {
  ...moduleQuizContext,
  leader: getLeader(resolveHeader(moduleQuizContext)),
};

const findRecord = (id: string): ResultModule => {
  const record = moduleQuiz.resultModules.find((module) => module.id === id);

  if (!record) throw new Error(`The quiz has no record "${id}"`);

  return record;
};

describe("resolveModule()", () => {
  describe("given a record that can be drawn", () => {
    it("returns where the record asks to stand, with the author's title and description", () => {
      expect(resolveModule(findRecord("economy"), context)).toMatchObject({
        id: "economy",
        position: 3,
        column: "end",
        description: "Jak blisko ci do każdej ze stron osi.",
      });
      expect(resolveModule(findRecord("ideologies"), context)).toMatchObject({
        id: "ideologies",
        position: 4,
        column: "start",
        title: "Ideologie",
      });
    });

    it("leaves out the fields of the record its module is not given", () => {
      const resolved = resolveModule(findRecord("ecology"), context);

      expect(Object.keys(resolved ?? {}).sort()).toEqual([
        "column",
        "description",
        "entry",
        "id",
        "marker",
        "position",
        "title",
        "type",
      ]);
    });

    it.each([
      ["ecology", "single_axis", ["entry", "marker"]],
      ["economy", "double_axis", ["axis", "marker"]],
      ["ideologies", "multi_axis", ["groups", "marker"]],
      ["parties", "horizontal_bar", ["entries", "visibleRows"]],
      [
        "compass",
        "nolan_chart",
        ["horizontal", "vertical", "labels", "colors"],
      ],
      ["identity", "archetype", ["entries"]],
      ["traits", "traits", ["traits", "earnedIds"]],
    ])('resolves the record "%s" as a %s', (id, type, keys) => {
      const resolved = resolveModule(findRecord(id), context);

      expect(resolved?.type).toBe(type);

      for (const key of keys) expect(resolved).toHaveProperty(key);
    });

    it("has a resolver for every type but the header", () => {
      const resolvedTypes = moduleQuiz.resultModules.flatMap(
        (record) => resolveModule(record, context)?.type ?? [],
      );

      expect(resolvedTypes.sort()).toEqual(
        RESULT_MODULE_TYPES.filter((type) => type !== "header").sort(),
      );
    });

    it("hands the leader to the resolver", () => {
      expect(resolveModule(findRecord("parties"), context)).toMatchObject({
        entries: [
          { orientation: { id: "party-green" } },
          { orientation: { id: "party-left" } },
        ],
      });
      expect(
        resolveModule(findRecord("parties"), moduleQuizContext),
      ).toBeUndefined();
    });
  });

  describe("given a record that cannot be drawn", () => {
    it("returns nothing", () => {
      expect(
        resolveModule(createResultModule("empty", "archetype"), context),
      ).toBeUndefined();
      expect(
        resolveModule(createResultModule("empty", "double_axis"), context),
      ).toBeUndefined();
    });
  });

  describe("given a header record", () => {
    it("returns nothing: the header is never one of the modules", () => {
      expect(resolveModule(findRecord("header"), context)).toBeUndefined();
    });
  });
});

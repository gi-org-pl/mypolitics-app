import { describe, expect, it } from "vitest";

import { SurveyResultState } from "@/types/survey";

import { storedSessionSchema } from "./storedSessionSchema";

const STATE = {
  id: "0b9f5a1e-6c1d-4f3a-9a52-3f0f2f6f8d11",
  surveyId: "survey",
  entries: [{ questionId: "q1", answerId: "q1-agree" }, { questionId: "q2" }],
  prioritizedCategoryIds: ["economy"],
  areCategoriesConfirmed: true,
  phase: "questions",
  areCheckpointsOff: false,
  demographics: { age: "30" },
  areDemographicsGiven: false,
  checkpointRecord: {
    cardsShown: [{ type: "halfway" }],
    timeSamples: [{ questionId: "q1", seconds: 4.5 }],
  },
};

const parse = (state: unknown, version: unknown = 1) =>
  storedSessionSchema.safeParse({ state, version });

describe("storedSessionSchema", () => {
  describe("given a record as the store writes it", () => {
    it("reads it as it is", () => {
      const { success, data } = parse(STATE);

      expect(success).toBe(true);
      expect(data).toEqual({ state: STATE, version: 1 });
    });

    it("leaves out what the store does not write", () => {
      const { data } = parse({
        ...STATE,
        email: { address: "jan@example.com", hasConsent: true },
        resultState: SurveyResultState.Failed,
      });

      expect(data?.state).not.toHaveProperty("email");
      expect(data?.state).not.toHaveProperty("resultState");
    });
  });

  describe("given a record that cannot be read", () => {
    it.each([
      [undefined],
      [null],
      ["{}"],
      [7],
      [true],
      [[]],
      [{}],
      [{ version: 1 }],
      [{ state: STATE }],
      [{ state: null, version: 1 }],
      [{ state: [STATE], version: 1 }],
    ])("does not pass %j", (record) => {
      expect(storedSessionSchema.safeParse(record).success).toBe(false);
    });

    it("does not pass a record of another version", () => {
      expect(parse(STATE, 0).success).toBe(false);
      expect(parse(STATE, 2).success).toBe(false);
      expect(parse(STATE, "1").success).toBe(false);
    });

    it("does not pass a session without a random identifier", () => {
      expect(parse({ ...STATE, id: undefined }).success).toBe(false);
      expect(parse({ ...STATE, id: "" }).success).toBe(false);
      expect(parse({ ...STATE, id: "session-1" }).success).toBe(false);
      expect(parse({ ...STATE, id: 7 }).success).toBe(false);
    });

    it.each([
      ["surveyId", 7],
      ["surveyId", undefined],
      ["entries", undefined],
      ["entries", { 0: { questionId: "q1" } }],
      ["prioritizedCategoryIds", "economy"],
      ["prioritizedCategoryIds", null],
      ["areCategoriesConfirmed", "yes"],
      ["areCategoriesConfirmed", undefined],
      ["areCheckpointsOff", 0],
      ["demographics", null],
      ["demographics", "female"],
      ["demographics", ["30"]],
      ["areDemographicsGiven", null],
    ])("does not pass a session whose %s is %j", (key, value) => {
      expect(parse({ ...STATE, [key]: value }).success).toBe(false);
    });
  });

  describe("given entries that cannot be read", () => {
    it("leaves nothing in the place of each, so that the others keep theirs", () => {
      const { data } = parse({
        ...STATE,
        entries: [
          { questionId: "q1" },
          "q2",
          null,
          { answerId: "q4-agree" },
          { questionId: "q5", answerId: 7 },
          { questionId: "q6", answerId: null },
          { questionId: "q7", answerId: "q7-agree", seconds: 3 },
        ],
      });

      expect(data?.state.entries).toEqual([
        { questionId: "q1" },
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        { questionId: "q7", answerId: "q7-agree" },
      ]);
    });
  });

  describe("given a phase that is not one of the seven", () => {
    it("reads it as no phase", () => {
      expect(parse({ ...STATE, phase: "summary" }).data?.state.phase).toBe(
        undefined,
      );
      expect(parse({ ...STATE, phase: 3 }).data?.state.phase).toBe(undefined);
      expect(parse({ ...STATE, phase: undefined }).data?.state.phase).toBe(
        undefined,
      );
    });

    it("reads each of the seven as it is", () => {
      expect(
        parse({ ...STATE, phase: "short-results" }).data?.state.phase,
      ).toBe("short-results");
      expect(
        parse({ ...STATE, phase: "category-select" }).data?.state.phase,
      ).toBe("category-select");
    });
  });

  describe("given a checkpoint record that cannot be read", () => {
    it.each([
      [undefined],
      [null],
      ["cards"],
      [[]],
      [{}],
      [{ cardsShown: [] }],
      [{ timeSamples: [] }],
      [{ cardsShown: "card", timeSamples: [] }],
      [{ cardsShown: [], timeSamples: { q1: 3 } }],
    ])("reads %j as an empty record and keeps the session", (record) => {
      const { success, data } = parse({ ...STATE, checkpointRecord: record });

      expect(success).toBe(true);
      expect(data?.state.checkpointRecord).toEqual({
        cardsShown: [],
        timeSamples: [],
      });
      expect(data?.state.entries).toEqual(STATE.entries);
    });

    it("hands out an empty record of its own each time", () => {
      const first = parse({ ...STATE, checkpointRecord: null }).data;
      const second = parse({ ...STATE, checkpointRecord: null }).data;

      expect(first?.state.checkpointRecord).not.toBe(
        second?.state.checkpointRecord,
      );
    });
  });

  describe("given a checkpoint record that can be read", () => {
    it("keeps the cards as they were stored, whatever they are", () => {
      const cardsShown = [{ type: "halfway" }, "card", 7, null, [1, 2]];
      const { data } = parse({
        ...STATE,
        checkpointRecord: { cardsShown, timeSamples: [] },
      });

      expect(data?.state.checkpointRecord.cardsShown).toEqual(cardsShown);
    });

    it("leaves nothing in the place of a time sample that cannot be read", () => {
      const { data } = parse({
        ...STATE,
        checkpointRecord: {
          cardsShown: ["card"],
          timeSamples: [
            { questionId: "q1", seconds: 0 },
            { questionId: "q2", seconds: -1 },
            { questionId: "q3", seconds: "4" },
            { questionId: "q4" },
            { seconds: 4 },
            "q5",
            null,
            { questionId: "q6", seconds: 12.5 },
          ],
        },
      });

      expect(data?.state.checkpointRecord).toEqual({
        cardsShown: ["card"],
        timeSamples: [
          { questionId: "q1", seconds: 0 },
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          { questionId: "q6", seconds: 12.5 },
        ],
      });
    });
  });

  describe("given picked categories and demographics", () => {
    it("leaves their content to be checked against the quiz and the lists", () => {
      const { data } = parse({
        ...STATE,
        prioritizedCategoryIds: ["economy", 7, null],
        demographics: { age: 30, region: "mazowieckie" },
      });

      expect(data?.state.prioritizedCategoryIds).toEqual(["economy", 7, null]);
      expect(data?.state.demographics).toEqual({
        age: 30,
        region: "mazowieckie",
      });
    });
  });
});

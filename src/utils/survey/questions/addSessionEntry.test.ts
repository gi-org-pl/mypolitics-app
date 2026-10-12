import { describe, expect, it } from "vitest";

import { createStartedSession } from "@/utils/vitest/createStartedSession";
import { createSurvey } from "@/utils/vitest/createSurvey";

import { addSessionEntry } from "./addSessionEntry";

describe("addSessionEntry()", () => {
  const survey = createSurvey();

  describe("when a question becomes done", () => {
    it("adds the entry after the ones the session has", () => {
      const session = addSessionEntry(survey, createStartedSession(survey, 1), {
        questionId: "q2",
        answerId: "q2-coal",
      });

      expect(session.entries).toEqual([
        { questionId: "q1" },
        { questionId: "q2", answerId: "q2-coal" },
      ]);
    });

    it("leaves the session it was handed as it was", () => {
      const before = createStartedSession(survey, 1);

      addSessionEntry(survey, before, { questionId: "q2" }, 3);

      expect(before.entries).toEqual([{ questionId: "q1" }]);
      expect(before.checkpointRecord.timeSamples).toEqual([]);
    });

    it("changes nothing else of the session", () => {
      const before = createStartedSession(survey, 1);
      const after = addSessionEntry(survey, before, { questionId: "q2" });

      expect(after).toEqual({ ...before, entries: after.entries });
    });
  });

  describe("when it was not the last question", () => {
    it("stays in the phase it was in", () => {
      const session = addSessionEntry(survey, createStartedSession(survey, 3), {
        questionId: "q4",
      });

      expect(session.phase).toBe("questions");
    });
  });

  describe("when it was the last question", () => {
    it("moves to demographics", () => {
      const session = addSessionEntry(survey, createStartedSession(survey, 4), {
        questionId: "q5",
      });

      expect(session.phase).toBe("demographics");
      expect(session.entries).toHaveLength(5);
    });
  });

  describe("when seconds are passed", () => {
    it("stores them as the time sample of the question", () => {
      const first = addSessionEntry(
        survey,
        createStartedSession(survey),
        { questionId: "q1" },
        4.5,
      );
      const second = addSessionEntry(survey, first, { questionId: "q2" }, 0);

      expect(second.checkpointRecord.timeSamples).toEqual([
        { questionId: "q1", seconds: 4.5 },
        { questionId: "q2", seconds: 0 },
      ]);
    });

    it("keeps the cards that were shown", () => {
      const before = createStartedSession(survey, 1);
      const withCard = {
        ...before,
        checkpointRecord: { ...before.checkpointRecord, cardsShown: ["card"] },
      };

      expect(
        addSessionEntry(survey, withCard, { questionId: "q2" }, 2)
          .checkpointRecord.cardsShown,
      ).toEqual(["card"]);
    });

    it("replaces a sample the question already had", () => {
      const before = createStartedSession(survey, 1);
      const withStaleSample = {
        ...before,
        checkpointRecord: {
          ...before.checkpointRecord,
          timeSamples: [
            { questionId: "q1", seconds: 1 },
            { questionId: "q2", seconds: 9 },
          ],
        },
      };

      expect(
        addSessionEntry(survey, withStaleSample, { questionId: "q2" }, 2)
          .checkpointRecord.timeSamples,
      ).toEqual([
        { questionId: "q1", seconds: 1 },
        { questionId: "q2", seconds: 2 },
      ]);
      expect(
        addSessionEntry(survey, withStaleSample, { questionId: "q2" })
          .checkpointRecord.timeSamples,
      ).toEqual([{ questionId: "q1", seconds: 1 }]);
    });
  });

  describe("when no usable seconds are passed", () => {
    it.each([
      [undefined],
      [Number.NaN],
      [Number.POSITIVE_INFINITY],
      [Number.NEGATIVE_INFINITY],
      [-1],
      [-0.001],
      ["4" as unknown as number],
      [null as unknown as number],
      [{} as unknown as number],
    ])("stores no sample for %s", (seconds) => {
      const session = addSessionEntry(
        survey,
        createStartedSession(survey),
        { questionId: "q1" },
        seconds,
      );

      expect(session.entries).toHaveLength(1);
      expect(session.checkpointRecord.timeSamples).toEqual([]);
    });
  });
});

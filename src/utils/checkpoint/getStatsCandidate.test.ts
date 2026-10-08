import { describe, expect, it } from "vitest";

import type {
  CheckpointAggregates,
  CheckpointTriggerInput,
} from "@/types/checkpoint";
import type { SurveyAnswerEntry } from "@/types/survey";
import { createSurvey } from "@/utils/vitest/createSurvey";

import {
  createRecord,
  createState,
  createTriggerInput,
  halfwayCard,
  statsForCard,
} from "./getNextCheckpoint.fixtures";
import { getStatsCandidate } from "./getStatsCandidate";

// The small quiz of the tests: q1 and q3 are on the agreement scale, q2 is a
// choice among three answers.
const survey = createSurvey();

const toCounts = (
  stronglyAgree: number,
  agree: number,
  disagree: number,
  stronglyDisagree: number,
  resultsCounted = stronglyAgree + agree + disagree + stronglyDisagree,
): CheckpointAggregates => ({
  q1: {
    resultsCounted,
    chosen: {
      "q1-strongly-agree": stronglyAgree,
      "q1-agree": agree,
      "q1-disagree": disagree,
      "q1-strongly-disagree": stronglyDisagree,
    },
  },
});

const answered = (answerId?: string): SurveyAnswerEntry[] => [
  { questionId: "q1", answerId },
];

// The boundary after q1, in a quiz long enough for a card.
const toInput = (
  overrides: Partial<CheckpointTriggerInput> = {},
): CheckpointTriggerInput =>
  createTriggerInput({
    survey,
    entries: answered("q1-agree"),
    state: createState(6, 40),
    aggregates: toCounts(30, 50, 400, 500, 1000),
    ...overrides,
  });

describe("getStatsCandidate()", () => {
  describe("given no aggregates", () => {
    it("returns nothing", () => {
      expect(
        getStatsCandidate(toInput({ aggregates: undefined })),
      ).toBeUndefined();
    });

    it("returns nothing without an entry for the question just answered", () => {
      expect(getStatsCandidate(toInput({ aggregates: {} }))).toBeUndefined();
      expect(
        getStatsCandidate(
          toInput({ aggregates: { q3: toCounts(30, 50, 400, 500).q1 } }),
        ),
      ).toBeUndefined();
    });
  });

  describe("given a share of 10% or less and a sample of 100 or more", () => {
    it("returns a card for the question just answered", () => {
      expect(getStatsCandidate(toInput())).toEqual({
        type: "stats",
        boundary: 6,
        questionId: "q1",
        thesis: "Podatki powinny być niższe.",
        side: "for",
        counts: { for: 80, against: 900, noAnswer: 20 },
        percent: 8,
      });
    });

    it("takes the side from the answer just given", () => {
      const aggregates = toCounts(500, 400, 50, 30, 1000);

      expect(
        getStatsCandidate(
          toInput({ entries: answered("q1-disagree"), aggregates }),
        ),
      ).toMatchObject({
        side: "against",
        counts: { for: 900, against: 80, noAnswer: 20 },
        percent: 8,
      });
      expect(
        getStatsCandidate(
          toInput({ entries: answered("q1-strongly-disagree"), aggregates }),
        )?.side,
      ).toBe("against");
      expect(
        getStatsCandidate(toInput({ entries: answered("q1-strongly-agree") }))
          ?.side,
      ).toBe("for");
    });

    it("takes the question from the last entry", () => {
      const entries = [
        { questionId: "q1", answerId: "q1-agree" },
        { questionId: "q2", answerId: "q2-coal" },
        { questionId: "q3", answerId: "q3-agree" },
      ];
      const aggregates: CheckpointAggregates = {
        ...toCounts(30, 50, 400, 500),
        q3: {
          resultsCounted: 200,
          chosen: { "q3-agree": 3, "q3-strongly-disagree": 190 },
        },
      };

      expect(getStatsCandidate(toInput({ entries, aggregates }))).toMatchObject(
        {
          questionId: "q3",
          thesis: "Państwo powinno dopłacać do kredytów mieszkaniowych.",
          counts: { for: 3, against: 190, noAnswer: 7 },
          percent: 2,
        },
      );
    });

    it("rounds the percent up and never below 1", () => {
      // 81 of 1000 is 8.1%, 1 of 1000 is 0.1%.
      expect(
        getStatsCandidate(toInput({ aggregates: toCounts(31, 50, 400, 519) }))
          ?.percent,
      ).toBe(9);
      expect(
        getStatsCandidate(toInput({ aggregates: toCounts(1, 0, 400, 599) }))
          ?.percent,
      ).toBe(1);
    });

    it("measures the share against everyone the question was shown to", () => {
      // 100 of the 900 who answered is more than 10%, of the 1000 it was
      // shown to exactly 10%.
      expect(
        getStatsCandidate(
          toInput({ aggregates: toCounts(40, 60, 300, 500, 1000) }),
        ),
      ).toMatchObject({ percent: 10, counts: { noAnswer: 100 } });
    });
  });

  describe("given a share of exactly 10%", () => {
    it("returns a card", () => {
      expect(
        getStatsCandidate(toInput({ aggregates: toCounts(40, 60, 400, 500) }))
          ?.percent,
      ).toBe(10);
      expect(
        getStatsCandidate(toInput({ aggregates: toCounts(0, 21, 100, 89) }))
          ?.percent,
      ).toBe(10);
    });
  });

  describe("given a share above 10%", () => {
    it("returns nothing", () => {
      expect(
        getStatsCandidate(toInput({ aggregates: toCounts(41, 60, 400, 499) })),
      ).toBeUndefined();
      expect(
        getStatsCandidate(
          toInput({ aggregates: toCounts(250, 250, 250, 250) }),
        ),
      ).toBeUndefined();
    });
  });

  describe("given a sample under 100", () => {
    it("returns nothing", () => {
      expect(
        getStatsCandidate(toInput({ aggregates: toCounts(0, 1, 48, 50) })),
      ).toBeUndefined();
      expect(
        getStatsCandidate(
          toInput({ aggregates: toCounts(0, 1, 48, 50, 5000) }),
        ),
      ).toBeUndefined();
      expect(
        getStatsCandidate(toInput({ aggregates: toCounts(0, 1, 49, 50) })),
      ).toMatchObject({ percent: 1 });
    });
  });

  describe("given nobody chose the taker's side", () => {
    it("returns a card with a percent of 1", () => {
      expect(
        getStatsCandidate(toInput({ aggregates: toCounts(0, 0, 400, 600) })),
      ).toMatchObject({
        side: "for",
        counts: { for: 0, against: 1000, noAnswer: 0 },
        percent: 1,
      });
    });
  });

  describe("given the question was skipped", () => {
    it("returns nothing", () => {
      expect(
        getStatsCandidate(toInput({ entries: answered(undefined) })),
      ).toBeUndefined();
    });
  });

  describe("given a stats card was already shown", () => {
    it("returns nothing", () => {
      expect(
        getStatsCandidate(
          toInput({ record: createRecord([halfwayCard, statsForCard]) }),
        ),
      ).toBeUndefined();
      expect(
        getStatsCandidate(toInput({ record: createRecord([halfwayCard]) })),
      ).toBeDefined();
    });
  });

  describe("given a question that is not eligible or counts that cannot be used", () => {
    it("returns nothing for a question with a custom answer", () => {
      expect(
        getStatsCandidate(
          toInput({
            entries: [{ questionId: "q2", answerId: "q2-coal" }],
            aggregates: {
              q2: {
                resultsCounted: 1000,
                chosen: {
                  "q2-coal": 10,
                  "q2-nuclear": 500,
                  "q2-renewables": 490,
                },
              },
            },
          }),
        ),
      ).toBeUndefined();
    });

    it("returns nothing when the counts add up to more than the results counted", () => {
      expect(
        getStatsCandidate(
          toInput({ aggregates: toCounts(30, 50, 400, 500, 900) }),
        ),
      ).toBeUndefined();
    });

    it("returns nothing for an answer or a question the quiz does not have", () => {
      expect(
        getStatsCandidate(toInput({ entries: answered("q9-agree") })),
      ).toBeUndefined();
      expect(
        getStatsCandidate(
          toInput({ entries: [{ questionId: "q9", answerId: "q1-agree" }] }),
        ),
      ).toBeUndefined();
      expect(getStatsCandidate(toInput({ entries: [] }))).toBeUndefined();
    });
  });
});

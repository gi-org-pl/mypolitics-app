import { beforeAll, describe, expect, it } from "vitest";

import { CHECKPOINT_PRIORITY } from "@/constants/checkpoint";
import type {
  CheckpointAggregates,
  CheckpointCard,
  CheckpointEngineInput,
  CheckpointRecord,
  CheckpointType,
  NolanPathCheckpointCard,
  RunningState,
} from "@/types/checkpoint";
import type { SurveyAnswerEntry, SurveyTimeSample } from "@/types/survey";
import { getRunningState } from "@/utils/running-state/getRunningState";
import { identityQuiz } from "@/utils/running-state/identityQuiz.fixtures";
import { createOrientation } from "@/utils/vitest/createOrientation";
import { createSurvey } from "@/utils/vitest/survey/createSurvey";

import { drawCheckpointLine } from "./drawCheckpointLine";
import { getNextCheckpoint } from "./getNextCheckpoint";
import {
  createArchetypes,
  createCompass,
  createEngineInput,
  createRecord,
  createSingleAxis,
  createState,
  createTwoSidedAxis,
  doubleClosenessCard,
  halfwayCard,
  partialPathCard,
  SEED,
  statsForCard,
} from "./getNextCheckpoint.fixtures";
import { readCheckpointRecord } from "./readCheckpointRecord";

// A two-sided axis that qualifies for a card: a standing trigger.
const pair = createTwoSidedAxis("pair", 20, 70);

// The record as it comes back from the storage of the tab after a card was
// put on screen: plain JSON, read again.
const afterShowing = (
  record: CheckpointRecord,
  card: CheckpointCard,
): CheckpointRecord =>
  readCheckpointRecord(
    JSON.parse(
      JSON.stringify({
        ...record,
        cardsShown: [...record.cardsShown, { card }],
      }),
    ),
  );

// The running states of the identity quiz, by the answers and the pace they
// come from. A replay asks for the same states again and again, and working
// one out is what a boundary costs.
const states = new Map<string, RunningState | null>();

const getState = (
  entries: SurveyAnswerEntry[],
  timeSamples: SurveyTimeSample[],
): RunningState | null => {
  const key = [
    timeSamples[0]?.seconds,
    ...entries.map(({ answerId }) => answerId),
  ].join();

  if (!states.has(key)) {
    states.set(
      key,
      getRunningState(identityQuiz, {
        entries,
        prioritizedCategoryIds: [],
        checkpointRecord: { cardsShown: [], timeSamples },
      }),
    );
  }

  return states.get(key) ?? null;
};

// A replay works through a hundred boundaries, and several agents may share
// the machine: it gets more time than a test has by default.
const REPLAY_TIMEOUT_MS = 30_000;

interface Replay {
  entries: SurveyAnswerEntry[]; // the answers of the whole run, in order
  from?: number; // the first boundary asked at
  record?: CheckpointRecord; // the cards shown before
  seed?: string;
  timeSamples?: SurveyTimeSample[];
  enabledTypes?: readonly CheckpointType[];
}

// A whole run of the identity quiz: the engine is asked at every boundary,
// with the running state of the answers so far, and every card it returns is
// put on screen.
const replay = ({
  entries,
  from = 1,
  record = createRecord(),
  seed = SEED,
  timeSamples = [],
  enabledTypes = CHECKPOINT_PRIORITY,
}: Replay): CheckpointRecord => {
  let currentRecord = { ...record, timeSamples };

  for (let done = from; done <= entries.length; done += 1) {
    const doneEntries = entries.slice(0, done);
    const card = getNextCheckpoint({
      survey: identityQuiz,
      entries: doneEntries,
      state: getState(doneEntries, timeSamples),
      record: currentRecord,
      seed,
      isOptedOut: false,
      enabledTypes,
    });

    if (card) {
      currentRecord = afterShowing(currentRecord, card);

      // The card came back from storage as it was handed over.
      expect(currentRecord.cardsShown.at(-1)?.card).toEqual(card);
    }
  }

  return currentRecord;
};

// The answers of a taker of the identity quiz who picks the answer at the
// place `pick` gives for every question.
const answerIdentityQuiz = (
  pick: (index: number, count: number) => number,
): SurveyAnswerEntry[] =>
  identityQuiz.questions.map(({ id, possibleAnswers }, index) => ({
    questionId: id,
    answerId: possibleAnswers[pick(index, possibleAnswers.length)].id,
  }));

const firstAnswers = answerIdentityQuiz(() => 0);
const lastAnswers = answerIdentityQuiz((_index, count) => count - 1);
const mixedAnswers = answerIdentityQuiz((index, count) => index % count);

const toSummary = ({ cardsShown }: CheckpointRecord): [number, string][] =>
  cardsShown.map(({ card }) => [
    card.boundary,
    "variant" in card ? `${card.type}/${card.variant}` : card.type,
  ]);

// What a card is about: nothing with the same subject is ever shown twice.
const toSubject = (card: CheckpointCard): string => {
  if (card.type === "axis-closeness" || card.type === "axis-puzzle") {
    return `axis:${card.axisId}`;
  }

  if (card.type === "nolan-path") return `nolan-path:${card.variant}`;

  return card.type === "new-trait" ? `trait:${card.trait.id}` : card.type;
};

describe("getNextCheckpoint()", () => {
  describe("given the taker turned checkpoints off", () => {
    it("returns nothing, whatever the state", () => {
      const state = createState(20, 40, {
        axes: [pair],
        unlockedTraits: [createOrientation("trait", "Cecha")],
        compass: createCompass(["topLeft", "topRight"]),
      });

      expect(getNextCheckpoint(createEngineInput({ state }))).not.toBeNull();

      for (let done = 0; done <= 40; done += 1) {
        expect(
          getNextCheckpoint(
            createEngineInput({
              state: { ...state, progress: createState(done, 40).progress },
              isOptedOut: true,
            }),
          ),
        ).toBeNull();
      }
    });
  });

  describe("given no state", () => {
    it("returns nothing", () => {
      expect(getNextCheckpoint(createEngineInput({ state: null }))).toBeNull();
    });
  });

  describe("given a closed slot", () => {
    it("returns nothing even when a trigger is true", () => {
      const closed = [
        createEngineInput({ state: createState(4, 40, { axes: [pair] }) }),
        createEngineInput({ state: createState(37, 40, { axes: [pair] }) }),
        createEngineInput({ state: createState(5, 8, { axes: [pair] }) }),
        createEngineInput({
          state: createState(25, 60, { axes: [pair] }),
          record: createRecord([halfwayCard]),
        }),
      ];

      for (const input of closed) {
        expect(getNextCheckpoint(input)).toBeNull();
      }

      expect(
        getNextCheckpoint(
          createEngineInput({ state: createState(5, 40, { axes: [pair] }) }),
        ),
      ).not.toBeNull();
    });
  });

  describe("given a type that is not enabled", () => {
    const state = createState(12, 60, { axes: [pair] });

    it("never returns it", () => {
      expect(
        getNextCheckpoint(createEngineInput({ state, enabledTypes: [] })),
      ).toBeNull();
      expect(
        getNextCheckpoint(
          createEngineInput({
            state,
            enabledTypes: ["halfway", "stats", "nolan-path"],
          }),
        ),
      ).toBeNull();
      expect(
        getNextCheckpoint(
          createEngineInput({
            state,
            enabledTypes: ["confetti" as CheckpointType],
          }),
        ),
      ).toBeNull();
    });

    it("returns nothing at any boundary when no type is enabled", () => {
      for (let done = 0; done <= 60; done += 1) {
        expect(
          getNextCheckpoint(
            createEngineInput({
              state: createState(done, 60, { axes: [pair] }),
              enabledTypes: [],
            }),
          ),
        ).toBeNull();
      }
    });

    it("returns another candidate that is enabled", () => {
      expect(
        getNextCheckpoint(
          createEngineInput({ state, enabledTypes: ["axis-puzzle"] }),
        ),
      ).toMatchObject({ type: "axis-puzzle", axisId: "pair" });
      expect(
        getNextCheckpoint(
          createEngineInput({
            state,
            enabledTypes: ["axis-puzzle", "axis-closeness"],
          }),
        ),
      ).toMatchObject({ type: "axis-closeness", axisId: "pair" });
    });
  });

  describe("given one candidate", () => {
    it("returns its card with the boundary, the values and a drawn line", () => {
      const axis = createSingleAxis("scale", 83);
      const input = createEngineInput({
        state: createState(12, 60, { axes: [axis] }),
      });

      expect(getNextCheckpoint(input)).toEqual({
        type: "axis-closeness",
        boundary: 12,
        axisId: "scale",
        variant: "single",
        entry: {
          orientation: createOrientation("scale-only", "Skala scale"),
          value: 83,
        },
        line: drawCheckpointLine("axis-closeness-single", createRecord(), SEED),
      });
    });

    it("draws the next unused line of the pool when the type was shown before", () => {
      const first = getNextCheckpoint(
        createEngineInput({
          state: createState(12, 60, { axes: [createSingleAxis("one", 83)] }),
        }),
      );
      const record = createRecord(first ? [first, halfwayCard] : []);
      const second = getNextCheckpoint(
        createEngineInput({
          state: createState(40, 60, { axes: [createSingleAxis("two", 90)] }),
          record,
        }),
      );

      expect(second).toMatchObject({ type: "axis-closeness", axisId: "two" });
      expect(second?.line.pool).toBe(first?.line.pool);
      expect(second?.line.index).not.toBe(first?.line.index);
    });
  });

  describe("given the question done at the boundary was skipped", () => {
    const survey = createSurvey();
    const aggregates: CheckpointAggregates = {
      q1: {
        resultsCounted: 1000,
        chosen: { "q1-agree": 80, "q1-strongly-disagree": 900 },
      },
    };
    const state = createState(12, 60, { axes: [pair] });

    it("evaluates the boundary like any other", () => {
      expect(
        getNextCheckpoint(
          createEngineInput({
            survey,
            entries: [{ questionId: "q1" }],
            state,
            aggregates,
          }),
        ),
      ).toMatchObject({ type: "axis-closeness", boundary: 12 });
    });

    it("has no stats card for the skip, which an answer would have had", () => {
      expect(
        getNextCheckpoint(
          createEngineInput({
            survey,
            entries: [{ questionId: "q1", answerId: "q1-agree" }],
            state,
            aggregates,
          }),
        ),
      ).toMatchObject({
        type: "stats",
        boundary: 12,
        questionId: "q1",
        side: "for",
        percent: 8,
        line: { pool: "stats-for" },
      });
    });
  });

  describe("given halfway and a personal candidate at the midpoint", () => {
    it("returns the personal one", () => {
      expect(
        getNextCheckpoint(
          createEngineInput({ state: createState(20, 40, { axes: [pair] }) }),
        ),
      ).toMatchObject({ type: "axis-closeness", boundary: 20 });
    });

    it("lets the midpoint pass: halfway is no candidate at a later boundary", () => {
      const record = createRecord([{ ...doubleClosenessCard, boundary: 20 }]);

      for (let done = 21; done <= 40; done += 1) {
        expect(
          getNextCheckpoint(
            createEngineInput({ state: createState(done, 40), record }),
          ),
        ).toBeNull();
      }
    });
  });

  describe("given halfway alone at the midpoint", () => {
    it("returns halfway", () => {
      expect(getNextCheckpoint(createEngineInput())).toEqual({
        type: "halfway",
        boundary: 20,
        percent: 50,
        minutes: 8,
        line: drawCheckpointLine("halfway", createRecord(), SEED),
      });
    });

    it("returns nothing when the slot is closed at the midpoint", () => {
      expect(
        getNextCheckpoint(
          createEngineInput({
            record: createRecord([{ ...doubleClosenessCard, boundary: 15 }]),
          }),
        ),
      ).toBeNull();
    });

    it("returns it when the taker stepped back across the midpoint and reaches it again", () => {
      const record = createRecord([{ ...doubleClosenessCard, boundary: 9 }]);

      expect(
        getNextCheckpoint(
          createEngineInput({ state: createState(19, 40), record }),
        ),
      ).toBeNull();
      expect(getNextCheckpoint(createEngineInput({ record }))).toMatchObject({
        type: "halfway",
        boundary: 20,
      });
    });
  });

  describe("given a standing trigger that met a closed slot", () => {
    const record = createRecord([halfwayCard]);

    it("returns its card at the first boundary where the slot is open", () => {
      const boundaries = [21, 22, 23, 24, 25, 26].map((done) =>
        getNextCheckpoint(
          createEngineInput({
            state: createState(done, 60, { axes: [pair] }),
            record,
          }),
        ),
      );

      expect(boundaries.slice(0, 5)).toEqual([null, null, null, null, null]);
      expect(boundaries[5]).toMatchObject({
        type: "axis-closeness",
        boundary: 26,
        axisId: "pair",
      });
    });

    it("returns nothing if the state stopped supporting it in between", () => {
      expect(
        getNextCheckpoint(
          createEngineInput({
            state: createState(26, 60, {
              axes: [createTwoSidedAxis("pair", 56, 70)],
            }),
            record,
          }),
        ),
      ).toBeNull();
    });
  });

  describe("given both axis cards qualify on the same axis", () => {
    const state = createState(12, 60, { axes: [pair] });

    it("returns one of them, by selection", () => {
      // Neither type was shown: the priority decides.
      expect(getNextCheckpoint(createEngineInput({ state }))).toMatchObject({
        type: "axis-closeness",
        axisId: "pair",
      });
      // Closeness was shown before: the type not yet shown wins.
      expect(
        getNextCheckpoint(
          createEngineInput({
            state: createState(40, 60, { axes: [pair] }),
            record: createRecord([doubleClosenessCard, halfwayCard]),
          }),
        ),
      ).toMatchObject({ type: "axis-puzzle", axisId: "pair" });
    });

    it("offers that axis to neither afterwards", () => {
      const card = getNextCheckpoint(createEngineInput({ state }));
      const record = afterShowing(createRecord(), card as CheckpointCard);

      for (const enabledTypes of [
        CHECKPOINT_PRIORITY,
        ["axis-puzzle"],
        ["axis-closeness"],
      ] as const) {
        expect(
          getNextCheckpoint(
            createEngineInput({
              state: createState(40, 60, { axes: [pair] }),
              record,
              enabledTypes,
            }),
          ),
        ).toBeNull();
      }
    });
  });

  describe("given the winner is of the same type as the previous card", () => {
    const record = createRecord([{ ...doubleClosenessCard, boundary: 9 }]);
    const single = createSingleAxis("scale", 90);

    it("returns the next candidate of another type", () => {
      expect(
        getNextCheckpoint(
          createEngineInput({
            state: createState(20, 40, { axes: [single] }),
            record,
          }),
        ),
      ).toMatchObject({ type: "halfway" });
    });

    it("returns nothing when there is none", () => {
      expect(
        getNextCheckpoint(
          createEngineInput({
            state: createState(21, 40, { axes: [single] }),
            record,
          }),
        ),
      ).toBeNull();
    });

    it("holds the full Nolan path back after the partial one, until another card came between", () => {
      const state = createState(40, 80, {
        compass: createCompass([
          "topLeft",
          "topRight",
          "bottomRight",
          "bottomLeft",
        ]),
      });
      const partial = { ...partialPathCard, boundary: 12 };

      expect(
        getNextCheckpoint(
          createEngineInput({ state, record: createRecord([partial]) }),
        ),
      ).toMatchObject({ type: "halfway" });
      expect(
        getNextCheckpoint(
          createEngineInput({
            state: { ...state, progress: createState(41, 80).progress },
            record: createRecord([partial]),
          }),
        ),
      ).toBeNull();
      expect(
        getNextCheckpoint(
          createEngineInput({
            state,
            record: createRecord([
              partial,
              { ...doubleClosenessCard, boundary: 24 },
            ]),
          }),
        ),
      ).toMatchObject({
        type: "nolan-path",
        variant: "full",
        count: 4,
        isSecondPath: true,
      });
    });
  });

  describe("given a candidate whose slot value is missing", () => {
    const nameless = createOrientation("nameless");

    it("leaves it out and returns the next candidate", () => {
      expect(
        getNextCheckpoint(
          createEngineInput({
            state: createState(12, 60, {
              unlockedTraits: [nameless],
              axes: [pair],
            }),
          }),
        ),
      ).toMatchObject({ type: "axis-closeness" });
    });

    it("returns nothing when it was the only one", () => {
      expect(
        getNextCheckpoint(
          createEngineInput({
            state: createState(12, 60, { unlockedTraits: [nameless] }),
          }),
        ),
      ).toBeNull();
    });
  });

  describe("given a puzzle whose hit pool cannot be filled", () => {
    it("leaves it out", () => {
      const [leader, ...others] = createArchetypes([80, 40, 30]);
      const archetypes = [
        { ...leader, orientation: createOrientation("leader", "  ") },
        ...others,
      ];
      const namelessPole = {
        ...pair,
        end: { orientation: createOrientation("end"), value: 70 },
      };

      // The position puzzle asks without a name and could not say whom the
      // taker hit: halfway takes the midpoint instead.
      expect(
        getNextCheckpoint(
          createEngineInput({ state: createState(30, 60, { archetypes }) }),
        ),
      ).toMatchObject({ type: "halfway" });
      expect(
        getNextCheckpoint(
          createEngineInput({
            state: createState(12, 60, { axes: [namelessPole] }),
            enabledTypes: ["axis-puzzle"],
          }),
        ),
      ).toBeNull();
    });
  });

  describe("given a card shown that cannot be read", () => {
    it("costs the boundary only the card of that type", () => {
      const damaged = {
        ...partialPathCard,
        trail: undefined,
      } as unknown as NolanPathCheckpointCard;
      const state = createState(40, 80, {
        axes: [pair],
        compass: createCompass([
          "topLeft",
          "topRight",
          "bottomRight",
          "bottomLeft",
        ]),
      });

      expect(
        getNextCheckpoint(
          createEngineInput({
            state,
            record: createRecord([damaged, statsForCard]),
          }),
        ),
      ).toMatchObject({ type: "axis-closeness", axisId: "pair" });
    });
  });

  describe("given the same input twice", () => {
    it("returns equal cards", () => {
      const input = createEngineInput({
        state: createState(30, 60, {
          axes: [pair, createSingleAxis("scale", 75)],
          archetypes: createArchetypes([80, 60, 55, 50, 45, 40]),
          compass: createCompass(["topLeft", "bottomRight"]),
        }),
        record: createRecord([{ ...doubleClosenessCard, boundary: 9 }]),
      });
      const copy = structuredClone(input);
      const card = getNextCheckpoint(input);

      expect(card).toMatchObject({ type: "position-puzzle", closeness: 80 });
      expect(getNextCheckpoint(input)).toEqual(card);
      expect(getNextCheckpoint(structuredClone(input))).toEqual(card);
      // The input is read, never changed.
      expect(input).toEqual(copy);
    });

    it("returns another line for another seed, and the same card otherwise", () => {
      const input = createEngineInput();
      const cards = Array.from({ length: 30 }, (_, index) =>
        getNextCheckpoint({ ...input, seed: `seed-${index}` }),
      );

      expect(new Set(cards.map((card) => card?.line.index)).size).toBe(3);

      for (const card of cards) {
        expect(card).toMatchObject({
          type: "halfway",
          boundary: 20,
          percent: 50,
          minutes: 8,
        });
      }
    });

    it("still returns a card, with a line, without a seed", () => {
      expect(getNextCheckpoint(createEngineInput({ seed: "" }))).toEqual(
        getNextCheckpoint(createEngineInput({ seed: "" })),
      );
      expect(
        getNextCheckpoint(createEngineInput({ seed: "" }))?.line.pool,
      ).toBe("halfway");
    });
  });

  describe("given the same answers with other time samples", () => {
    const toSamples = (seconds: number): SurveyTimeSample[] =>
      firstAnswers.map(({ questionId }) => ({ questionId, seconds }));

    it(
      "returns the same cards, with other minutes on a halfway card at most",
      () => {
        const run = { entries: firstAnswers };
        const slow = replay({ ...run, timeSamples: toSamples(40) });

        expect(slow.cardsShown).toEqual(replay(run).cardsShown);
        expect(slow.cardsShown).toEqual(
          replay({ ...run, timeSamples: toSamples(4) }).cardsShown,
        );
      },
      REPLAY_TIMEOUT_MS,
    );

    it(
      "prints the minutes of the taker's own pace on the halfway card",
      () => {
        const run = {
          entries: firstAnswers,
          enabledTypes: ["halfway"],
        } as const;
        const [fast] = replay({ ...run, timeSamples: toSamples(4) }).cardsShown;
        const [slow] = replay({
          ...run,
          timeSamples: toSamples(40),
        }).cardsShown;

        // 51 questions left at 4 and at 40 seconds each.
        expect(fast.card).toMatchObject({ type: "halfway", minutes: 4 });
        expect(slow.card).toEqual({ ...fast.card, minutes: 34 });
      },
      REPLAY_TIMEOUT_MS,
    );
  });

  describe("given a replay of a whole quiz with a fixed seed", () => {
    let runs: CheckpointRecord[] = [];

    beforeAll(() => {
      runs = [firstAnswers, lastAnswers, mixedAnswers].map((entries) =>
        replay({ entries }),
      );
    }, REPLAY_TIMEOUT_MS);

    it(
      "shows the same cards at the same boundaries on every run",
      () => {
        expect(toSummary(runs[0])).toEqual([
          [9, "axis-closeness/double"],
          [22, "axis-puzzle"],
          [34, "axis-closeness/double"],
          [51, "position-puzzle"],
          [68, "nolan-path/partial"],
          [85, "axis-closeness/single"],
        ]);

        for (const [index, entries] of [
          firstAnswers,
          lastAnswers,
          mixedAnswers,
        ].entries()) {
          expect(replay({ entries })).toEqual(runs[index]);
        }
      },
      REPLAY_TIMEOUT_MS,
    );

    it("never shows two cards of one type in a row, more than 6 cards, or two cards less than 6 questions apart", () => {
      for (const { cardsShown } of runs) {
        expect(cardsShown.length).toBeGreaterThan(0);
        expect(cardsShown.length).toBeLessThanOrEqual(6);

        for (const [index, { card }] of cardsShown.entries()) {
          const previous = cardsShown[index - 1]?.card;

          expect(card.type).not.toBe(previous?.type);
          expect(
            card.boundary - (previous?.boundary ?? -6),
          ).toBeGreaterThanOrEqual(6);
          // Not at the start, not before the end, and no faster than one card
          // per sixth of the quiz.
          expect(card.boundary).toBeGreaterThanOrEqual(Math.max(5, index * 17));
          expect(card.boundary).toBeLessThanOrEqual(98);
        }
      }
    });

    it(
      "never shows a card twice after the taker steps back and answers again",
      () => {
        // The taker reaches question 60, steps back to question 30, and answers
        // the rest again - first the same way, then another way.
        for (const again of [firstAnswers, lastAnswers, mixedAnswers]) {
          const before = replay({ entries: firstAnswers.slice(0, 60) });
          const after = replay({
            entries: [...firstAnswers.slice(0, 30), ...again.slice(30)],
            from: 31,
            record: before,
          });
          const subjects = after.cardsShown.map(({ card }) => toSubject(card));
          const boundaries = after.cardsShown.map(({ card }) => card.boundary);

          expect(after.cardsShown.slice(0, before.cardsShown.length)).toEqual(
            before.cardsShown,
          );
          expect(after.cardsShown.length).toBeGreaterThan(
            before.cardsShown.length,
          );
          expect(new Set(subjects).size).toBe(subjects.length);
          // Nothing appears on ground already covered.
          expect(boundaries).toEqual([...boundaries].sort((a, b) => a - b));

          for (const [index, boundary] of boundaries.entries()) {
            expect(
              boundary - (boundaries[index - 1] ?? -6),
            ).toBeGreaterThanOrEqual(6);
          }
        }
      },
      REPLAY_TIMEOUT_MS,
    );

    it("hands over cards that are plain JSON data", () => {
      for (const { cardsShown } of runs) {
        for (const { card } of cardsShown) {
          expect(JSON.parse(JSON.stringify(card))).toEqual(card);
        }
      }
    });
  });

  describe("given a card of every type and variant", () => {
    const allQuadrants = createCompass([
      "topLeft",
      "topRight",
      "bottomRight",
      "bottomLeft",
    ]);
    const inputs: CheckpointEngineInput[] = [
      createEngineInput({
        survey: createSurvey(),
        entries: [{ questionId: "q1", answerId: "q1-disagree" }],
        state: createState(12, 60),
        aggregates: {
          q1: {
            resultsCounted: 500,
            chosen: { "q1-strongly-agree": 470, "q1-disagree": 30 },
          },
        },
      }),
      createEngineInput({
        state: createState(12, 60, {
          unlockedTraits: [createOrientation("trait", "Cecha")],
        }),
      }),
      createEngineInput({
        state: createState(30, 60, {
          archetypes: createArchetypes([80, 60, 55, 50]),
        }),
      }),
      createEngineInput({
        state: createState(12, 60, {
          compass: createCompass(["topLeft", "bottomRight"]),
        }),
      }),
      createEngineInput({
        state: createState(12, 60, { compass: allQuadrants }),
      }),
      createEngineInput({
        state: createState(40, 80, { compass: allQuadrants }),
        record: createRecord([
          { ...partialPathCard, boundary: 12 },
          { ...doubleClosenessCard, boundary: 24 },
        ]),
      }),
      createEngineInput({
        state: createState(12, 60, { axes: [createSingleAxis("scale", 83)] }),
      }),
      createEngineInput({ state: createState(12, 60, { axes: [pair] }) }),
      createEngineInput({
        state: createState(12, 60, { axes: [pair] }),
        enabledTypes: ["axis-puzzle"],
      }),
      createEngineInput(),
    ];

    it("comes back from the storage of the tab as it was handed over", () => {
      const cards = inputs.map((input) => getNextCheckpoint(input));

      expect(
        cards.map((card) =>
          card && "variant" in card
            ? `${card.type}/${card.variant}`
            : card?.type,
        ),
      ).toEqual([
        "stats",
        "new-trait",
        "position-puzzle",
        "nolan-path/partial",
        "nolan-path/full",
        "nolan-path/full",
        "axis-closeness/single",
        "axis-closeness/double",
        "axis-puzzle",
        "halfway",
      ]);

      for (const card of cards) {
        expect(
          afterShowing(createRecord(), card as CheckpointCard).cardsShown,
        ).toEqual([{ card }]);
      }
    });
  });

  describe("given malformed input", () => {
    it("returns nothing and does not throw", () => {
      const malformed = [
        null,
        undefined,
        {},
        createEngineInput({ record: undefined as never }),
        createEngineInput({ record: { cardsShown: null } as never }),
        createEngineInput({
          record: { cardsShown: [null], timeSamples: [] } as never,
        }),
        createEngineInput({ state: {} as never }),
        createEngineInput({ state: { progress: null } as never }),
        createEngineInput({ enabledTypes: undefined as never }),
      ];

      for (const input of malformed) {
        expect(getNextCheckpoint(input as CheckpointEngineInput)).toBeNull();
      }
    });

    it("leaves out the type that cannot read its input and keeps the others", () => {
      expect(
        getNextCheckpoint(
          createEngineInput({
            state: createState(20, 40, {
              axes: null as never,
              archetypes: null as never,
            }),
          }),
        ),
      ).toMatchObject({ type: "halfway" });
      expect(
        getNextCheckpoint(
          createEngineInput({
            survey: null as never,
            entries: null as never,
            state: createState(12, 60, { axes: [pair] }),
            aggregates: { q1: null } as never,
          }),
        ),
      ).toMatchObject({ type: "axis-closeness" });
    });
  });
});

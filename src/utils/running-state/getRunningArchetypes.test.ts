import { describe, expect, it } from "vitest";

import type { RunningScore } from "@/types/checkpoint";
import type { OrientationType } from "@/types/orientation";
import { createOrientation } from "@/utils/vitest/createOrientation";
import { createScoredQuestion } from "@/utils/vitest/createScoredQuestion";
import { createSurvey } from "@/utils/vitest/createSurvey";

import { getRunningArchetypes } from "./getRunningArchetypes";

const identity: { type: OrientationType } = { type: "identity" };

const quiz = createSurvey({
  orientations: [
    createOrientation("patriot", "Patriota", identity),
    createOrientation("liberalism", "Liberalizm"),
    createOrientation("democrat", "Demokrata", identity),
    createOrientation("hidden", "Ukryty", { ...identity, isHidden: true }),
    createOrientation("nameless", undefined, identity),
    createOrientation("unfed", "Bez pytań", identity),
    {
      id: "green",
      type: "identity",
      nameForms: { masculine: "Zielony", feminine: "Zielona" },
    },
    createOrientation("pragmatist", "Pragmatyk", identity),
  ],
  questions: [
    createScoredQuestion("q1", [
      [
        1,
        [
          "patriot",
          "liberalism",
          "democrat",
          "hidden",
          "nameless",
          "green",
          "pragmatist",
        ],
      ],
    ]),
  ],
});

const toScores = (
  values: Record<string, number | undefined>,
): Record<string, RunningScore> =>
  Object.fromEntries(
    Object.entries(values).map(([id, value]) => [
      id,
      value === undefined
        ? { points: 0, maximum: 0 }
        : { points: value, maximum: 100 },
    ]),
  );

const getNames = (values: Record<string, number | undefined>) =>
  getRunningArchetypes(quiz, toScores(values)).map(
    ({ orientation }) => orientation.name,
  );

describe("getRunningArchetypes()", () => {
  it("keeps the identity orientations that are shown, named and fed", () => {
    const archetypes = getRunningArchetypes(
      quiz,
      toScores({
        patriot: 40,
        liberalism: 90,
        democrat: 30,
        hidden: 80,
        nameless: 70,
        unfed: 60,
        green: 20,
        pragmatist: 10,
      }),
    );

    expect(
      archetypes.map(({ orientation, value }) => [orientation.id, value]),
    ).toEqual([
      ["patriot", 40],
      ["democrat", 30],
      ["green", 20],
      ["pragmatist", 10],
    ]);
  });

  it("ranks them by exact value, highest first", () => {
    expect(
      getNames({ patriot: 50.2, democrat: 50.4, green: 50.3, pragmatist: 12 }),
    ).toEqual(["Demokrata", "Zielony", "Patriota", "Pragmatyk"]);
  });

  it("keeps the order of the quiz for equal values", () => {
    expect(
      getNames({ patriot: 30, democrat: 60, green: 30, pragmatist: 60 }),
    ).toEqual(["Demokrata", "Pragmatyk", "Patriota", "Zielony"]);
  });

  it("puts an archetype without a value after every archetype that has one", () => {
    expect(
      getNames({
        patriot: undefined,
        democrat: 0,
        green: undefined,
        pragmatist: 35,
      }),
    ).toEqual(["Pragmatyk", "Demokrata", "Patriota", "Zielony"]);
  });

  it("keeps an archetype whose maximum is still 0 in the list, with no value", () => {
    const archetypes = getRunningArchetypes(quiz, {});

    expect(archetypes).toHaveLength(4);
    expect(archetypes.map(({ value }) => value)).toEqual([
      undefined,
      undefined,
      undefined,
      undefined,
    ]);
  });

  it("shows a name with two forms in its masculine form", () => {
    expect(getNames({ green: 10 })).toContain("Zielony");
  });

  it("returns an empty list for a quiz with no identity orientation", () => {
    expect(
      getRunningArchetypes(
        createSurvey({
          orientations: [createOrientation("liberalism", "Liberalizm")],
          questions: [createScoredQuestion("q1", [[1, ["liberalism"]]])],
        }),
        toScores({ liberalism: 100 }),
      ),
    ).toEqual([]);
  });
});

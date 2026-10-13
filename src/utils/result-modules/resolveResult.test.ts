import { describe, expect, it } from "vitest";

import { PARTIAL_MATCH_FROM } from "@/constants/results";
import type {
  QuizResult,
  ResolvedModule,
  ResultModule,
  ResultModuleType,
} from "@/types/results";
import type { Survey } from "@/types/survey";
import { createResultModule } from "@/utils/vitest/results/createResultModule";
import { createSurveyAxis } from "@/utils/vitest/survey/createSurveyAxis";
import { createSurveyCategory } from "@/utils/vitest/survey/createSurveyCategory";

import {
  AXIS_IDS,
  IDENTITY_IDS,
  identityQuizResult,
  identityResultQuiz,
  PARTY_IDS,
} from "./identityQuizResult.fixtures";
import { resolveResult } from "./resolveResult";
import { moduleQuiz, moduleQuizResult } from "./resolveResult.fixtures";

const NO_RESULT: QuizResult = { scores: {}, answers: [] };

const header = (orientationIds: string[]): ResultModule =>
  createResultModule("header", "header", { orientationIds });

// The quiz with other records, a result of it, or both.
const resolveWith = (
  resultModules: ResultModule[],
  result: QuizResult = moduleQuizResult,
  survey: Survey = moduleQuiz,
) => resolveResult({ ...survey, resultModules }, result);

// The one module of a quiz whose only record, beside a header, is this one.
const resolveRecord = (
  type: ResultModuleType,
  overrides: Partial<ResultModule>,
  result: QuizResult = moduleQuizResult,
  survey: Survey = moduleQuiz,
): ResolvedModule | undefined =>
  resolveWith(
    [
      header(["liberal", "socialist"]),
      createResultModule("record", type, overrides),
    ],
    result,
    survey,
  ).modules.at(0);

const withScores = (scores: QuizResult["scores"]): QuizResult => ({
  ...moduleQuizResult,
  scores: { ...moduleQuizResult.scores, ...scores },
});

const findModule = (id: string): ResolvedModule | undefined =>
  resolveResult(moduleQuiz, moduleQuizResult).modules.find(
    (module) => module.id === id,
  );

describe("resolveResult()", () => {
  describe("given a quiz with one record of every type and a result", () => {
    const resolved = resolveResult(moduleQuiz, moduleQuizResult);

    it("returns the header and seven modules, in the order of the records", () => {
      expect(resolved.header).toBeDefined();
      expect(resolved.modules.map(({ id, type }) => [id, type])).toEqual([
        ["identity", "archetype"],
        ["ecology", "single_axis"],
        ["economy", "double_axis"],
        ["ideologies", "multi_axis"],
        ["parties", "horizontal_bar"],
        ["compass", "nolan_chart"],
        ["traits", "traits"],
      ]);
    });

    it("resolves the header as the leader with its value, and never as one of the modules", () => {
      expect(resolved.header).toEqual({
        orientation: expect.objectContaining({ id: "socialist" }),
        confidence: 100,
        linkLabel: "Zobacz stronę",
        lowMatch: "no_match",
      });
      expect(resolved.leader).toEqual({
        orientation: expect.objectContaining({ id: "socialist" }),
        value: 100,
      });
      expect(resolved.modules.map(({ id }) => id)).not.toContain("header");
    });

    it("gives a single axis the first shown orientation of the record with its value, and the marker", () => {
      expect(findModule("ecology")).toEqual({
        id: "ecology",
        type: "single_axis",
        position: 2,
        column: "start",
        entry: {
          orientation: expect.objectContaining({ id: "green" }),
          value: 100,
        },
        marker: 60,
      });
    });

    it("gives a double axis the first axis of the record with both entries, and the marker", () => {
      expect(findModule("economy")).toEqual({
        id: "economy",
        type: "double_axis",
        position: 3,
        column: "end",
        description: "Jak blisko ci do każdej ze stron osi.",
        axis: {
          id: "economy-axis",
          name: "Gospodarka",
          start: {
            orientation: expect.objectContaining({ id: "left" }),
            value: 100,
          },
          end: {
            orientation: expect.objectContaining({ id: "right" }),
            value: 0,
          },
        },
        marker: false,
      });
    });

    it("gives a multi axis its groups, and the marker", () => {
      expect(findModule("ideologies")).toMatchObject({
        id: "ideologies",
        type: "multi_axis",
        position: 4,
        column: "start",
        title: "Ideologie",
        groups: [
          { name: "Gospodarka", axes: [{ id: "economy-axis" }] },
          { name: "Społeczeństwo", axes: [{ id: "society-axis" }] },
        ],
        marker: 50,
      });
    });

    it("gives a horizontal bar its entries, and the visible rows", () => {
      expect(findModule("parties")).toEqual({
        id: "parties",
        type: "horizontal_bar",
        position: 5,
        column: "start",
        title: "Partie",
        entries: [
          {
            orientation: expect.objectContaining({ id: "party-green" }),
            isOfficial: false,
          },
          {
            orientation: expect.objectContaining({ id: "party-left" }),
            isOfficial: true,
          },
        ],
        visibleRows: 2,
      });
    });

    it("gives a Nolan chart the compass_x_axis as horizontal, the compass_y_axis as vertical, and the labels and colours as read", () => {
      expect(findModule("compass")).toMatchObject({
        id: "compass",
        type: "nolan_chart",
        position: 6,
        column: "end",
        horizontal: {
          id: "compass-x",
          name: "gospodarczo",
          start: { orientation: { id: "left" }, value: 100 },
          end: { orientation: { id: "right" }, value: 0 },
        },
        vertical: {
          id: "compass-y",
          name: "światopoglądowo",
          start: { orientation: { id: "progress" }, value: 100 },
          end: { orientation: { id: "tradition" }, value: 0 },
        },
        labels: { centre: "Centrum" },
        colors: { topLeft: "#ff0000" },
      });
    });

    it("gives an archetype every shown orientation of the record with its value", () => {
      expect(findModule("identity")).toEqual({
        id: "identity",
        type: "archetype",
        position: 1,
        column: "end",
        title: "Tożsamość",
        entries: [
          {
            orientation: expect.objectContaining({ id: "liberal" }),
            value: 20,
          },
          {
            orientation: expect.objectContaining({ id: "socialist" }),
            value: 100,
          },
        ],
        lowMatch: "no_match",
      });
    });

    it("gives traits every shown orientation of the record, and the ones that scored all they could as earned", () => {
      expect(findModule("traits")).toEqual({
        id: "traits",
        type: "traits",
        position: 7,
        column: "start",
        title: "Cechy",
        traits: [
          expect.objectContaining({ id: "brave", name: "Odwaga" }),
          expect.objectContaining({ id: "calm", name: "Spokój" }),
        ],
        earnedIds: ["brave"],
      });
    });
  });

  describe("values", () => {
    it("gives an orientation its points over its maximum, times 100, never rounded", () => {
      expect(
        resolveRecord(
          "single_axis",
          { orientationIds: ["green"] },
          withScores({ green: { points: 1, maximum: 3 } }),
        ),
      ).toMatchObject({ entry: { value: (1 / 3) * 100 } });
    });

    it("gives no value to an orientation that has no score, or a maximum of 0", () => {
      const resolved = resolveRecord("archetype", {
        orientationIds: ["party-right", "party-left"],
      });

      expect(resolved).toMatchObject({
        entries: [
          { orientation: { id: "party-right" } },
          { orientation: { id: "party-left" } },
        ],
      });
      expect(resolved).not.toHaveProperty("entries.0.value", expect.anything());
      expect(resolved).not.toHaveProperty("entries.1.value", expect.anything());
    });

    it("gives an axis side the points of its orientations over their maximums, the hidden ones included", () => {
      // The start side is the hidden "secret" 0 of 1, "left" 3 of 3 and "green" 1 of 1.
      expect(
        resolveRecord("double_axis", { axisIds: ["mixed"] }),
      ).toMatchObject({ axis: { start: { value: 80 }, end: { value: 0 } } });
    });

    it("gives an orientation inside a category the same arithmetic on the questions of that category alone", () => {
      // The liberal: 1 of 5 in the whole quiz, 0 of 3 in economy, 1 of 2 in society.
      expect(
        resolveRecord("horizontal_bar", {
          orientationIds: ["liberal"],
          values: { groupBy: "category" },
        }),
      ).toMatchObject({
        categories: [
          { id: "economy", entries: [{ value: 0 }] },
          { id: "society", entries: [{ value: 50 }] },
        ],
      });
    });
  });

  describe("what a record points at", () => {
    it("leaves out a hidden orientation the record lists", () => {
      expect(
        resolveRecord("archetype", {
          orientationIds: ["anarchist", "liberal", "secret"],
        }),
      ).toMatchObject({ entries: [{ orientation: { id: "liberal" } }] });
    });

    it("gives a module an orientation in its display form for the declared gender", () => {
      const forWoman = resolveResult(moduleQuiz, moduleQuizResult, "female");
      const forMan = resolveResult(moduleQuiz, moduleQuizResult, "male");

      expect(forWoman.header?.orientation?.name).toBe("Socjalistka");
      expect(forWoman.leader?.orientation.name).toBe("Socjalistka");
      expect(forWoman.modules[0]).toMatchObject({
        entries: [
          { orientation: { name: "Liberał" } },
          { orientation: { name: "Socjalistka" } },
        ],
      });
      expect(forMan.header?.orientation?.name).toBe("Socjalista");
      expect(forWoman.header?.orientation).not.toHaveProperty("nameForms");
    });

    it("gives an axis side with several orientations the first shown one, with the side's value", () => {
      expect(
        resolveRecord("double_axis", { axisIds: ["mixed"] }),
      ).toMatchObject({
        axis: { start: { orientation: { id: "left" }, value: 80 } },
      });
    });

    it("gives an axis no side that has no shown orientation", () => {
      // The end side of "one-sided" holds only the hidden "secret".
      expect(
        resolveRecord("double_axis", { axisIds: ["one-sided"] }),
      ).toBeUndefined();
    });
  });

  describe("the leader", () => {
    it("is the one with the highest value among the shown orientations of the header record", () => {
      const resolved = resolveWith([
        header(["anarchist", "liberal", "socialist", "party-left"]),
      ]);

      expect(resolved.leader).toMatchObject({
        orientation: { id: "socialist" },
        value: 100,
      });
      expect(resolved.header).toMatchObject({
        orientation: { id: "socialist" },
        confidence: 100,
      });
    });

    it("is the one listed first when two share the highest value", () => {
      expect(
        resolveWith([header(["liberal", "green", "socialist"])]).leader
          ?.orientation.id,
      ).toBe("green");
      expect(
        resolveWith([header(["liberal", "socialist", "green"])]).leader
          ?.orientation.id,
      ).toBe("socialist");
    });

    it("is absent when none of them has a value", () => {
      const resolved = resolveWith([header(["party-left", "party-right"])]);

      expect(resolved.leader).toBeUndefined();
      expect(resolved.header).toBeDefined();
      expect(resolved.header?.orientation).toBeUndefined();
      expect(resolved.header?.confidence).toBeUndefined();
    });

    it("is absent, like the header, when there is no header record", () => {
      const resolved = resolveWith([
        createResultModule("identity", "archetype", {
          orientationIds: ["socialist"],
        }),
      ]);

      expect(resolved.leader).toBeUndefined();
      expect(resolved.header).toBeUndefined();
      expect(resolved.modules).toHaveLength(1);
    });

    it("is absent below a partial match, while the header still carries the orientation and its value", () => {
      const resolved = resolveWith(
        [
          header(["liberal", "socialist"]),
          createResultModule("parties", "horizontal_bar", {
            orientationIds: ["party-left", "party-green"],
            values: { selection: "linked_to_leader" },
          }),
        ],
        withScores({
          socialist: { points: PARTIAL_MATCH_FROM - 1, maximum: 100 },
        }),
      );

      expect(resolved.header).toMatchObject({
        orientation: { id: "socialist" },
        confidence: PARTIAL_MATCH_FROM - 1,
      });
      expect(resolved.leader).toBeUndefined();
      expect(resolved.modules).toEqual([]);
    });

    it("leads from the partial match threshold on", () => {
      expect(
        resolveWith(
          [header(["socialist"])],
          withScores({
            socialist: { points: PARTIAL_MATCH_FROM, maximum: 100 },
          }),
        ).leader,
      ).toMatchObject({
        orientation: { id: "socialist" },
        value: PARTIAL_MATCH_FROM,
      });
    });

    it("gives the header the label of the link of the header record", () => {
      expect(
        resolveWith([
          createResultModule("header", "header", {
            values: { "label.link": "Strona partii" },
          }),
        ]).header?.linkLabel,
      ).toBe("Strona partii");
    });
  });

  describe("selection, for a horizontal bar record", () => {
    const orientationIds = [
      "party-left",
      "anarchist",
      "party-right",
      "party-green",
    ];

    it("selects every shown orientation of the record, in the author's order, with all", () => {
      expect(
        resolveRecord("horizontal_bar", {
          orientationIds,
          values: { selection: "all" },
        }),
      ).toMatchObject({
        entries: [
          { orientation: { id: "party-left" } },
          { orientation: { id: "party-right" } },
          { orientation: { id: "party-green" } },
        ],
      });
    });

    it("selects the ones the leader links, in the leader's order, with linked_to_leader", () => {
      expect(
        resolveRecord("horizontal_bar", {
          orientationIds,
          values: { selection: "linked_to_leader" },
        }),
      ).toMatchObject({
        entries: [
          { orientation: { id: "party-green" } },
          { orientation: { id: "party-left" } },
        ],
      });
    });

    it("selects none with linked_to_leader and no leader, so the record is not drawn", () => {
      expect(
        resolveWith([
          createResultModule("parties", "horizontal_bar", {
            orientationIds,
            values: { selection: "linked_to_leader" },
          }),
        ]).modules,
      ).toEqual([]);
      expect(
        resolveRecord(
          "horizontal_bar",
          { orientationIds, values: { selection: "linked_to_leader" } },
          NO_RESULT,
        ),
      ).toBeUndefined();
    });
  });

  describe("grouping by category", () => {
    it("groups a multi axis record by the categories of the quiz that are not hidden, in the quiz's order", () => {
      const resolved = resolveRecord("multi_axis", {
        axisIds: ["society-axis", "mixed", "economy-axis"],
        values: { groupBy: "category" },
      });

      expect(resolved).toMatchObject({
        groups: [
          {
            name: "Gospodarka",
            axes: [{ id: "mixed" }, { id: "economy-axis" }],
          },
          { name: "Społeczeństwo", axes: [{ id: "society-axis" }] },
        ],
      });
    });

    it("puts an axis whose category matches no category of the quiz in a last group with no name", () => {
      const resolved = resolveRecord("multi_axis", {
        axisIds: ["loose", "economy-axis"],
        values: { groupBy: "category" },
      });

      expect(resolved).toMatchObject({
        groups: [
          { name: "Gospodarka", axes: [{ id: "economy-axis" }] },
          { axes: [{ id: "loose" }] },
        ],
      });
      expect(resolved).not.toHaveProperty("groups.1.name", expect.anything());
    });

    it("puts every axis of a multi axis record in one group with no name, with none", () => {
      const resolved = resolveRecord("multi_axis", {
        axisIds: ["society-axis", "loose", "economy-axis"],
        values: { groupBy: "none" },
      });

      expect(resolved).toMatchObject({
        groups: [
          {
            axes: [
              { id: "society-axis" },
              { id: "loose" },
              { id: "economy-axis" },
            ],
          },
        ],
      });
      expect(resolved).not.toHaveProperty("groups.0.name", expect.anything());
    });

    it("gives a horizontal bar record one category per category of the quiz that is not hidden, each with the selected orientations and their values inside it", () => {
      expect(
        resolveRecord("horizontal_bar", {
          orientationIds: ["liberal", "socialist"],
          values: { groupBy: "category" },
        }),
      ).toMatchObject({
        categories: [
          {
            id: "economy",
            name: "Gospodarka",
            entries: [
              { orientation: { id: "liberal" }, value: 0, isOfficial: false },
              { orientation: { id: "socialist" }, value: 100 },
            ],
          },
          {
            id: "society",
            name: "Społeczeństwo",
            entries: [
              { orientation: { id: "liberal" }, value: 50 },
              { orientation: { id: "socialist" }, value: 100 },
            ],
          },
        ],
      });
    });

    it("keeps a category in which none of the record's orientations has a value, with its entries and no values", () => {
      const resolved = resolveRecord("horizontal_bar", {
        orientationIds: ["party-left", "party-green"],
        values: { selection: "linked_to_leader", groupBy: "category" },
      });

      expect(resolved).toMatchObject({
        categories: [
          {
            id: "economy",
            entries: [
              { orientation: { id: "party-green" }, isOfficial: false },
              { orientation: { id: "party-left" }, isOfficial: true },
            ],
          },
          {
            id: "society",
            entries: [
              { orientation: { id: "party-green" } },
              { orientation: { id: "party-left" } },
            ],
          },
        ],
      });
      expect(resolved).not.toHaveProperty(
        "categories.0.entries.0.value",
        expect.anything(),
      );
      expect(resolved).not.toHaveProperty(
        "categories.1.entries.1.value",
        expect.anything(),
      );
    });

    it("gives a horizontal bar record entries with their values, with none", () => {
      const resolved = resolveRecord("horizontal_bar", {
        orientationIds: ["liberal", "party-left"],
        values: { groupBy: "none" },
      });

      expect(resolved).toMatchObject({
        entries: [
          { orientation: { id: "liberal" }, value: 20, isOfficial: false },
          { orientation: { id: "party-left" }, isOfficial: true },
        ],
      });
      expect(resolved).not.toHaveProperty("categories");
    });
  });

  describe("a record that cannot be drawn", () => {
    it.each<ResultModuleType>([
      "single_axis",
      "archetype",
      "traits",
    ])("leaves out a %s record with no shown orientation left", (type) => {
      expect(resolveRecord(type, { orientationIds: [] })).toBeUndefined();
      expect(
        resolveRecord(type, { orientationIds: ["anarchist", "secret"] }),
      ).toBeUndefined();
    });

    it("leaves out a horizontal bar record whose selection leaves nothing", () => {
      expect(
        resolveRecord("horizontal_bar", { orientationIds: ["anarchist"] }),
      ).toBeUndefined();
      expect(
        resolveRecord("horizontal_bar", {
          orientationIds: ["party-right"],
          values: { selection: "linked_to_leader" },
        }),
      ).toBeUndefined();
    });

    it("draws a horizontal bar record whose selection leaves nothing when it has a text for that: no rows, and the text", () => {
      expect(
        resolveRecord("horizontal_bar", {
          orientationIds: ["party-right"],
          values: {
            selection: "linked_to_leader",
            "label.empty": "Brak najbliższej partii",
          },
        }),
      ).toMatchObject({
        type: "horizontal_bar",
        entries: [],
        emptyLabel: "Brak najbliższej partii",
      });
    });

    it("leaves out a horizontal bar record whose grouping leaves no category", () => {
      const control = createSurveyCategory("control", { isHidden: true });

      expect(
        resolveRecord(
          "horizontal_bar",
          { orientationIds: ["liberal"], values: { groupBy: "category" } },
          moduleQuizResult,
          { ...moduleQuiz, categories: [control] },
        ),
      ).toBeUndefined();
    });

    it("leaves out a double axis record that has no axis", () => {
      expect(resolveRecord("double_axis", { axisIds: [] })).toBeUndefined();
    });

    it("leaves out a double axis record whose axis lacks a side", () => {
      expect(
        resolveRecord("double_axis", { axisIds: ["one-sided"] }),
      ).toBeUndefined();
    });

    it("leaves out a multi axis record with no axis that has both sides left", () => {
      expect(resolveRecord("multi_axis", { axisIds: [] })).toBeUndefined();
      expect(
        resolveRecord("multi_axis", {
          axisIds: ["one-sided"],
          values: { groupBy: "category" },
        }),
      ).toBeUndefined();
    });

    it("leaves an axis that lacks a side out of its group, and a group left empty out of the groups", () => {
      const society = createSurveyAxis("lone", ["progress"], ["secret"], {
        categoryName: "Społeczeństwo",
      });

      expect(
        resolveRecord(
          "multi_axis",
          {
            axisIds: ["lone", "one-sided", "economy-axis"],
            values: { groupBy: "category" },
          },
          moduleQuizResult,
          { ...moduleQuiz, axes: [...moduleQuiz.axes, society] },
        ),
      ).toMatchObject({
        groups: [{ name: "Gospodarka", axes: [{ id: "economy-axis" }] }],
      });
    });

    it("leaves out a Nolan chart record that does not find both axes", () => {
      expect(
        resolveRecord("nolan_chart", {
          axisIds: ["compass-x", "economy-axis"],
        }),
      ).toBeUndefined();
      expect(resolveRecord("nolan_chart", { axisIds: [] })).toBeUndefined();
    });

    it("leaves out a Nolan chart record one of whose axes lacks a side", () => {
      const vertical = createSurveyAxis("compass-y", ["progress"], ["secret"], {
        type: "compass_y_axis",
      });

      expect(
        resolveRecord(
          "nolan_chart",
          { axisIds: ["compass-x", "compass-y"] },
          moduleQuizResult,
          {
            ...moduleQuiz,
            axes: [
              ...moduleQuiz.axes.filter(({ id }) => id !== "compass-y"),
              vertical,
            ],
          },
        ),
      ).toBeUndefined();
    });

    it("draws the other records of the quiz all the same", () => {
      const resolved = resolveWith([
        header(["socialist"]),
        createResultModule("empty", "double_axis", { position: 1 }),
        createResultModule("ecology", "single_axis", {
          position: 2,
          orientationIds: ["green"],
        }),
      ]);

      expect(resolved.modules.map(({ id }) => id)).toEqual(["ecology"]);
    });
  });

  describe("invalid and edge input", () => {
    it("returns no header, no leader and no modules for a quiz with no records", () => {
      expect(resolveWith([])).toEqual({ modules: [] });
    });

    it("leaves every value absent for a result with no scores, and still resolves the modules that need none", () => {
      const resolved = resolveResult(moduleQuiz, {
        ...moduleQuizResult,
        scores: {},
      });

      expect(resolved.leader).toBeUndefined();
      expect(resolved.header).toEqual({
        linkLabel: "Zobacz stronę",
        lowMatch: "no_match",
      });
      // The parties are linked to a leader, and there is none.
      expect(resolved.modules.map(({ id }) => id)).toEqual([
        "identity",
        "ecology",
        "economy",
        "ideologies",
        "compass",
        "traits",
      ]);
      expect(resolved.modules[0]).toMatchObject({
        entries: [
          { orientation: { id: "liberal" } },
          { orientation: { id: "socialist" } },
        ],
      });
      expect(JSON.stringify(resolved)).not.toContain('"value"');
      // The earned traits come from the answers.
      expect(resolved.modules.at(-1)).toMatchObject({ earnedIds: ["brave"] });
    });

    it("ignores an answer that names a question or an answer the quiz does not have", () => {
      const result = {
        ...moduleQuizResult,
        answers: [
          { questionId: "ghost", answerId: "q1-a2" },
          { questionId: "q5", answerId: "ghost" },
          ...moduleQuizResult.answers,
        ],
      };

      expect(resolveResult(moduleQuiz, result)).toEqual(
        resolveResult(moduleQuiz, moduleQuizResult),
      );
    });

    it("counts the first answer when a question is answered twice", () => {
      const result = {
        ...moduleQuizResult,
        answers: [
          ...moduleQuizResult.answers,
          { questionId: "q1", answerId: "q1-a2" },
        ],
      };

      expect(resolveResult(moduleQuiz, result)).toEqual(
        resolveResult(moduleQuiz, moduleQuizResult),
      );
      expect(
        resolveRecord(
          "traits",
          { orientationIds: ["brave"] },
          { ...result, answers: [...result.answers].reverse() },
        ),
      ).toMatchObject({ earnedIds: [] });
    });

    it("gives the same result for the same quiz, result and gender", () => {
      expect(resolveResult(moduleQuiz, moduleQuizResult, "female")).toEqual(
        resolveResult(moduleQuiz, moduleQuizResult, "female"),
      );
    });
  });

  describe("given the identity quiz, cut to four identities, and the result of a green progressive", () => {
    const resolved = resolveResult(identityResultQuiz, identityQuizResult);

    it("leads with the top identity", () => {
      const identities = resolved.modules.find(
        ({ id }) => id === "identity-archetype",
      );

      expect(resolved.leader).toMatchObject({
        orientation: {
          id: IDENTITY_IDS.greenProgressive,
          type: "identity",
          name: "Zielony postępowiec",
        },
        value: 100,
      });
      expect(resolved.header).toMatchObject({
        orientation: { id: IDENTITY_IDS.greenProgressive },
        confidence: 100,
      });
      expect(identities).toMatchObject({
        entries: [
          { orientation: { name: "Międzynarodowy socjalista" } },
          { orientation: { name: "Zielony postępowiec" }, value: 100 },
          { orientation: { name: "Euroentuzjasta" } },
          { orientation: { name: "Konserwatywny wolnościowiec" } },
        ],
      });
    });

    it("names the leader in the form of the declared gender", () => {
      expect(
        resolveResult(identityResultQuiz, identityQuizResult, "female").leader
          ?.orientation.name,
      ).toBe("Zielona postępowczyni");
    });

    it("shows the parties linked to the top identity, in its order and with no values", () => {
      const parties = resolved.modules.find(
        ({ id }) => id === "identity-parties",
      );

      expect(parties).toMatchObject({
        type: "horizontal_bar",
        title: "Partie",
        entries: [
          {
            orientation: { id: PARTY_IDS.zieloni, name: "Zieloni" },
            isOfficial: false,
          },
          {
            orientation: { id: PARTY_IDS.nowaLewica, name: "Nowa Lewica" },
            isOfficial: false,
          },
        ],
      });
      expect(JSON.stringify(parties)).not.toContain('"value"');
    });

    it("groups the axes by the categories of the quiz, in the quiz's order", () => {
      expect(
        resolved.modules.find(({ id }) => id === "identity-ideologies"),
      ).toMatchObject({
        type: "multi_axis",
        groups: [
          {
            name: "Gospodarka",
            axes: [
              {
                id: AXIS_IDS.marketIntervention,
                name: "Interwencjonizm-Wolny rynek",
                start: { orientation: { name: "Interwencjonizm" } },
                end: { orientation: { name: "Wolny rynek" }, value: 0 },
              },
              { id: AXIS_IDS.economicSolidarity },
            ],
          },
          {
            name: "Ekologia",
            axes: [
              {
                id: AXIS_IDS.climate,
                start: {
                  orientation: { name: "Ekologia Klimatyczna" },
                  value: 100,
                },
                end: { orientation: { name: "Antyklimatyzm" }, value: 0 },
              },
              { id: AXIS_IDS.greenEconomy },
            ],
          },
        ],
      });
    });

    it("finds the two compass axes, each side with one value for its several orientations", () => {
      const compass = resolved.modules.find(
        ({ id }) => id === "identity-compass",
      );
      const { scores } = identityQuizResult;
      // The start side of the horizontal axis is "Interwencjonizm" and "Solidaryzm ekonomiczny".
      const intervention = scores["b7bb725e-74fc-48fb-ada9-1bb238c77280"];
      const solidarity = scores["5df67347-1f24-4054-ac44-58fbefefe140"];

      expect(compass).toMatchObject({
        type: "nolan_chart",
        horizontal: {
          id: AXIS_IDS.compassHorizontal,
          name: "gospodarczo",
          start: {
            orientation: { name: "Interwencjonizm" },
            value:
              ((intervention.points + solidarity.points) /
                (intervention.maximum + solidarity.maximum)) *
              100,
          },
          end: { orientation: { name: "Wolny rynek" }, value: 0 },
        },
        vertical: {
          id: AXIS_IDS.compassVertical,
          name: "światopoglądowo",
          start: { orientation: { name: "Progresywizm" } },
          end: { orientation: { name: "Tradycjonalizm" } },
        },
        labels: { centre: "Centrowy" },
      });
    });

    it("draws the four modules in the order of their positions", () => {
      expect(resolved.modules.map(({ id }) => id)).toEqual([
        "identity-ideologies",
        "identity-archetype",
        "identity-compass",
        "identity-parties",
      ]);
    });
  });

  describe("given the identity quiz and a result with no answer", () => {
    it("has a header that carries the first identity at 0, no leader, and a parties card with no party but the line for that", () => {
      const doneNothing = {
        scores: Object.fromEntries(
          Object.entries(identityQuizResult.scores).map(([id, { maximum }]) => [
            id,
            { points: 0, maximum },
          ]),
        ),
        answers: [],
      };
      const resolved = resolveResult(identityResultQuiz, doneNothing);

      expect(resolved.header).toMatchObject({
        orientation: { id: IDENTITY_IDS.internationalSocialist },
        confidence: 0,
      });
      expect(resolved.leader).toBeUndefined();
      expect(resolved.modules.map(({ id }) => id)).toEqual([
        "identity-ideologies",
        "identity-archetype",
        "identity-compass",
        "identity-parties",
      ]);
      expect(resolved.modules.at(-1)).toMatchObject({
        entries: [],
        emptyLabel: "Brak najbliższej partii",
      });
    });
  });
});

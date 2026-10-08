import { describe, expect, it } from "vitest";

import { readQuizOrientations } from "@/services/api/utils/orientation/readQuizOrientations";
import type { Survey } from "@/types/survey";

import { readSurvey } from "./readSurvey";
import {
  IDENTITY_QUIZ_AXIS_COUNT,
  IDENTITY_QUIZ_QUESTION_COUNT,
  identityQuizSurvey,
  PRESIDENTIAL_QUIZ_QUESTION_COUNT,
  presidentialQuizSurvey,
} from "./readSurvey.fixtures";

const SURVEY_ID = "60beb898-a4e4-4160-88c4-07a9931ab499";

const createQuestion = (
  id: string,
  overrides: Record<string, unknown> = {},
): Record<string, unknown> => ({
  id,
  text: `Stwierdzenie ${id}.`,
  status: "LIVE",
  possibleAnswers: [{ id: `${id}-yes`, text: "Tak" }],
  ...overrides,
});

const read = (response: Record<string, unknown>): Survey => {
  const result = readSurvey(
    { questions: [createQuestion("q1")], ...response },
    SURVEY_ID,
  );

  if (result.status !== "ready") {
    throw new Error(`The quiz was read as ${result.status}`);
  }

  return result.survey;
};

const getQuestionIds = (questions: unknown[]): string[] =>
  read({ questions }).questions.map(({ id }) => id);

describe("readSurvey()", () => {
  describe("given something that is not an object, or has no list of questions", () => {
    it.each([
      [undefined],
      [null],
      [""],
      ["<html></html>"],
      [7],
      [true],
      [[]],
      [[createQuestion("q1")]],
      [{}],
      [{ title: "Quiz" }],
      [{ questions: null }],
      [{ questions: {} }],
      [{ questions: "questions" }],
      [{ message: "Survey with given ID not found.", statusCode: 404 }],
    ])("returns failed for %j", (response) => {
      expect(readSurvey(response, SURVEY_ID)).toEqual({ status: "failed" });
    });
  });

  describe("the quiz", () => {
    it("uses the identifier it was asked for by", () => {
      expect(read({ id: "another-identifier" }).id).toBe(SURVEY_ID);
      expect(read({}).id).toBe(SURVEY_ID);
    });

    it("reads title as the name, and has no name when it is missing or empty", () => {
      expect(read({ title: " Barometr Prezydencki 2025\n" }).name).toBe(
        "Barometr Prezydencki 2025",
      );
      expect(read({}).name).toBeUndefined();
      expect(read({ title: "" }).name).toBeUndefined();
      expect(read({ title: " \n " }).name).toBeUndefined();
      expect(read({ title: null }).name).toBeUndefined();
      expect(read({ title: 7 }).name).toBeUndefined();
    });

    it("is official only when type is OFFICIAL", () => {
      expect(read({ type: "OFFICIAL" }).isOfficial).toBe(true);
      expect(read({ type: "COMMUNITY" }).isOfficial).toBe(false);
      expect(read({ type: "official" }).isOfficial).toBe(false);
      expect(read({ type: null }).isOfficial).toBe(false);
      expect(read({ type: true }).isOfficial).toBe(false);
      expect(read({}).isOfficial).toBe(false);
    });

    it("carries the algorithm, the default language and the supported languages", () => {
      expect(
        read({
          algorithm: "default",
          defaultLanguage: "pl",
          supportedLanguages: ["pl", "en"],
        }),
      ).toMatchObject({
        algorithm: "default",
        defaultLanguage: "pl",
        supportedLanguages: ["pl", "en"],
      });
    });

    it("has no algorithm and no default language when they are missing, and no supported languages", () => {
      const survey = read({});

      expect(survey.algorithm).toBeUndefined();
      expect(survey.defaultLanguage).toBeUndefined();
      expect(survey.supportedLanguages).toEqual([]);
      expect(read({ supportedLanguages: "pl" }).supportedLanguages).toEqual([]);
      expect(
        read({ supportedLanguages: ["pl", 7, null, " ", " en "] })
          .supportedLanguages,
      ).toEqual(["pl", "en"]);
    });

    it("carries the average time", () => {
      expect(read({ averageFinishTime: 15 }).averageFinishTime).toBe(15);
      expect(read({ averageFinishTime: 0 }).averageFinishTime).toBe(0);
    });

    it("has no average time when it is missing, not a number or below zero", () => {
      expect(read({}).averageFinishTime).toBeUndefined();
      expect(
        read({ averageFinishTime: null }).averageFinishTime,
      ).toBeUndefined();
      expect(
        read({ averageFinishTime: "15" }).averageFinishTime,
      ).toBeUndefined();
      expect(
        read({ averageFinishTime: Number.NaN }).averageFinishTime,
      ).toBeUndefined();
      expect(read({ averageFinishTime: -1 }).averageFinishTime).toBeUndefined();
    });

    it("reads the orientations with readQuizOrientations and the official mark of the quiz", () => {
      const orientations = [
        { id: "a", generalName: '{"name":"Kandydat","isOfficial":true}' },
        { id: "b", generalName: '{"m":"Liberał","f":"Liberałka"}' },
        { generalName: "Bez identyfikatora" },
        { id: "a", generalName: "Powtórzony" },
      ];

      const official = read({ type: "OFFICIAL", orientations }).orientations;
      const community = read({ type: "COMMUNITY", orientations }).orientations;

      expect(official).toEqual(
        readQuizOrientations(orientations, { isOfficialQuiz: true }),
      );
      expect(community).toEqual(
        readQuizOrientations(orientations, { isOfficialQuiz: false }),
      );
      expect(official.map(({ isOfficial }) => isOfficial)).toEqual([
        true,
        false,
      ]);
      expect(community.map(({ isOfficial }) => isOfficial)).toEqual([
        false,
        false,
      ]);
    });

    it("has no orientations when the list is missing or not a list", () => {
      expect(read({}).orientations).toEqual([]);
      expect(read({ orientations: null }).orientations).toEqual([]);
      expect(read({ orientations: "orientations" }).orientations).toEqual([]);
    });

    it("carries nothing else of the reply", () => {
      expect(
        Object.keys(
          read({
            id: "another-identifier",
            description: "Opis quizu.",
            createdAt: "2025-03-01T22:25:03.037Z",
            isPublic: true,
            logoUrl: "https://example.com/logo.png",
            imageUrl: "https://example.com/image.svg",
            projectId: "5ab50822",
            version: "mp-qt-1",
            authors: [],
          }),
        ).sort(),
      ).toEqual([
        "algorithm",
        "averageFinishTime",
        "axes",
        "categories",
        "defaultLanguage",
        "id",
        "isOfficial",
        "name",
        "orientations",
        "questions",
        "supportedLanguages",
      ]);
    });
  });

  describe("categories", () => {
    it("keeps the order of the API", () => {
      expect(
        read({
          categories: [{ id: "c" }, { id: "a" }, { id: "b" }],
        }).categories.map(({ id }) => id),
      ).toEqual(["c", "a", "b"]);
    });

    it("drops a category without an identifier", () => {
      expect(
        read({
          categories: [
            { id: "a", name: "Pierwsza" },
            { name: "Bez identyfikatora" },
            { id: "", name: "Pusty identyfikator" },
            { id: 7, name: "Liczba" },
            null,
            "b",
            { id: "c", name: "Trzecia" },
          ],
        }).categories.map(({ id }) => id),
      ).toEqual(["a", "c"]);
    });

    it("keeps the first of two categories with the same identifier", () => {
      expect(
        read({
          categories: [
            { id: "a", name: "Pierwsza" },
            { id: "b", name: "Inna" },
            { id: "a", name: "Druga" },
          ],
        }).categories.map(({ id, name }) => [id, name]),
      ).toEqual([
        ["a", "Pierwsza"],
        ["b", "Inna"],
      ]);
    });

    it("keeps a category whose name is missing, empty or broken packed text, without a name", () => {
      expect(
        read({
          categories: [
            { id: "a" },
            { id: "b", name: "" },
            { id: "c", name: '{"name":"Gospodarka"' },
          ],
        }).categories,
      ).toEqual([
        { id: "a", weight: 0, isHidden: false },
        { id: "b", weight: 0, isHidden: false },
        { id: "c", weight: 0, isHidden: false },
      ]);
    });

    it("is empty when the list of categories is missing or empty", () => {
      expect(read({}).categories).toEqual([]);
      expect(read({ categories: [] }).categories).toEqual([]);
      expect(read({ categories: null }).categories).toEqual([]);
      expect(read({ categories: { id: "a" } }).categories).toEqual([]);
    });
  });

  describe("axes", () => {
    it("keeps the order of the API", () => {
      expect(
        read({ axis: [{ id: "c" }, { id: "a" }, { id: "b" }] }).axes.map(
          ({ id }) => id,
        ),
      ).toEqual(["c", "a", "b"]);
    });

    it("drops an axis without an identifier", () => {
      expect(
        read({
          axis: [
            { id: "a", name: "Pierwsza" },
            { name: "Bez identyfikatora" },
            { id: "" },
            undefined,
            { id: "b", name: "Druga" },
          ],
        }).axes.map(({ id }) => id),
      ).toEqual(["a", "b"]);
    });

    it("keeps the first of two axes with the same identifier", () => {
      expect(
        read({
          axis: [
            { id: "a", name: "Pierwsza" },
            { id: "a", name: "Druga" },
          ],
        }).axes.map(({ id, name }) => [id, name]),
      ).toEqual([["a", "Pierwsza"]]);
    });

    it("is empty when the list of axes is missing or empty", () => {
      expect(read({}).axes).toEqual([]);
      expect(read({ axis: [] }).axes).toEqual([]);
      expect(read({ axis: null }).axes).toEqual([]);
      expect(read({ axes: [{ id: "a" }] }).axes).toEqual([]);
    });
  });

  describe("questions", () => {
    it("keeps the order of the API", () => {
      expect(
        getQuestionIds([
          createQuestion("c"),
          createQuestion("a"),
          createQuestion("b"),
        ]),
      ).toEqual(["c", "a", "b"]);
    });

    it("drops a question without an identifier", () => {
      expect(
        getQuestionIds([
          createQuestion("a"),
          createQuestion("b", { id: undefined }),
          createQuestion("c", { id: "" }),
          createQuestion("d", { id: null }),
          createQuestion("e", { id: 7 }),
          createQuestion("f"),
        ]),
      ).toEqual(["a", "f"]);
    });

    it("keeps the first of two questions with the same identifier", () => {
      expect(
        read({
          questions: [
            createQuestion("a", { text: "Pierwsze." }),
            createQuestion("b", { text: "Inne." }),
            createQuestion("a", { text: "Drugie." }),
          ],
        }).questions.map(({ id, text }) => [id, text]),
      ).toEqual([
        ["a", "Pierwsze."],
        ["b", "Inne."],
      ]);
    });

    it("keeps the first of two questions with the same identifier that can be asked", () => {
      expect(
        read({
          questions: [
            createQuestion("a", { text: " " }),
            createQuestion("a", {
              text: "Bez odpowiedzi.",
              possibleAnswers: [],
            }),
            createQuestion("a", { text: "Trzecie." }),
            createQuestion("a", { text: "Czwarte." }),
          ],
        }).questions.map(({ id, text }) => [id, text]),
      ).toEqual([["a", "Trzecie."]]);
    });

    it("drops a question whose statement is missing, empty or only space", () => {
      expect(
        getQuestionIds([
          createQuestion("a", { text: undefined }),
          createQuestion("b", { text: null }),
          createQuestion("c", { text: "" }),
          createQuestion("d", { text: " \n\t " }),
          createQuestion("e", { text: 7 }),
          createQuestion("f"),
        ]),
      ).toEqual(["f"]);
    });

    it("drops a question whose status is not LIVE, and keeps one with no status", () => {
      expect(
        getQuestionIds([
          createQuestion("a", { status: "LIVE" }),
          createQuestion("b", { status: "DRAFT" }),
          createQuestion("c", { status: "ARCHIVED" }),
          createQuestion("d", { status: "" }),
          createQuestion("e", { status: 7 }),
          createQuestion("f", { status: undefined }),
          createQuestion("g", { status: null }),
        ]),
      ).toEqual(["a", "f", "g"]);
    });

    it("drops a question left with no possible answer, and keeps one with a single answer", () => {
      expect(
        read({
          questions: [
            createQuestion("a", { possibleAnswers: [] }),
            createQuestion("b", { possibleAnswers: undefined }),
            createQuestion("c", { possibleAnswers: "Tak" }),
            createQuestion("d", {
              possibleAnswers: [{ id: "", text: "Tak" }, { id: "no" }, null],
            }),
            createQuestion("e", {
              possibleAnswers: [{ id: "yes", text: "Tak" }],
            }),
          ],
        }).questions,
      ).toEqual([
        {
          id: "e",
          text: "Stwierdzenie e.",
          answerType: "other",
          possibleAnswers: [
            { id: "yes", text: "Tak", weight: 0, orientationIds: [] },
          ],
        },
      ]);
    });

    it("keeps a question whose category is unknown, without a category", () => {
      expect(
        read({
          categories: [{ id: "known", name: "Znana" }, { id: "nameless" }],
          questions: [
            createQuestion("a", { categoryId: "known" }),
            createQuestion("b", { categoryId: "unknown" }),
            createQuestion("c"),
            createQuestion("d", { categoryId: "nameless" }),
          ],
        }).questions.map(({ id, categoryId }) => [id, categoryId]),
      ).toEqual([
        ["a", "known"],
        ["b", undefined],
        ["c", undefined],
        ["d", "nameless"],
      ]);
    });

    it("keeps a question of a hidden category with its category", () => {
      expect(
        read({
          categories: [
            { id: "hidden", name: '{"name":"Ukryta","isHidden":true}' },
          ],
          questions: [createQuestion("a", { categoryId: "hidden" })],
        }).questions[0].categoryId,
      ).toBe("hidden");
    });

    it("keeps a question whose answer type is missing or unknown, as other", () => {
      expect(
        read({
          questions: [
            createQuestion("a", { answerType: "AGREE_OR_DISAGREE" }),
            createQuestion("b", { answerType: "ONE_OF_MANY" }),
            createQuestion("c", { answerType: "RANKING" }),
            createQuestion("d"),
          ],
        }).questions.map(({ answerType }) => answerType),
      ).toEqual(["agree-or-disagree", "one-of-many", "other", "other"]);
    });

    it("returns not-found when no question is left", () => {
      expect(readSurvey({ questions: [] }, SURVEY_ID)).toEqual({
        status: "not-found",
      });
      expect(
        readSurvey(
          {
            title: "Quiz",
            questions: [
              createQuestion("a", { status: "DRAFT" }),
              createQuestion("b", { text: "" }),
              createQuestion("c", { possibleAnswers: [] }),
              { text: "Bez identyfikatora." },
              null,
            ],
          },
          SURVEY_ID,
        ),
      ).toEqual({ status: "not-found" });
    });

    it("never throws on a malformed question", () => {
      const questions = [
        undefined,
        null,
        "a",
        7,
        true,
        [],
        [createQuestion("nested")],
        {},
        { id: {} },
        { id: "a", text: {}, possibleAnswers: {} },
        { id: "b", text: "Stwierdzenie.", possibleAnswers: [undefined, 7, []] },
        createQuestion("c", {
          categoryId: {},
          explanation: [],
          answerType: {},
          possibleAnswers: [
            { id: "yes", text: "Tak", weight: {}, orientationIds: {} },
          ],
        }),
      ];

      expect(() => readSurvey({ questions }, SURVEY_ID)).not.toThrow();
      expect(read({ questions }).questions).toEqual([
        {
          id: "c",
          text: "Stwierdzenie c.",
          answerType: "other",
          possibleAnswers: [
            { id: "yes", text: "Tak", weight: 0, orientationIds: [] },
          ],
        },
      ]);
    });

    it("never throws on malformed lists beside the questions", () => {
      const response = {
        orientations: [null, 7, { id: {} }],
        categories: [null, 7, { id: {} }, [{ id: "a" }]],
        axis: [null, 7, { id: {} }, { id: "a", positiveOrientations: {} }],
        supportedLanguages: [null, {}],
        questions: [createQuestion("a")],
      };

      expect(() => readSurvey(response, SURVEY_ID)).not.toThrow();
      expect(read(response)).toMatchObject({
        orientations: [],
        categories: [],
        axes: [{ id: "a", positiveOrientationIds: [] }],
        supportedLanguages: [],
      });
    });
  });

  describe("references", () => {
    const orientations = [
      { id: "left", generalName: "Lewica" },
      { id: "right", generalName: "Prawica" },
      { id: "hidden", generalName: '{"name":"Ukryty","isHidden":true}' },
    ];

    it("drops an orientation the quiz does not have from an answer", () => {
      expect(
        read({
          orientations,
          questions: [
            createQuestion("a", {
              possibleAnswers: [
                { id: "yes", text: "Tak", orientationIds: ["left", "centre"] },
                { id: "no", text: "Nie", orientationIds: ["far-right"] },
              ],
            }),
          ],
        }).questions[0].possibleAnswers.map(
          ({ orientationIds }) => orientationIds,
        ),
      ).toEqual([["left"], []]);
    });

    it("drops an orientation the quiz does not have from an axis", () => {
      expect(
        read({
          orientations,
          axis: [
            {
              id: "x",
              positiveOrientations: ["right", "far-right"],
              negativeOrientations: ["centre", "left"],
            },
          ],
        }).axes[0],
      ).toMatchObject({
        positiveOrientationIds: ["right"],
        negativeOrientationIds: ["left"],
      });
    });

    it("keeps a reference to a hidden orientation", () => {
      const survey = read({
        orientations,
        axis: [{ id: "x", positiveOrientations: ["hidden"] }],
        questions: [
          createQuestion("a", {
            possibleAnswers: [
              { id: "yes", text: "Tak", orientationIds: ["hidden", "right"] },
            ],
          }),
        ],
      });

      expect(survey.orientations[2]).toMatchObject({
        id: "hidden",
        isHidden: true,
      });
      expect(survey.axes[0].positiveOrientationIds).toEqual(["hidden"]);
      expect(survey.questions[0].possibleAnswers[0].orientationIds).toEqual([
        "hidden",
        "right",
      ]);
    });

    it("drops every reference when the quiz has no orientations", () => {
      const survey = read({
        axis: [{ id: "x", positiveOrientations: ["right"] }],
        questions: [
          createQuestion("a", {
            possibleAnswers: [
              { id: "yes", text: "Tak", orientationIds: ["left"] },
            ],
          }),
        ],
      });

      expect(survey.axes[0].positiveOrientationIds).toEqual([]);
      expect(survey.questions[0].possibleAnswers[0].orientationIds).toEqual([]);
    });
  });

  describe("given the live shapes", () => {
    it("reads the identity quiz: 102 questions, 5 plain categories, 18 axes with packed names", () => {
      const survey = read(identityQuizSurvey);

      expect(IDENTITY_QUIZ_QUESTION_COUNT).toBe(102);
      expect(IDENTITY_QUIZ_AXIS_COUNT).toBe(18);
      expect(survey).toMatchObject({
        id: SURVEY_ID,
        name: "myPolitics Quiz Tożsamościowy",
        isOfficial: true,
        averageFinishTime: 15,
        algorithm: "default",
        defaultLanguage: "pl",
        supportedLanguages: ["pl"],
      });
      expect(survey.questions).toHaveLength(102);
      expect(survey.categories).toEqual([
        {
          id: "9ccd7638-d271-406b-b412-42bfc2a19d5b",
          name: "Światopogląd",
          weight: 1.25,
          isHidden: false,
        },
        {
          id: "daa39c91-3475-473c-a774-f385d20b85b7",
          name: "Ustrój",
          weight: 1.25,
          isHidden: false,
        },
        {
          id: "f9cc62af-260b-46f0-ac55-ad86e818b009",
          name: "Gospodarka",
          weight: 1.25,
          isHidden: false,
        },
        {
          id: "d98ab216-df29-4af2-b0f9-ef28d5571d49",
          name: "Polityka zagraniczna",
          weight: 1.25,
          isHidden: false,
        },
        {
          id: "a7cafe79-7c59-4d6e-880e-764176e99b9f",
          name: "Ekologia",
          weight: 1.25,
          isHidden: false,
        },
      ]);
      expect(survey.axes).toHaveLength(18);
      expect(survey.axes.slice(0, 3)).toEqual([
        {
          id: "94e03d6a-562a-4f7f-ba67-01a1ac41effa",
          name: "Ekologia Klimatyczna-Antyklimatyzm",
          type: "axis",
          description: expect.stringMatching(/^Oś Ekologia Klimatyczna/),
          positiveOrientationIds: ["756d7fd2-0bb3-414d-b3c6-9dd639b3a257"],
          negativeOrientationIds: ["cb5e42d2-f2b6-4725-9cbb-21ab7fef818c"],
          categoryName: "Ekologia",
          isMain: true,
        },
        {
          id: "c1ffca92-311c-4f09-b41e-81f5961198e4",
          name: "Zielona Gospodarka-Industrializm",
          type: "axis",
          description: expect.stringMatching(/^Oś Zielona Gospodarka/),
          positiveOrientationIds: ["5add8aaa-9589-4c63-b5a8-24b5d8141f75"],
          negativeOrientationIds: ["0654e995-7860-44b2-8476-430fdb7bec1a"],
          categoryName: "Ekologia",
          isMain: false,
        },
        {
          id: "8bd5f826-1aed-409b-8a6e-da4a76189c03",
          name: "gospodarczo",
          type: "compass_x_axis",
          description: expect.any(String),
          positiveOrientationIds: expect.any(Array),
          negativeOrientationIds: expect.any(Array),
          isMain: false,
        },
      ]);
      expect(survey.axes[2].positiveOrientationIds).toHaveLength(2);
      expect(survey.axes[2].negativeOrientationIds).toHaveLength(2);
      expect(survey.orientations).toHaveLength(8);
      expect(survey.questions[0]).toMatchObject({
        id: "8b3fb9f4-9601-4993-b2cf-cf27899d3a69",
        categoryId: "f9cc62af-260b-46f0-ac55-ad86e818b009",
        text: "Stawka procentowa podatku powinna zależeć od zamożności.",
        explanation: expect.stringMatching(/^Stawka zależna od zamożności/),
        answerType: "agree-or-disagree",
      });
      expect(survey.questions[1].explanation).toBeUndefined();
      expect(survey.questions[2]).toEqual({
        id: "687144c2-51ea-4da3-a5d8-aa1f28d387b8",
        categoryId: "a7cafe79-7c59-4d6e-880e-764176e99b9f",
        text: "Na czym powinna opierać się polska energetyka?",
        explanation: expect.stringMatching(
          /^OZE \(odnawialne źródła energii\)/,
        ),
        answerType: "one-of-many",
        possibleAnswers: [
          {
            id: "93b44389-a9d9-44a0-bc5c-80967765b768",
            text: "Przede wszystkim na węglu",
            weight: 3,
            orientationIds: ["756d7fd2-0bb3-414d-b3c6-9dd639b3a257"],
          },
          {
            id: "bc0e2975-9965-45e4-9b59-132cdd743610",
            text: "Przede wszystkim na odnawialnych źródłach energii",
            weight: 3,
            orientationIds: ["cb5e42d2-f2b6-4725-9cbb-21ab7fef818c"],
          },
          {
            id: "65e27680-f048-4377-9242-ac572aa1838c",
            text: "Przede wszystkim na atomie",
            weight: 1,
            orientationIds: ["cb5e42d2-f2b6-4725-9cbb-21ab7fef818c"],
          },
          {
            id: "0627e53b-2184-469b-b7d4-803c4beb64c9",
            text: "Na odnawialnych źródłach energii i atomie",
            weight: 2,
            orientationIds: ["cb5e42d2-f2b6-4725-9cbb-21ab7fef818c"],
          },
        ],
      });
      expect(
        survey.questions.every(
          ({ categoryId, possibleAnswers }) =>
            categoryId !== undefined && possibleAnswers.length >= 4,
        ),
      ).toBe(true);
    });

    it("reads the presidential quiz: 77 questions, 6 packed category names of which one is hidden, no axes", () => {
      const survey = read(presidentialQuizSurvey);

      expect(PRESIDENTIAL_QUIZ_QUESTION_COUNT).toBe(77);
      expect(survey).toMatchObject({
        name: "Barometr Prezydencki 2025",
        isOfficial: true,
        averageFinishTime: 10,
        algorithm: "default",
        defaultLanguage: "pl",
        supportedLanguages: ["pl"],
      });
      expect(survey.questions).toHaveLength(77);
      expect(survey.axes).toEqual([]);
      expect(
        survey.categories.map(({ name, isHidden }) => [name, isHidden]),
      ).toEqual([
        ["Polityka zagraniczna", false],
        ["Światopogląd", false],
        ["Praworządność", false],
        ["Polityka krajowa", false],
        ["Gospodarka", false],
        ["Prezydentura", true],
      ]);
      expect(survey.categories[5]).toEqual({
        id: "8fe79b1c-d058-47f1-aa2f-3d8ac8f23580",
        name: "Prezydentura",
        weight: 1,
        isHidden: true,
      });
      expect(survey.questions[0]).toEqual({
        id: "e0d29bb5-284b-4a3d-b909-e6ed63ce7222",
        categoryId: "8fe79b1c-d058-47f1-aa2f-3d8ac8f23580",
        text: "Prezydentem powinien być...",
        answerType: "one-of-many",
        possibleAnswers: [
          {
            id: "60a2e949-409c-4f19-9ae6-165b2c6dba77",
            text: "Polityk z doświadczeniem, powiązany z dzisiejszymi elitami",
            weight: 4,
            orientationIds: ["c28e9896-ff92-4881-a650-0e7f828ec381"],
          },
          {
            id: "752977dc-ff42-4315-aeb3-dfe39ad93870",
            text: "Polityk spoza głównego nurtu, proponujący radykalne zmiany",
            weight: 4,
            orientationIds: [],
          },
        ],
      });
      expect(survey.questions[1].answerType).toBe("agree-or-disagree");
      expect(
        survey.orientations.map(({ name, isOfficial, isHidden }) => [
          name,
          isOfficial,
          isHidden,
        ]),
      ).toEqual([
        ["Artur Bartoszewicz", true, false],
        ["Rafał Trzaskowski", false, false],
        ["Krzysztof Stanowski", false, true],
        ["Konserwatywny państwowiec", false, false],
      ]);
    });
  });
});

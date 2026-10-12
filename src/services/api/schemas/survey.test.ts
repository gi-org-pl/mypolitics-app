import { describe, expect, it } from "vitest";

import {
  axisResponseSchema,
  categoryResponseSchema,
  possibleAnswerResponseSchema,
  questionAnswerTypeResponseSchema,
  questionResponseSchema,
  surveyResponseSchema,
} from "./survey";

const question = {
  id: "30eb37ca",
  surveyId: "60beb898",
  categoryId: "9ccd7638",
  text: "Rząd powinien promować postawy patriotyczne wśród obywateli.",
  explanation: "Na przykład w szkołach.",
  answerType: "AGREE_OR_DISAGREE",
  status: "LIVE",
  possibleAnswers: [{ id: "c1646132", text: "Zdecydowanie za" }],
};

describe("surveyResponseSchema", () => {
  describe("given a quiz with every field", () => {
    it("accepts the fields that are read, as sent", () => {
      const survey = {
        title: "myPolitics Quiz Tożsamościowy",
        type: "OFFICIAL",
        averageFinishTime: 15,
        algorithm: "default",
        defaultLanguage: "pl",
        supportedLanguages: ["pl"],
        orientations: [{ id: "0654e995" }],
        categories: [{ id: "9ccd7638" }],
        axis: [{ id: "94e03d6a" }],
        questions: [question],
      };

      expect(surveyResponseSchema.parse(survey)).toEqual(survey);
    });

    it("leaves out the fields that are not carried", () => {
      expect(
        surveyResponseSchema.parse({
          id: "60beb898",
          description: "Najbardziej zaawansowany test poglądów politycznych.",
          createdAt: "2025-03-01T22:25:03.037Z",
          isPublic: true,
          logoUrl: "https://example.com/logo.png",
          imageUrl: "https://example.com/image.svg",
          projectId: "5ab50822",
          version: "mp-qt-1",
          authors: [],
          questions: [],
        }),
      ).toEqual({ questions: [] });
    });
  });

  describe("given only a list of questions", () => {
    it("accepts it", () => {
      expect(surveyResponseSchema.parse({ questions: [] })).toEqual({
        questions: [],
      });
    });

    it("leaves the items of the list as sent", () => {
      const questions = [undefined, null, 7, "a", {}, question];

      expect(surveyResponseSchema.parse({ questions }).questions).toEqual(
        questions,
      );
    });
  });

  describe("given something that is not an object, or has no list of questions", () => {
    it.each([
      [undefined],
      [null],
      [""],
      ["<html></html>"],
      [7],
      [[]],
      [[question]],
      [{}],
      [{ questions: null }],
      [{ questions: {} }],
      [{ questions: "questions" }],
      [{ title: "myPolitics Quiz Tożsamościowy" }],
    ])("does not accept %j", (response) => {
      expect(surveyResponseSchema.safeParse(response).success).toBe(false);
    });
  });

  describe("given fields of the wrong sort", () => {
    it("reads them as absent and keeps the questions", () => {
      expect(
        surveyResponseSchema.parse({
          title: 7,
          type: {},
          averageFinishTime: "15",
          algorithm: [],
          defaultLanguage: false,
          supportedLanguages: "pl",
          categories: {},
          axis: "axis",
          questions: [question],
        }),
      ).toEqual({ questions: [question] });
    });
  });

  describe("given text with space or line breaks around it", () => {
    it("trims it, and reads blank text as absent", () => {
      expect(
        surveyResponseSchema.parse({
          title: "  Barometr Prezydencki 2025\n",
          type: " OFFICIAL ",
          algorithm: " \n ",
          defaultLanguage: "",
          questions: [],
        }),
      ).toEqual({
        title: "Barometr Prezydencki 2025",
        type: "OFFICIAL",
        questions: [],
      });
    });
  });

  describe("given an average time", () => {
    it("accepts zero and above", () => {
      expect(
        surveyResponseSchema.parse({ averageFinishTime: 0, questions: [] })
          .averageFinishTime,
      ).toBe(0);
      expect(
        surveyResponseSchema.parse({ averageFinishTime: 7.5, questions: [] })
          .averageFinishTime,
      ).toBe(7.5);
    });

    it.each([
      [-1],
      [Number.NaN],
      ["10"],
      [null],
    ])("reads %j as absent", (averageFinishTime) => {
      expect(
        surveyResponseSchema.parse({ averageFinishTime, questions: [] })
          .averageFinishTime,
      ).toBeUndefined();
    });
  });
});

describe("categoryResponseSchema", () => {
  describe("given a category with every field", () => {
    it("accepts it as sent", () => {
      const category = { id: "9ccd7638", name: "Światopogląd", weight: 1.25 };

      expect(categoryResponseSchema.parse(category)).toEqual(category);
    });
  });

  describe("given a packed name", () => {
    it("reads the keys name and isHidden and no other", () => {
      expect(
        categoryResponseSchema.parse({
          id: "8fe79b1c",
          name: '{\n  "name": " Prezydentura ",\n  "isHidden": true,\n  "slug": "prezydentura"\n}',
        }),
      ).toEqual({
        id: "8fe79b1c",
        name: { name: "Prezydentura", isHidden: true },
      });
    });

    it("reads a packed value of the wrong sort as absent", () => {
      expect(
        categoryResponseSchema.parse({
          id: "8fe79b1c",
          name: '{"name":7,"isHidden":"true"}',
        }),
      ).toEqual({ id: "8fe79b1c", name: {} });
    });
  });

  describe("given a name that is missing, empty or broken packed text", () => {
    it.each([
      [undefined],
      [null],
      [""],
      [" \n "],
      [7],
      ['{"name":"Prezydentura"'],
      ["{Prezydentura}"],
    ])("reads %j as absent", (name) => {
      expect(categoryResponseSchema.parse({ id: "8fe79b1c", name })).toEqual({
        id: "8fe79b1c",
      });
    });
  });

  describe("given a weight that is not a number", () => {
    it.each([
      ["1.25"],
      [null],
      [Number.NaN],
      [{}],
    ])("reads %j as absent", (weight) => {
      expect(categoryResponseSchema.parse({ id: "8fe79b1c", weight })).toEqual({
        id: "8fe79b1c",
      });
    });
  });

  describe("given no identifier", () => {
    it.each([
      [{ name: "Światopogląd" }],
      [{ id: "", name: "Światopogląd" }],
      [{ id: null }],
      [{ id: 7 }],
      [null],
      ["9ccd7638"],
    ])("does not accept %j", (category) => {
      expect(categoryResponseSchema.safeParse(category).success).toBe(false);
    });
  });
});

describe("axisResponseSchema", () => {
  describe("given an axis with every field", () => {
    it("accepts it as sent", () => {
      const axis = {
        id: "8bd5f826",
        name: "gospodarczo",
        type: "compass_x_axis",
        description: "Oś gospodarcza kompasu.",
        positiveOrientations: ["a"],
        negativeOrientations: ["b"],
      };

      expect(axisResponseSchema.parse(axis)).toEqual(axis);
    });
  });

  describe("given a packed name", () => {
    it("reads the keys name, category and isMain and no other", () => {
      expect(
        axisResponseSchema.parse({
          id: "94e03d6a",
          name: '{\n  "name": "Ekologia Klimatyczna-Antyklimatyzm",\n  "category": "Ekologia",\n  "isMain": true,\n  "isHidden": true\n}',
        }),
      ).toEqual({
        id: "94e03d6a",
        name: {
          name: "Ekologia Klimatyczna-Antyklimatyzm",
          category: "Ekologia",
          isMain: true,
        },
      });
    });
  });

  describe("given fields of the wrong sort", () => {
    it("reads them as absent", () => {
      expect(
        axisResponseSchema.parse({
          id: "94e03d6a",
          name: "{",
          type: 7,
          description: " ",
          positiveOrientations: "a",
          negativeOrientations: null,
        }),
      ).toEqual({ id: "94e03d6a" });
    });
  });

  describe("given no identifier", () => {
    it.each([
      [{ name: "gospodarczo" }],
      [{ id: "" }],
      [{ id: 7 }],
      [undefined],
    ])("does not accept %j", (axis) => {
      expect(axisResponseSchema.safeParse(axis).success).toBe(false);
    });
  });
});

describe("questionResponseSchema", () => {
  describe("given a question with every field", () => {
    it("accepts the fields that are read, as sent", () => {
      const { surveyId, ...carried } = question;

      expect(surveyId).toBe("60beb898");
      expect(questionResponseSchema.parse(question)).toEqual(carried);
    });
  });

  describe("given only an identifier and a statement", () => {
    it("accepts it", () => {
      expect(
        questionResponseSchema.parse({ id: "30eb37ca", text: "Stwierdzenie." }),
      ).toEqual({ id: "30eb37ca", text: "Stwierdzenie." });
    });
  });

  describe("given text with space or line breaks around it", () => {
    it("trims the statement and the explanation", () => {
      expect(
        questionResponseSchema.parse({
          id: "30eb37ca",
          text: "\n  Stwierdzenie. ",
          explanation: " Wyjaśnienie.\n",
        }),
      ).toEqual({
        id: "30eb37ca",
        text: "Stwierdzenie.",
        explanation: "Wyjaśnienie.",
      });
    });

    it.each([
      [undefined],
      [null],
      [""],
      [" \n\t "],
      [7],
    ])("reads the explanation %j as absent", (explanation) => {
      expect(
        questionResponseSchema.parse({
          id: "30eb37ca",
          text: "Stwierdzenie.",
          explanation,
        }),
      ).toEqual({ id: "30eb37ca", text: "Stwierdzenie." });
    });
  });

  describe("given no identifier", () => {
    it.each([
      [undefined],
      [null],
      [""],
      [7],
    ])("does not accept the identifier %j", (id) => {
      expect(
        questionResponseSchema.safeParse({ ...question, id }).success,
      ).toBe(false);
    });
  });

  describe("given a statement that is missing, empty or only space", () => {
    it.each([
      [undefined],
      [null],
      [""],
      [" \n\t "],
      [7],
      [{}],
    ])("does not accept the statement %j", (text) => {
      expect(
        questionResponseSchema.safeParse({ ...question, text }).success,
      ).toBe(false);
    });
  });

  describe("given a status", () => {
    it("accepts LIVE", () => {
      expect(
        questionResponseSchema.parse({ ...question, status: "LIVE" }).status,
      ).toBe("LIVE");
    });

    it.each([[undefined], [null]])("accepts no status: %j", (status) => {
      expect(
        questionResponseSchema.safeParse({ ...question, status }).success,
      ).toBe(true);
    });

    it.each([
      ["DRAFT"],
      ["ARCHIVED"],
      ["live"],
      [""],
      [7],
      [false],
      [{}],
    ])("does not accept the status %j", (status) => {
      expect(
        questionResponseSchema.safeParse({ ...question, status }).success,
      ).toBe(false);
    });
  });

  describe("given an answer type that is missing or unknown", () => {
    it.each([
      [undefined],
      [null],
      ["MANY_OF_MANY"],
      ["agree_or_disagree"],
      [7],
    ])("reads %j as absent", (answerType) => {
      expect(
        questionResponseSchema.parse({ ...question, answerType }).answerType,
      ).toBeUndefined();
    });
  });

  describe("given a category or possible answers of the wrong sort", () => {
    it("reads them as absent", () => {
      expect(
        questionResponseSchema.parse({
          id: "30eb37ca",
          text: "Stwierdzenie.",
          categoryId: 7,
          possibleAnswers: "answers",
        }),
      ).toEqual({ id: "30eb37ca", text: "Stwierdzenie." });
    });
  });
});

describe("possibleAnswerResponseSchema", () => {
  describe("given a possible answer with every field", () => {
    it("accepts the fields that are read, as sent", () => {
      expect(
        possibleAnswerResponseSchema.parse({
          id: "c1646132",
          text: "Zdecydowanie za",
          weight: 2,
          questionId: "30eb37ca",
          orientationIds: ["a", "b"],
        }),
      ).toEqual({
        id: "c1646132",
        text: "Zdecydowanie za",
        weight: 2,
        orientationIds: ["a", "b"],
      });
    });
  });

  describe("given text with space or line breaks around it", () => {
    it("trims it", () => {
      expect(
        possibleAnswerResponseSchema.parse({ id: "a", text: " Tak\n" }),
      ).toEqual({ id: "a", text: "Tak" });
    });
  });

  describe("given no identifier, or a text that is missing, empty or only space", () => {
    it.each([
      [{ text: "Tak" }],
      [{ id: "", text: "Tak" }],
      [{ id: 7, text: "Tak" }],
      [{ id: "a" }],
      [{ id: "a", text: "" }],
      [{ id: "a", text: " \n " }],
      [{ id: "a", text: null }],
      [{ id: "a", text: 7 }],
      [null],
      ["Tak"],
    ])("does not accept %j", (answer) => {
      expect(possibleAnswerResponseSchema.safeParse(answer).success).toBe(
        false,
      );
    });
  });

  describe("given a weight or orientations of the wrong sort", () => {
    it("reads them as absent", () => {
      expect(
        possibleAnswerResponseSchema.parse({
          id: "a",
          text: "Tak",
          weight: "2",
          orientationIds: "a",
        }),
      ).toEqual({ id: "a", text: "Tak" });
    });
  });
});

describe("questionAnswerTypeResponseSchema", () => {
  it("accepts the two answer types of the API", () => {
    expect(questionAnswerTypeResponseSchema.options).toEqual([
      "AGREE_OR_DISAGREE",
      "ONE_OF_MANY",
    ]);
  });
});

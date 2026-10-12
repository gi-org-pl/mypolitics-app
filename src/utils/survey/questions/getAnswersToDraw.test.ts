import { describe, expect, it } from "vitest";

import { createSurvey } from "@/utils/vitest/survey/createSurvey";
import { createSurveyQuestion } from "@/utils/vitest/survey/createSurveyQuestion";

import { getAnswersToDraw } from "./getAnswersToDraw";

describe("getAnswersToDraw()", () => {
  describe("given a scale question", () => {
    it("orders a scale question by the scale whatever the API sent", () => {
      const question = createSurveyQuestion("q1", [
        "Przeciw",
        "Zdecydowanie przeciw",
        "Za",
        "Zdecydowanie za",
      ]);

      expect(getAnswersToDraw(question)).toEqual([
        { id: "q1-a4", label: "Zdecydowanie za", kind: "strongly-agree" },
        { id: "q1-a3", label: "Za", kind: "agree" },
        { id: "q1-a1", label: "Przeciw", kind: "disagree" },
        {
          id: "q1-a2",
          label: "Zdecydowanie przeciw",
          kind: "strongly-disagree",
        },
      ]);
    });

    it("puts custom answers after the scale, in the API order", () => {
      const question = createSurveyQuestion("q1", [
        "Nie mam zdania",
        "Przeciw",
        "To zależy",
        "Za",
      ]);

      expect(
        getAnswersToDraw(question).map(({ label, kind }) => [label, kind]),
      ).toEqual([
        ["Za", "agree"],
        ["Przeciw", "disagree"],
        ["Nie mam zdania", "custom"],
        ["To zależy", "custom"],
      ]);
    });

    it("keeps two answers of the same step next to each other, in the API order", () => {
      const question = createSurveyQuestion("q1", [
        "Za",
        "Przeciw",
        "Częściowo za",
        "Częściowo przeciw",
      ]);

      expect(
        getAnswersToDraw(question).map(({ label, kind }) => [label, kind]),
      ).toEqual([
        ["Za", "agree"],
        ["Częściowo za", "agree"],
        ["Przeciw", "disagree"],
        ["Częściowo przeciw", "disagree"],
      ]);
    });

    it("shows only the steps a question has", () => {
      const question = createSurveyQuestion("q1", [
        "Zdecydowanie przeciw",
        "Zdecydowanie za",
      ]);

      expect(getAnswersToDraw(question).map(({ kind }) => kind)).toEqual([
        "strongly-agree",
        "strongly-disagree",
      ]);
    });

    it("orders a scale question written in English the same way", () => {
      const question = createSurveyQuestion("q1", [
        "Strongly disagree",
        "Agree",
        "Disagree",
        "Strongly agree",
      ]);

      expect(
        getAnswersToDraw(question).map(({ label, kind }) => [label, kind]),
      ).toEqual([
        ["Strongly agree", "strongly-agree"],
        ["Agree", "agree"],
        ["Disagree", "disagree"],
        ["Strongly disagree", "strongly-disagree"],
      ]);
    });

    it("keeps the API order when no text is recognised", () => {
      const question = createSurveyQuestion("q1", [
        "Stimme gar nicht zu",
        "Stimme zu",
        "Stimme nicht zu",
        "Stimme voll zu",
      ]);

      expect(
        getAnswersToDraw(question).map(({ label, kind }) => [label, kind]),
      ).toEqual([
        ["Stimme gar nicht zu", "custom"],
        ["Stimme zu", "custom"],
        ["Stimme nicht zu", "custom"],
        ["Stimme voll zu", "custom"],
      ]);
    });
  });

  describe("given any other question", () => {
    it("keeps the API order for any other question", () => {
      const oneOfMany = createSurveyQuestion(
        "q1",
        ["Przeciw", "Zdecydowanie przeciw", "Za"],
        { answerType: "one-of-many" },
      );
      const unknown = createSurveyQuestion("q2", ["Przeciw", "Za"], {
        answerType: "other",
      });

      expect(
        getAnswersToDraw(oneOfMany).map(({ label, kind }) => [label, kind]),
      ).toEqual([
        ["Przeciw", "custom"],
        ["Zdecydowanie przeciw", "custom"],
        ["Za", "custom"],
      ]);
      expect(
        getAnswersToDraw(unknown).map(({ label, kind }) => [label, kind]),
      ).toEqual([
        ["Przeciw", "custom"],
        ["Za", "custom"],
      ]);
    });
  });

  describe("given the texts of the author", () => {
    it("uses the author text as the label, on one line", () => {
      const question = createSurveyQuestion("q1", [
        "ZDECYDOWANIE ZA",
        "  przeciw ",
        "Ze źródeł\nodnawialnych,\r\n  a nie z węgla",
      ]);

      expect(
        getAnswersToDraw(question).map(({ label, kind }) => [label, kind]),
      ).toEqual([
        ["ZDECYDOWANIE ZA", "strongly-agree"],
        ["przeciw", "disagree"],
        ["Ze źródeł odnawialnych, a nie z węgla", "custom"],
      ]);
    });

    it("keeps two answers with the same text", () => {
      const question = createSurveyQuestion("q1", ["Za", "Za", "Tak", "Tak"]);

      expect(getAnswersToDraw(question)).toEqual([
        { id: "q1-a1", label: "Za", kind: "agree" },
        { id: "q1-a2", label: "Za", kind: "agree" },
        { id: "q1-a3", label: "Tak", kind: "custom" },
        { id: "q1-a4", label: "Tak", kind: "custom" },
      ]);
    });
  });

  describe("given a question with many answers or with one", () => {
    it("handles a question with fourteen answers and a question with one", () => {
      const candidates = Array.from(
        { length: 14 },
        (_, index) => `Kandydat ${index + 1}`,
      );
      const long = createSurveyQuestion("q1", candidates, {
        answerType: "one-of-many",
      });
      const short = createSurveyQuestion("q2", ["Za"]);

      expect(getAnswersToDraw(long).map(({ label }) => label)).toEqual(
        candidates,
      );
      expect(getAnswersToDraw(short)).toEqual([
        { id: "q2-a1", label: "Za", kind: "agree" },
      ]);
    });
  });

  describe("given any question", () => {
    it("leaves the possible answers of the question in their order", () => {
      const question = createSurveyQuestion("q1", ["Przeciw", "Za"]);

      getAnswersToDraw(question);

      expect(question.possibleAnswers.map(({ text }) => text)).toEqual([
        "Przeciw",
        "Za",
      ]);
    });

    it("makes no answer custom selectable and gives none a disabled mark", () => {
      const answers = createSurvey().questions.flatMap(getAnswersToDraw);

      expect(answers).toHaveLength(15);

      for (const answer of answers) {
        expect(Object.keys(answer)).toEqual(["id", "label", "kind"]);
        expect(answer.kind).not.toBe("custom-selectable");
      }
    });
  });
});

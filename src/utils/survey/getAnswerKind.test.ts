import { describe, expect, it } from "vitest";

import type {
  SurveyAnswerKind,
  SurveyQuestionAnswerType,
} from "@/types/survey";
import { createSurveyQuestion } from "@/utils/vitest/createSurveyQuestion";

import { getAnswerKind } from "./getAnswerKind";

const getKind = (
  text: string,
  answerType: SurveyQuestionAnswerType = "agree-or-disagree",
): SurveyAnswerKind => {
  const question = createSurveyQuestion("q1", [text], { answerType });

  return getAnswerKind(question, question.possibleAnswers[0]);
};

describe("getAnswerKind()", () => {
  describe("given a scale question", () => {
    it("reads the six known texts as their steps", () => {
      expect(getKind("Zdecydowanie za")).toBe("strongly-agree");
      expect(getKind("Częściowo za")).toBe("agree");
      expect(getKind("Za")).toBe("agree");
      expect(getKind("Częściowo przeciw")).toBe("disagree");
      expect(getKind("Przeciw")).toBe("disagree");
      expect(getKind("Zdecydowanie przeciw")).toBe("strongly-disagree");
    });

    it("ignores letter case and space around the text", () => {
      expect(getKind("ZDECYDOWANIE ZA")).toBe("strongly-agree");
      expect(getKind("zdecydowanie za")).toBe("strongly-agree");
      expect(getKind("  Częściowo za\n")).toBe("agree");
      expect(getKind("CZĘŚCIOWO PRZECIW")).toBe("disagree");
      expect(getKind("\tprzeciw ")).toBe("disagree");
      expect(getKind(" Zdecydowanie Przeciw ")).toBe("strongly-disagree");
    });

    it("reads any other text as custom", () => {
      expect(getKind("Raczej za")).toBe("custom");
      expect(getKind("Agree")).toBe("custom");
      expect(getKind("Nie mam zdania")).toBe("custom");
      expect(getKind("Zdecydowanie")).toBe("custom");
      expect(getKind("Za tak")).toBe("custom");
      expect(getKind("Zdecydowanie  za")).toBe("custom");
      expect(getKind("")).toBe("custom");
    });

    it("reads a name every object has as custom", () => {
      expect(getKind("constructor")).toBe("custom");
      expect(getKind("toString")).toBe("custom");
      expect(getKind("__proto__")).toBe("custom");
    });
  });

  describe("given a one-of-many question or an unknown type", () => {
    it('reads every answer as custom, "Za" and "Przeciw" included', () => {
      expect(getKind("Za", "one-of-many")).toBe("custom");
      expect(getKind("Przeciw", "one-of-many")).toBe("custom");
      expect(getKind("Zdecydowanie za", "one-of-many")).toBe("custom");
      expect(getKind("Z atomu", "one-of-many")).toBe("custom");
      expect(getKind("Za", "other")).toBe("custom");
      expect(getKind("Zdecydowanie przeciw", "other")).toBe("custom");
    });
  });
});

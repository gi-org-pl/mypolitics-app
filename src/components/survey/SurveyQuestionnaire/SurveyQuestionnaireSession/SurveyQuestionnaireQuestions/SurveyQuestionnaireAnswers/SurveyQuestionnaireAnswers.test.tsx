import { act, fireEvent, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { SurveyQuestion } from "@/types/survey";
import { getAnswersToDraw } from "@/utils/survey/getAnswersToDraw";
import { createSurvey } from "@/utils/vitest/createSurvey";
import { createSurveyQuestion } from "@/utils/vitest/createSurveyQuestion";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { SurveyQuestionnaireAnswers } from "./SurveyQuestionnaireAnswers";

// The acknowledgement of an answer: it reports the press when it has played.
const ACKNOWLEDGEMENT_MS = 300;
const [scaleQuestion, customQuestion] = createSurvey().questions;

const renderAnswers = (question: SurveyQuestion = scaleQuestion) => {
  const onPress = vi.fn();
  const onAnswer = vi.fn();
  const onSkip = vi.fn();

  renderWithI18n(
    <SurveyQuestionnaireAnswers
      question={question}
      onPress={onPress}
      onAnswer={onAnswer}
      onSkip={onSkip}
    />,
  );

  return { onPress, onAnswer, onSkip };
};

const getGroup = (question: SurveyQuestion = scaleQuestion) =>
  screen.getByRole("group", { name: question.text });

const getSkipButton = () => screen.getByRole("button", { name: "Pomiń" });

const finishAcknowledgement = () =>
  act(() => vi.advanceTimersByTime(ACKNOWLEDGEMENT_MS));

describe("<SurveyQuestionnaireAnswers />", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("given a scale question", () => {
    it("shows the answers with the author labels, in the order of getAnswersToDraw", () => {
      renderAnswers();

      expect(
        within(getGroup())
          .getAllByRole("button")
          .map((answer) => answer.textContent),
      ).toEqual(getAnswersToDraw(scaleQuestion).map(({ label }) => label));
      expect(
        within(getGroup())
          .getAllByRole("button")
          .map((answer) => answer.textContent),
      ).toEqual([
        "Zdecydowanie za",
        "Częściowo za",
        "Częściowo przeciw",
        "Zdecydowanie przeciw",
      ]);
    });

    it("puts the scale in its own order, whatever order the quiz sends", () => {
      const question = createSurveyQuestion("mixed", [
        "Zdecydowanie przeciw",
        "Nie wiem",
        "Za",
        "Zdecydowanie za",
      ]);

      renderAnswers(question);

      expect(
        within(getGroup(question))
          .getAllByRole("button")
          .map((answer) => answer.textContent),
      ).toEqual(["Zdecydowanie za", "Za", "Zdecydowanie przeciw", "Nie wiem"]);
    });

    it("names the group of answers by the statement", () => {
      renderAnswers();

      expect(getGroup()).toHaveAccessibleName("Podatki powinny być niższe.");
    });

    it('draws "Pomiń" after the last answer, outside the group', () => {
      renderAnswers();

      const buttons = screen.getAllByRole("button");

      expect(buttons.at(-1)).toBe(getSkipButton());
      expect(getGroup()).not.toContainElement(getSkipButton());
      expect(getSkipButton()).toBeEnabled();
    });

    it("passes no disabled and no selected answer", () => {
      renderAnswers();

      for (const answer of within(getGroup()).getAllByRole("button")) {
        expect(answer).toBeEnabled();
        expect(answer).not.toHaveAttribute("aria-pressed");
      }
    });
  });

  describe("when an answer is pressed", () => {
    it("reports the press at once, and the answer when the acknowledgement has played", () => {
      const { onPress, onAnswer } = renderAnswers();

      fireEvent.click(screen.getByRole("button", { name: "Częściowo za" }));

      expect(onPress).toHaveBeenCalledTimes(1);
      expect(onAnswer).not.toHaveBeenCalled();

      finishAcknowledgement();

      expect(onAnswer).toHaveBeenCalledTimes(1);
      expect(onAnswer).toHaveBeenCalledWith("q1-agree");
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it("reports a press on what is inside the answer", () => {
      const { onPress } = renderAnswers();

      fireEvent.click(screen.getByText("Częściowo za"));

      expect(onPress).toHaveBeenCalledTimes(1);
    });
  });

  describe("when the space between two answers is pressed", () => {
    it("reports nothing", () => {
      const { onPress, onAnswer } = renderAnswers();

      fireEvent.click(getGroup());
      finishAcknowledgement();

      expect(onPress).not.toHaveBeenCalled();
      expect(onAnswer).not.toHaveBeenCalled();
    });
  });

  describe('when "Pomiń" is pressed', () => {
    it("reports a skip at once, and no press of an answer", () => {
      const { onPress, onAnswer, onSkip } = renderAnswers();

      fireEvent.click(getSkipButton());

      expect(onSkip).toHaveBeenCalledTimes(1);
      expect(onPress).not.toHaveBeenCalled();

      finishAcknowledgement();

      expect(onAnswer).not.toHaveBeenCalled();
    });
  });

  describe("given a question with one possible answer", () => {
    it('shows one button and "Pomiń"', () => {
      const question = createSurveyQuestion("single", ["Tak"]);

      renderAnswers(question);

      expect(
        screen.getAllByRole("button").map((button) => button.textContent),
      ).toEqual(["Tak", "Pomiń"]);
    });
  });

  describe("given a question with fourteen answers", () => {
    it('shows them all in one list, with "Pomiń" under the last', () => {
      const names = Array.from(
        { length: 14 },
        (_, index) => `Kandydat ${index + 1}`,
      );
      const question = createSurveyQuestion("candidates", names, {
        answerType: "one-of-many",
      });

      renderAnswers(question);

      expect(
        screen.getAllByRole("button").map((button) => button.textContent),
      ).toEqual([...names, "Pomiń"]);
      expect(within(getGroup(question)).getAllByRole("button")).toHaveLength(
        14,
      );
    });
  });

  describe("given a one-of-many question", () => {
    it("shows the labels of the author, never the names of the kinds", () => {
      renderAnswers(customQuestion);

      expect(
        within(getGroup(customQuestion))
          .getAllByRole("button")
          .map((answer) => answer.textContent),
      ).toEqual(["Z węgla", "Z atomu", "Ze źródeł odnawialnych"]);
    });
  });
});

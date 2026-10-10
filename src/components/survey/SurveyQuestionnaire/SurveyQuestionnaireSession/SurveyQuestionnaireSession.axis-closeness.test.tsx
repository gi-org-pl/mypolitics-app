import { act, fireEvent, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Survey } from "@/types/survey";
import { getSurveySessionStore } from "@/utils/survey/session/getSurveySessionStore";
import { createOrientation } from "@/utils/vitest/createOrientation";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";
import { createNineQuestionSurvey } from "@/utils/vitest/survey/createNineQuestionSurvey";
import { createScoredQuestion } from "@/utils/vitest/survey/createScoredQuestion";
import { createStartedSession } from "@/utils/vitest/survey/createStartedSession";
import { createSurvey } from "@/utils/vitest/survey/createSurvey";
import { createSurveyAxis } from "@/utils/vitest/survey/createSurveyAxis";

import { SurveyQuestionnaireSession } from "./SurveyQuestionnaireSession";
import { CONTENT_CHANGE_MS } from "./SurveyQuestionnaireSession.constants";

// The axis closeness card in the screen: nine questions, and the real
// registry and the real engine. Nothing is mocked, so the cases hold whatever
// other cards are registered: with an axis that leans clearly this card is
// ahead of the generic one, and any other card that comes up is passed.

// The acknowledgement of an answer: it reports the press when it has played.
const ACKNOWLEDGEMENT_MS = 300;
const QUESTIONS = 9;
const CONTINUE = "Dalej";
const START_NAME = "Eurosceptycyzm";
const END_NAME = "Federacjonizm";
// The possible answers of a scored question are named by their place.
const FOR_START = "Odpowiedź 1";
const FOR_END = "Odpowiedź 2";

const scrollIntoView = vi.fn();

// A quiz with one axis of type `axis`: the first orientation on its negative
// side, the second on its positive side. In every question the first answer
// scores the first orientation; the second answer scores the second one, or
// nothing at all when no question is to score the second pole.
const createAxisSurvey = (isEndScored = true): Survey =>
  createSurvey({
    id: crypto.randomUUID(),
    averageFinishTime: QUESTIONS,
    orientations: [
      createOrientation("start", START_NAME, { color: "#b67559" }),
      createOrientation("end", END_NAME, { color: "#1a79bc" }),
    ],
    axes: [createSurveyAxis("union", ["start"], ["end"])],
    questions: Array.from({ length: QUESTIONS }, (_, index) =>
      createScoredQuestion(
        `q${index + 1}`,
        [
          [1, ["start"]],
          [1, isEndScored ? ["end"] : []],
        ],
        { categoryId: "economy" },
      ),
    ),
  });

// The stores live as long as the module does, so every test takes a quiz of
// its own.
const renderScreen = (survey: Survey) => {
  const store = getSurveySessionStore(survey);

  store.setState(createStartedSession(survey), true);

  return {
    ...renderWithI18n(<SurveyQuestionnaireSession survey={survey} />),
    getSession: store.getState,
  };
};

const getButton = (name: string) => screen.getByRole("button", { name });

const queryCard = () => screen.queryByRole("region", { name: "Checkpoint" });

const getCard = () => screen.getByRole("region", { name: "Checkpoint" });

const getBar = () => within(getCard()).getByRole("img");

const finishChange = () => act(() => vi.advanceTimersByTime(CONTENT_CHANGE_MS));

// An answer is recorded when its acknowledgement has played; the screen takes
// the next press when the new content is there.
const answerQuestion = (text: string) => {
  fireEvent.click(getButton(text));
  act(() => vi.advanceTimersByTime(ACKNOWLEDGEMENT_MS));
  finishChange();
};

const answerQuestions = (text: string, count: number) => {
  for (let done = 0; done < count; done += 1) answerQuestion(text);
};

const pressContinue = () => {
  fireEvent.click(getButton(CONTINUE));
  finishChange();
};

describe("<SurveyQuestionnaireSession /> - the axis closeness card", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Element.prototype.scrollIntoView = scrollIntoView;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
    sessionStorage.clear();
  });

  describe("given a quiz with one two-sided axis, when five answers that all score its start side are given", () => {
    it("shows the card titled with the name of the start side, with a bar without numbers", () => {
      const { getSession } = renderScreen(createAxisSurvey());

      answerQuestions(FOR_START, 4);

      expect(queryCard()).not.toBeInTheDocument();

      answerQuestion(FOR_START);

      const [title, startLabel] = within(getCard()).getAllByText(START_NAME);

      expect(getCard()).toBeVisible();
      expect(
        title.compareDocumentPosition(getBar()) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      expect(getBar()).toContainElement(startLabel);
      expect(getBar()).toHaveAccessibleName(
        `„${START_NAME}” i „${END_NAME}”: wyższy wynik po stronie „${START_NAME}”`,
      );
      expect(within(getBar()).getByText(END_NAME)).toBeVisible();
      expect(screen.getByTestId("universal-axis-fill-start")).toHaveStyle({
        width: "100%",
      });
      expect(getCard().textContent).not.toMatch(/[\d%]/);
      expect(within(getCard()).getByRole("paragraph")).toHaveTextContent(
        `„${START_NAME}”`,
      );
      expect(within(getCard()).getByRole("paragraph")).toHaveTextContent(
        `„${END_NAME}”`,
      );
      expect(getSession().phase).toBe("checkpoints");
      expect(getSession().checkpointRecord.cardsShown).toEqual([
        {
          card: expect.objectContaining({
            type: "axis-closeness",
            variant: "double",
            boundary: 5,
            axisId: "union",
            leadingSide: "start",
            line: { pool: "axis-closeness-double", index: expect.any(Number) },
          }),
        },
      ]);
    });

    it('goes on to the sixth question on "Dalej", and does not speak about the axis again', () => {
      const { getSession } = renderScreen(createAxisSurvey());

      answerQuestions(FOR_START, 5);
      pressContinue();

      expect(queryCard()).not.toBeInTheDocument();
      expect(screen.getByText("Stwierdzenie q6.")).toBeVisible();
      expect(getSession().phase).toBe("questions");

      answerQuestions(FOR_START, 3);

      expect(
        getSession().checkpointRecord.cardsShown.filter(
          (shown) =>
            (shown as { card: { type: string } }).card.type ===
            "axis-closeness",
        ),
      ).toHaveLength(1);
    });
  });

  describe("given the same quiz, when the five answers all score its end side", () => {
    it("shows the card titled with the name of the end side", () => {
      renderScreen(createAxisSurvey());

      answerQuestions(FOR_END, 5);

      const [title, endLabel] = within(getCard()).getAllByText(END_NAME);

      expect(getBar()).not.toContainElement(title);
      expect(getBar()).toContainElement(endLabel);
      // The bar keeps its sides: the start side is still on the start cap.
      expect(
        screen.getByTestId("universal-axis-labels").firstElementChild,
      ).toHaveTextContent(START_NAME);
      expect(screen.getByTestId("universal-axis-fill-end")).toHaveStyle({
        width: "100%",
      });
      expect(getBar()).toHaveAccessibleName(
        `„${START_NAME}” i „${END_NAME}”: wyższy wynik po stronie „${END_NAME}”`,
      );
    });
  });

  describe("given a quiz with an axis whose second pole no question scores, when five answers bring it to 70 or more", () => {
    it("shows the single variant", () => {
      const { getSession } = renderScreen(createAxisSurvey(false));

      answerQuestions(FOR_START, 5);

      expect(within(getCard()).getAllByText(START_NAME)).toHaveLength(1);
      expect(within(getCard()).queryByText(END_NAME)).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("universal-axis-labels"),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("universal-axis-cap-end"),
      ).not.toBeInTheDocument();
      expect(getBar()).toHaveAccessibleName(
        `Skala „${START_NAME}”: wysoki wynik`,
      );
      expect(getCard().textContent).not.toMatch(/[\d%]/);
      expect(getSession().checkpointRecord.cardsShown).toEqual([
        {
          card: expect.objectContaining({
            type: "axis-closeness",
            variant: "single",
            line: { pool: "axis-closeness-single", index: expect.any(Number) },
          }),
        },
      ]);
    });
  });

  describe("given a quiz without axes", () => {
    it("never shows this card", () => {
      const survey = createNineQuestionSurvey({ id: crypto.randomUUID() });
      const { getSession } = renderScreen(survey);

      for (let done = 0; done < QUESTIONS; done += 1) {
        answerQuestion("Za");

        // Another card may be registered: it is passed, and it is not this one.
        if (queryCard()) pressContinue();
      }

      expect(getSession().phase).toBe("demographics");
      expect(
        getSession().checkpointRecord.cardsShown.map(
          (shown) => (shown as { card: { type: string } }).card.type,
        ),
      ).not.toContain("axis-closeness");
    });
  });
});

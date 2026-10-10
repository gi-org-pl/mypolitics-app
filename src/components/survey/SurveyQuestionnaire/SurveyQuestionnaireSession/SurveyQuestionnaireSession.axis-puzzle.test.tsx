import { act, fireEvent, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Survey } from "@/types/survey";
import { getSurveySessionStore } from "@/utils/survey/session/getSurveySessionStore";
import { createOrientation } from "@/utils/vitest/createOrientation";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";
import { createScoredQuestion } from "@/utils/vitest/survey/createScoredQuestion";
import { createStartedSession } from "@/utils/vitest/survey/createStartedSession";
import { createSurvey } from "@/utils/vitest/survey/createSurvey";
import { createSurveyAxis } from "@/utils/vitest/survey/createSurveyAxis";

import { SurveyQuestionnaireSession } from "./SurveyQuestionnaireSession";
import { CONTENT_CHANGE_MS } from "./SurveyQuestionnaireSession.constants";

// The single axis puzzle in the screen: sixteen questions and two axes, with
// the real registry, the real engine and the real cards. Nothing is mocked.
//
// Questions 1 to 5 and 12 to 16 are behind the first axis, questions 6 to 11
// behind the second. After five answers only the first axis has enough
// behind it, and the axis closeness card - ahead of the puzzle in priority -
// takes it. The next card can come no sooner than six questions later, and
// by then only the second axis is left: a second closeness card in a row is
// left out, so the puzzle is about the second axis.

// The acknowledgement of an answer: it reports the press when it has played.
const ACKNOWLEDGEMENT_MS = 300;
const QUESTIONS = 16;
const PUZZLE_BOUNDARY = 11;
const CONTINUE = "Dalej";
const OPT_OUT = "Wyłącz checkpointy";
const START_NAME = "Interwencjonizm";
const END_NAME = "Wolny rynek";
// The possible answers of a scored question are named by their place.
const FOR_END = "Odpowiedź 1";
const FOR_START = "Odpowiedź 2";

const scrollIntoView = vi.fn();

const isBehindSecondAxis = (index: number): boolean => index >= 5 && index < 11;

const createPuzzleSurvey = (): Survey =>
  createSurvey({
    id: crypto.randomUUID(),
    averageFinishTime: QUESTIONS,
    orientations: [
      createOrientation("conservatism", "Konserwatyzm", { color: "#b67559" }),
      createOrientation("progressivism", "Progresywizm", { color: "#1a79bc" }),
      createOrientation("interventionism", START_NAME, { color: "#e74c3c" }),
      createOrientation("free-market", END_NAME, { color: "#2ecc71" }),
    ],
    axes: [
      createSurveyAxis("society", ["conservatism"], ["progressivism"]),
      createSurveyAxis("economy", ["interventionism"], ["free-market"]),
    ],
    questions: Array.from({ length: QUESTIONS }, (_, index) =>
      createScoredQuestion(
        `q${index + 1}`,
        isBehindSecondAxis(index)
          ? [
              [2, ["free-market"]],
              [2, ["interventionism"]],
            ]
          : [
              [2, ["progressivism"]],
              [2, ["conservatism"]],
            ],
        { categoryId: "economy" },
      ),
    ),
  });

// The stores live as long as the module does, so every test takes a quiz of
// its own.
const renderScreen = (survey: Survey, isStarted = true) => {
  const store = getSurveySessionStore(survey);

  if (isStarted) store.setState(createStartedSession(survey), true);

  return {
    ...renderWithI18n(<SurveyQuestionnaireSession survey={survey} />),
    getSession: store.getState,
  };
};

const getButton = (name: string) => screen.getByRole("button", { name });

const queryButton = (name: string) => screen.queryByRole("button", { name });

const getCard = () => screen.getByRole("region", { name: "Checkpoint" });

const queryCard = () => screen.queryByRole("region", { name: "Checkpoint" });

const getBar = () => within(getCard()).getByRole("img");

const getText = () => within(getCard()).getByRole("paragraph");

const finishChange = () => act(() => vi.advanceTimersByTime(CONTENT_CHANGE_MS));

// An answer is recorded when its acknowledgement has played; the screen takes
// the next press when the new content is there.
const answerQuestions = (text: string, count: number) => {
  for (let done = 0; done < count; done += 1) {
    fireEvent.click(getButton(text));
    act(() => vi.advanceTimersByTime(ACKNOWLEDGEMENT_MS));
    finishChange();
  }
};

const pressContinue = () => {
  fireEvent.click(getButton(CONTINUE));
  finishChange();
};

// Up to the puzzle: the closeness card after the fifth answer is passed, and
// the six questions of the second axis are answered for the given side.
const reachPuzzle = (text: string) => {
  answerQuestions(FOR_END, 5);
  pressContinue();
  answerQuestions(text, 6);
};

const getShownTypes = (getSession: () => { checkpointRecord: unknown }) =>
  (
    getSession().checkpointRecord as {
      cardsShown: { card: { type: string } }[];
    }
  ).cardsShown.map(({ card }) => card.type);

describe("<SurveyQuestionnaireSession /> - the single axis puzzle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Element.prototype.scrollIntoView = scrollIntoView;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
    sessionStorage.clear();
  });

  describe("given a quiz with two axes, when the first has had its card and the second leans clearly", () => {
    it("asks about the second axis, with its two poles as options and no way on but a guess", () => {
      const { getSession } = renderScreen(createPuzzleSurvey());

      answerQuestions(FOR_END, 5);

      expect(getShownTypes(getSession)).toEqual(["axis-closeness"]);

      pressContinue();
      answerQuestions(FOR_END, 5);

      expect(queryCard()).not.toBeInTheDocument();

      answerQuestions(FOR_END, 1);

      expect(getCard()).toBeVisible();
      expect(getSession().phase).toBe("checkpoints");
      expect(getSession().checkpointRecord.cardsShown.at(-1)).toEqual({
        card: expect.objectContaining({
          type: "axis-puzzle",
          boundary: PUZZLE_BOUNDARY,
          axisId: "economy",
          leadingSide: "end",
          line: { pool: "axis-puzzle-ask", index: expect.any(Number) },
        }),
      });
      expect(
        within(screen.getByRole("group"))
          .getAllByRole("button")
          .map((row) => row.textContent),
      ).toEqual([START_NAME, END_NAME]);
      expect(queryButton(CONTINUE)).not.toBeInTheDocument();
      expect(getButton(OPT_OUT)).toBeVisible();
      expect(getBar()).toHaveAccessibleName(
        `„${START_NAME}” i „${END_NAME}”: wynik ukryty`,
      );
      expect(within(getCard()).queryByTestId(/universal-axis-fill/)).toBeNull();
      expect(getCard().textContent).not.toMatch(/[\d%]/);
    });

    it("reveals the reading on a hit, keeps the line of the guess and goes on to the twelfth question", () => {
      const { getSession } = renderScreen(createPuzzleSurvey());

      reachPuzzle(FOR_END);
      fireEvent.click(getButton(END_NAME));

      const line = { pool: "axis-puzzle-hit", index: expect.any(Number) };

      expect(getSession().checkpointRecord.cardsShown.at(-1)).toEqual({
        card: expect.objectContaining({ type: "axis-puzzle" }),
        revealLines: { hit: line },
      });
      expect(getText()).toHaveTextContent(`„${END_NAME}”`);
      expect(getText()).toHaveFocus();
      expect(queryButton(END_NAME)).not.toBeInTheDocument();
      expect(queryButton(START_NAME)).not.toBeInTheDocument();
      expect(screen.getByTestId("universal-axis-fill-end")).toHaveStyle({
        width: "100%",
      });
      expect(getBar()).toHaveAccessibleName(
        `„${START_NAME}” i „${END_NAME}”: bliżej Ci do strony „${END_NAME}”`,
      );
      expect(getCard().textContent).not.toMatch(/[\d%]/);
      expect(getSession().phase).toBe("checkpoints");

      pressContinue();

      expect(queryCard()).not.toBeInTheDocument();
      expect(screen.getByText("Stwierdzenie q12.")).toBeVisible();
      expect(getSession().phase).toBe("questions");
    });

    it("reveals the same bar on a miss, with the miss line", () => {
      const { getSession } = renderScreen(createPuzzleSurvey());

      reachPuzzle(FOR_START);

      expect(getSession().checkpointRecord.cardsShown.at(-1)).toEqual({
        card: expect.objectContaining({
          type: "axis-puzzle",
          leadingSide: "start",
        }),
      });

      fireEvent.click(getButton(END_NAME));

      expect(getSession().checkpointRecord.cardsShown.at(-1)).toEqual({
        card: expect.objectContaining({ type: "axis-puzzle" }),
        revealLines: {
          miss: { pool: "axis-puzzle-miss", index: expect.any(Number) },
        },
      });
      expect(screen.getByTestId("universal-axis-fill-start")).toHaveStyle({
        width: "100%",
      });
      expect(getBar()).toHaveAccessibleName(
        `„${START_NAME}” i „${END_NAME}”: bliżej Ci do strony „${START_NAME}”`,
      );
      expect(getButton(CONTINUE)).toBeVisible();
    });

    it("does not store the guess: after a reload the card asks again, and the same guess reads the same line", () => {
      const survey = createPuzzleSurvey();
      const first = renderScreen(survey);

      reachPuzzle(FOR_END);

      const asked = getText().textContent;

      fireEvent.click(getButton(END_NAME));

      const revealed = getText().textContent;
      const stored = JSON.stringify(first.getSession().checkpointRecord);

      expect(revealed).not.toBe(asked);
      expect(stored).not.toMatch(/guess|outcome/);

      first.unmount();
      renderScreen(survey, false);
      finishChange();

      expect(getText().textContent).toBe(asked);
      expect(queryButton(CONTINUE)).not.toBeInTheDocument();
      expect(screen.getByTestId("universal-axis-mask")).toBeInTheDocument();

      fireEvent.click(getButton(END_NAME));

      expect(getText().textContent).toBe(revealed);
    });

    it("turns checkpoints off without revealing anything", () => {
      const { getSession } = renderScreen(createPuzzleSurvey());

      reachPuzzle(FOR_END);
      fireEvent.click(getButton(OPT_OUT));
      finishChange();

      expect(queryCard()).not.toBeInTheDocument();
      expect(screen.getByText("Stwierdzenie q12.")).toBeVisible();
      expect(getSession().areCheckpointsOff).toBe(true);
      expect(getSession().checkpointRecord.cardsShown.at(-1)).toEqual({
        card: expect.objectContaining({ type: "axis-puzzle" }),
      });
    });

    it("does not speak about either axis again", () => {
      const { getSession } = renderScreen(createPuzzleSurvey());

      reachPuzzle(FOR_END);
      fireEvent.click(getButton(END_NAME));
      pressContinue();

      for (let done = PUZZLE_BOUNDARY; done < QUESTIONS; done += 1) {
        answerQuestions(FOR_END, 1);

        // Another card may be registered: it is passed, and it is no axis card.
        if (queryButton(CONTINUE) && queryCard()) pressContinue();
      }

      expect(
        getShownTypes(getSession).filter((type) => type.startsWith("axis-")),
      ).toEqual(["axis-closeness", "axis-puzzle"]);
    });
  });
});

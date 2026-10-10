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

// The Nolan path card in the screen: a quiz of twenty questions with a
// compass, the real registry, the real engine and the real card. Nothing is
// mocked.

// The acknowledgement of an answer: it reports the press when it has played.
const ACKNOWLEDGEMENT_MS = 300;
const QUESTIONS = 20;
const CONTINUE = "Dalej";
// The two answers of every question: up and to the right, down and to the
// left.
const TOP_RIGHT = "Odpowiedź 1";
const BOTTOM_LEFT = "Odpowiedź 2";
const TENTH_STATEMENT = "Stwierdzenie q10.";
const ELEVENTH_STATEMENT = "Stwierdzenie q11.";
const TWO_OF_FOUR =
  "Kompas: trasa przeszła przez 2 z 4 ćwiartek. Twoja pozycja jest teraz w podświetlonej ćwiartce.";

const scrollIntoView = vi.fn();

// One category, four orientations and the two axes of a compass. Every
// question pulls the same way, so the first answer puts the taker in a
// corner at the extreme level, and answering the other way from then on
// carries them into the opposite quadrant.
const createCompassSurvey = (): Survey =>
  createSurvey({
    id: crypto.randomUUID(),
    averageFinishTime: QUESTIONS,
    orientations: ["left", "right", "down", "up"].map((id) =>
      createOrientation(id, id),
    ),
    axes: [
      createSurveyAxis("x", ["left"], ["right"], { type: "compass_x_axis" }),
      createSurveyAxis("y", ["down"], ["up"], { type: "compass_y_axis" }),
    ],
    questions: Array.from({ length: QUESTIONS }, (_, index) =>
      createScoredQuestion(
        `q${index + 1}`,
        [
          [2, ["right", "up"]],
          [2, ["left", "down"]],
        ],
        { categoryId: "economy" },
      ),
    ),
  });

// The stores live as long as the module does, so every test takes a quiz of
// its own.
const renderScreen = () => {
  const survey = createCompassSurvey();
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

const finishChange = () => act(() => vi.advanceTimersByTime(CONTENT_CHANGE_MS));

// An answer is recorded when its acknowledgement has played; the screen takes
// the next press when the new content is there.
const answerQuestion = (text: string) => {
  fireEvent.click(getButton(text));
  act(() => vi.advanceTimersByTime(ACKNOWLEDGEMENT_MS));
  finishChange();
};

// The first question one way, the following ones the other way, up to the
// given number of done questions. No card may appear on the way.
const answerQuestions = (done: number, first: string, rest: string) => {
  for (let index = 0; index < done; index += 1) {
    expect(queryCard()).not.toBeInTheDocument();

    answerQuestion(index === 0 ? first : rest);
  }
};

describe("<SurveyQuestionnaireSession /> - the Nolan path card", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Element.prototype.scrollIntoView = scrollIntoView;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
    sessionStorage.clear();
  });

  describe("when the position has been through two quadrants and the tenth question is answered", () => {
    it("shows the card with the map and a statement that counts 2 quadrants", () => {
      renderScreen();

      answerQuestions(10, TOP_RIGHT, BOTTOM_LEFT);

      expect(
        within(getCard()).getByRole("img", { name: TWO_OF_FOUR }),
      ).toBeVisible();
      expect(within(getCard()).getByRole("paragraph")).toHaveTextContent(
        "2 ćwiartki kompasu",
      );
      expect(screen.queryByText(ELEVENTH_STATEMENT)).not.toBeInTheDocument();
    });

    it("stores the card with the whole route, from the first position held", () => {
      const { getSession } = renderScreen();

      answerQuestions(10, TOP_RIGHT, BOTTOM_LEFT);

      const [{ card }] = getSession().checkpointRecord.cardsShown as {
        card: { trail: { x: number; y: number; done: number }[] };
      }[];

      expect(getSession().phase).toBe("checkpoints");
      expect(getSession().checkpointRecord.cardsShown).toHaveLength(1);
      expect(card).toMatchObject({
        type: "nolan-path",
        boundary: 10,
        line: { pool: "nolan-path-partial", index: expect.any(Number) },
        variant: "partial",
        count: 2,
        isSecondPath: false,
      });
      expect(card.trail).toHaveLength(10);
      expect(card.trail[0]).toMatchObject({
        x: 1,
        y: 1,
        level: "extreme",
        quadrant: "topRight",
        done: 1,
      });
      expect(card.trail[9]).toMatchObject({
        level: "extreme",
        quadrant: "bottomLeft",
        done: 10,
      });
    });

    it("draws the dot at the last position and fills its quadrant", () => {
      renderScreen();

      answerQuestions(10, TOP_RIGHT, BOTTOM_LEFT);

      // One answer of ten went up and right: both coordinates are -0.8.
      const dot = screen.getByTestId("nolan-chart-dot");

      expect(
        Number.parseFloat(dot.style.getPropertyValue("--nolan-x")),
      ).toBeCloseTo(10);
      expect(
        Number.parseFloat(dot.style.getPropertyValue("--nolan-y")),
      ).toBeCloseTo(90);
      expect(
        screen.getByTestId("nolan-chart-quadrant-bottomLeft"),
      ).toHaveAttribute("data-filled", "true");
      expect(screen.getByTestId("compass-map-trail")).toBeInTheDocument();
    });

    it("beats the halfway card, which is due at the same boundary", () => {
      renderScreen();

      answerQuestions(10, TOP_RIGHT, BOTTOM_LEFT);

      expect(within(getCard()).queryByText("50%")).not.toBeInTheDocument();
      expect(within(getCard()).getByRole("paragraph")).not.toHaveTextContent(
        /min\./,
      );
    });
  });

  describe('when "Dalej" is pressed on the card', () => {
    it("shows the eleventh question", () => {
      const { getSession } = renderScreen();

      answerQuestions(10, TOP_RIGHT, BOTTOM_LEFT);
      fireEvent.click(getButton(CONTINUE));
      finishChange();

      expect(screen.getByText(ELEVENTH_STATEMENT)).toBeVisible();
      expect(queryCard()).not.toBeInTheDocument();
      expect(getSession().phase).toBe("questions");
    });
  });

  describe("when the taker never leaves one quadrant", () => {
    it("shows the halfway card at the midpoint instead", () => {
      const { getSession } = renderScreen();

      answerQuestions(10, TOP_RIGHT, TOP_RIGHT);

      expect(screen.queryByText(TENTH_STATEMENT)).not.toBeInTheDocument();
      expect(within(getCard()).getByText("50%")).toBeVisible();
      expect(within(getCard()).queryByRole("img")).not.toBeInTheDocument();
      expect(getSession().checkpointRecord.cardsShown).toMatchObject([
        { card: { type: "halfway", boundary: 10 } },
      ]);
    });
  });
});

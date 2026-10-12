import { act, fireEvent, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Survey } from "@/types/survey";
import { getSurveySessionStore } from "@/utils/survey/session/getSurveySessionStore";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";
import { createNineQuestionSurvey } from "@/utils/vitest/survey/createNineQuestionSurvey";
import { createStartedSession } from "@/utils/vitest/survey/createStartedSession";

import { SurveyQuestionnaireSession } from "./SurveyQuestionnaireSession";
import { CONTENT_CHANGE_MS } from "./SurveyQuestionnaireSession.constants";

// The halfway card in the screen: a quiz of nine questions with an average
// finish time, the real registry, the real engine and the real card. Nothing
// is mocked.

// The acknowledgement of an answer: it reports the press when it has played.
const ACKNOWLEDGEMENT_MS = 300;
const CONTINUE = "Dalej";
const FIFTH_STATEMENT = "Stwierdzenie q5.";
const SIXTH_STATEMENT = "Stwierdzenie q6.";
// Four of nine questions are left and nine minutes is the average for all.
const MINUTES_LEFT = "ok. 4 min.";
const FIVE_OF_NINE = (5 / 9) * 100;

const scrollIntoView = vi.fn();

// The stores live as long as the module does, so every test takes a quiz of
// its own.
const renderScreen = (done = 4, overrides: Partial<Survey> = {}) => {
  const survey = createNineQuestionSurvey({
    id: crypto.randomUUID(),
    ...overrides,
  });
  const store = getSurveySessionStore(survey);

  store.setState(createStartedSession(survey, done), true);

  return {
    ...renderWithI18n(<SurveyQuestionnaireSession survey={survey} />),
    survey,
    getSession: store.getState,
  };
};

const getButton = (name: string) => screen.getByRole("button", { name });

const queryCard = () => screen.queryByRole("region", { name: "Checkpoint" });

const getCard = () => screen.getByRole("region", { name: "Checkpoint" });

const finishChange = () => act(() => vi.advanceTimersByTime(CONTENT_CHANGE_MS));

// An answer is recorded when its acknowledgement has played; the screen takes
// the next press when the new content is there.
const answerQuestion = () => {
  fireEvent.click(getButton("Za"));
  act(() => vi.advanceTimersByTime(ACKNOWLEDGEMENT_MS));
  finishChange();
};

const press = (name: string) => {
  fireEvent.click(getButton(name));
  finishChange();
};

const skipQuestion = () => press("Pomiń");

const expectHalfwayCard = () => {
  expect(within(getCard()).getByText("55%")).toBeVisible();
  expect(within(getCard()).getByRole("paragraph")).toHaveTextContent(
    MINUTES_LEFT,
  );
  expect(screen.queryByText(SIXTH_STATEMENT)).not.toBeInTheDocument();
};

describe("<SurveyQuestionnaireSession /> - the halfway card", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Element.prototype.scrollIntoView = scrollIntoView;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
    sessionStorage.clear();
  });

  describe("when the fifth question is answered", () => {
    it('shows the card with "55%" and a statement that gives the minutes', () => {
      const { getSession } = renderScreen();

      answerQuestion();

      expectHalfwayCard();
      expect(getSession().phase).toBe("checkpoints");
      expect(getSession().checkpointRecord.cardsShown).toEqual([
        {
          card: {
            type: "halfway",
            boundary: 5,
            line: { pool: "halfway", index: expect.any(Number) },
            percent: 55,
            minutes: 4,
          },
        },
      ]);
    });

    it("shows the progress of the bar above it, five of nine, rounded down", () => {
      renderScreen();

      answerQuestion();

      // From the midpoint on the bar shows the true share. It reports it
      // rounded to the nearest whole percent; the card rounds down.
      expect(
        screen.getByRole("progressbar", { name: "Postęp quizu" }),
      ).toHaveAttribute("aria-valuenow", String(Math.round(FIVE_OF_NINE)));
      expect(
        within(getCard()).getByText(`${Math.floor(FIVE_OF_NINE)}%`),
      ).toBeVisible();
    });
  });

  describe("when the fifth question is skipped", () => {
    it("shows the same card", () => {
      const { getSession } = renderScreen();

      skipQuestion();

      expectHalfwayCard();
      expect(getSession().checkpointRecord.cardsShown).toHaveLength(1);
    });
  });

  describe("when the card is closed, the taker steps back and answers the fifth question again", () => {
    it("does not show the card again", () => {
      const { getSession } = renderScreen();

      answerQuestion();
      press(CONTINUE);

      expect(screen.getByText(SIXTH_STATEMENT)).toBeVisible();
      expect(queryCard()).not.toBeInTheDocument();

      press("Poprzednie pytanie");

      expect(screen.getByText(FIFTH_STATEMENT)).toBeVisible();

      answerQuestion();

      expect(screen.getByText(SIXTH_STATEMENT)).toBeVisible();
      expect(queryCard()).not.toBeInTheDocument();
      expect(getSession().checkpointRecord.cardsShown).toHaveLength(1);
    });
  });

  describe("when the screen is mounted again with the stored session after the card was closed", () => {
    it("shows the sixth question and no card", () => {
      const { survey, unmount, getSession } = renderScreen();

      answerQuestion();
      press(CONTINUE);
      unmount();
      renderWithI18n(<SurveyQuestionnaireSession survey={survey} />);

      expect(screen.getByText(SIXTH_STATEMENT)).toBeVisible();
      expect(queryCard()).not.toBeInTheDocument();
      expect(getSession().phase).toBe("questions");
    });
  });

  describe("when the quiz is reset after the card and five questions are answered again", () => {
    it("shows the card again", () => {
      const { getSession } = renderScreen();

      answerQuestion();
      press(CONTINUE);
      fireEvent.click(getButton("Zacznij od nowa"));
      press("Resetuj quiz");

      expect(getSession()).toMatchObject({
        phase: "category-select",
        entries: [],
        checkpointRecord: { cardsShown: [] },
      });

      // Category select, then the first five questions again.
      skipQuestion();
      answerQuestion();
      answerQuestion();
      answerQuestion();
      answerQuestion();

      expect(queryCard()).not.toBeInTheDocument();

      answerQuestion();

      expect(within(getCard()).getByText("55%")).toBeVisible();
      expect(within(getCard()).getByRole("paragraph")).toHaveTextContent(
        /ok\. \d+ min\./,
      );
      expect(getSession().entries).toHaveLength(5);
      expect(getSession().checkpointRecord.cardsShown).toHaveLength(1);
    });
  });

  describe("given a quiz of eight questions", () => {
    it("never shows the card", () => {
      const { questions } = createNineQuestionSurvey();
      const { getSession } = renderScreen(0, {
        questions: questions.slice(0, 8),
      });

      for (const _question of questions.slice(0, 8)) {
        answerQuestion();

        expect(queryCard()).not.toBeInTheDocument();
      }

      expect(getSession().phase).toBe("demographics");
      expect(getSession().entries).toHaveLength(8);
      expect(getSession().checkpointRecord.cardsShown).toEqual([]);
    });
  });
});

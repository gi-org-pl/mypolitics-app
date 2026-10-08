import { act, fireEvent, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MATCH_BAND_COLORS } from "@/constants/results";
import type { Survey } from "@/types/survey";
import { getSurveySessionStore } from "@/utils/survey/getSurveySessionStore";
import { createOrientation } from "@/utils/vitest/createOrientation";
import { createScoredQuestion } from "@/utils/vitest/createScoredQuestion";
import { createStartedSession } from "@/utils/vitest/createStartedSession";
import { createSurvey } from "@/utils/vitest/createSurvey";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { SurveyQuestionnaireSession } from "./SurveyQuestionnaireSession";
import { CONTENT_CHANGE_MS } from "./SurveyQuestionnaireSession.constants";

// The double axis puzzle in the screen: ten questions and three archetypes,
// with the real registry, the real engine and the real cards. Nothing is
// mocked.
//
// The quiz has no axes and no compass, so no other personal card can fire in
// it. In every question the first answer scores the first archetype, the
// second the second and the third the third. After five answers for one
// archetype it stands at 100 and the other two at 0, and half the questions
// are done: the puzzle is due at that boundary, ahead of the halfway card.

// The acknowledgement of an answer: it reports the press when it has played.
const ACKNOWLEDGEMENT_MS = 300;
const QUESTIONS = 10;
const PUZZLE_BOUNDARY = 5;
const CONTINUE = "Dalej";
const OPT_OUT = "Wyłącz checkpointy";
const FIRST_NAME = "Zielony postępowiec";
const SECOND_NAME = "Narodowy konserwatysta";
const THIRD_NAME = "Suwerenny patriota";
const NAMES = [FIRST_NAME, SECOND_NAME, THIRD_NAME];
const HIDDEN = "Ukryta postać jest blisko Ciebie";
// The possible answers of a scored question are named by their place.
const FOR_FIRST = "Odpowiedź 1";
const FOR_SECOND = "Odpowiedź 2";
const FOR_THIRD = "Odpowiedź 3";

const scrollIntoView = vi.fn();

const createArchetypesSurvey = (): Survey =>
  createSurvey({
    id: crypto.randomUUID(),
    averageFinishTime: QUESTIONS,
    orientations: [
      createOrientation("green", FIRST_NAME, {
        type: "identity",
        color: "#27ae60",
      }),
      createOrientation("national", SECOND_NAME, {
        type: "identity",
        color: "#2c3e50",
      }),
      createOrientation("sovereign", THIRD_NAME, {
        type: "identity",
        color: "#c0392b",
      }),
    ],
    questions: Array.from({ length: QUESTIONS }, (_, index) =>
      createScoredQuestion(
        `q${index + 1}`,
        [
          [2, ["green"]],
          [2, ["national"]],
          [2, ["sovereign"]],
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

const getRowNames = () =>
  within(within(getCard()).getByRole("group"))
    .getAllByRole("button")
    .map((row) => row.textContent);

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

const getShownTypes = (getSession: () => { checkpointRecord: unknown }) =>
  (
    getSession().checkpointRecord as {
      cardsShown: { card: { type: string } }[];
    }
  ).cardsShown.map(({ card }) => card.type);

describe("<SurveyQuestionnaireSession /> - the double axis puzzle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Element.prototype.scrollIntoView = scrollIntoView;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
    sessionStorage.clear();
  });

  describe("given a quiz with three archetypes, when half the questions are done and one is clearly the closest", () => {
    it("asks which of the three it is, with the bar true and nobody named", () => {
      const { getSession } = renderScreen(createArchetypesSurvey());

      answerQuestions(FOR_FIRST, PUZZLE_BOUNDARY - 1);

      expect(queryCard()).not.toBeInTheDocument();

      answerQuestions(FOR_FIRST, 1);

      expect(getCard()).toBeVisible();
      expect(getSession().phase).toBe("checkpoints");
      expect(getShownTypes(getSession)).toEqual(["position-puzzle"]);
      expect(getSession().checkpointRecord.cardsShown.at(-1)).toEqual({
        card: expect.objectContaining({
          type: "position-puzzle",
          boundary: PUZZLE_BOUNDARY,
          leader: expect.objectContaining({ id: "green", name: FIRST_NAME }),
          closeness: 100,
          line: { pool: "position-puzzle-ask", index: expect.any(Number) },
        }),
      });
      expect([...getRowNames()].sort()).toEqual([...NAMES].sort());
      expect(getButton(CONTINUE)).toBeVisible();
      expect(getButton(OPT_OUT)).toBeVisible();
      expect(getBar()).toHaveAccessibleName(HIDDEN);
      expect(screen.getByTestId("universal-axis-fill-start")).toHaveStyle({
        width: "100%",
      });
      expect(within(getCard()).getAllByText(FIRST_NAME)).toHaveLength(1);
      expect(getCard().textContent).not.toMatch(/[\d%]/);
      expect(getCard().innerHTML).not.toContain("#27ae60");
    });

    it("reveals the archetype on a hit, keeps the line of the guess and goes on to the sixth question", () => {
      const { getSession } = renderScreen(createArchetypesSurvey());

      answerQuestions(FOR_FIRST, PUZZLE_BOUNDARY);
      fireEvent.click(getButton(FIRST_NAME));

      expect(getSession().checkpointRecord.cardsShown.at(-1)).toEqual({
        card: expect.objectContaining({ type: "position-puzzle" }),
        revealLines: {
          hit: { pool: "position-puzzle-hit", index: expect.any(Number) },
        },
      });
      expect(getText()).toHaveTextContent(FIRST_NAME);
      expect(getText()).toHaveFocus();
      expect(within(getCard()).queryByRole("group")).not.toBeInTheDocument();
      expect(
        within(getCard()).getByText(FIRST_NAME, { exact: true }),
      ).toBeVisible();
      expect(getBar()).toHaveAccessibleName(`${FIRST_NAME} jest blisko Ciebie`);
      expect(
        screen
          .getByTestId("universal-axis-fill-start")
          .style.getPropertyValue("--axis-color"),
      ).toBe(MATCH_BAND_COLORS.match);
      expect(getCard().textContent).not.toMatch(/[\d%]/);
      expect(getSession().phase).toBe("checkpoints");

      pressContinue();

      expect(queryCard()).not.toBeInTheDocument();
      expect(screen.getByText("Stwierdzenie q6.")).toBeVisible();
      expect(getSession().phase).toBe("questions");
    });

    it("decides against the archetype the answers lead to, whichever it is", () => {
      const { getSession } = renderScreen(createArchetypesSurvey());

      answerQuestions(FOR_THIRD, PUZZLE_BOUNDARY);

      expect(getSession().checkpointRecord.cardsShown.at(-1)).toEqual({
        card: expect.objectContaining({
          leader: expect.objectContaining({ id: "sovereign" }),
        }),
      });

      fireEvent.click(getButton(THIRD_NAME));

      expect(getText()).toHaveTextContent(THIRD_NAME);
      expect(getBar()).toHaveAccessibleName(`${THIRD_NAME} jest blisko Ciebie`);
    });

    it("reveals nothing on a miss: the leader is named nowhere", () => {
      const { getSession } = renderScreen(createArchetypesSurvey());

      answerQuestions(FOR_FIRST, PUZZLE_BOUNDARY);
      fireEvent.click(getButton(SECOND_NAME));

      expect(getSession().checkpointRecord.cardsShown.at(-1)).toEqual({
        card: expect.objectContaining({ type: "position-puzzle" }),
        revealLines: {
          miss: { pool: "position-puzzle-miss", index: expect.any(Number) },
        },
      });
      expect(getText()).toHaveFocus();
      expect(document.body.textContent).not.toContain(FIRST_NAME);
      expect(getBar()).toHaveAccessibleName(HIDDEN);
      expect(getCard().innerHTML).not.toContain(MATCH_BAND_COLORS.match);
      expect(queryButton(SECOND_NAME)).not.toBeInTheDocument();
      expect(getButton(CONTINUE)).toBeVisible();

      pressContinue();

      expect(screen.getByText("Stwierdzenie q6.")).toBeVisible();
    });

    it('goes on without a guess when "Dalej" is pressed, and the card is spent all the same', () => {
      const { getSession } = renderScreen(createArchetypesSurvey());

      answerQuestions(FOR_FIRST, PUZZLE_BOUNDARY);
      pressContinue();

      expect(queryCard()).not.toBeInTheDocument();
      expect(screen.getByText("Stwierdzenie q6.")).toBeVisible();
      expect(getSession().checkpointRecord.cardsShown).toEqual([
        { card: expect.objectContaining({ type: "position-puzzle" }) },
      ]);

      for (let done = PUZZLE_BOUNDARY; done < QUESTIONS; done += 1) {
        answerQuestions(FOR_FIRST, 1);

        // Another card may be registered: it is passed.
        if (queryCard()) pressContinue();
      }

      expect(
        getShownTypes(getSession).filter((type) => type === "position-puzzle"),
      ).toHaveLength(1);
    });

    it("does not store the guess: after a reload the card asks again with the same rows, and the same guess reads the same line", () => {
      const survey = createArchetypesSurvey();
      const first = renderScreen(survey);

      answerQuestions(FOR_FIRST, PUZZLE_BOUNDARY);

      const asked = getText().textContent;
      const rows = getRowNames();

      fireEvent.click(getButton(FIRST_NAME));

      const revealed = getText().textContent;
      const stored = JSON.stringify(first.getSession().checkpointRecord);

      expect(revealed).not.toBe(asked);
      expect(stored).not.toMatch(/guess|outcome/);

      first.unmount();
      renderScreen(survey, false);
      finishChange();

      expect(getText().textContent).toBe(asked);
      expect(getRowNames()).toEqual(rows);
      expect(getBar()).toHaveAccessibleName(HIDDEN);
      expect(screen.getByTestId("universal-axis-fill-start")).toHaveStyle({
        width: "100%",
      });

      fireEvent.click(getButton(FIRST_NAME));

      expect(getText().textContent).toBe(revealed);
    });

    it("turns checkpoints off without revealing anything", () => {
      const { getSession } = renderScreen(createArchetypesSurvey());

      answerQuestions(FOR_FIRST, PUZZLE_BOUNDARY);
      fireEvent.click(getButton(OPT_OUT));
      finishChange();

      expect(queryCard()).not.toBeInTheDocument();
      expect(screen.getByText("Stwierdzenie q6.")).toBeVisible();
      expect(getSession().areCheckpointsOff).toBe(true);
      expect(getSession().checkpointRecord.cardsShown.at(-1)).toEqual({
        card: expect.objectContaining({ type: "position-puzzle" }),
      });
    });
  });

  describe("given the same quiz, when no archetype is clearly the closest", () => {
    it("shows the halfway card instead", () => {
      const { getSession } = renderScreen(createArchetypesSurvey());

      // Two answers each for two archetypes and one for the third: the
      // closest stands at 40, under the 50 the card needs.
      answerQuestions(FOR_FIRST, 2);
      answerQuestions(FOR_THIRD, 2);
      answerQuestions(FOR_SECOND, 1);

      expect(getCard()).toBeVisible();
      expect(getShownTypes(getSession)).toEqual(["halfway"]);
    });
  });
});

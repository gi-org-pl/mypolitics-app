import { useLingui } from "@lingui/react";
import { act, fireEvent, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SurveyCheckpoint } from "@/components/survey/SurveyCheckpoint/SurveyCheckpoint";
import type { CheckpointCardProps } from "@/types/checkpoint";
import type { Survey, SurveySession } from "@/types/survey";
import { getCheckpointText } from "@/utils/checkpoint/getCheckpointText";
import { getSurveySessionStore } from "@/utils/survey/getSurveySessionStore";
import { createNineQuestionSurvey } from "@/utils/vitest/createNineQuestionSurvey";
import { createStartedSession } from "@/utils/vitest/createStartedSession";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { CHECKPOINT_CARDS } from "../SurveyQuestionnaire.constants";
import { SurveyQuestionnaireSession } from "./SurveyQuestionnaireSession";
import { CONTENT_CHANGE_MS } from "./SurveyQuestionnaireSession.constants";

// The Checkpoints phase in the screen. The quiz has nine questions and the
// engine is the real one: with a card registered for "halfway", that card
// fires after the fifth question and no card fires anywhere else.
vi.mock("../SurveyQuestionnaire.constants", () => ({
  CHECKPOINT_CARDS: {},
}));

// The acknowledgement of an answer: it reports the press when it has played.
const ACKNOWLEDGEMENT_MS = 300;
const CONTINUE = "Dalej";
const OPT_OUT = "Wyłącz checkpointy";
const FIFTH_STATEMENT = "Stwierdzenie q5.";
const SIXTH_STATEMENT = "Stwierdzenie q6.";

// A card as a card task writes it: the frame, filled from the card alone.
const HalfwayCard = ({
  card,
  onContinue,
  onOptOut,
}: CheckpointCardProps<"halfway">) => {
  const { i18n } = useLingui();
  const text = getCheckpointText(i18n, card);

  return (
    <SurveyCheckpoint
      visual={<span>{`${card.percent}%`}</span>}
      leadIn={text?.leadIn}
      statement={text?.statement ?? ""}
      onContinue={onContinue}
      onOptOut={onOptOut}
    />
  );
};

const scrollIntoView = vi.fn();

// The stores live as long as the module does, so every test takes a quiz of
// its own.
const renderScreen = (done = 4, overrides: Partial<SurveySession> = {}) => {
  const survey: Survey = createNineQuestionSurvey({ id: crypto.randomUUID() });
  const store = getSurveySessionStore(survey);

  store.setState({ ...createStartedSession(survey, done), ...overrides }, true);

  return {
    ...renderWithI18n(<SurveyQuestionnaireSession survey={survey} />),
    survey,
    getSession: store.getState,
  };
};

const getBar = () => screen.getByRole("progressbar", { name: "Postęp quizu" });

const getBackButton = () =>
  screen.getByRole("button", { name: "Poprzednie pytanie" });

const getResetButton = () =>
  screen.getByRole("button", { name: "Zacznij od nowa" });

const getButton = (name: string) => screen.getByRole("button", { name });

const queryCard = () => screen.queryByRole("region", { name: "Checkpoint" });

const getCard = () => screen.getByRole("region", { name: "Checkpoint" });

const getCardText = () => within(getCard()).getByRole("paragraph");

const finishChange = () => act(() => vi.advanceTimersByTime(CONTENT_CHANGE_MS));

// An answer is recorded when its acknowledgement has played; the screen takes
// the next press when the new content is there.
const answerQuestion = () => {
  fireEvent.click(getButton("Za"));
  act(() => vi.advanceTimersByTime(ACKNOWLEDGEMENT_MS));
  finishChange();
};

const skipQuestion = () => {
  fireEvent.click(getButton("Pomiń"));
  finishChange();
};

const press = (name: string) => {
  fireEvent.click(getButton(name));
  finishChange();
};

describe("<SurveyQuestionnaireSession /> - Checkpoints phase", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Element.prototype.scrollIntoView = scrollIntoView;
    CHECKPOINT_CARDS.halfway = HalfwayCard;
  });

  afterEach(() => {
    CHECKPOINT_CARDS.halfway = undefined;
    vi.useRealTimers();
    vi.resetAllMocks();
    sessionStorage.clear();
  });

  describe("given an empty registry", () => {
    it("shows one question after another with no card", () => {
      CHECKPOINT_CARDS.halfway = undefined;

      const { getSession } = renderScreen();

      answerQuestion();

      expect(screen.getByText(SIXTH_STATEMENT)).toBeVisible();
      expect(queryCard()).not.toBeInTheDocument();
      expect(getSession().phase).toBe("questions");
      expect(getSession().checkpointRecord.cardsShown).toEqual([]);

      skipQuestion();
      skipQuestion();
      skipQuestion();
      skipQuestion();

      expect(getSession().phase).toBe("demographics");
      expect(getSession().checkpointRecord.cardsShown).toEqual([]);
    });
  });

  describe("when a question before the fifth is answered", () => {
    it("shows the next question and no card", () => {
      renderScreen(3);

      answerQuestion();

      expect(screen.getByText(FIFTH_STATEMENT)).toBeVisible();
      expect(queryCard()).not.toBeInTheDocument();
    });
  });

  describe("when the fifth question is answered", () => {
    it('shows the card in place of the question, the answers and "Pomiń"', () => {
      const { getSession } = renderScreen();

      answerQuestion();

      expect(getCard()).toBeVisible();
      expect(within(getCard()).getByText("55%")).toBeVisible();
      expect(screen.queryByText(SIXTH_STATEMENT)).not.toBeInTheDocument();
      expect(screen.queryByText(FIFTH_STATEMENT)).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Za" }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Pomiń" }),
      ).not.toBeInTheDocument();
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

    it("shows the card after a skip as well", () => {
      renderScreen();

      skipQuestion();

      expect(getCard()).toBeVisible();
    });

    it("brings the card in with the movement of a change of question", () => {
      renderScreen();

      answerQuestion();

      expect(getCard().closest("[data-direction]")).toHaveAttribute(
        "data-direction",
        "forwards",
      );
    });

    it("puts the focus on the text of the card", () => {
      renderScreen();

      answerQuestion();

      expect(getCardText()).toHaveFocus();
      expect(getCardText().textContent).not.toBe("");
    });

    it("keeps the progress bar at five of nine", () => {
      renderScreen();

      const valueBefore = getBar().getAttribute("aria-valuenow");

      answerQuestion();

      const valueOnCard = getBar().getAttribute("aria-valuenow");

      press(CONTINUE);

      expect(Number(valueOnCard)).toBeGreaterThan(Number(valueBefore));
      expect(screen.getByText(SIXTH_STATEMENT)).toBeVisible();
      expect(getBar()).toHaveAttribute("aria-valuenow", valueOnCard);
    });

    it("shows in the pill the category and the count of the sixth question", () => {
      renderScreen();

      answerQuestion();

      expect(screen.getByText("Gospodarka")).toBeVisible();
      expect(
        screen.getByText("Pozostałe pytania w kategorii: 4"),
      ).toBeInTheDocument();

      press(CONTINUE);

      expect(
        screen.getByText("Pozostałe pytania w kategorii: 4"),
      ).toBeInTheDocument();
    });

    it("disables back and keeps reset enabled", () => {
      const { getSession } = renderScreen();

      answerQuestion();
      fireEvent.click(getBackButton());

      expect(getBackButton()).toBeDisabled();
      expect(getResetButton()).toBeEnabled();
      expect(getSession().entries).toHaveLength(5);
      expect(getCard()).toBeVisible();
    });

    it("counts the time the card is up for no question", () => {
      const { getSession } = renderScreen();

      answerQuestion();
      act(() => vi.advanceTimersByTime(60_000));
      press(CONTINUE);
      act(() => vi.advanceTimersByTime(2000));
      skipQuestion();

      const samples = getSession().checkpointRecord.timeSamples;

      expect(samples.map(({ questionId }) => questionId)).toEqual(["q5", "q6"]);
      expect(samples[0].seconds).toBeLessThan(1);
      expect(samples[1].seconds).toBeGreaterThanOrEqual(2);
      expect(samples[1].seconds).toBeLessThan(3);
    });
  });

  describe('when "Dalej" is activated', () => {
    it("shows the sixth question", () => {
      const { getSession } = renderScreen();

      answerQuestion();
      press(CONTINUE);

      expect(screen.getByText(SIXTH_STATEMENT)).toBeVisible();
      expect(queryCard()).not.toBeInTheDocument();
      expect(getSession()).toMatchObject({
        phase: "questions",
        areCheckpointsOff: false,
      });
      expect(getBackButton()).toBeEnabled();
    });

    it("puts the focus where a change of question puts it", () => {
      renderScreen();

      answerQuestion();
      press(CONTINUE);

      expect(
        screen.getByText(SIXTH_STATEMENT).closest("[data-direction]"),
      ).toHaveFocus();
    });

    it("does nothing on a second press while the card is closing", () => {
      const { getSession } = renderScreen();

      answerQuestion();

      const button = getButton(CONTINUE);

      fireEvent.click(button);
      fireEvent.click(button);
      finishChange();

      expect(getSession().entries).toHaveLength(5);
      expect(getSession().areCheckpointsOff).toBe(false);
      expect(screen.getByText(SIXTH_STATEMENT)).toBeVisible();
    });
  });

  describe("when the taker goes back from the sixth question and answers the fifth again", () => {
    it("does not show the card again", () => {
      const { getSession } = renderScreen();

      answerQuestion();
      press(CONTINUE);
      press("Poprzednie pytanie");

      expect(screen.getByText(FIFTH_STATEMENT)).toBeVisible();
      expect(queryCard()).not.toBeInTheDocument();

      answerQuestion();

      expect(screen.getByText(SIXTH_STATEMENT)).toBeVisible();
      expect(queryCard()).not.toBeInTheDocument();
      expect(getSession().checkpointRecord.cardsShown).toHaveLength(1);
    });
  });

  describe('when "Wyłącz checkpointy" is activated', () => {
    it("shows the sixth question", () => {
      const { getSession } = renderScreen();

      answerQuestion();
      press(OPT_OUT);

      expect(screen.getByText(SIXTH_STATEMENT)).toBeVisible();
      expect(queryCard()).not.toBeInTheDocument();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(getSession()).toMatchObject({
        phase: "questions",
        areCheckpointsOff: true,
      });
    });

    it("shows no card for the rest of the quiz", () => {
      const { getSession } = renderScreen();

      answerQuestion();
      press(OPT_OUT);
      press("Poprzednie pytanie");
      answerQuestion();

      expect(screen.getByText(SIXTH_STATEMENT)).toBeVisible();

      skipQuestion();
      skipQuestion();
      skipQuestion();
      skipQuestion();

      expect(getSession().phase).toBe("demographics");
      expect(getSession().checkpointRecord.cardsShown).toHaveLength(1);
    });

    it("shows no card after a reset", () => {
      const { getSession } = renderScreen();

      answerQuestion();
      press(OPT_OUT);
      fireEvent.click(getResetButton());
      press("Resetuj quiz");

      expect(getSession()).toMatchObject({
        phase: "category-select",
        areCheckpointsOff: true,
      });

      // Category select, then the first five questions again.
      skipQuestion();
      skipQuestion();
      skipQuestion();
      skipQuestion();
      skipQuestion();
      answerQuestion();

      expect(getSession().entries).toHaveLength(5);
      expect(screen.getByText(SIXTH_STATEMENT)).toBeVisible();
      expect(queryCard()).not.toBeInTheDocument();
      expect(getSession().checkpointRecord.cardsShown).toEqual([]);
    });
  });

  describe("when reset is confirmed while the card is up", () => {
    it("closes the card and starts the session over", () => {
      const { getSession } = renderScreen();

      answerQuestion();

      const { id } = getSession();

      fireEvent.click(getResetButton());
      press("Resetuj quiz");

      expect(queryCard()).not.toBeInTheDocument();
      expect(getSession().id).not.toBe(id);
      expect(getSession()).toMatchObject({
        phase: "category-select",
        entries: [],
        areCheckpointsOff: false,
        checkpointRecord: { cardsShown: [], timeSamples: [] },
      });
    });
  });

  describe("when reset is cancelled while the card is up", () => {
    it("keeps the card up, unchanged", () => {
      const { getSession } = renderScreen();

      answerQuestion();

      const session = getSession();
      const text = getCardText().textContent;

      fireEvent.click(getResetButton());
      fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });

      expect(getSession()).toBe(session);
      expect(getCardText().textContent).toBe(text);
      expect(getButton(CONTINUE)).toBeEnabled();
    });
  });

  describe("when the screen is mounted again with the stored session while the card is up", () => {
    it("shows the same card with the same text", () => {
      const { survey, unmount } = renderScreen();

      answerQuestion();

      const text = getCardText().textContent;

      unmount();
      renderWithI18n(<SurveyQuestionnaireSession survey={survey} />);

      expect(within(getCard()).getByText("55%")).toBeVisible();
      expect(getCardText().textContent).toBe(text);
      expect(getBackButton()).toBeDisabled();
      // Nothing changed on screen: the page keeps its own focus.
      expect(document.body).toHaveFocus();
    });
  });

  describe("given a stored card that can no longer be read", () => {
    it("shows the next question", () => {
      const { getSession } = renderScreen(5, {
        phase: "checkpoints",
        checkpointRecord: {
          cardsShown: [{ card: { type: "halfway", boundary: "five" } }],
          timeSamples: [],
        },
      });

      expect(queryCard()).not.toBeInTheDocument();
      expect(screen.getByText(SIXTH_STATEMENT)).toBeVisible();
      expect(getSession().phase).toBe("questions");
    });
  });

  describe("given the last question is answered", () => {
    it("goes to demographics without a card", () => {
      const { getSession } = renderScreen(8);

      answerQuestion();

      expect(queryCard()).not.toBeInTheDocument();
      expect(getSession().phase).toBe("demographics");
      expect(
        screen.getByRole("heading", { name: "Twoja tożsamość" }),
      ).toBeInTheDocument();
    });
  });
});

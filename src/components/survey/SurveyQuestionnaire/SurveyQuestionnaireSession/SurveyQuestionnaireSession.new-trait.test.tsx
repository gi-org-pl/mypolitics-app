import { act, fireEvent, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { NewTraitCheckpointCard } from "@/types/checkpoint";
import { getSurveySessionStore } from "@/utils/survey/session/getSurveySessionStore";
import { createOrientation } from "@/utils/vitest/createOrientation";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";
import { createNineQuestionSurvey } from "@/utils/vitest/survey/createNineQuestionSurvey";
import { createStartedSession } from "@/utils/vitest/survey/createStartedSession";

import { SurveyQuestionnaireSession } from "./SurveyQuestionnaireSession";
import { CONTENT_CHANGE_MS } from "./SurveyQuestionnaireSession.constants";

// The new trait card in the screen: the real registry, the real phase and the
// real card. Nothing is mocked.
//
// No quiz carries a list of its traits, so the engine never selects this card
// from a session: the first cases put the card up the only way it can be up
// today, as the last card shown of a stored session; the last one answers a
// whole quiz and finds no such card.

// The acknowledgement of an answer: it reports the press when it has played.
const ACKNOWLEDGEMENT_MS = 300;
const CONTINUE = "Dalej";
const OPT_OUT = "Wyłącz checkpointy";
const NAME = "Monarchizm";
const STATEMENT = `A to niespodzianka! — Masz nową cechę: „${NAME}”... to dobrze, niedobrze?`;
const FOURTH_STATEMENT = "Stwierdzenie q4.";

const CARD: NewTraitCheckpointCard = {
  type: "new-trait",
  boundary: 3,
  line: { pool: "new-trait", index: 0 },
  trait: createOrientation("monarchism", NAME, {
    imageUrl: "https://example.com/monarchism.svg",
    color: "#9b51e0",
  }),
};

const scrollIntoView = vi.fn();

// The stores live as long as the module does, so every test takes a quiz of
// its own.
const createQuiz = () => {
  const survey = createNineQuestionSurvey({ id: crypto.randomUUID() });

  return { survey, store: getSurveySessionStore(survey) };
};

// Three questions done, and the card up at that boundary.
const renderCardUp = () => {
  const { survey, store } = createQuiz();

  store.setState(
    {
      ...createStartedSession(survey, 3),
      phase: "checkpoints",
      checkpointRecord: { cardsShown: [{ card: CARD }], timeSamples: [] },
    },
    true,
  );

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

const press = (name: string) => {
  fireEvent.click(getButton(name));
  finishChange();
};

// An answer is recorded when its acknowledgement has played; the screen takes
// the next press when the new content is there.
const answerQuestion = () => {
  fireEvent.click(getButton("Za"));
  act(() => vi.advanceTimersByTime(ACKNOWLEDGEMENT_MS));
  finishChange();
};

const expectNewTraitCard = () => {
  const pill = within(getCard()).getByTestId("trait-pill");

  expect(pill).toBeVisible();
  expect(pill).toHaveTextContent(/^Monarchizm$/);
  expect(within(getCard()).getByRole("paragraph")).toHaveTextContent(STATEMENT);
};

describe("<SurveyQuestionnaireSession /> - the new trait card", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Element.prototype.scrollIntoView = scrollIntoView;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
    sessionStorage.clear();
  });

  describe("given a session in the Checkpoints phase with a new trait card as the last card shown", () => {
    it("draws the pill and the statement of that card", () => {
      const { getSession } = renderCardUp();

      expectNewTraitCard();
      expect(screen.queryByRole("list")).not.toBeInTheDocument();
      expect(screen.queryByText(FOURTH_STATEMENT)).not.toBeInTheDocument();
      expect(getSession().phase).toBe("checkpoints");
    });

    it('closes the checkpoint when "Dalej" is activated', () => {
      const { getSession } = renderCardUp();

      press(CONTINUE);

      expect(queryCard()).not.toBeInTheDocument();
      expect(screen.getByText(FOURTH_STATEMENT)).toBeVisible();
      expect(getSession().phase).toBe("questions");
      expect(getSession().areCheckpointsOff).toBe(false);
      expect(getSession().checkpointRecord.cardsShown).toEqual([
        { card: CARD },
      ]);
    });

    it('turns checkpoints off when "Wyłącz checkpointy" is activated', () => {
      const { getSession } = renderCardUp();

      press(OPT_OUT);

      expect(queryCard()).not.toBeInTheDocument();
      expect(screen.getByText(FOURTH_STATEMENT)).toBeVisible();
      expect(getSession().phase).toBe("questions");
      expect(getSession().areCheckpointsOff).toBe(true);
    });

    it("leaves the card up when the pill is pressed", () => {
      const { getSession } = renderCardUp();

      fireEvent.click(within(getCard()).getByTestId("trait-pill"));
      finishChange();

      expectNewTraitCard();
      expect(getSession().phase).toBe("checkpoints");
    });
  });

  describe("when the screen is mounted again with the stored session while the card is up", () => {
    it("shows the same card with the same words", () => {
      const { survey, unmount } = renderCardUp();

      unmount();
      renderWithI18n(<SurveyQuestionnaireSession survey={survey} />);

      expectNewTraitCard();
    });
  });

  describe("given a quiz as the API sends it today, with no list of traits", () => {
    it("never shows the card, whatever is answered", () => {
      const { survey, store } = createQuiz();

      store.setState(createStartedSession(survey), true);
      renderWithI18n(<SurveyQuestionnaireSession survey={survey} />);

      for (const _question of survey.questions) {
        answerQuestion();

        expect(screen.queryByTestId("trait-pill")).not.toBeInTheDocument();

        // The halfway card is the only one this quiz can fire.
        if (queryCard()) {
          press(CONTINUE);
        }
      }

      expect(store.getState().phase).toBe("demographics");
      expect(
        store
          .getState()
          .checkpointRecord.cardsShown.map(
            (shown) => (shown as { card: { type: string } }).card.type,
          ),
      ).toEqual(["halfway"]);
    });
  });
});

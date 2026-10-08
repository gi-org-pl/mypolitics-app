import { act, fireEvent, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getAnswerCounts } from "@/services/api/client/getAnswerCounts";
import type { CheckpointAggregates } from "@/types/checkpoint";
import { getSurveySessionStore } from "@/utils/survey/getSurveySessionStore";
import { createNineQuestionSurvey } from "@/utils/vitest/createNineQuestionSurvey";
import { createStartedSession } from "@/utils/vitest/createStartedSession";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { SurveyQuestionnaireSession } from "./SurveyQuestionnaireSession";
import { CONTENT_CHANGE_MS } from "./SurveyQuestionnaireSession.constants";

// The stats chart card in the screen: a quiz of nine questions on the
// agreement scale, the real registry, the real engine and the real card. Only
// the request for the answer counts is mocked: no source of them exists.
vi.mock("@/services/api/client/getAnswerCounts", () => ({
  getAnswerCounts: vi.fn(),
}));

// The acknowledgement of an answer: it reports the press when it has played.
const ACKNOWLEDGEMENT_MS = 300;
const CONTINUE = "Dalej";
const SIXTH_STATEMENT = "Stwierdzenie q6.";
const PIE_DESCRIPTION = "Za: 8%, Przeciw: 62%, Brak odpowiedzi: 30%";
// Of a thousand results in which the fifth question was shown, 80 agreed with
// it, 620 disagreed and 300 skipped it: agreeing is the side of 8%.
const COUNTS: CheckpointAggregates = {
  q5: { resultsCounted: 1000, chosen: { "q5-a1": 80, "q5-a2": 620 } },
};

const scrollIntoView = vi.fn();

type Counts = CheckpointAggregates | undefined;

// The counts arrive a moment after they were asked for, as a response does.
const flushCounts = () =>
  act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });

// The stores and the loaded counts live as long as their modules do, so
// every test takes a quiz of its own.
const renderScreen = async (done = 4) => {
  const survey = createNineQuestionSurvey({ id: crypto.randomUUID() });
  const store = getSurveySessionStore(survey);

  store.setState(createStartedSession(survey, done), true);

  const view = renderWithI18n(<SurveyQuestionnaireSession survey={survey} />);

  await flushCounts();

  return { ...view, survey, getSession: store.getState };
};

const getButton = (name: string) => screen.getByRole("button", { name });

const queryCard = () => screen.queryByRole("region", { name: "Checkpoint" });

const getCard = () => screen.getByRole("region", { name: "Checkpoint" });

const queryPie = () => screen.queryByRole("img", { name: PIE_DESCRIPTION });

const finishChange = () => act(() => vi.advanceTimersByTime(CONTENT_CHANGE_MS));

// An answer is recorded when its acknowledgement has played; the screen takes
// the next press when the new content is there.
const answerQuestion = (name = "Za") => {
  fireEvent.click(getButton(name));
  act(() => vi.advanceTimersByTime(ACKNOWLEDGEMENT_MS));
  finishChange();
};

const press = (name: string) => {
  fireEvent.click(getButton(name));
  finishChange();
};

const getShownTypes = (getSession: () => { checkpointRecord: unknown }) =>
  (
    getSession().checkpointRecord as {
      cardsShown: { card: { type: string } }[];
    }
  ).cardsShown.map(({ card }) => card.type);

// With no stats card the halfway card takes the boundary after the fifth
// question, as it does in every quiz of nine.
const expectHalfwayCard = () => {
  expect(within(getCard()).getByText("55%")).toBeVisible();
  expect(screen.queryByRole("img")).not.toBeInTheDocument();
};

describe("<SurveyQuestionnaireSession /> - the stats card", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Element.prototype.scrollIntoView = scrollIntoView;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
    sessionStorage.clear();
  });

  describe("given counts in which agreeing with the fifth question is rare, when the taker agrees with it", () => {
    it('shows the card with the pie, the "for" statement and the percent', async () => {
      vi.mocked(getAnswerCounts).mockResolvedValue(COUNTS);

      const { getSession } = await renderScreen();

      answerQuestion("Za");

      expect(queryPie()).toBeVisible();
      expect(
        within(getCard())
          .getAllByRole("listitem")
          .map((row) => row.textContent),
      ).toEqual(["Za", "Przeciw", "Brak odpowiedzi"]);
      // The line is drawn from a pool, and its lines name the percent and
      // the statement in either order.
      expect(within(getCard()).getByRole("paragraph")).toHaveTextContent("8%");
      expect(within(getCard()).getByRole("paragraph")).toHaveTextContent(
        "„Stwierdzenie q5”",
      );
      expect(screen.queryByText(SIXTH_STATEMENT)).not.toBeInTheDocument();
      expect(getSession().phase).toBe("checkpoints");
      expect(getSession().checkpointRecord.cardsShown).toEqual([
        {
          card: {
            type: "stats",
            boundary: 5,
            line: { pool: "stats-for", index: expect.any(Number) },
            questionId: "q5",
            thesis: "Stwierdzenie q5.",
            side: "for",
            counts: { for: 80, against: 620, noAnswer: 300 },
            percent: 8,
          },
        },
      ]);
    });

    it("asks for the counts of the quiz once, by its identifier alone", async () => {
      vi.mocked(getAnswerCounts).mockResolvedValue(COUNTS);

      const { survey } = await renderScreen();

      answerQuestion("Za");

      expect(getAnswerCounts).toHaveBeenCalledTimes(1);
      expect(getAnswerCounts).toHaveBeenCalledWith(survey.id);
    });

    it('leads to the next question on "Dalej", with no second request', async () => {
      vi.mocked(getAnswerCounts).mockResolvedValue(COUNTS);

      const { getSession } = await renderScreen();

      answerQuestion("Za");
      press(CONTINUE);
      await flushCounts();

      expect(screen.getByText(SIXTH_STATEMENT)).toBeVisible();
      expect(queryCard()).not.toBeInTheDocument();
      expect(getSession().phase).toBe("questions");
      expect(getAnswerCounts).toHaveBeenCalledTimes(1);
    });

    it("keeps the loaded counts out of the session and out of storage", async () => {
      vi.mocked(getAnswerCounts).mockResolvedValue(COUNTS);

      const { getSession } = await renderScreen();

      answerQuestion("Za");

      // The card that was shown keeps its own three totals, as every card
      // keeps its values; the counts as loaded go nowhere.
      expect(JSON.stringify(getSession())).not.toContain("resultsCounted");
      expect(JSON.stringify({ ...sessionStorage })).not.toContain(
        "resultsCounted",
      );
      expect(JSON.stringify({ ...localStorage })).not.toContain(
        "resultsCounted",
      );
    });
  });

  describe("given the same counts, when the taker disagrees with the fifth question", () => {
    it("shows no stats card", async () => {
      vi.mocked(getAnswerCounts).mockResolvedValue(COUNTS);

      const { getSession } = await renderScreen();

      answerQuestion("Przeciw");

      expect(queryPie()).not.toBeInTheDocument();
      expectHalfwayCard();
      expect(getShownTypes(getSession)).toEqual(["halfway"]);
    });
  });

  describe("given the same counts, when the taker skips the fifth question", () => {
    it("shows no stats card", async () => {
      vi.mocked(getAnswerCounts).mockResolvedValue(COUNTS);

      const { getSession } = await renderScreen();

      press("Pomiń");

      expect(queryPie()).not.toBeInTheDocument();
      expectHalfwayCard();
      expect(getShownTypes(getSession)).toEqual(["halfway"]);
    });
  });

  describe("given the source gives nothing - no address, a failure, unusable counts", () => {
    it("never shows the card and shows no message", async () => {
      vi.mocked(getAnswerCounts).mockResolvedValue(undefined);

      const { getSession } = await renderScreen();

      answerQuestion("Za");

      expect(screen.queryByRole("img")).not.toBeInTheDocument();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expectHalfwayCard();
      expect(getShownTypes(getSession)).toEqual(["halfway"]);
    });

    it("lets every question be answered as usual", async () => {
      vi.mocked(getAnswerCounts).mockResolvedValue(undefined);

      const { getSession } = await renderScreen(0);

      for (let done = 1; done <= 9; done += 1) {
        answerQuestion("Za");

        expect(getSession().entries).toHaveLength(done);
        expect(screen.queryByRole("img")).not.toBeInTheDocument();
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();

        if (queryCard()) {
          press(CONTINUE);
        }
      }

      expect(getSession().phase).toBe("demographics");
      expect(getShownTypes(getSession)).toEqual(["halfway"]);
      expect(getAnswerCounts).toHaveBeenCalledTimes(1);
    });
  });

  describe("given the counts arrive after the fifth question was answered", () => {
    it("shows no card for that question", async () => {
      let arrive: (counts: Counts) => void = () => undefined;

      vi.mocked(getAnswerCounts).mockReturnValue(
        new Promise((resolve) => {
          arrive = resolve;
        }),
      );

      const { getSession } = await renderScreen();

      // The question did not wait for the counts.
      answerQuestion("Za");

      expect(getSession().entries).toHaveLength(5);
      expectHalfwayCard();

      await act(async () => arrive(COUNTS));

      // The card on screen stays as it is, and the question is not brought up
      // later.
      expectHalfwayCard();
      expect(getShownTypes(getSession)).toEqual(["halfway"]);

      press(CONTINUE);

      expect(screen.getByText(SIXTH_STATEMENT)).toBeVisible();
      expect(queryPie()).not.toBeInTheDocument();
    });
  });
});

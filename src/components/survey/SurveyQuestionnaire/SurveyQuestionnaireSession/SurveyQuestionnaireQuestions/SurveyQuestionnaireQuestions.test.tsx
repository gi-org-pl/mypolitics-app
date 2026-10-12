import { act, fireEvent, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Survey } from "@/types/survey";
import { skipQuestion } from "@/utils/survey/questions/skipQuestion";
import { getSurveySessionStore } from "@/utils/survey/session/getSurveySessionStore";
import { createStartedSession } from "@/utils/vitest/survey/createStartedSession";
import { createSurvey } from "@/utils/vitest/survey/createSurvey";
import { renderPhaseContent } from "@/utils/vitest/survey/renderPhaseContent";

import { SurveyQuestionnaireQuestions } from "./SurveyQuestionnaireQuestions";

// The acknowledgement of an answer: it reports the press when it has played.
const ACKNOWLEDGEMENT_MS = 300;
const EXPLANATION = "Chodzi o główne źródło energii w najbliższych dekadach.";
const FIRST_STATEMENT = "Podatki powinny być niższe.";
const SECOND_STATEMENT = "Z czego Polska powinna czerpać energię?";

// The stores live as long as the module does, so every test takes a quiz of
// its own.
const createQuiz = (): Survey => createSurvey({ id: crypto.randomUUID() });

const renderPhase = (done = 0, survey = createQuiz()) =>
  renderPhaseContent(
    SurveyQuestionnaireQuestions,
    survey,
    createStartedSession(survey, done),
  );

const getAnswer = (name: string) => screen.getByRole("button", { name });

const getSkipButton = () => screen.getByRole("button", { name: "Pomiń" });

const getExplanationButton = () =>
  screen.getByRole("button", { expanded: false });

const finishAcknowledgement = () =>
  act(() => vi.advanceTimersByTime(ACKNOWLEDGEMENT_MS));

// The bubble of a question: the element that slides.
const getBubble = (statement: string) =>
  screen.getByText(statement).closest("[style]") as HTMLElement;

const allowMotion = () =>
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({ matches: false })),
  );

describe("<SurveyQuestionnaireQuestions />", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    sessionStorage.clear();
  });

  describe("when the phase opens", () => {
    it("shows the statement of the current question, and no explanation it does not have", () => {
      renderPhase();

      expect(screen.getByText("Podatki powinny być niższe.")).toBeVisible();
      expect(
        screen.queryByRole("button", { expanded: false }),
      ).not.toBeInTheDocument();
    });

    it("shows the statement and the explanation of the current question", () => {
      renderPhase(1);

      expect(
        screen.getByText("Z czego Polska powinna czerpać energię?"),
      ).toBeVisible();
      expect(getExplanationButton()).toBeInTheDocument();
      expect(screen.getByText(EXPLANATION)).toBeInTheDocument();
    });

    it("shows the answers of the current question, then Pomiń", () => {
      renderPhase(1);

      expect(
        within(
          screen.getByRole("group", {
            name: "Z czego Polska powinna czerpać energię?",
          }),
        )
          .getAllByRole("button")
          .map((answer) => answer.textContent),
      ).toEqual(["Z węgla", "Z atomu", "Ze źródeł odnawialnych"]);
      expect(screen.getAllByRole("button").at(-1)).toBe(getSkipButton());
    });
  });

  describe("when an answer is pressed", () => {
    it("locks the screen at the press", () => {
      const { lock, getSession } = renderPhase();

      fireEvent.click(getAnswer("Częściowo za"));

      expect(lock).toHaveBeenCalledTimes(1);
      expect(getSession().entries).toEqual([]);
    });

    it("records the answer when the acknowledgement has played, once", () => {
      const { getSession } = renderPhase();

      fireEvent.click(getAnswer("Częściowo za"));
      finishAcknowledgement();

      expect(getSession().entries).toEqual([
        { questionId: "q1", answerId: "q1-agree" },
      ]);

      act(() => vi.advanceTimersByTime(ACKNOWLEDGEMENT_MS * 4));

      expect(getSession().entries).toHaveLength(1);
    });

    it("shows the next question", () => {
      renderPhase();

      fireEvent.click(getAnswer("Częściowo za"));
      finishAcknowledgement();

      expect(
        screen.getByText("Z czego Polska powinna czerpać energię?"),
      ).toBeVisible();
      expect(
        screen.queryByText("Podatki powinny być niższe."),
      ).not.toBeInTheDocument();
    });
  });

  describe("when one question takes the place of another", () => {
    it("slides the bubbles: the one before leaves while the new one arrives", () => {
      allowMotion();
      renderPhase();

      fireEvent.click(getSkipButton());

      expect(getBubble(FIRST_STATEMENT)).toHaveAttribute(
        "data-leaving",
        "forwards",
      );
      expect(getBubble(SECOND_STATEMENT)).toHaveAttribute(
        "data-arriving",
        "forwards",
      );
    });

    it("changes the answers in place and at once: they do not slide", () => {
      allowMotion();
      renderPhase();

      const answers = screen.getByRole("group", { name: FIRST_STATEMENT });

      fireEvent.click(getSkipButton());

      expect(answers).toHaveAccessibleName(SECOND_STATEMENT);
      expect(screen.getAllByRole("group")).toHaveLength(1);
      expect(
        within(answers)
          .getAllByRole("button")
          .map((answer) => answer.textContent),
      ).toEqual(["Z węgla", "Z atomu", "Ze źródeł odnawialnych"]);
      expect(answers.closest("[data-leaving], [data-arriving]")).toBeNull();
    });

    it("keeps the answers in a box that follows the height of their list, apart from the bubbles", () => {
      renderPhase();

      const answersBox = screen
        .getByRole("group", { name: FIRST_STATEMENT })
        .closest(".data-\\[animating\\=true\\]\\:overflow-y-clip");
      const bubbleBox = screen
        .getByText(FIRST_STATEMENT)
        .closest(".data-\\[animating\\=true\\]\\:overflow-y-clip");

      expect(answersBox).toContainElement(getSkipButton());
      expect(bubbleBox).not.toBeNull();
      expect(bubbleBox).not.toBe(answersBox);
      expect(bubbleBox?.nextElementSibling).toBe(answersBox);
    });

    it("gives the new question as many seconds of slide as the one before", () => {
      allowMotion();
      renderPhase();

      fireEvent.click(getSkipButton());
      act(() => vi.advanceTimersByTime(299));

      expect(screen.getByText(FIRST_STATEMENT)).toBeInTheDocument();

      act(() => vi.advanceTimersByTime(1));

      expect(screen.queryByText(FIRST_STATEMENT)).not.toBeInTheDocument();
      expect(screen.getByText(SECOND_STATEMENT)).toBeVisible();
    });

    it("replaces the question at once where nothing may move", () => {
      renderPhase();

      fireEvent.click(getSkipButton());

      expect(screen.queryByText(FIRST_STATEMENT)).not.toBeInTheDocument();
      expect(getBubble(SECOND_STATEMENT)).not.toHaveAttribute("data-arriving");
    });
  });

  describe("when another question took its place while an answer was being acknowledged", () => {
    it("records no answer for the new question", () => {
      const survey = createQuiz();
      const { getSession } = renderPhase(0, survey);
      const store = getSurveySessionStore(survey);

      fireEvent.click(getAnswer("Częściowo za"));
      act(() => store.setState(skipQuestion(survey, store.getState()), true));
      finishAcknowledgement();
      act(() => vi.advanceTimersByTime(ACKNOWLEDGEMENT_MS * 4));

      expect(getSession().entries).toEqual([{ questionId: "q1" }]);
      expect(screen.getByText(SECOND_STATEMENT)).toBeVisible();
    });
  });

  describe("when the same answer is pressed twice quickly", () => {
    it("records one answer", () => {
      const { getSession } = renderPhase();

      fireEvent.click(getAnswer("Częściowo za"));
      fireEvent.click(getAnswer("Częściowo za"));
      finishAcknowledgement();
      act(() => vi.advanceTimersByTime(ACKNOWLEDGEMENT_MS * 4));

      expect(getSession().entries).toEqual([
        { questionId: "q1", answerId: "q1-agree" },
      ]);
    });
  });

  describe("when the question leaves the screen while an answer is being acknowledged", () => {
    it("records nothing: the answer was not acknowledged", () => {
      const { getSession, unmount } = renderPhase();

      fireEvent.click(getAnswer("Częściowo za"));
      unmount();
      finishAcknowledgement();
      act(() => vi.advanceTimersByTime(ACKNOWLEDGEMENT_MS * 4));

      expect(getSession().entries).toEqual([]);
      expect(getSession().phase).toBe("questions");
    });
  });

  describe('when "Pomiń" is pressed', () => {
    it("records a skip at once, and locks nothing", () => {
      const { lock, getSession } = renderPhase();

      fireEvent.click(getSkipButton());

      expect(getSession().entries).toEqual([{ questionId: "q1" }]);
      expect(lock).not.toHaveBeenCalled();
    });
  });

  describe("when the last question is done", () => {
    it("leads to demographics, and draws nothing of its own", () => {
      const { getSession, container } = renderPhase(4);

      fireEvent.click(getSkipButton());

      expect(getSession().phase).toBe("demographics");
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe("given a session with no open question", () => {
    it("draws nothing", () => {
      const survey = createQuiz();
      const { container } = renderPhaseContent(
        SurveyQuestionnaireQuestions,
        survey,
        createStartedSession(survey, survey.questions.length),
      );

      expect(container).toBeEmptyDOMElement();
    });
  });
});

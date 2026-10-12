import { act, fireEvent, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SURVEY_SESSION_CONFIG } from "@/constants/survey";
import { createResult } from "@/services/api/client/createResult";
import {
  CreateResultOutcome,
  type Survey,
  SurveyResultState,
  type SurveySession,
} from "@/types/survey";
import { getResultsUrl } from "@/utils/survey/result/getResultsUrl";
import { createSession } from "@/utils/survey/session/createSession";
import { getSessionStorageKey } from "@/utils/survey/session/getSessionStorageKey";
import { getSurveySessionStore } from "@/utils/survey/session/getSurveySessionStore";
import { openAddress } from "@/utils/url/openAddress";
import { createStartedSession } from "@/utils/vitest/createStartedSession";
import { createSurvey } from "@/utils/vitest/createSurvey";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";
import { QUESTION_SLIDE_MS } from "./SurveyQuestionnaireQuestions/SurveyQuestionSlide/SurveyQuestionSlide.constants";
import { SurveyQuestionnaireSession } from "./SurveyQuestionnaireSession";
import { CONTENT_CHANGE_MS } from "./SurveyQuestionnaireSession.constants";

vi.mock("@/services/api/client/createResult");
vi.mock("@/utils/url/openAddress");

// The acknowledgement of an answer: it reports the press when it has played.
const ACKNOWLEDGEMENT_MS = 300;
const FIRST_STATEMENT = "Podatki powinny być niższe.";
const SECOND_STATEMENT = "Z czego Polska powinna czerpać energię?";
const PROMPT = "Wybierz 1 najważniejszy dla Ciebie temat.";
const WAITING = "Liczymy Twoje wyniki";
const ALL_DONE = createSurvey().questions.length;

// Fewer than two visible categories: such a quiz has no category select.
const ONE_VISIBLE_CATEGORY = [
  { id: "economy", name: "Gospodarka", weight: 1, isHidden: false },
  { id: "ecology", name: "Ekologia", weight: 1, isHidden: true },
  { id: "hidden", name: "Pytania kontrolne", weight: 1, isHidden: true },
];
const NO_VISIBLE_CATEGORY = ONE_VISIBLE_CATEGORY.map((category) => ({
  ...category,
  isHidden: true,
}));

const scrollIntoView = vi.fn();

// The stores live as long as the module does, so every test takes a quiz of
// its own. q1 economy, q2 ecology, q3 economy, q4 hidden, q5 ecology.
const createQuiz = (overrides: Partial<Survey> = {}): Survey =>
  createSurvey({ id: crypto.randomUUID(), ...overrides });

const renderScreen = (
  toSession: (survey: Survey) => SurveySession = createSession,
  survey = createQuiz(),
) => {
  const store = getSurveySessionStore(survey);

  store.setState(toSession(survey), true);

  return {
    ...renderWithI18n(<SurveyQuestionnaireSession survey={survey} />),
    survey,
    getSession: store.getState,
  };
};

const onQuestion =
  (done: number, overrides: Partial<SurveySession> = {}) =>
  (survey: Survey): SurveySession => ({
    ...createStartedSession(survey, done),
    ...overrides,
  });

const getBar = () => screen.getByRole("progressbar", { name: "Postęp quizu" });

const getBackButton = (name = "Poprzednie pytanie") =>
  screen.getByRole("button", { name });

const getResetButton = () =>
  screen.getByRole("button", { name: "Zacznij od nowa" });

const getSkipButton = () => screen.getByRole("button", { name: "Pomiń" });

const getLockedElement = (container: HTMLElement) =>
  container.firstElementChild as HTMLElement;

const getContent = (text: string) =>
  screen.getByText(text).closest("[tabindex='-1']") as HTMLElement;

const finishChange = () => act(() => vi.advanceTimersByTime(CONTENT_CHANGE_MS));

// The bubble of a question: the element that slides.
const getBubble = (statement: string) =>
  screen
    .getByText(statement)
    .closest("[data-leaving], [data-arriving]") as HTMLElement;

const queryLeavingBubbles = (container: HTMLElement) =>
  container.querySelectorAll("[data-leaving]");

const allowMotion = () =>
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({ matches: false })),
  );

const finishAcknowledgement = () =>
  act(() => vi.advanceTimersByTime(ACKNOWLEDGEMENT_MS));

const finishRequests = () => act(async () => undefined);

const showPageFromMemory = () =>
  act(() => {
    window.dispatchEvent(
      new PageTransitionEvent("pageshow", { persisted: true }),
    );
  });

describe("<SurveyQuestionnaireSession />", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Element.prototype.scrollIntoView = scrollIntoView;
    vi.mocked(createResult).mockResolvedValue(CreateResultOutcome.Stored);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.resetAllMocks();
    vi.unstubAllGlobals();
    sessionStorage.clear();
  });

  describe("the frame", () => {
    it("passes the frame of category select to the bar and the controls", () => {
      renderScreen();

      expect(getBar()).toHaveAttribute("aria-valuenow", "0");
      expect(screen.getByText("Quiz testowy")).toBeVisible();
      expect(getBackButton()).toBeDisabled();
      expect(getResetButton()).toBeDisabled();
      expect(screen.getByRole("group", { name: PROMPT })).toBeInTheDocument();
    });

    it("passes the frame of a question to the bar and the controls", () => {
      renderScreen(onQuestion(2));

      // Two of five are done: 40%, which the bar shows as 47%.
      expect(getBar()).toHaveAttribute("aria-valuenow", "47");
      expect(screen.getByText("Gospodarka")).toBeVisible();
      expect(
        screen.getByText("Pozostałe pytania w kategorii: 1"),
      ).toBeInTheDocument();
      expect(getBackButton()).toBeEnabled();
      expect(getResetButton()).toBeEnabled();
    });

    it("draws no bar where the phase has none", () => {
      renderScreen(onQuestion(ALL_DONE));

      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Twoja tożsamość" }),
      ).toBeInTheDocument();
    });

    it("keeps the bar, the controls and the content of the phase mounted between two questions", () => {
      renderScreen(onQuestion(0));

      const bar = getBar();
      const backButton = getBackButton();
      const firstContent = getContent(FIRST_STATEMENT);

      fireEvent.click(getSkipButton());

      expect(getBar()).toBe(bar);
      expect(getBackButton()).toBe(backButton);
      expect(getContent(SECOND_STATEMENT)).toBe(firstContent);
      expect(screen.queryByText(FIRST_STATEMENT)).not.toBeInTheDocument();
    });

    it("mounts new content for another phase, under the same bar and controls", () => {
      renderScreen();

      const backButton = getBackButton();
      const select = screen.getByRole("group", { name: PROMPT });
      const selectContent = select.closest("[tabindex='-1']");

      fireEvent.click(getSkipButton());

      expect(getBackButton()).toBe(backButton);
      expect(select).not.toBeInTheDocument();
      expect(getContent(FIRST_STATEMENT)).not.toBe(selectContent);
    });

    it("keeps the content in a box that follows its height, whatever the phase", () => {
      const { container } = renderScreen();
      const getBox = () =>
        container.querySelector(
          "[data-locked] > .data-\\[animating\\=true\\]\\:overflow-y-clip",
        );
      const box = getBox();

      expect(box).toContainElement(screen.getByRole("group", { name: PROMPT }));

      fireEvent.click(getSkipButton());

      expect(getBox()).toBe(box);
      expect(box).toContainElement(getContent(FIRST_STATEMENT));
      expect(box?.previousElementSibling).toHaveAttribute("role", "status");
    });

    it('announces the pill once when it becomes "Prawie koniec!" and "Prawie gotowe"', async () => {
      vi.mocked(createResult).mockReturnValue(new Promise(() => undefined));
      renderScreen(onQuestion(ALL_DONE - 1));

      const [announcement] = screen.getAllByRole("status");

      expect(announcement).toBeEmptyDOMElement();

      fireEvent.click(getSkipButton());

      expect(announcement).toHaveTextContent("Prawie koniec!");

      finishChange();
      fireEvent.click(getSkipButton());

      expect(announcement).toHaveTextContent("Prawie gotowe");
      expect(screen.getAllByRole("status")[0]).toBe(announcement);
    });

    it("passes an empty quiz name for a quiz without one", () => {
      renderScreen(createSession, createQuiz({ name: undefined }));

      expect(getBackButton().nextElementSibling).toBe(getResetButton());
    });
  });

  describe("when back is pressed", () => {
    it("calls back of the session: the question before is open again", () => {
      const { getSession } = renderScreen(onQuestion(1));

      fireEvent.click(getBackButton());

      expect(getSession().entries).toEqual([]);
      expect(screen.getByText(FIRST_STATEMENT)).toBeVisible();
      expect(getBackButton()).toBeDisabled();
    });

    it("leads from demographics to the last question", () => {
      const { getSession } = renderScreen(onQuestion(ALL_DONE));

      fireEvent.click(getBackButton());

      expect(getSession().phase).toBe("questions");
      expect(getSession().entries).toHaveLength(ALL_DONE - 1);
      expect(
        screen.getByText("Kto powinien płacić za ochronę klimatu?"),
      ).toBeVisible();
    });
  });

  describe.each([
    ["one visible category", ONE_VISIBLE_CATEGORY],
    ["no visible category", NO_VISIBLE_CATEGORY],
  ])("given a quiz with %s", (_name, categories) => {
    const queryCategorySelect = () =>
      screen.queryByRole("group", { name: /^Wybierz / });

    it("draws no category select: the session starts on the first question", () => {
      const { getSession } = renderScreen(
        createSession,
        createQuiz({ categories }),
      );

      expect(getSession().phase).toBe("questions");
      expect(queryCategorySelect()).not.toBeInTheDocument();
      expect(screen.getByText(FIRST_STATEMENT)).toBeVisible();
      expect(
        screen.getByRole("group", { name: FIRST_STATEMENT }),
      ).toBeInTheDocument();
      expect(getBar()).toHaveAttribute("aria-valuenow", "0");
    });

    it("has nothing to step back to or to reset on the first question", () => {
      const { getSession } = renderScreen(
        createSession,
        createQuiz({ categories }),
      );
      const session = getSession();

      expect(getBackButton()).toBeDisabled();
      expect(getResetButton()).toBeDisabled();

      fireEvent.click(getBackButton());
      fireEvent.click(getResetButton());

      expect(getSession()).toBe(session);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("steps back from the second question to the first and no further, never to a select", () => {
      const { getSession } = renderScreen(
        createSession,
        createQuiz({ categories }),
      );

      fireEvent.click(getSkipButton());
      finishChange();

      expect(screen.getByText(SECOND_STATEMENT)).toBeVisible();

      fireEvent.click(getBackButton());
      finishChange();

      expect(getSession()).toMatchObject({ phase: "questions", entries: [] });
      expect(screen.getByText(FIRST_STATEMENT)).toBeVisible();
      expect(queryCategorySelect()).not.toBeInTheDocument();
      expect(getBackButton()).toBeDisabled();
    });

    it("comes back to the first question after a confirmed reset", () => {
      const { getSession } = renderScreen(
        onQuestion(2),
        createQuiz({ categories }),
      );

      fireEvent.click(getResetButton());
      fireEvent.click(screen.getByRole("button", { name: "Resetuj quiz" }));
      finishChange();

      expect(getSession()).toMatchObject({ phase: "questions", entries: [] });
      expect(screen.getByText(FIRST_STATEMENT)).toBeVisible();
      expect(queryCategorySelect()).not.toBeInTheDocument();
    });
  });

  describe("when reset is confirmed", () => {
    it("calls reset of the session and shows the first phase", () => {
      const { getSession } = renderScreen(
        onQuestion(2, { areCheckpointsOff: true }),
      );
      const { id } = getSession();

      fireEvent.click(getResetButton());
      fireEvent.click(screen.getByRole("button", { name: "Resetuj quiz" }));

      expect(getSession().id).not.toBe(id);
      expect(getSession()).toMatchObject({
        phase: "category-select",
        entries: [],
        prioritizedCategoryIds: [],
        areCheckpointsOff: true,
      });
      expect(screen.getByRole("group", { name: PROMPT })).toBeInTheDocument();
    });
  });

  describe("when the reset dialog is dismissed", () => {
    it("changes nothing", () => {
      const { getSession } = renderScreen(onQuestion(2));
      const session = getSession();

      fireEvent.click(getResetButton());

      expect(
        screen.getByRole("dialog", { name: "Rozpocząć od nowa?" }),
      ).toBeInTheDocument();

      fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });

      expect(getSession()).toBe(session);
      expect(
        screen.getByText(
          "Państwo powinno dopłacać do kredytów mieszkaniowych.",
        ),
      ).toBeVisible();
    });
  });

  describe("when the content changes", () => {
    it("moves forwards after an answer", () => {
      renderScreen(onQuestion(0));

      fireEvent.click(screen.getByRole("button", { name: "Częściowo za" }));
      finishAcknowledgement();

      expect(getContent(SECOND_STATEMENT)).toHaveAttribute(
        "data-direction",
        "forwards",
      );
    });

    it("moves forwards after a skip", () => {
      renderScreen(onQuestion(0));

      fireEvent.click(getSkipButton());

      expect(getContent(SECOND_STATEMENT)).toHaveAttribute(
        "data-direction",
        "forwards",
      );
    });

    it("moves forwards after a phase forward", () => {
      renderScreen();

      fireEvent.click(getSkipButton());

      expect(getContent(FIRST_STATEMENT)).toHaveAttribute(
        "data-direction",
        "forwards",
      );
    });

    it("moves backwards after back", () => {
      renderScreen(onQuestion(1));

      fireEvent.click(getBackButton());

      expect(getContent(FIRST_STATEMENT)).toHaveAttribute(
        "data-direction",
        "backwards",
      );
    });

    it("does not move the content the screen appears with", () => {
      renderScreen(onQuestion(0));

      expect(getContent(FIRST_STATEMENT)).not.toHaveAttribute("data-direction");
    });

    it("takes no press until the new content is there", () => {
      const { container, getSession } = renderScreen(onQuestion(0));

      fireEvent.click(getSkipButton());

      expect(getLockedElement(container)).toHaveAttribute(
        "data-locked",
        "true",
      );

      fireEvent.click(getSkipButton());
      fireEvent.click(getBackButton());
      fireEvent.click(getResetButton());

      expect(getSession().entries).toEqual([{ questionId: "q1" }]);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(getSkipButton()).toBeEnabled();

      finishChange();

      expect(getLockedElement(container)).toHaveAttribute(
        "data-locked",
        "false",
      );

      fireEvent.click(getSkipButton());

      expect(getSession().entries).toEqual([
        { questionId: "q1" },
        { questionId: "q2" },
      ]);
    });

    it("puts the focus on the top of the new content", () => {
      renderScreen(onQuestion(0));

      expect(document.body).toHaveFocus();

      fireEvent.click(getSkipButton());

      expect(getContent(SECOND_STATEMENT)).toHaveFocus();
    });

    it("returns the view to the top of the screen", () => {
      renderScreen(onQuestion(0));

      expect(scrollIntoView).not.toHaveBeenCalled();

      fireEvent.click(getSkipButton());

      expect(scrollIntoView).toHaveBeenCalledTimes(1);
      expect(scrollIntoView.mock.contexts[0]).toContainElement(getBar());
    });
  });

  describe("when one question takes the place of another", () => {
    beforeEach(() => {
      allowMotion();
    });

    it("sends the bubble before to the left and brings the new one in from the right after an answer", () => {
      const { container } = renderScreen(onQuestion(0));

      fireEvent.click(screen.getByRole("button", { name: "Częściowo za" }));
      finishAcknowledgement();

      expect(getBubble(FIRST_STATEMENT)).toHaveAttribute(
        "data-leaving",
        "forwards",
      );
      expect(getBubble(SECOND_STATEMENT)).toHaveAttribute(
        "data-arriving",
        "forwards",
      );
      expect(queryLeavingBubbles(container)).toHaveLength(1);
    });

    it("does the same after a skip", () => {
      renderScreen(onQuestion(0));

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

    it("turns the directions round after back", () => {
      renderScreen(onQuestion(1));

      fireEvent.click(getBackButton());

      expect(getBubble(SECOND_STATEMENT)).toHaveAttribute(
        "data-leaving",
        "backwards",
      );
      expect(getBubble(FIRST_STATEMENT)).toHaveAttribute(
        "data-arriving",
        "backwards",
      );
    });

    it("moves neither the bar, the controls nor the answers sideways", () => {
      renderScreen(onQuestion(0));

      fireEvent.click(getSkipButton());

      for (const still of [
        getBar(),
        getBackButton(),
        getSkipButton(),
        screen.getByRole("group", { name: SECOND_STATEMENT }),
      ]) {
        expect(still.closest("[data-leaving], [data-arriving]")).toBeNull();
      }
    });

    it("takes no press while the bubbles move: no question is skipped and two bubbles are the most there are", () => {
      const { container, getSession } = renderScreen(onQuestion(0));

      fireEvent.click(getSkipButton());
      fireEvent.click(getSkipButton());
      fireEvent.click(getBackButton());
      fireEvent.click(
        screen.getByRole("button", { name: "Ze źródeł odnawialnych" }),
      );
      act(() => vi.advanceTimersByTime(CONTENT_CHANGE_MS - 1));

      expect(getSession().entries).toEqual([{ questionId: "q1" }]);
      expect(queryLeavingBubbles(container)).toHaveLength(1);
      expect(getLockedElement(container)).toHaveAttribute(
        "data-locked",
        "true",
      );

      act(() => vi.advanceTimersByTime(ACKNOWLEDGEMENT_MS * 2));

      expect(getSession().entries).toEqual([{ questionId: "q1" }]);
      expect(queryLeavingBubbles(container)).toHaveLength(0);
      expect(screen.queryByText(FIRST_STATEMENT)).not.toBeInTheDocument();
      expect(getLockedElement(container)).toHaveAttribute(
        "data-locked",
        "false",
      );
    });

    it("takes the next press when the slide is over, and answers the question that is on screen", () => {
      const { getSession } = renderScreen(onQuestion(0));

      fireEvent.click(getSkipButton());
      finishChange();
      fireEvent.click(
        screen.getByRole("button", { name: "Ze źródeł odnawialnych" }),
      );
      finishAcknowledgement();

      expect(getSession().entries).toEqual([
        { questionId: "q1" },
        { questionId: "q2", answerId: "q2-renewables" },
      ]);
    });

    it("puts the focus on the top of the content, out of the bubble that leaves", () => {
      renderScreen(onQuestion(1));

      const explanation = screen.getByRole("button", { expanded: false });

      explanation.focus();
      fireEvent.click(getSkipButton());

      expect(getContent(SECOND_STATEMENT)).toHaveFocus();
      expect(getBubble(SECOND_STATEMENT)).toHaveAttribute("inert");
      expect(getBubble(SECOND_STATEMENT)).toHaveAttribute(
        "aria-hidden",
        "true",
      );
    });

    it("names the new question once for a screen reader: by its bubble and by its answers", () => {
      renderScreen(onQuestion(0));

      fireEvent.click(getSkipButton());

      expect(screen.getAllByText(SECOND_STATEMENT)).toHaveLength(1);
      expect(
        screen.getAllByRole("group", { name: SECOND_STATEMENT }),
      ).toHaveLength(1);
      expect(
        screen.queryByRole("group", { name: FIRST_STATEMENT }),
      ).not.toBeInTheDocument();
      expect(getBubble(SECOND_STATEMENT)).not.toHaveAttribute("aria-live");
    });

    it("locks the screen for exactly as long as a question slides", () => {
      expect(CONTENT_CHANGE_MS).toBe(QUESTION_SLIDE_MS);
    });
  });

  describe("when an answer is being acknowledged", () => {
    it('ignores another answer, "Pomiń", back and reset: the first press stands', () => {
      const { container, getSession } = renderScreen(onQuestion(1));

      fireEvent.click(screen.getByRole("button", { name: "Z atomu" }));

      expect(getLockedElement(container)).toHaveAttribute(
        "data-locked",
        "true",
      );

      fireEvent.click(screen.getByRole("button", { name: "Z węgla" }));
      fireEvent.click(getSkipButton());
      fireEvent.click(getBackButton());
      fireEvent.click(getResetButton());

      expect(getSession().entries).toHaveLength(1);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Z węgla" })).toBeEnabled();

      finishAcknowledgement();
      act(() => vi.advanceTimersByTime(ACKNOWLEDGEMENT_MS * 4));

      expect(getSession().entries).toEqual([
        { questionId: "q1" },
        { questionId: "q2", answerId: "q2-nuclear" },
      ]);
    });
  });

  describe("given a phase with no content registered", () => {
    it("closes a card phase and shows the question", () => {
      const { getSession } = renderScreen(
        onQuestion(1, {
          phase: "checkpoints",
          checkpointRecord: { cardsShown: [{ kind: "card" }], timeSamples: [] },
        }),
      );

      expect(getSession().phase).toBe("questions");
      expect(getSession().entries).toHaveLength(1);
      expect(screen.getByText(SECOND_STATEMENT)).toBeVisible();
    });

    it("leaves an e-mail phase as skipped", async () => {
      vi.spyOn(
        SURVEY_SESSION_CONFIG,
        "isEmailSendingSetUp",
        "get",
      ).mockReturnValue(true);
      vi.mocked(createResult).mockReturnValue(new Promise(() => undefined));

      const { getSession } = renderScreen(
        onQuestion(ALL_DONE, {
          phase: "email-capture",
          email: { address: "ktos@example.com", hasConsent: true },
        }),
      );

      expect(getSession().phase).toBe("results-calculation");
      expect(getSession().email).toBeNull();
      expect(screen.getByText(WAITING)).toBeVisible();
    });
  });

  describe("when onLeave is called", () => {
    it("removes the stored session, then opens the results address of that session in the same tab", async () => {
      const { survey, getSession } = renderScreen(onQuestion(ALL_DONE));
      const storageKey = getSessionStorageKey(survey.id);
      const stored: (string | null)[] = [];

      vi.mocked(openAddress).mockImplementation(() => {
        stored.push(sessionStorage.getItem(storageKey));
      });

      expect(sessionStorage.getItem(storageKey)).not.toBeNull();

      fireEvent.click(getSkipButton());
      await finishRequests();

      expect(createResult).toHaveBeenCalledTimes(1);
      expect(openAddress).toHaveBeenCalledTimes(1);
      expect(openAddress).toHaveBeenCalledWith(getResultsUrl(getSession().id));
      expect(stored).toEqual([null]);
      expect(sessionStorage.getItem(storageKey)).toBeNull();
    });

    it("keeps showing what it showed", async () => {
      const { getSession } = renderScreen(onQuestion(ALL_DONE));

      fireEvent.click(getSkipButton());
      await finishRequests();

      expect(openAddress).toHaveBeenCalledTimes(1);
      expect(screen.getByText(WAITING)).toBeVisible();
      expect(getSession().phase).toBe("results-calculation");
      expect(getSession().resultState).toBe(SurveyResultState.Created);
      expect(getBackButton()).toBeDisabled();
      expect(getResetButton()).toBeDisabled();
    });
  });

  describe("when the hand-in fails", () => {
    it("turns reset on, and a confirmed reset starts a new session without handing in", async () => {
      vi.mocked(createResult).mockResolvedValue(
        CreateResultOutcome.Unreachable,
      );

      const { getSession } = renderScreen(onQuestion(ALL_DONE));
      const { id } = getSession();

      fireEvent.click(getSkipButton());
      await finishRequests();
      finishChange();

      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(getBackButton()).toBeDisabled();

      fireEvent.click(getResetButton());
      fireEvent.click(screen.getByRole("button", { name: "Resetuj quiz" }));

      expect(getSession().id).not.toBe(id);
      expect(getSession().phase).toBe("category-select");
      expect(createResult).toHaveBeenCalledTimes(1);
      expect(openAddress).not.toHaveBeenCalled();
    });
  });

  describe("when the page is shown again from the memory of the browser after leaving", () => {
    it("starts over and shows the first phase of a new session", async () => {
      const { getSession } = renderScreen(onQuestion(ALL_DONE));
      const { id } = getSession();

      fireEvent.click(getSkipButton());
      await finishRequests();

      expect(openAddress).toHaveBeenCalledTimes(1);

      showPageFromMemory();

      expect(getSession().id).not.toBe(id);
      expect(getSession()).toMatchObject({
        phase: "category-select",
        entries: [],
        resultState: SurveyResultState.NotSent,
      });
      expect(screen.getByRole("group", { name: PROMPT })).toBeInTheDocument();
      expect(screen.queryByText(WAITING)).not.toBeInTheDocument();
      expect(createResult).toHaveBeenCalledTimes(1);
    });
  });
});

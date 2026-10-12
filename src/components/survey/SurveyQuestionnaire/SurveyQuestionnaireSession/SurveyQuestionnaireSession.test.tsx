import { act, fireEvent, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SURVEY_SESSION_CONFIG } from "@/constants/survey";
import { createResult } from "@/services/api/client/createResult";
import { getResult } from "@/services/api/client/getResult";
import { requestResultLink } from "@/services/api/client/requestResultLink";
import {
  CreateResultOutcome,
  type DemographicsValues,
  ResultLinkOutcome,
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
vi.mock("@/services/api/client/getResult");
vi.mock("@/services/api/client/requestResultLink");
vi.mock("@/utils/url/openAddress");

// The acknowledgement of an answer: it reports the press when it has played.
const ACKNOWLEDGEMENT_MS = 300;
// The loader: a line every 1.2 seconds, and a stay of five lines.
const LOADER_LINE_MS = 1200;
const LOADER_MIN_LINES = 5;
const FIRST_STATEMENT = "Podatki powinny być niższe.";
const SECOND_STATEMENT = "Z czego Polska powinna czerpać energię?";
const PROMPT = "Wybierz 1 najważniejszy dla Ciebie temat.";
const WAITING = "Liczymy Twoje wyniki";
const ALL_DONE = createSurvey().questions.length;
const EMAIL_HEADING = "Zapisz swoje wyniki!";
const CONSENT =
  "Wyrażam zgodę na przetwarzanie moich danych osobowych w celu przesyłania mi treści marketingowych przez Fundację Generacja Innowacja.";
const ADULT: DemographicsValues = {
  age: "27",
  gender: "female",
  residenceAreaSize: "city_below_200k",
  education: "higher",
};

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

const getResultsButton = () =>
  screen.getByRole("button", { name: "Zobacz wyniki" });

const getEmailField = () =>
  screen.getByRole("textbox", { name: "Adres e-mail" });

const getConsentBox = () => screen.getByRole("checkbox", { name: CONSENT });

const queryEmailCard = () =>
  screen.queryByRole("heading", { name: EMAIL_HEADING });

const typeAddress = (address: string) =>
  fireEvent.change(getEmailField(), { target: { value: address } });

const chooseAge = (age: string) => {
  const field = screen.getByRole("button", { name: "Wiek" });

  field.focus();
  fireEvent.keyDown(field, { key: "Enter" });
  fireEvent.click(screen.getByRole("menuitem", { name: age }));
};

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

// The stay of the loader, one line at a time: the next line is timed only
// once the one before has arrived.
const finishLoader = async () => {
  for (let line = 0; line < LOADER_MIN_LINES; line += 1) {
    await act(() => vi.advanceTimersByTimeAsync(LOADER_LINE_MS));
  }
};

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
    vi.mocked(getResult).mockResolvedValue({ id: "", isCalculated: true });
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
  });

  describe("given sending set up", () => {
    beforeEach(() => {
      vi.spyOn(
        SURVEY_SESSION_CONFIG,
        "isEmailSendingSetUp",
        "get",
      ).mockReturnValue(true);
      vi.mocked(createResult).mockReturnValue(new Promise(() => undefined));
    });

    it("shows the e-mail card after demographics, given or skipped", () => {
      const given = renderScreen(onQuestion(ALL_DONE, { demographics: ADULT }));

      fireEvent.click(getResultsButton());

      expect(given.getSession()).toMatchObject({
        phase: "email-capture",
        areDemographicsGiven: true,
      });
      expect(queryEmailCard()).toBeVisible();
      expect(getEmailField()).toHaveValue("");
      expect(getConsentBox()).not.toBeChecked();
      expect(createResult).not.toHaveBeenCalled();

      given.unmount();

      const skipped = renderScreen(
        onQuestion(ALL_DONE, { demographics: ADULT }),
      );

      fireEvent.click(getSkipButton());

      expect(skipped.getSession()).toMatchObject({
        phase: "email-capture",
        areDemographicsGiven: false,
      });
      expect(queryEmailCard()).toBeVisible();
      expect(createResult).not.toHaveBeenCalled();
    });

    it.each([
      ["13"],
      ["16"],
      ["17"],
    ])("shows results calculation after demographics for a taker who picked an age under 18: %s", (age) => {
      const given = renderScreen(
        onQuestion(ALL_DONE, { demographics: { ...ADULT, age } }),
      );

      fireEvent.click(getResultsButton());

      expect(given.getSession().phase).toBe("results-calculation");
      expect(queryEmailCard()).not.toBeInTheDocument();
      expect(screen.getByText(WAITING)).toBeVisible();

      given.unmount();

      // Whichever button demographics is left with.
      const skipped = renderScreen(
        onQuestion(ALL_DONE, { demographics: { age } }),
      );

      fireEvent.click(getSkipButton());

      expect(skipped.getSession().phase).toBe("results-calculation");
      expect(queryEmailCard()).not.toBeInTheDocument();
    });

    it("shows the card for a taker of 18", () => {
      const { getSession } = renderScreen(
        onQuestion(ALL_DONE, { demographics: { ...ADULT, age: "18" } }),
      );

      fireEvent.click(getResultsButton());

      expect(getSession().phase).toBe("email-capture");
      expect(queryEmailCard()).toBeVisible();
    });

    it("shows the card for a taker who skipped demographics with no age picked", () => {
      const { getSession } = renderScreen(
        onQuestion(ALL_DONE, { demographics: { gender: "male" } }),
      );

      fireEvent.click(getSkipButton());

      expect(getSession().phase).toBe("email-capture");
      expect(queryEmailCard()).toBeVisible();
    });

    it("drops a typed address when the taker goes back and picks an age under 18", () => {
      const { getSession } = renderScreen(
        onQuestion(ALL_DONE, {
          phase: "email-capture",
          demographics: ADULT,
          areDemographicsGiven: true,
        }),
      );

      typeAddress("biuro@mypolitics.pl");
      fireEvent.click(getConsentBox());

      expect(getSession().email).toEqual({
        address: "biuro@mypolitics.pl",
        hasConsent: true,
      });

      fireEvent.click(getBackButton("Wróć"));
      finishChange();

      expect(getSession().phase).toBe("demographics");

      chooseAge("17");
      fireEvent.click(getResultsButton());

      expect(getSession()).toMatchObject({
        phase: "results-calculation",
        email: null,
        demographics: { ...ADULT, age: "17" },
      });
      expect(queryEmailCard()).not.toBeInTheDocument();
      expect(requestResultLink).not.toHaveBeenCalled();
    });

    it('draws a full bar, "Prawie koniec!" and a back control named "Wróć" on the card', () => {
      renderScreen(onQuestion(ALL_DONE, { phase: "email-capture" }));

      expect(getBar()).toHaveAttribute("aria-valuenow", "100");
      expect(screen.getAllByText("Prawie koniec!")[0]).toBeVisible();
      expect(getBackButton("Wróć")).toBeEnabled();
      expect(
        screen.queryByRole("button", { name: "Poprzednie pytanie" }),
      ).not.toBeInTheDocument();
      expect(getResetButton()).toBeEnabled();
      expect(queryEmailCard()).toBeVisible();
    });

    it("opens the card with the focus on the top of its content, not in the field", () => {
      renderScreen(onQuestion(ALL_DONE));

      fireEvent.click(getSkipButton());

      expect(getContent(EMAIL_HEADING)).toHaveFocus();
      expect(getEmailField()).not.toHaveFocus();
      expect(getContent(EMAIL_HEADING)).toHaveAttribute(
        "data-direction",
        "forwards",
      );
    });

    it("leads back to demographics, and forward again to the same text and the same tick", () => {
      const { getSession } = renderScreen(
        onQuestion(ALL_DONE, { demographics: ADULT }),
      );

      fireEvent.click(getResultsButton());
      finishChange();
      typeAddress("biuro@mypolitics.pl");
      fireEvent.click(getConsentBox());
      fireEvent.click(getBackButton("Wróć"));

      expect(getSession().phase).toBe("demographics");
      expect(
        screen.getByRole("heading", { name: "Twoja tożsamość" }),
      ).toBeVisible();
      expect(queryEmailCard()).not.toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Wiek" }),
      ).toHaveAccessibleDescription("27");

      finishChange();
      fireEvent.click(getResultsButton());

      expect(getEmailField()).toHaveValue("biuro@mypolitics.pl");
      expect(getConsentBox()).toBeChecked();
      expect(
        screen.getByRole("button", { name: "Wyślij i zobacz wyniki" }),
      ).toBeEnabled();
    });

    it("starts a new session with nothing typed or ticked when reset is confirmed", () => {
      const { getSession } = renderScreen(
        onQuestion(ALL_DONE, {
          phase: "email-capture",
          email: { address: "biuro@mypolitics.pl", hasConsent: true },
        }),
      );
      const { id } = getSession();

      expect(getEmailField()).toHaveValue("biuro@mypolitics.pl");

      fireEvent.click(getResetButton());
      fireEvent.click(screen.getByRole("button", { name: "Resetuj quiz" }));

      expect(getSession().id).not.toBe(id);
      expect(getSession()).toMatchObject({
        phase: "category-select",
        email: null,
        entries: [],
      });
      expect(queryEmailCard()).not.toBeInTheDocument();
      expect(screen.getByRole("group", { name: PROMPT })).toBeInTheDocument();
    });

    it("hands the result in without the address when the card is left with one", () => {
      const { getSession } = renderScreen(
        onQuestion(ALL_DONE, { phase: "email-capture" }),
      );

      typeAddress("biuro@mypolitics.pl");
      fireEvent.click(
        screen.getByRole("button", { name: "Wyślij i zobacz wyniki" }),
      );

      expect(getSession()).toMatchObject({
        phase: "results-calculation",
        email: { address: "biuro@mypolitics.pl", hasConsent: false },
      });
      expect(screen.getByText(WAITING)).toBeVisible();
      expect(createResult).toHaveBeenCalledTimes(1);
      expect(JSON.stringify(vi.mocked(createResult).mock.calls)).not.toContain(
        "biuro",
      );
      expect(requestResultLink).not.toHaveBeenCalled();
    });

    it("hands the result in with no e-mail held when the card is skipped", () => {
      const { getSession } = renderScreen(
        onQuestion(ALL_DONE, {
          phase: "email-capture",
          email: { address: "biuro@mypolitics", hasConsent: true },
        }),
      );

      fireEvent.click(getSkipButton());

      expect(getSession()).toMatchObject({
        phase: "results-calculation",
        email: null,
      });
      expect(createResult).toHaveBeenCalledTimes(1);
      expect(requestResultLink).not.toHaveBeenCalled();
    });
  });

  describe("given sending not set up", () => {
    it("shows results calculation right after demographics", () => {
      vi.mocked(createResult).mockReturnValue(new Promise(() => undefined));

      const given = renderScreen(onQuestion(ALL_DONE, { demographics: ADULT }));

      fireEvent.click(getResultsButton());

      expect(given.getSession().phase).toBe("results-calculation");
      expect(queryEmailCard()).not.toBeInTheDocument();
      expect(screen.getByText(WAITING)).toBeVisible();

      given.unmount();

      const skipped = renderScreen(onQuestion(ALL_DONE));

      fireEvent.click(getSkipButton());

      expect(skipped.getSession().phase).toBe("results-calculation");
      expect(queryEmailCard()).not.toBeInTheDocument();
      expect(requestResultLink).not.toHaveBeenCalled();
    });

    it("never shows the card, even for a session that was left on it", () => {
      renderScreen(
        onQuestion(ALL_DONE, {
          phase: "email-capture",
          email: { address: "biuro@mypolitics.pl", hasConsent: true },
        }),
      );

      expect(queryEmailCard()).not.toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Twoja tożsamość" }),
      ).toBeVisible();
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
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

      // The result is there; the stay of the loader is not over.
      expect(openAddress).not.toHaveBeenCalled();
      expect(sessionStorage.getItem(storageKey)).not.toBeNull();

      await finishLoader();

      expect(createResult).toHaveBeenCalledTimes(1);
      expect(openAddress).toHaveBeenCalledTimes(1);
      expect(openAddress).toHaveBeenCalledWith(getResultsUrl(getSession().id));
      expect(stored).toEqual([null]);
      expect(sessionStorage.getItem(storageKey)).toBeNull();
    });

    it("keeps showing what it showed", async () => {
      const { getSession } = renderScreen(onQuestion(ALL_DONE));

      fireEvent.click(getSkipButton());
      await finishLoader();

      expect(openAddress).toHaveBeenCalledTimes(1);
      expect(screen.getByText(WAITING)).toBeVisible();
      expect(getSession().phase).toBe("results-calculation");
      expect(getSession().resultState).toBe(SurveyResultState.Calculated);
      expect(getBackButton()).toBeDisabled();
      expect(getResetButton()).toBeDisabled();
    });
  });

  describe("given a session in results calculation", () => {
    const inCalculation = (overrides: Partial<SurveySession> = {}) =>
      onQuestion(ALL_DONE, { phase: "results-calculation", ...overrides });

    it('draws no bar, "Prawie gotowe", back off and reset off while a run is under way', async () => {
      vi.mocked(getResult).mockResolvedValue({ id: "", isCalculated: false });

      const { getSession } = renderScreen(inCalculation());

      await finishRequests();

      expect(getSession().resultState).toBe(SurveyResultState.Created);
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
      expect(screen.getAllByText("Prawie gotowe")[0]).toBeVisible();
      expect(getBackButton()).toBeDisabled();
      expect(getResetButton()).toBeDisabled();
      expect(screen.getAllByRole("listitem")).toHaveLength(1);
      expect(screen.getByRole("button", { name: "Pobierz" })).toBeDisabled();
      expect(
        screen.getByRole("button", { name: "Pełne wyniki" }),
      ).toBeDisabled();
      expect(openAddress).not.toHaveBeenCalled();
    });

    it("turns reset on when the run has failed, and starts a new session when it is confirmed", async () => {
      vi.mocked(createResult).mockResolvedValue(CreateResultOutcome.Refused);

      const { getSession } = renderScreen(onQuestion(ALL_DONE));
      const { id } = getSession();

      fireEvent.click(getSkipButton());
      await finishRequests();
      finishChange();

      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(getSession().resultState).toBe(SurveyResultState.Failed);
      expect(getBackButton()).toBeDisabled();
      expect(getResetButton()).toBeEnabled();

      fireEvent.click(getResetButton());
      fireEvent.click(screen.getByRole("button", { name: "Resetuj quiz" }));

      // Nothing of the phase survives: no hand-in for the new session.
      expect(getSession().id).not.toBe(id);
      expect(getSession().phase).toBe("category-select");
      expect(getSession().resultState).toBe(SurveyResultState.NotSent);
      expect(createResult).toHaveBeenCalledTimes(1);
      expect(openAddress).not.toHaveBeenCalled();
    });

    it("keeps reset off on the notice", async () => {
      vi.spyOn(
        SURVEY_SESSION_CONFIG,
        "isEmailSendingSetUp",
        "get",
      ).mockReturnValue(true);
      vi.mocked(requestResultLink).mockResolvedValue(
        ResultLinkOutcome.Unavailable,
      );

      const { survey, getSession } = renderScreen(
        inCalculation({
          email: { address: "biuro@mypolitics.pl", hasConsent: true },
        }),
      );

      await finishLoader();

      expect(screen.getByRole("alert")).toHaveTextContent(
        "Nie udało się wysłać linku na Twój e-mail.",
      );
      expect(getBackButton()).toBeDisabled();
      expect(getResetButton()).toBeDisabled();
      expect(openAddress).not.toHaveBeenCalled();
      expect(
        sessionStorage.getItem(getSessionStorageKey(survey.id)),
      ).not.toBeNull();

      fireEvent.click(getResultsButton());

      expect(requestResultLink).toHaveBeenCalledTimes(1);
      expect(openAddress).toHaveBeenCalledTimes(1);
      expect(openAddress).toHaveBeenCalledWith(getResultsUrl(getSession().id));
      expect(
        sessionStorage.getItem(getSessionStorageKey(survey.id)),
      ).toBeNull();
    });
  });

  describe("when the page is shown again from the memory of the browser after leaving", () => {
    it("starts over and shows the first phase of a new session", async () => {
      const { getSession } = renderScreen(onQuestion(ALL_DONE));
      const { id } = getSession();

      fireEvent.click(getSkipButton());
      await finishLoader();

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

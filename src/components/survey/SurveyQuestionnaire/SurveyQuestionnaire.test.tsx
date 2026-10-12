import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { type Survey, SurveyLoadStatus } from "@/types/survey";
import { getSurveySessionStore } from "@/utils/survey/session/getSurveySessionStore";
import { createStartedSession } from "@/utils/vitest/survey/createStartedSession";
import { createSurvey } from "@/utils/vitest/survey/createSurvey";

import { SurveyQuestionnaire } from "./SurveyQuestionnaire";
import type { SurveyQuestionnaireProps } from "./SurveyQuestionnaire.types";

const PROMPT = "Wybierz 1 najważniejszy dla Ciebie temat.";

// The stores live as long as the module does, so every test takes a quiz of
// its own.
const createQuiz = (): Survey => createSurvey({ id: crypto.randomUUID() });

const getScreenElement = (
  load: SurveyQuestionnaireProps["load"],
  onRetry: () => void,
) => (
  <I18nProvider i18n={i18n}>
    <SurveyQuestionnaire load={load} onRetry={onRetry} />
  </I18nProvider>
);

const renderScreen = (load: SurveyQuestionnaireProps["load"]) => {
  const onRetry = vi.fn();
  const view = render(getScreenElement(load, onRetry));

  return {
    ...view,
    onRetry,
    rerenderScreen: (nextLoad: SurveyQuestionnaireProps["load"]) =>
      view.rerender(getScreenElement(nextLoad, onRetry)),
  };
};

describe("<SurveyQuestionnaire />", () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  describe("given a loading quiz", () => {
    it("shows the placeholders and no text or button", () => {
      renderScreen({ status: SurveyLoadStatus.Loading });

      expect(screen.getByRole("status").lastElementChild).toHaveAttribute(
        "aria-hidden",
        "true",
      );
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it('says "Wczytywanie quizu" to assistive technology', () => {
      renderScreen({ status: SurveyLoadStatus.Loading });

      expect(screen.getByRole("status")).toHaveTextContent(
        /^Wczytywanie quizu$/,
      );
    });
  });

  describe("given a failed read", () => {
    it("shows the heading, the line and the retry button", () => {
      renderScreen({ status: SurveyLoadStatus.Failed });

      expect(
        screen.getByRole("heading", { name: "Nie udało się wczytać quizu" }),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Sprawdź połączenie z internetem i spróbuj ponownie."),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Spróbuj ponownie" }),
      ).toBeInTheDocument();
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    it("announces the failure", () => {
      renderScreen({ status: SurveyLoadStatus.Failed });

      expect(screen.getByRole("alert")).toHaveTextContent(
        "Nie udało się wczytać quizu",
      );
    });

    it("calls onRetry when retry is pressed", () => {
      const { onRetry } = renderScreen({ status: SurveyLoadStatus.Failed });

      fireEvent.click(screen.getByRole("button", { name: "Spróbuj ponownie" }));

      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it("touches no session", () => {
      renderScreen({ status: SurveyLoadStatus.Failed });

      expect(sessionStorage).toHaveLength(0);
    });
  });

  describe("given a quiz", () => {
    it("shows the first phase of a new session", () => {
      renderScreen({ status: SurveyLoadStatus.Ready, survey: createQuiz() });

      expect(screen.getByRole("group", { name: PROMPT })).toBeInTheDocument();
      expect(
        screen.getByRole("progressbar", { name: "Postęp quizu" }),
      ).toBeInTheDocument();
    });

    it("shows the phase the session is in", () => {
      const survey = createQuiz();

      getSurveySessionStore(survey).setState(
        createStartedSession(survey, 1),
        true,
      );
      renderScreen({ status: SurveyLoadStatus.Ready, survey });

      expect(
        screen.getByText("Z czego Polska powinna czerpać energię?"),
      ).toBeVisible();
      expect(screen.getByText("Ekologia")).toBeVisible();
    });

    it("cuts off at its sides what moves across them, and nothing at the top or the bottom", () => {
      const { container } = renderScreen({
        status: SurveyLoadStatus.Ready,
        survey: createQuiz(),
      });
      const card = container.querySelector(".bg-gi-ash");

      expect(card).toHaveClass("overflow-x-clip");
      expect(card?.className).not.toContain("overflow-hidden");
      expect(card?.className).not.toContain("overflow-y");
      expect(card?.className).not.toContain("overflow-clip");
    });

    it("draws the same frame in every state: one card that takes the width of its parent", () => {
      const { container, rerenderScreen } = renderScreen({
        status: SurveyLoadStatus.Loading,
      });
      const frame = container.firstElementChild;

      expect(frame).toHaveClass("w-full");
      expect(frame?.firstElementChild).toHaveClass("w-full", "bg-gi-ash");

      rerenderScreen({ status: SurveyLoadStatus.Failed });

      expect(container.firstElementChild).toBe(frame);

      rerenderScreen({ status: SurveyLoadStatus.Ready, survey: createQuiz() });

      expect(container.firstElementChild).toBe(frame);
    });
  });

  describe("when the quiz is read again in another language", () => {
    it("is loading, then back on the same question", () => {
      const survey = createQuiz();

      getSurveySessionStore(survey).setState(
        createStartedSession(survey, 2),
        true,
      );

      const { rerenderScreen } = renderScreen({
        status: SurveyLoadStatus.Ready,
        survey,
      });

      rerenderScreen({ status: SurveyLoadStatus.Loading });

      expect(screen.getByRole("status")).toHaveTextContent("Wczytywanie quizu");

      rerenderScreen({
        status: SurveyLoadStatus.Ready,
        survey: {
          ...survey,
          questions: survey.questions.map((question) => ({
            ...question,
            text: `EN ${question.text}`,
          })),
        },
      });

      expect(
        screen.getByText(
          "EN Państwo powinno dopłacać do kredytów mieszkaniowych.",
        ),
      ).toBeVisible();
    });
  });

  describe("when another quiz takes the place of the quiz", () => {
    it("shows the session of the other quiz", () => {
      const survey = createQuiz();
      const otherSurvey = createQuiz();

      getSurveySessionStore(survey).setState(
        createStartedSession(survey, 1),
        true,
      );

      const { rerenderScreen } = renderScreen({
        status: SurveyLoadStatus.Ready,
        survey,
      });

      rerenderScreen({ status: SurveyLoadStatus.Ready, survey: otherSurvey });

      expect(screen.getByRole("group", { name: PROMPT })).toBeInTheDocument();
      expect(
        screen.queryByText("Z czego Polska powinna czerpać energię?"),
      ).not.toBeInTheDocument();
    });
  });
});

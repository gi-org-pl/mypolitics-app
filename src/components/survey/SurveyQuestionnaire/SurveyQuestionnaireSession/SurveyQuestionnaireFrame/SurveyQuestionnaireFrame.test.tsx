import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";

import { createMessage } from "@/utils/vitest/createMessage";

import type {
  SurveyFrame,
  SurveyQuestionnaireFrameProps,
} from "../../SurveyQuestionnaire.types";
import { SurveyQuestionnaireFrame } from "./SurveyQuestionnaireFrame";

const QUESTION_FRAME: SurveyFrame = {
  progress: { done: 2, all: 10 },
  categoryName: "Gospodarka",
  questionsLeft: 4,
  canStepBack: true,
  canReset: true,
};
const CLOSING_FRAME: SurveyFrame = {
  label: createMessage("Prawie koniec!"),
  canStepBack: true,
  canReset: true,
};

const getFrameElement = (props: Partial<SurveyQuestionnaireFrameProps>) => (
  <I18nProvider i18n={i18n}>
    <SurveyQuestionnaireFrame
      quizName="Quiz testowy"
      frame={QUESTION_FRAME}
      isLocked={false}
      topRef={createRef<HTMLDivElement>()}
      onPrevious={vi.fn()}
      onReset={vi.fn()}
      {...props}
    >
      <button type="button" onClick={props.onPrevious}>
        Treść
      </button>
    </SurveyQuestionnaireFrame>
  </I18nProvider>
);

const renderFrame = (props: Partial<SurveyQuestionnaireFrameProps> = {}) => {
  const view = render(getFrameElement(props));

  return {
    ...view,
    rerenderFrame: (nextProps: Partial<SurveyQuestionnaireFrameProps>) =>
      view.rerender(getFrameElement(nextProps)),
  };
};

const getBar = () => screen.getByRole("progressbar", { name: "Postęp quizu" });

const getBackButton = (name = "Poprzednie pytanie") =>
  screen.getByRole("button", { name });

const getResetButton = () =>
  screen.getByRole("button", { name: "Zacznij od nowa" });

const getAnnouncement = () => screen.getByRole("status");

describe("<SurveyQuestionnaireFrame />", () => {
  describe("given the frame of a question", () => {
    it("passes the progress to the bar", () => {
      renderFrame();

      // Two of ten are done: 20%, which the bar shows as 34%.
      expect(getBar()).toHaveAttribute("aria-valuenow", "34");
    });

    it("passes the category and the questions left to the pill", () => {
      renderFrame();

      expect(screen.getByText("Gospodarka")).toBeVisible();
      expect(
        screen.getByText("Pozostałe pytania w kategorii: 4"),
      ).toBeInTheDocument();
      expect(screen.queryByText("Quiz testowy")).not.toBeInTheDocument();
    });

    it("draws the bar, then the controls, then the content", () => {
      renderFrame();

      const content = screen.getByRole("button", { name: "Treść" });

      expect(
        getBar().compareDocumentPosition(getBackButton()) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      expect(
        getResetButton().compareDocumentPosition(content) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    });

    it("announces nothing", () => {
      renderFrame();

      expect(getAnnouncement()).toBeEmptyDOMElement();
    });
  });

  describe("given a frame with neither category nor label", () => {
    it("shows the quiz name in the pill", () => {
      renderFrame({
        frame: {
          progress: { done: 0, all: 10 },
          canStepBack: false,
          canReset: false,
        },
      });

      expect(screen.getByText("Quiz testowy")).toBeVisible();
    });

    it("draws no pill for a quiz without a name", () => {
      renderFrame({
        quizName: "",
        frame: { canStepBack: false, canReset: false },
      });

      expect(getBackButton().nextElementSibling).toBe(getResetButton());
    });
  });

  describe("given a frame with no progress", () => {
    it("draws no bar, and nothing holds its place", () => {
      const topRef = createRef<HTMLDivElement>();

      renderFrame({ frame: CLOSING_FRAME, topRef });

      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
      expect(topRef.current?.children).toHaveLength(1);
    });
  });

  describe("given a frame with a label", () => {
    it("shows the label in the pill", () => {
      renderFrame({ frame: CLOSING_FRAME });

      expect(
        screen.getAllByText("Prawie koniec!").map((label) => label.tagName),
      ).toEqual(["SPAN", "P"]);
    });

    it("announces the pill once when it appears, and again only when it changes", () => {
      const { rerenderFrame } = renderFrame();
      const announcement = getAnnouncement();

      rerenderFrame({ frame: CLOSING_FRAME });

      expect(getAnnouncement()).toBe(announcement);
      expect(announcement).toHaveTextContent("Prawie koniec!");
      expect(announcement).toHaveClass("sr-only");

      // E-mail capture carries the same label: the text does not change, so
      // nothing is announced again.
      rerenderFrame({
        frame: { ...CLOSING_FRAME, progress: { done: 10, all: 10 } },
      });

      expect(getAnnouncement()).toBe(announcement);
      expect(announcement).toHaveTextContent("Prawie koniec!");

      rerenderFrame({
        frame: { ...CLOSING_FRAME, label: createMessage("Prawie gotowe") },
      });

      expect(announcement).toHaveTextContent("Prawie gotowe");
    });
  });

  describe("given the controls of the frame", () => {
    it("turns back and reset on as the frame says", () => {
      renderFrame();

      expect(getBackButton()).toBeEnabled();
      expect(getResetButton()).toBeEnabled();
    });

    it("turns back and reset off as the frame says", () => {
      renderFrame({
        frame: { ...QUESTION_FRAME, canStepBack: false, canReset: false },
      });

      expect(getBackButton()).toBeDisabled();
      expect(getResetButton()).toBeDisabled();
    });

    it("names the back control as the frame says", () => {
      renderFrame({
        frame: { ...CLOSING_FRAME, previousLabel: createMessage("Wróć") },
      });

      expect(getBackButton("Wróć")).toBeInTheDocument();
    });
  });

  describe("when back is pressed", () => {
    it("calls onPrevious", () => {
      const onPrevious = vi.fn();

      renderFrame({ onPrevious });
      fireEvent.click(getBackButton());

      expect(onPrevious).toHaveBeenCalledTimes(1);
    });
  });

  describe("when reset is confirmed", () => {
    it("calls onReset", () => {
      const onReset = vi.fn();

      renderFrame({ onReset });
      fireEvent.click(getResetButton());

      expect(onReset).not.toHaveBeenCalled();

      fireEvent.click(screen.getByRole("button", { name: "Resetuj quiz" }));

      expect(onReset).toHaveBeenCalledTimes(1);
    });
  });

  describe("when the frame changes", () => {
    it("keeps the bar and the controls mounted", () => {
      const { rerenderFrame } = renderFrame();
      const bar = getBar();
      const backButton = getBackButton();

      rerenderFrame({
        frame: {
          ...QUESTION_FRAME,
          progress: { done: 3, all: 10 },
          questionsLeft: 3,
        },
      });

      expect(getBar()).toBe(bar);
      expect(getBackButton()).toBe(backButton);
    });
  });

  describe("given a locked screen", () => {
    it("takes no press and no key, in the controls and in the content", () => {
      const onPrevious = vi.fn();

      renderFrame({ isLocked: true, onPrevious });

      const content = screen.getByRole("button", { name: "Treść" });

      fireEvent.click(getBackButton());
      fireEvent.click(content);
      fireEvent.click(getResetButton());

      expect(onPrevious).not.toHaveBeenCalled();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(fireEvent.keyDown(content, { key: "Enter" })).toBe(false);
    });

    it("takes no pointer, and draws nothing disabled", () => {
      const { container } = renderFrame({ isLocked: true });

      expect(container.firstElementChild).toHaveAttribute(
        "data-locked",
        "true",
      );
      expect(container.firstElementChild).toHaveClass(
        "data-[locked=true]:pointer-events-none",
      );
      expect(getBackButton()).toBeEnabled();
      expect(getResetButton()).toBeEnabled();
      expect(screen.getByRole("button", { name: "Treść" })).toBeEnabled();
    });
  });

  describe("given an open screen", () => {
    it("lets the presses and the keys through", () => {
      const onPrevious = vi.fn();

      renderFrame({ onPrevious });

      const content = screen.getByRole("button", { name: "Treść" });

      fireEvent.click(content);

      expect(onPrevious).toHaveBeenCalledTimes(1);
      expect(fireEvent.keyDown(content, { key: "Enter" })).toBe(true);
    });
  });
});

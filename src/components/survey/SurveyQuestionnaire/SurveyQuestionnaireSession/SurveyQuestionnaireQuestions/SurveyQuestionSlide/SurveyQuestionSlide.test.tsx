import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { SurveyQuestion } from "@/types/survey";
import { createSurvey } from "@/utils/vitest/survey/createSurvey";

import { SurveyQuestionSlide } from "./SurveyQuestionSlide";
import { QUESTION_SLIDE_MS } from "./SurveyQuestionSlide.constants";

// q1 has no explanation, q2 has one.
const [first, second, third] = createSurvey().questions;

const getSlideElement = (question: SurveyQuestion, position: number) => (
  <I18nProvider i18n={i18n}>
    <SurveyQuestionSlide question={question} position={position} />
  </I18nProvider>
);

const renderSlide = (question: SurveyQuestion = first, position = 0) => {
  const view = render(getSlideElement(question, position));

  return {
    ...view,
    show: (nextQuestion: SurveyQuestion, nextPosition: number) =>
      view.rerender(getSlideElement(nextQuestion, nextPosition)),
  };
};

// The bubble of a question: the element that moves.
const getBubble = (question: SurveyQuestion) =>
  screen.getByText(question.text).closest("[style]") as HTMLElement;

const queryBubbles = (container: HTMLElement) =>
  container.querySelectorAll("[data-leaving], [data-arriving]");

const finishSlide = () => act(() => vi.advanceTimersByTime(QUESTION_SLIDE_MS));

const stubReducedMotion = (matches: boolean) =>
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({ matches })),
  );

describe("<SurveyQuestionSlide />", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    stubReducedMotion(false);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  describe("when the question appears", () => {
    it("shows its statement, and no explanation it does not have", () => {
      renderSlide();

      expect(screen.getByText(first.text)).toBeVisible();
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("shows its explanation, closed", () => {
      renderSlide(second, 1);

      expect(screen.getByText(second.text)).toBeVisible();
      expect(screen.getByRole("button", { expanded: false })).toBeEnabled();
    });

    it("does not move it", () => {
      const { container } = renderSlide();

      expect(getBubble(first)).not.toHaveAttribute("data-arriving");
      expect(getBubble(first).className).not.toContain("starting:");
      expect(queryBubbles(container)).toHaveLength(0);
    });

    it("takes the width of its parent, in a box that follows the height of the bubble", () => {
      const { container } = renderSlide();
      const box = container.firstElementChild as HTMLElement;

      expect(box).toHaveClass(
        "w-full",
        "data-[animating=true]:overflow-y-clip",
      );
      expect(box).toContainElement(getBubble(first));
      expect(getBubble(first)).toHaveClass("w-full");
      expect(getBubble(first).parentElement).toHaveClass("relative", "w-full");
    });
  });

  describe("when the next question takes its place", () => {
    it("shows both bubbles at once", () => {
      const { container, show } = renderSlide();

      show(second, 1);

      expect(screen.getByText(first.text)).toBeInTheDocument();
      expect(screen.getByText(second.text)).toBeInTheDocument();
      expect(queryBubbles(container)).toHaveLength(2);
    });

    it("sends the bubble before to the left, fading, out of the flow", () => {
      const { show } = renderSlide();

      show(second, 1);

      expect(getBubble(first)).toHaveAttribute("data-leaving", "forwards");
      expect(getBubble(first)).toHaveClass(
        "absolute",
        "top-0",
        "left-0",
        "-translate-x-[calc(100%+2rem)]",
        "opacity-0",
      );
    });

    it("brings the new bubble in from the right, without fading it", () => {
      const { show } = renderSlide();

      show(second, 1);

      expect(getBubble(second)).toHaveAttribute("data-arriving", "forwards");
      expect(getBubble(second)).toHaveClass(
        "starting:translate-x-[calc(100%+2rem)]",
      );
      expect(getBubble(second)).not.toHaveClass("absolute");
      expect(getBubble(second)).not.toHaveClass("opacity-0");
      expect(getBubble(second).className).not.toContain("starting:opacity");
    });

    it("moves the two for 300 ms, eased in and out", () => {
      const { show } = renderSlide();

      show(second, 1);

      for (const bubble of [getBubble(first), getBubble(second)]) {
        expect(bubble.style.transitionDuration).toBe("300ms");
        expect(bubble).toHaveClass(
          "transition-[translate,opacity]",
          "ease-in-out",
          "motion-reduce:transition-none",
        );
      }

      expect(QUESTION_SLIDE_MS).toBe(300);
    });

    it("keeps the element of the bubble before, so that it can move out, and draws a new one for the new question", () => {
      const { show } = renderSlide();
      const bubbleBefore = getBubble(first);

      show(second, 1);

      expect(getBubble(first)).toBe(bubbleBefore);
      expect(getBubble(second)).not.toBe(bubbleBefore);
      expect(getBubble(first).nextElementSibling).toBe(getBubble(second));
    });

    it("puts the bubble before out of reach of the pointer, the keyboard and a screen reader", () => {
      const { show } = renderSlide(second, 1);

      show(third, 2);

      expect(getBubble(second)).toHaveAttribute("aria-hidden", "true");
      expect(getBubble(second)).toHaveAttribute("inert");
      expect(getBubble(second)).toHaveClass("pointer-events-none");
      expect(getBubble(third)).not.toHaveAttribute("aria-hidden");
      expect(getBubble(third)).not.toHaveAttribute("inert");
    });

    it("lets the bubble before leave with its explanation as open as it was", () => {
      const { show } = renderSlide(second, 1);

      fireEvent.click(screen.getByRole("button", { expanded: false }));
      show(third, 2);

      expect(
        within(getBubble(second)).getByRole("button", {
          hidden: true,
          expanded: true,
        }),
      ).toBeInTheDocument();
    });

    it("leaves the new bubble alone when the slide is over", () => {
      const { container, show } = renderSlide();

      show(second, 1);
      finishSlide();

      expect(screen.queryByText(first.text)).not.toBeInTheDocument();
      expect(screen.getByText(second.text)).toBeVisible();
      expect(queryBubbles(container)).toHaveLength(1);
      expect(getBubble(second)).toHaveAttribute("data-arriving", "forwards");
    });
  });

  describe("when the question before takes its place", () => {
    it("sends the bubble to the right and brings the new one in from the left", () => {
      const { show } = renderSlide(second, 1);

      show(first, 0);

      expect(getBubble(second)).toHaveAttribute("data-leaving", "backwards");
      expect(getBubble(second)).toHaveClass(
        "translate-x-[calc(100%+2rem)]",
        "opacity-0",
      );
      expect(getBubble(second)).not.toHaveClass(
        "-translate-x-[calc(100%+2rem)]",
      );
      expect(getBubble(first)).toHaveAttribute("data-arriving", "backwards");
      expect(getBubble(first)).toHaveClass(
        "starting:-translate-x-[calc(100%+2rem)]",
      );
      expect(getBubble(first)).not.toHaveClass(
        "starting:translate-x-[calc(100%+2rem)]",
      );
    });
  });

  describe("when a question arrives in the middle of a slide", () => {
    it("never shows more than two bubbles: the one that was arriving leaves", () => {
      const { container, show } = renderSlide();

      show(second, 1);
      act(() => vi.advanceTimersByTime(QUESTION_SLIDE_MS / 2));
      show(third, 2);

      expect(screen.queryByText(first.text)).not.toBeInTheDocument();
      expect(queryBubbles(container)).toHaveLength(2);
      expect(getBubble(second)).toHaveAttribute("data-leaving", "forwards");
      expect(getBubble(third)).toHaveAttribute("data-arriving", "forwards");

      finishSlide();

      expect(queryBubbles(container)).toHaveLength(1);
      expect(screen.getByText(third.text)).toBeVisible();
    });

    it("turns round when the taker steps back: the bubble that was leaving comes back as it is", () => {
      const { container, show } = renderSlide();
      const firstBubble = getBubble(first);

      show(second, 1);
      act(() => vi.advanceTimersByTime(QUESTION_SLIDE_MS / 2));
      show(first, 0);

      expect(queryBubbles(container)).toHaveLength(2);
      expect(getBubble(second)).toHaveAttribute("data-leaving", "backwards");
      expect(getBubble(first)).toHaveAttribute("data-arriving", "backwards");
      expect(getBubble(first)).toBe(firstBubble);
      expect(getBubble(first)).not.toHaveAttribute("inert");
      expect(getBubble(first)).not.toHaveAttribute("aria-hidden");
      expect(getBubble(first)).not.toHaveClass("absolute", "opacity-0");
    });
  });

  describe("when the same question is handed in again", () => {
    it("keeps its bubble where it is", () => {
      const { container, show } = renderSlide();
      const bubble = getBubble(first);

      show({ ...first }, 0);

      expect(getBubble(first)).toBe(bubble);
      expect(queryBubbles(container)).toHaveLength(0);
    });
  });

  describe("given a taker who asked for less movement", () => {
    it("replaces the question at once", () => {
      stubReducedMotion(true);

      const { container, show } = renderSlide();

      show(second, 1);

      expect(screen.queryByText(first.text)).not.toBeInTheDocument();
      expect(screen.getByText(second.text)).toBeVisible();
      expect(queryBubbles(container)).toHaveLength(0);
      expect(getBubble(second).className).not.toContain("starting:");
    });
  });
});

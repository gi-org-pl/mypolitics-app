import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import type { ChangeDirection } from "../SurveyQuestionnaireSession.types";
import { SurveyQuestionnaireTransition } from "./SurveyQuestionnaireTransition";

const DURATION_MS = 200;

const getTransition = (contentKey: string, direction?: ChangeDirection) => (
  <SurveyQuestionnaireTransition
    contentKey={contentKey}
    direction={direction}
    durationMs={DURATION_MS}
    contentRef={createRef<HTMLDivElement>()}
  >
    <p>Treść {contentKey}</p>
  </SurveyQuestionnaireTransition>
);

const getContent = (contentKey: string) =>
  screen.getByText(`Treść ${contentKey}`).parentElement as HTMLElement;

describe("<SurveyQuestionnaireTransition />", () => {
  describe("when the screen appears", () => {
    it("shows the content, and does not move it", () => {
      render(getTransition("first"));

      expect(getContent("first").className).not.toContain("starting:");
      expect(getContent("first")).not.toHaveAttribute("data-direction");
    });

    it("hands out the top of the content, which takes the focus and is no stop for the Tab key", () => {
      const contentRef = createRef<HTMLDivElement>();

      render(
        <SurveyQuestionnaireTransition
          contentKey="first"
          durationMs={DURATION_MS}
          contentRef={contentRef}
        >
          <p>Treść first</p>
        </SurveyQuestionnaireTransition>,
      );

      expect(contentRef.current).toBe(getContent("first"));
      expect(contentRef.current).toHaveAttribute("tabindex", "-1");

      contentRef.current?.focus();

      expect(contentRef.current).toHaveFocus();
    });

    it("takes the width of its parent", () => {
      render(getTransition("first"));

      expect(getContent("first")).toHaveClass("w-full");
    });
  });

  describe("when the content changes", () => {
    it("replaces the old content with a new element", () => {
      const { rerender } = render(getTransition("first"));
      const oldContent = getContent("first");

      rerender(getTransition("second", "forwards"));

      expect(oldContent).not.toBeInTheDocument();
      expect(screen.queryByText("Treść first")).not.toBeInTheDocument();
      expect(getContent("second")).toBeInTheDocument();
    });

    it("brings the new content in from the right when moving forwards", () => {
      const { rerender } = render(getTransition("first"));

      rerender(getTransition("second", "forwards"));

      expect(getContent("second")).toHaveClass(
        "starting:translate-x-4",
        "starting:opacity-0",
      );
      expect(getContent("second")).toHaveAttribute(
        "data-direction",
        "forwards",
      );
    });

    it("brings the new content in from the left when moving backwards", () => {
      const { rerender } = render(getTransition("second"));

      rerender(getTransition("first", "backwards"));

      expect(getContent("first")).toHaveClass(
        "starting:-translate-x-4",
        "starting:opacity-0",
      );
      expect(getContent("first")).not.toHaveClass("starting:translate-x-4");
    });

    it("moves for the length it is given, and not at all under reduced motion", () => {
      const { rerender } = render(getTransition("first"));

      rerender(getTransition("second", "forwards"));

      expect(getContent("second").style.transitionDuration).toBe(
        `${DURATION_MS}ms`,
      );
      expect(getContent("second")).toHaveClass(
        "transition-[opacity,translate]",
        "motion-reduce:transition-none",
      );
    });
  });

  describe("when rendered again with the same content", () => {
    it("keeps the element", () => {
      const { rerender } = render(getTransition("first", "forwards"));
      const content = getContent("first");

      rerender(getTransition("first", "forwards"));

      expect(getContent("first")).toBe(content);
    });
  });
});

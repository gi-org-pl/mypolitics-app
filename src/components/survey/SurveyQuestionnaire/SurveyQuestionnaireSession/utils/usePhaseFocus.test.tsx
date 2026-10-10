import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PHASE_FOCUS_ATTRIBUTE } from "@/constants/focus";

import { usePhaseFocus } from "./usePhaseFocus";

const scrollIntoView = vi.fn();
const FOCUS_TARGET_PROPS = { [PHASE_FOCUS_ATTRIBUTE]: true };

const Screen = ({
  contentKey,
  hasContent = true,
  hasMarkedText = false,
}: {
  contentKey: string;
  hasContent?: boolean;
  hasMarkedText?: boolean;
}) => {
  const { topRef, contentRef } = usePhaseFocus(contentKey);

  return (
    <div>
      <div ref={topRef} data-testid="top" />
      {hasContent && (
        <div ref={contentRef} tabIndex={-1} data-testid="content">
          {hasMarkedText && (
            <p tabIndex={-1} {...FOCUS_TARGET_PROPS}>
              Tekst karty
            </p>
          )}
          <button type="button">Dalej</button>
        </div>
      )}
    </div>
  );
};

describe("usePhaseFocus()", () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = scrollIntoView;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("when the screen appears", () => {
    it("leaves the focus and the view where they are", () => {
      render(<Screen contentKey="first" />);

      expect(document.body).toHaveFocus();
      expect(scrollIntoView).not.toHaveBeenCalled();
    });
  });

  describe("when the content changes", () => {
    it("puts the focus on the top of the new content, without scrolling to it", () => {
      const { rerender } = render(<Screen contentKey="first" />);
      const focus = vi.spyOn(screen.getByTestId("content"), "focus");

      rerender(<Screen contentKey="second" />);

      expect(screen.getByTestId("content")).toHaveFocus();
      expect(focus).toHaveBeenCalledWith({ preventScroll: true });
    });

    it("returns the view to the top of the screen, only as far as needed", () => {
      const { rerender } = render(<Screen contentKey="first" />);

      rerender(<Screen contentKey="second" />);

      expect(scrollIntoView).toHaveBeenCalledTimes(1);
      expect(scrollIntoView.mock.contexts[0]).toBe(screen.getByTestId("top"));
      expect(scrollIntoView).toHaveBeenCalledWith({ block: "nearest" });
    });

    it("does both once for every change", () => {
      const { rerender } = render(<Screen contentKey="first" />);

      rerender(<Screen contentKey="second" />);
      rerender(<Screen contentKey="second" />);
      rerender(<Screen contentKey="first" />);

      expect(scrollIntoView).toHaveBeenCalledTimes(2);
    });
  });

  describe("when the new content marks an element of its own for the focus", () => {
    it("puts the focus on that element, without scrolling to it", () => {
      const { rerender } = render(<Screen contentKey="first" />);

      rerender(<Screen contentKey="second" hasMarkedText />);

      const text = screen.getByText("Tekst karty");

      expect(text).toHaveFocus();
      expect(scrollIntoView.mock.contexts).toEqual([screen.getByTestId("top")]);
    });

    it("leaves it alone when the screen appears with it", () => {
      render(<Screen contentKey="first" hasMarkedText />);

      expect(document.body).toHaveFocus();
    });
  });

  describe("when the content changes and nothing is drawn", () => {
    it("returns the view and moves no focus", () => {
      const { rerender } = render(
        <Screen contentKey="first" hasContent={false} />,
      );

      rerender(<Screen contentKey="second" hasContent={false} />);

      expect(scrollIntoView).toHaveBeenCalledTimes(1);
      expect(document.body).toHaveFocus();
    });
  });
});

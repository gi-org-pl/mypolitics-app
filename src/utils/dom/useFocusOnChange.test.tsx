import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useFocusOnChange } from "./useFocusOnChange";

const Place = ({ value }: { value: string }) => {
  const ref = useFocusOnChange<HTMLDivElement>(value);

  return (
    <div ref={ref} tabIndex={-1} data-testid="place">
      {value}
    </div>
  );
};

describe("useFocusOnChange()", () => {
  describe("when the element first appears", () => {
    it("leaves the focus where it is", () => {
      render(<Place value="first" />);

      expect(screen.getByTestId("place")).not.toHaveFocus();
      expect(document.body).toHaveFocus();
    });
  });

  describe("when the value changes", () => {
    it("moves the focus to the element", () => {
      const { rerender } = render(<Place value="first" />);

      rerender(<Place value="second" />);

      expect(screen.getByTestId("place")).toHaveFocus();
    });

    it("moves it again at every later change", () => {
      const { rerender } = render(<Place value="first" />);

      rerender(<Place value="second" />);
      screen.getByTestId("place").blur();
      rerender(<Place value="first" />);

      expect(screen.getByTestId("place")).toHaveFocus();
    });
  });

  describe("when the element takes the focus", () => {
    afterEach(() => {
      vi.restoreAllMocks();
      Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView");
    });

    it("does not let the browser scroll the page to it", () => {
      const focus = vi.spyOn(HTMLElement.prototype, "focus");
      const { rerender } = render(<Place value="first" />);

      rerender(<Place value="second" />);

      expect(focus).toHaveBeenCalledWith({ preventScroll: true });
    });

    it("leaves the page where it is while the start of the element shows", () => {
      const scrollIntoView = vi.fn();
      HTMLElement.prototype.scrollIntoView = scrollIntoView;
      const { rerender } = render(<Place value="first" />);

      rerender(<Place value="second" />);

      expect(scrollIntoView).not.toHaveBeenCalled();
    });

    it("brings its start into view when it is above the top of the window", () => {
      const scrollIntoView = vi.fn();
      HTMLElement.prototype.scrollIntoView = scrollIntoView;
      const { rerender } = render(<Place value="first" />);
      vi.spyOn(
        screen.getByTestId("place"),
        "getBoundingClientRect",
      ).mockReturnValue({ top: -120 } as DOMRect);

      rerender(<Place value="second" />);

      expect(scrollIntoView).toHaveBeenCalledExactlyOnceWith({
        block: "start",
      });
    });
  });

  describe("when the element is drawn again with the same value", () => {
    it("leaves the focus where it is", () => {
      const { rerender } = render(<Place value="first" />);

      rerender(<Place value="first" />);

      expect(screen.getByTestId("place")).not.toHaveFocus();
    });
  });
});

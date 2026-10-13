import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

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

  describe("when the element is drawn again with the same value", () => {
    it("leaves the focus where it is", () => {
      const { rerender } = render(<Place value="first" />);

      rerender(<Place value="first" />);

      expect(screen.getByTestId("place")).not.toHaveFocus();
    });
  });
});

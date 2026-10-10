import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useTextFocus } from "./useTextFocus";

const Card = ({
  text,
  hasText = true,
}: {
  text: string;
  hasText?: boolean;
}) => {
  const textRef = useTextFocus(text);

  return (
    <div>
      <button type="button">Opcja</button>
      {hasText && (
        <p ref={textRef} tabIndex={-1}>
          {text}
        </p>
      )}
    </div>
  );
};

describe("useTextFocus()", () => {
  describe("when the card appears", () => {
    it("leaves the focus where it is", () => {
      render(<Card text="Jak myślisz?" />);

      expect(document.body).toHaveFocus();
    });
  });

  describe("when the text changes in place", () => {
    it("moves the focus to the new text, without scrolling to it", () => {
      const { rerender } = render(<Card text="Jak myślisz?" />);
      const focus = vi.spyOn(screen.getByText("Jak myślisz?"), "focus");

      screen.getByRole("button", { name: "Opcja" }).focus();
      rerender(<Card text="Trafione!" />);

      expect(screen.getByText("Trafione!")).toHaveFocus();
      expect(focus).toHaveBeenCalledWith({ preventScroll: true });
    });

    it("moves it once for every change", () => {
      const { rerender } = render(<Card text="Jak myślisz?" />);
      const focus = vi.spyOn(screen.getByText("Jak myślisz?"), "focus");

      rerender(<Card text="Trafione!" />);
      rerender(<Card text="Trafione!" />);

      expect(focus).toHaveBeenCalledTimes(1);
    });
  });

  describe("when the text changes and no text is drawn", () => {
    it("moves no focus", () => {
      const { rerender } = render(<Card text="Jak myślisz?" hasText={false} />);

      screen.getByRole("button", { name: "Opcja" }).focus();
      rerender(<Card text="Trafione!" hasText={false} />);

      expect(screen.getByRole("button", { name: "Opcja" })).toHaveFocus();
    });
  });
});

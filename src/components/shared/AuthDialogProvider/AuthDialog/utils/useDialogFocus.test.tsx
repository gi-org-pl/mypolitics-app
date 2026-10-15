import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { useDialogFocus } from "./useDialogFocus";

const Dialog = ({
  onEscape,
  withControls = true,
}: {
  onEscape: () => void;
  withControls?: boolean;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isLong, setIsLong] = useState(false);
  const onKeyDown = useDialogFocus(ref, onEscape);

  return (
    <div ref={ref} tabIndex={-1} aria-label="dialog" onKeyDown={onKeyDown}>
      {withControls && (
        <>
          <button type="button">first</button>
          <button type="button" onClick={() => setIsLong(true)}>
            grow
          </button>
          {isLong && <button type="button">added</button>}
        </>
      )}
    </div>
  );
};

const Page = ({
  isOpen,
  onEscape,
}: {
  isOpen: boolean;
  onEscape: () => void;
}) => (
  <>
    <button type="button">opener</button>
    {isOpen && <Dialog onEscape={onEscape} />}
  </>
);

describe("useDialogFocus()", () => {
  describe("given the dialog opens", () => {
    it("focuses the dialog and stops the page from scrolling", () => {
      render(<Dialog onEscape={vi.fn()} />);

      expect(screen.getByLabelText("dialog")).toHaveFocus();
      expect(document.body.style.overflow).toBe("hidden");
    });
  });

  describe("given the dialog closes", () => {
    it("gives focus back to the opener and lets the page scroll", () => {
      const { rerender } = render(<Page isOpen={false} onEscape={vi.fn()} />);
      screen.getByText("opener").focus();
      rerender(<Page isOpen onEscape={vi.fn()} />);

      rerender(<Page isOpen={false} onEscape={vi.fn()} />);

      expect(screen.getByText("opener")).toHaveFocus();
      expect(document.body.style.overflow).toBe("");
    });
  });

  describe("given the focused control disappears", () => {
    it("moves focus back to the dialog", async () => {
      render(<Dialog onEscape={vi.fn()} />);
      const grow = screen.getByText("grow");
      grow.focus();

      grow.remove();
      screen.getByText("first").remove();
      await waitFor(() =>
        expect(screen.getByLabelText("dialog")).toHaveFocus(),
      );
    });
  });

  describe("given Escape", () => {
    it("asks to close", () => {
      const onEscape = vi.fn();
      render(<Dialog onEscape={onEscape} />);

      fireEvent.keyDown(screen.getByLabelText("dialog"), { key: "Escape" });

      expect(onEscape).toHaveBeenCalledOnce();
    });
  });

  describe("given Tab on the last control", () => {
    it("wraps to the first, also after the content changed", () => {
      render(<Dialog onEscape={vi.fn()} />);
      fireEvent.click(screen.getByText("grow"));
      screen.getByText("added").focus();

      fireEvent.keyDown(screen.getByText("added"), { key: "Tab" });

      expect(screen.getByText("first")).toHaveFocus();
    });
  });

  describe("given Shift+Tab on the first control or on the dialog", () => {
    it("wraps to the last", () => {
      render(<Dialog onEscape={vi.fn()} />);

      fireEvent.keyDown(screen.getByLabelText("dialog"), {
        key: "Tab",
        shiftKey: true,
      });

      expect(screen.getByText("grow")).toHaveFocus();
    });
  });

  describe("given Tab in the middle", () => {
    it("leaves it to the browser", () => {
      render(<Dialog onEscape={vi.fn()} />);
      screen.getByText("first").focus();

      const isNotPrevented = fireEvent.keyDown(screen.getByText("first"), {
        key: "Tab",
      });

      expect(isNotPrevented).toBe(true);
    });
  });

  describe("given a dialog with no controls", () => {
    it("keeps focus where it is on Tab", () => {
      render(<Dialog onEscape={vi.fn()} withControls={false} />);

      const isNotPrevented = fireEvent.keyDown(
        screen.getByLabelText("dialog"),
        {
          key: "Tab",
        },
      );

      expect(isNotPrevented).toBe(false);
    });
  });

  describe("given another key", () => {
    it("does nothing", () => {
      const onEscape = vi.fn();
      render(<Dialog onEscape={onEscape} />);

      fireEvent.keyDown(screen.getByLabelText("dialog"), { key: "Enter" });

      expect(onEscape).not.toHaveBeenCalled();
    });
  });
});

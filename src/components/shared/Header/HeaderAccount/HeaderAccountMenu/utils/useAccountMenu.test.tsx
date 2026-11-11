import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react";
import { Link, MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { useAccountMenu } from "./useAccountMenu";

const Menu = () => {
  const menu = useAccountMenu();

  return (
    <div onKeyDown={menu.onKeyDown}>
      <button ref={menu.buttonRef} type="button" onClick={menu.toggle}>
        pill
      </button>
      {menu.isOpen && (
        <div ref={menu.menuRef}>
          <button type="button">inside</button>
        </div>
      )}
      <p>outside</p>
      <Link to="/elsewhere">elsewhere</Link>
    </div>
  );
};

describe("useAccountMenu()", () => {
  describe("given it starts", () => {
    it("is closed, with an identifier for the menu", () => {
      const { result } = renderHook(() => useAccountMenu(), {
        wrapper: MemoryRouter,
      });

      expect(result.current.isOpen).toBe(false);
      expect(result.current.menuId).toEqual(expect.any(String));
    });
  });

  describe("given the menu is open", () => {
    it("stays open on a press inside it or on the pill's own press", () => {
      render(<Menu />, { wrapper: MemoryRouter });
      fireEvent.click(screen.getByText("pill"));

      fireEvent.mouseDown(screen.getByText("inside"));
      fireEvent.mouseDown(screen.getByText("pill"));

      expect(screen.getByText("inside")).toBeInTheDocument();
    });

    it("closes on a press outside", () => {
      render(<Menu />, { wrapper: MemoryRouter });
      fireEvent.click(screen.getByText("pill"));

      fireEvent.mouseDown(screen.getByText("outside"));

      expect(screen.queryByText("inside")).not.toBeInTheDocument();
    });

    it("closes on Escape and focuses the pill", () => {
      render(<Menu />, { wrapper: MemoryRouter });
      fireEvent.click(screen.getByText("pill"));

      fireEvent.keyDown(screen.getByText("inside"), { key: "Escape" });

      expect(screen.queryByText("inside")).not.toBeInTheDocument();
      expect(screen.getByText("pill")).toHaveFocus();
    });

    it("closes when a link is followed from the keyboard", () => {
      render(<Menu />, { wrapper: MemoryRouter });
      fireEvent.click(screen.getByText("pill"));

      fireEvent.click(screen.getByRole("link", { name: "elsewhere" }));

      expect(screen.queryByText("inside")).not.toBeInTheDocument();
    });

    it("closes on close", () => {
      const { result } = renderHook(() => useAccountMenu(), {
        wrapper: MemoryRouter,
      });
      act(() => result.current.toggle());

      act(() => result.current.close());

      expect(result.current.isOpen).toBe(false);
    });
  });

  describe("given the menu is closed", () => {
    it("ignores Escape and other keys", () => {
      render(<Menu />, { wrapper: MemoryRouter });

      fireEvent.keyDown(screen.getByText("pill"), { key: "Escape" });
      fireEvent.click(screen.getByText("pill"));
      fireEvent.keyDown(screen.getByText("inside"), { key: "Enter" });

      expect(screen.getByText("inside")).toBeInTheDocument();
    });
  });
});

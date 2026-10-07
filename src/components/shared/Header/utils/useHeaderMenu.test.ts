import { act, fireEvent, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useHeaderMenu } from "./useHeaderMenu";

const appendElement = <T extends keyof HTMLElementTagNameMap>(tagName: T) => {
  const element = document.createElement(tagName);
  document.body.append(element);

  return element;
};

const renderOpenMenu = () => {
  const menu = appendElement("nav");
  const button = appendElement("button");
  const view = renderHook(() => useHeaderMenu());

  view.result.current.menuRef.current = menu;
  view.result.current.buttonRef.current = button;
  act(() => view.result.current.toggle());

  return { ...view, menu, button };
};

describe("useHeaderMenu()", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.replaceChildren();
  });

  describe("given a header that has just been rendered", () => {
    it("starts with the menu closed", () => {
      const { result } = renderHook(() => useHeaderMenu());

      expect(result.current.isOpen).toBe(false);
    });

    it("gives the menu an id for the button to point at", () => {
      const { result } = renderHook(() => useHeaderMenu());

      expect(result.current.menuId).not.toBe("");
    });

    it("keeps the same id between renders", () => {
      const { result, rerender } = renderHook(() => useHeaderMenu());
      const { menuId } = result.current;

      rerender();

      expect(result.current.menuId).toBe(menuId);
    });
  });

  describe("when the menu is toggled", () => {
    it("opens it", () => {
      const { result } = renderHook(() => useHeaderMenu());

      act(() => result.current.toggle());

      expect(result.current.isOpen).toBe(true);
    });

    it("closes it when toggled again", () => {
      const { result } = renderHook(() => useHeaderMenu());

      act(() => result.current.toggle());
      act(() => result.current.toggle());

      expect(result.current.isOpen).toBe(false);
    });
  });

  describe("when the open menu is closed", () => {
    it("closes it", () => {
      const { result } = renderOpenMenu();

      act(() => result.current.close());

      expect(result.current.isOpen).toBe(false);
    });
  });

  describe("when the user presses outside the open menu", () => {
    it("closes it", () => {
      const { result } = renderOpenMenu();

      fireEvent.mouseDown(document.body);

      expect(result.current.isOpen).toBe(false);
    });
  });

  describe("when the user presses inside the open menu", () => {
    it("keeps it open", () => {
      const { result, menu } = renderOpenMenu();

      fireEvent.mouseDown(menu);

      expect(result.current.isOpen).toBe(true);
    });
  });

  describe("when the user presses the menu button", () => {
    it("leaves closing to the button itself", () => {
      const { result, button } = renderOpenMenu();

      fireEvent.mouseDown(button);

      expect(result.current.isOpen).toBe(true);
    });
  });

  describe("when the user presses anywhere while the menu is closed", () => {
    it("keeps it closed", () => {
      const { result } = renderHook(() => useHeaderMenu());

      fireEvent.mouseDown(document.body);

      expect(result.current.isOpen).toBe(false);
    });
  });

  describe("when the header is removed while the menu is open", () => {
    it("stops listening for presses", () => {
      const { unmount } = renderOpenMenu();
      const removeEventListener = vi.spyOn(document, "removeEventListener");

      unmount();

      expect(removeEventListener).toHaveBeenCalledWith(
        "mousedown",
        expect.any(Function),
      );
    });
  });
});

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useArchetypeView } from "./useArchetypeView";

const BOTH = { hasDescription: true, hasRanking: true };

const renderView = (initialProps = BOTH) =>
  renderHook((props) => useArchetypeView(props), { initialProps });

describe("useArchetypeView()", () => {
  describe("given both views available", () => {
    it("starts in the summary", () => {
      const { result } = renderView();

      expect(result.current.openView).toBe("summary");
    });
  });

  describe("when a view is toggled", () => {
    it("opens it", () => {
      const { result } = renderView();

      act(() => result.current.toggleView("description"));
      expect(result.current.openView).toBe("description");
    });

    it("returns to the summary when toggled again", () => {
      const { result } = renderView();

      act(() => result.current.toggleView("ranking"));
      act(() => result.current.toggleView("ranking"));

      expect(result.current.openView).toBe("summary");
    });
  });

  describe("when one view is open and the other is toggled", () => {
    it("switches straight to the other view", () => {
      const { result } = renderView();

      act(() => result.current.toggleView("description"));
      act(() => result.current.toggleView("ranking"));
      expect(result.current.openView).toBe("ranking");

      act(() => result.current.toggleView("description"));
      expect(result.current.openView).toBe("description");
    });
  });

  describe("when a view that is not available is toggled", () => {
    it("stays in the summary", () => {
      const { result } = renderView({
        hasDescription: false,
        hasRanking: true,
      });

      act(() => result.current.toggleView("description"));

      expect(result.current.openView).toBe("summary");
    });

    it("does not open it once it becomes available", () => {
      const { result, rerender } = renderView({
        hasDescription: true,
        hasRanking: false,
      });

      act(() => result.current.toggleView("ranking"));
      rerender(BOTH);

      expect(result.current.openView).toBe("summary");
    });
  });

  describe("given an open view and data that changes", () => {
    it("keeps it open while it stays available", () => {
      const { result, rerender } = renderView();

      act(() => result.current.toggleView("ranking"));
      rerender({ hasDescription: false, hasRanking: true });

      expect(result.current.openView).toBe("ranking");
    });

    it("returns to the summary when the open view stops being available", () => {
      const { result, rerender } = renderView();

      act(() => result.current.toggleView("ranking"));
      rerender({ hasDescription: true, hasRanking: false });

      expect(result.current.openView).toBe("summary");
    });

    it.each([
      ["ranking", { hasDescription: true, hasRanking: false }],
      ["description", { hasDescription: false, hasRanking: true }],
    ] as const)("stays in the summary when the %s comes back", (view, without) => {
      const { result, rerender } = renderView();

      act(() => result.current.toggleView(view));
      rerender(without);
      rerender(BOTH);

      expect(result.current.openView).toBe("summary");
    });

    it("opens the view again when it is toggled after coming back", () => {
      const { result, rerender } = renderView();

      act(() => result.current.toggleView("ranking"));
      rerender({ hasDescription: true, hasRanking: false });
      rerender(BOTH);
      act(() => result.current.toggleView("ranking"));

      expect(result.current.openView).toBe("ranking");
    });
  });
});

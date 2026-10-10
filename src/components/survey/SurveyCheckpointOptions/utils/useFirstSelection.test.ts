import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useFirstSelection } from "./useFirstSelection";

describe("useFirstSelection()", () => {
  describe("when a value is selected", () => {
    it("passes it on", () => {
      const onSelect = vi.fn();
      const { result } = renderHook(() => useFirstSelection(onSelect));

      result.current("first");

      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith("first");
    });
  });

  describe("when a value is selected after one already was", () => {
    it("passes nothing on, for the same value or another", () => {
      const onSelect = vi.fn();
      const { result } = renderHook(() => useFirstSelection(onSelect));

      result.current("first");
      result.current("first");
      result.current("second");

      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith("first");
    });

    it("passes nothing on after a new render with a new handler", () => {
      const first = vi.fn();
      const second = vi.fn();
      const { result, rerender } = renderHook(
        ({ onSelect }) => useFirstSelection(onSelect),
        { initialProps: { onSelect: first } },
      );

      result.current("first");
      rerender({ onSelect: second });
      result.current("second");

      expect(first).toHaveBeenCalledTimes(1);
      expect(second).not.toHaveBeenCalled();
    });
  });

  describe("when mounted again", () => {
    it("lets a selection through again", () => {
      const onSelect = vi.fn();
      const first = renderHook(() => useFirstSelection(onSelect));

      first.result.current("first");
      first.unmount();

      const second = renderHook(() => useFirstSelection(onSelect));

      second.result.current("second");

      expect(onSelect).toHaveBeenCalledTimes(2);
      expect(onSelect).toHaveBeenLastCalledWith("second");
    });
  });
});

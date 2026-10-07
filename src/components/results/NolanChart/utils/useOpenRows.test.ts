import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useOpenRows } from "./useOpenRows";

describe("useOpenRows()", () => {
  it("starts closed, with an id for the rows", () => {
    const { result } = renderHook(() => useOpenRows());

    expect(result.current.isOpen).toBe(false);
    expect(result.current.rowsId).not.toBe("");
  });

  describe("when toggled", () => {
    it("opens, then closes again", () => {
      const { result } = renderHook(() => useOpenRows());

      act(() => result.current.toggle());

      expect(result.current.isOpen).toBe(true);

      act(() => result.current.toggle());

      expect(result.current.isOpen).toBe(false);
    });

    it("keeps the same id", () => {
      const { result } = renderHook(() => useOpenRows());
      const { rowsId } = result.current;

      act(() => result.current.toggle());

      expect(result.current.rowsId).toBe(rowsId);
    });
  });
});

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useResetDialog } from "./useResetDialog";

const renderDialog = (onReset = vi.fn(), isDisabled = false) =>
  renderHook(
    ({ isDisabled: isResetDisabled }) =>
      useResetDialog(onReset, isResetDisabled),
    { initialProps: { isDisabled } },
  );

describe("useResetDialog()", () => {
  describe("on first render", () => {
    it("is closed", () => {
      const { result } = renderDialog();

      expect(result.current.isOpen).toBe(false);
    });
  });

  describe("when opened", () => {
    it("is open and has not called onReset", () => {
      const onReset = vi.fn();
      const { result } = renderDialog(onReset);

      act(() => result.current.open());

      expect(result.current.isOpen).toBe(true);
      expect(onReset).not.toHaveBeenCalled();
    });
  });

  describe("when closed", () => {
    it("is closed and has not called onReset", () => {
      const onReset = vi.fn();
      const { result } = renderDialog(onReset);

      act(() => result.current.open());
      act(() => result.current.close());

      expect(result.current.isOpen).toBe(false);
      expect(onReset).not.toHaveBeenCalled();
    });

    it("keeps the same close function between renders", () => {
      const { result, rerender } = renderDialog();
      const { close } = result.current;

      act(() => result.current.open());
      rerender({ isDisabled: false });

      expect(result.current.close).toBe(close);
    });
  });

  describe("when confirmed", () => {
    it("calls onReset once and closes", () => {
      const onReset = vi.fn();
      const { result } = renderDialog(onReset);

      act(() => result.current.open());
      act(() => result.current.confirm());

      expect(onReset).toHaveBeenCalledTimes(1);
      expect(result.current.isOpen).toBe(false);
    });
  });

  describe("when confirmed again after it has closed", () => {
    it("does not call onReset a second time", () => {
      const onReset = vi.fn();
      const { result } = renderDialog(onReset);

      act(() => result.current.open());
      act(() => result.current.confirm());
      act(() => result.current.confirm());

      expect(onReset).toHaveBeenCalledTimes(1);
    });
  });

  describe("when confirmed without being open", () => {
    it("does not call onReset", () => {
      const onReset = vi.fn();
      const { result } = renderDialog(onReset);

      act(() => result.current.confirm());

      expect(onReset).not.toHaveBeenCalled();
    });
  });

  describe("given reset is disabled", () => {
    it("does not open", () => {
      const { result } = renderDialog(vi.fn(), true);

      act(() => result.current.open());

      expect(result.current.isOpen).toBe(false);
    });
  });

  describe("when reset becomes disabled while the dialog is open", () => {
    it("closes and stays closed once reset is enabled again", () => {
      const { result, rerender } = renderDialog();

      act(() => result.current.open());
      rerender({ isDisabled: true });

      expect(result.current.isOpen).toBe(false);

      rerender({ isDisabled: false });

      expect(result.current.isOpen).toBe(false);
    });

    it("does not call onReset on a late confirmation", () => {
      const onReset = vi.fn();
      const { result, rerender } = renderDialog(onReset);

      act(() => result.current.open());
      rerender({ isDisabled: true });
      act(() => result.current.confirm());

      expect(onReset).not.toHaveBeenCalled();
    });
  });
});

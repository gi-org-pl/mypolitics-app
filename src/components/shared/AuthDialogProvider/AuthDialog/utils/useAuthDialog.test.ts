import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useAuthDialog } from "./useAuthDialog";

describe("useAuthDialog()", () => {
  describe("given nothing is being saved", () => {
    it("closes on request", () => {
      const onClose = vi.fn();
      const { result } = renderHook(() => useAuthDialog(onClose));

      act(() => result.current.close());

      expect(onClose).toHaveBeenCalledOnce();
    });

    it("gives the heading and the line their own identifiers", () => {
      const { result } = renderHook(() => useAuthDialog(vi.fn()));

      expect(result.current.headingId).not.toBe(result.current.descriptionId);
    });
  });

  describe("given the account is being saved", () => {
    it("refuses to close, until the save is over", () => {
      const onClose = vi.fn();
      const { result } = renderHook(() => useAuthDialog(onClose));

      act(() => result.current.setIsBusy(true));
      act(() => result.current.close());

      expect(onClose).not.toHaveBeenCalled();

      act(() => result.current.setIsBusy(false));
      act(() => result.current.close());

      expect(onClose).toHaveBeenCalledOnce();
    });
  });
});

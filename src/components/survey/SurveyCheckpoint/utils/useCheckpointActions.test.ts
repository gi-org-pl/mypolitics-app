import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useCheckpointActions } from "./useCheckpointActions";

const renderActions = (canDraw = true) => {
  const onContinue = vi.fn();
  const onOptOut = vi.fn();

  return {
    ...renderHook(
      (props: { canDraw: boolean }) =>
        useCheckpointActions({ ...props, onContinue, onOptOut }),
      { initialProps: { canDraw } },
    ),
    onContinue,
    onOptOut,
  };
};

describe("useCheckpointActions()", () => {
  describe("when the card can be drawn", () => {
    it("asks for nothing by itself", () => {
      const { onContinue, onOptOut } = renderActions();

      expect(onContinue).not.toHaveBeenCalled();
      expect(onOptOut).not.toHaveBeenCalled();
    });

    it("lets the first request through and ignores every later one", () => {
      const { result, onContinue, onOptOut } = renderActions();

      result.current.requestContinue();
      result.current.requestContinue();
      result.current.requestOptOut();

      expect(onContinue).toHaveBeenCalledTimes(1);
      expect(onOptOut).not.toHaveBeenCalled();
    });

    it("lets a first request to opt out through and ignores a later continue", () => {
      const { result, rerender, onContinue, onOptOut } = renderActions();

      result.current.requestOptOut();
      rerender({ canDraw: true });
      result.current.requestOptOut();
      result.current.requestContinue();

      expect(onOptOut).toHaveBeenCalledTimes(1);
      expect(onContinue).not.toHaveBeenCalled();
    });
  });

  describe("when the card cannot be drawn", () => {
    it("asks to continue once when the card cannot be drawn", () => {
      const { result, rerender, onContinue, onOptOut } = renderActions(false);

      rerender({ canDraw: false });
      result.current.requestContinue();
      result.current.requestOptOut();

      expect(onContinue).toHaveBeenCalledTimes(1);
      expect(onOptOut).not.toHaveBeenCalled();
    });

    it("asks to continue when a card that was drawn loses what it draws", () => {
      const { rerender, onContinue } = renderActions();

      rerender({ canDraw: false });

      expect(onContinue).toHaveBeenCalledTimes(1);
    });
  });
});

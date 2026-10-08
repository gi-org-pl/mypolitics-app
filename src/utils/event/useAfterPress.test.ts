import { act, fireEvent, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useAfterPress } from "./useAfterPress";

const finishTask = () => act(() => vi.runAllTimers());

describe("useAfterPress()", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("given no press under way", () => {
    it("runs the callback at once", () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useAfterPress());

      result.current(callback);

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("runs the callback at once after a press that is over", () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useAfterPress());

      fireEvent.pointerDown(document.body);
      fireEvent.pointerUp(document.body);
      result.current(callback);

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe("given a press under way", () => {
    it("waits until the press is over and has been delivered", () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useAfterPress());

      fireEvent.pointerDown(document.body);
      result.current(callback);

      expect(callback).not.toHaveBeenCalled();

      fireEvent.pointerUp(document.body);

      // The click of the press is still to come, in the same task.
      expect(callback).not.toHaveBeenCalled();

      finishTask();

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("runs the callback when the press is cancelled", () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useAfterPress());

      fireEvent.pointerDown(document.body);
      result.current(callback);
      fireEvent.pointerCancel(document.body);
      finishTask();

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("hears a press that the pressed control keeps to itself", () => {
      const callback = vi.fn();
      const button = document.body.appendChild(
        document.createElement("button"),
      );
      const { result } = renderHook(() => useAfterPress());

      button.addEventListener("pointerdown", (event) =>
        event.stopPropagation(),
      );
      fireEvent.pointerDown(button);
      result.current(callback);

      expect(callback).not.toHaveBeenCalled();

      fireEvent.pointerUp(button);
      finishTask();
      button.remove();

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("runs the later callback when asked twice during one press", () => {
      const first = vi.fn();
      const second = vi.fn();
      const { result } = renderHook(() => useAfterPress());

      fireEvent.pointerDown(document.body);
      result.current(first);
      result.current(second);
      fireEvent.pointerUp(document.body);
      finishTask();

      expect(first).not.toHaveBeenCalled();
      expect(second).toHaveBeenCalledTimes(1);
    });

    it("runs a callback once, however many presses follow", () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useAfterPress());

      fireEvent.pointerDown(document.body);
      result.current(callback);
      fireEvent.pointerUp(document.body);
      finishTask();
      fireEvent.pointerDown(document.body);
      fireEvent.pointerUp(document.body);
      finishTask();

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe("when the component is gone", () => {
    it("drops a callback that was waiting for the end of the task", () => {
      const callback = vi.fn();
      const { result, unmount } = renderHook(() => useAfterPress());

      fireEvent.pointerDown(document.body);
      result.current(callback);
      fireEvent.pointerUp(document.body);
      unmount();
      finishTask();

      expect(callback).not.toHaveBeenCalled();
    });

    it("stops listening to presses", () => {
      const callback = vi.fn();
      const { result, unmount } = renderHook(() => useAfterPress());
      const afterPress = result.current;

      fireEvent.pointerDown(document.body);
      afterPress(callback);
      unmount();
      fireEvent.pointerUp(document.body);
      finishTask();

      expect(callback).not.toHaveBeenCalled();
    });

    it("keeps the same function for as long as the component lives", () => {
      const { result, rerender } = renderHook(() => useAfterPress());
      const afterPress = result.current;

      rerender();

      expect(result.current).toBe(afterPress);
    });
  });
});

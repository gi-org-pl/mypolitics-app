import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { wait } from "./wait";

describe("wait()", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("answers true once the time has passed, and not before", async () => {
    const settled = vi.fn();

    wait(100).then(settled);

    await vi.advanceTimersByTimeAsync(99);
    expect(settled).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(settled).toHaveBeenCalledWith(true);
  });

  it("answers false at once for a signal that is already aborted", async () => {
    await expect(wait(100, AbortSignal.abort())).resolves.toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("answers false as soon as the signal is aborted, and stops the timer", async () => {
    const controller = new AbortController();
    const waiting = wait(100, controller.signal);

    await vi.advanceTimersByTimeAsync(10);
    controller.abort();

    await expect(waiting).resolves.toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("answers true when the signal is never aborted", async () => {
    const waiting = wait(100, new AbortController().signal);

    await vi.advanceTimersByTimeAsync(100);

    await expect(waiting).resolves.toBe(true);
  });
});

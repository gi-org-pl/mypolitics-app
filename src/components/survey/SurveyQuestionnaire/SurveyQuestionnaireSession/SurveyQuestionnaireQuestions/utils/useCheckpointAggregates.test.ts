import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { CheckpointAggregates } from "@/types/checkpoint";
import { loadCheckpointAggregates } from "@/utils/survey/loadCheckpointAggregates";

import { useCheckpointAggregates } from "./useCheckpointAggregates";

vi.mock("@/utils/survey/loadCheckpointAggregates", () => ({
  loadCheckpointAggregates: vi.fn(),
}));

const COUNTS: CheckpointAggregates = {
  q5: { resultsCounted: 1000, chosen: { "q5-a1": 80, "q5-a2": 620 } },
};
const OTHER_COUNTS: CheckpointAggregates = {
  q5: { resultsCounted: 200, chosen: { "q5-a1": 150 } },
};

type Counts = CheckpointAggregates | undefined;

// A load that ends when the test says so.
const createLoad = () => {
  let arrive: (counts: Counts) => void = () => undefined;
  const load = new Promise<Counts>((resolve) => {
    arrive = resolve;
  });

  return { load, arrive: (counts: Counts) => act(async () => arrive(counts)) };
};

const flush = () => act(async () => undefined);

describe("useCheckpointAggregates()", () => {
  beforeEach(() => {
    vi.mocked(loadCheckpointAggregates).mockReset();
  });

  it("starts the load when it is first used", () => {
    vi.mocked(loadCheckpointAggregates).mockReturnValue(createLoad().load);

    renderHook(() => useCheckpointAggregates("quiz-1"));

    expect(loadCheckpointAggregates).toHaveBeenCalledTimes(1);
    expect(loadCheckpointAggregates).toHaveBeenCalledWith("quiz-1");
  });

  it("does not start it again when it is drawn again", () => {
    vi.mocked(loadCheckpointAggregates).mockReturnValue(createLoad().load);

    const { rerender } = renderHook(() => useCheckpointAggregates("quiz-1"));

    rerender();
    rerender();

    expect(loadCheckpointAggregates).toHaveBeenCalledTimes(1);
  });

  it("gives nothing until the counts have arrived", async () => {
    vi.mocked(loadCheckpointAggregates).mockReturnValue(createLoad().load);

    const { result } = renderHook(() => useCheckpointAggregates("quiz-1"));

    await flush();

    expect(result.current()).toBeUndefined();
  });

  it("gives the counts once they have arrived, without a re-render being needed", async () => {
    const { load, arrive } = createLoad();
    let renders = 0;

    vi.mocked(loadCheckpointAggregates).mockReturnValue(load);

    const { result } = renderHook(() => {
      renders += 1;

      return useCheckpointAggregates("quiz-1");
    });
    const getAggregates = result.current;
    const rendersBefore = renders;

    await arrive(COUNTS);

    // The function handed out before the counts arrived gives them now, and
    // their arrival drew nothing again.
    expect(getAggregates()).toBe(COUNTS);
    expect(renders).toBe(rendersBefore);
  });

  it("keeps the same function between renders", () => {
    vi.mocked(loadCheckpointAggregates).mockReturnValue(createLoad().load);

    const { result, rerender } = renderHook(() =>
      useCheckpointAggregates("quiz-1"),
    );
    const getAggregates = result.current;

    rerender();

    expect(result.current).toBe(getAggregates);
  });

  it("gives nothing when the source gave nothing", async () => {
    vi.mocked(loadCheckpointAggregates).mockResolvedValue(undefined);

    const { result } = renderHook(() => useCheckpointAggregates("quiz-1"));

    await flush();

    expect(result.current()).toBeUndefined();
  });

  it("gives the counts already loaded when it is mounted again, with no new request", async () => {
    // The loader answers every call with the one load of the page.
    vi.mocked(loadCheckpointAggregates).mockReturnValue(
      Promise.resolve(COUNTS),
    );

    const first = renderHook(() => useCheckpointAggregates("quiz-1"));

    await flush();
    first.unmount();

    const second = renderHook(() => useCheckpointAggregates("quiz-1"));

    await flush();

    expect(second.result.current()).toBe(COUNTS);
    // It asks the loader, which holds the counts: nothing here keeps or
    // requests them by itself.
    expect(loadCheckpointAggregates).toHaveBeenCalledTimes(2);
    expect(loadCheckpointAggregates).toHaveBeenNthCalledWith(2, "quiz-1");
  });

  it("ignores counts that arrive after it was unmounted", async () => {
    const { load, arrive } = createLoad();

    vi.mocked(loadCheckpointAggregates).mockReturnValue(load);

    const { result, unmount } = renderHook(() =>
      useCheckpointAggregates("quiz-1"),
    );
    const getAggregates = result.current;

    unmount();
    await arrive(COUNTS);

    expect(getAggregates()).toBeUndefined();
  });

  it("gives nothing after it was unmounted, though the counts had arrived", async () => {
    vi.mocked(loadCheckpointAggregates).mockResolvedValue(COUNTS);

    const { result, unmount } = renderHook(() =>
      useCheckpointAggregates("quiz-1"),
    );

    await flush();

    expect(result.current()).toBe(COUNTS);

    unmount();

    expect(result.current()).toBeUndefined();
  });

  it("loads the counts of another quiz when the quiz changes, and drops those of the first", async () => {
    const first = createLoad();
    const second = createLoad();

    vi.mocked(loadCheckpointAggregates)
      .mockReturnValueOnce(first.load)
      .mockReturnValueOnce(second.load);

    const { result, rerender } = renderHook(
      ({ surveyId }) => useCheckpointAggregates(surveyId),
      { initialProps: { surveyId: "quiz-1" } },
    );

    await first.arrive(COUNTS);

    expect(result.current()).toBe(COUNTS);

    rerender({ surveyId: "quiz-2" });

    expect(loadCheckpointAggregates).toHaveBeenLastCalledWith("quiz-2");
    expect(result.current()).toBeUndefined();

    await second.arrive(OTHER_COUNTS);

    expect(result.current()).toBe(OTHER_COUNTS);
  });
});

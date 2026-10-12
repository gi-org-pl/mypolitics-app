import { beforeEach, describe, expect, it, vi } from "vitest";

import { getAnswerCounts } from "@/services/api/client/getAnswerCounts";
import type { CheckpointAggregates } from "@/types/checkpoint";

vi.mock("@/services/api/client/getAnswerCounts", () => ({
  getAnswerCounts: vi.fn(),
}));

const COUNTS: CheckpointAggregates = {
  q1: { resultsCounted: 1000, chosen: { "q1-a1": 80, "q1-a2": 620 } },
};
const OTHER_COUNTS: CheckpointAggregates = {
  q1: { resultsCounted: 200, chosen: { "q1-a1": 150 } },
};

// The answers are kept in the module: every test loads a fresh one.
const importLoad = async () =>
  (await import("./loadCheckpointAggregates")).loadCheckpointAggregates;

describe("loadCheckpointAggregates()", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.mocked(getAnswerCounts).mockReset();
  });

  it("asks the source once for a quiz, however often it is called", async () => {
    vi.mocked(getAnswerCounts).mockResolvedValue(COUNTS);

    const loadCheckpointAggregates = await importLoad();

    await loadCheckpointAggregates("quiz-1");
    await loadCheckpointAggregates("quiz-1");
    await Promise.all([
      loadCheckpointAggregates("quiz-1"),
      loadCheckpointAggregates("quiz-1"),
    ]);

    expect(getAnswerCounts).toHaveBeenCalledTimes(1);
    expect(getAnswerCounts).toHaveBeenCalledWith("quiz-1");
  });

  it("asks once when it is called again before the counts have arrived", async () => {
    let arrive: (counts: CheckpointAggregates) => void = () => undefined;

    vi.mocked(getAnswerCounts).mockReturnValue(
      new Promise((resolve) => {
        arrive = resolve;
      }),
    );

    const loadCheckpointAggregates = await importLoad();
    const first = loadCheckpointAggregates("quiz-1");
    const second = loadCheckpointAggregates("quiz-1");

    arrive(COUNTS);

    expect(await first).toBe(COUNTS);
    expect(await second).toBe(COUNTS);
    expect(getAnswerCounts).toHaveBeenCalledTimes(1);
  });

  it("gives every caller the same counts", async () => {
    vi.mocked(getAnswerCounts)
      .mockResolvedValueOnce(COUNTS)
      .mockResolvedValue(OTHER_COUNTS);

    const loadCheckpointAggregates = await importLoad();

    expect(await loadCheckpointAggregates("quiz-1")).toBe(COUNTS);
    expect(await loadCheckpointAggregates("quiz-1")).toBe(COUNTS);
    expect(loadCheckpointAggregates("quiz-1")).toBe(
      loadCheckpointAggregates("quiz-1"),
    );
  });

  it("asks again for another quiz", async () => {
    vi.mocked(getAnswerCounts)
      .mockResolvedValueOnce(COUNTS)
      .mockResolvedValueOnce(OTHER_COUNTS);

    const loadCheckpointAggregates = await importLoad();

    expect(await loadCheckpointAggregates("quiz-1")).toBe(COUNTS);
    expect(await loadCheckpointAggregates("quiz-2")).toBe(OTHER_COUNTS);
    expect(await loadCheckpointAggregates("quiz-1")).toBe(COUNTS);
    expect(getAnswerCounts).toHaveBeenCalledTimes(2);
    expect(getAnswerCounts).toHaveBeenLastCalledWith("quiz-2");
  });

  it("does not ask again after a failure", async () => {
    vi.mocked(getAnswerCounts)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValue(COUNTS);

    const loadCheckpointAggregates = await importLoad();

    expect(await loadCheckpointAggregates("quiz-1")).toBeUndefined();
    expect(await loadCheckpointAggregates("quiz-1")).toBeUndefined();
    expect(getAnswerCounts).toHaveBeenCalledTimes(1);
  });

  it("gives nothing, and does not reject, when the request rejects after all", async () => {
    vi.mocked(getAnswerCounts)
      .mockRejectedValueOnce(new Error("Unexpected"))
      .mockResolvedValue(COUNTS);

    const loadCheckpointAggregates = await importLoad();

    await expect(loadCheckpointAggregates("quiz-1")).resolves.toBeUndefined();
    await expect(loadCheckpointAggregates("quiz-1")).resolves.toBeUndefined();
    expect(getAnswerCounts).toHaveBeenCalledTimes(1);
  });

  it("asks once more after the page is loaded again", async () => {
    vi.mocked(getAnswerCounts).mockResolvedValue(COUNTS);

    await (await importLoad())("quiz-1");
    // A new page starts with a new module.
    vi.resetModules();
    await (await importLoad())("quiz-1");

    expect(getAnswerCounts).toHaveBeenCalledTimes(2);
  });
});

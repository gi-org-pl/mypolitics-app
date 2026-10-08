import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type {
  AxisPuzzleCheckpointCard,
  CheckpointCardProps,
  CheckpointLine,
} from "@/types/checkpoint";
import { createAxisPair } from "@/utils/vitest/createAxisPair";

import { useCheckpointGuess } from "./useCheckpointGuess";

const HIT_LINE: CheckpointLine = { pool: "axis-puzzle-hit", index: 1 };
const MISS_LINE: CheckpointLine = { pool: "axis-puzzle-miss", index: 2 };

const { start, end } = createAxisPair(
  "economy",
  "Interwencjonizm",
  "Wolny rynek",
  44,
  56,
);

const card: AxisPuzzleCheckpointCard = {
  type: "axis-puzzle",
  boundary: 11,
  axisId: "economy",
  start,
  end,
  leadingSide: "end",
  line: { pool: "axis-puzzle-ask", index: 0 },
};

const createReveal = () =>
  vi.fn<CheckpointCardProps["onReveal"]>((outcome) =>
    outcome === "hit" ? HIT_LINE : MISS_LINE,
  );

const renderGuess = (
  onReveal: CheckpointCardProps["onReveal"] = createReveal(),
  onContinue: () => void = vi.fn(),
) => renderHook(() => useCheckpointGuess(card, onReveal, onContinue));

describe("useCheckpointGuess()", () => {
  describe("before a guess", () => {
    it("is in ask with the line of the card", () => {
      const onReveal = createReveal();
      const onContinue = vi.fn();
      const { result } = renderGuess(onReveal, onContinue);

      expect(result.current.state).toBe("ask");
      expect(result.current.line).toBe(card.line);
      expect(onReveal).not.toHaveBeenCalled();
      expect(onContinue).not.toHaveBeenCalled();
    });
  });

  describe("when a hit is guessed and a line comes back", () => {
    it('calls onReveal once with "hit"', () => {
      const onReveal = createReveal();
      const { result } = renderGuess(onReveal);

      act(() => result.current.guess("hit"));

      expect(onReveal).toHaveBeenCalledTimes(1);
      expect(onReveal).toHaveBeenCalledWith("hit");
    });

    it("is in hit with the line that came back", () => {
      const onContinue = vi.fn();
      const { result } = renderGuess(createReveal(), onContinue);

      act(() => result.current.guess("hit"));

      expect(result.current.state).toBe("hit");
      expect(result.current.line).toBe(HIT_LINE);
      expect(onContinue).not.toHaveBeenCalled();
    });
  });

  describe("when a miss is guessed and a line comes back", () => {
    it('calls onReveal once with "miss"', () => {
      const onReveal = createReveal();
      const { result } = renderGuess(onReveal);

      act(() => result.current.guess("miss"));

      expect(onReveal).toHaveBeenCalledTimes(1);
      expect(onReveal).toHaveBeenCalledWith("miss");
    });

    it("is in miss with the line that came back", () => {
      const { result } = renderGuess();

      act(() => result.current.guess("miss"));

      expect(result.current.state).toBe("miss");
      expect(result.current.line).toBe(MISS_LINE);
    });
  });

  describe("when nothing comes back", () => {
    it("calls onContinue once and stays in ask", () => {
      const onReveal = vi.fn<CheckpointCardProps["onReveal"]>();
      const onContinue = vi.fn();
      const { result } = renderGuess(onReveal, onContinue);

      act(() => result.current.guess("hit"));
      act(() => result.current.guess("miss"));

      expect(onReveal).toHaveBeenCalledTimes(1);
      expect(onContinue).toHaveBeenCalledTimes(1);
      expect(result.current.state).toBe("ask");
      expect(result.current.line).toBe(card.line);
    });
  });

  describe("when asking for the line throws", () => {
    it("leaves the card the same way, without throwing", () => {
      const onReveal = vi.fn<CheckpointCardProps["onReveal"]>(() => {
        throw new Error("no record");
      });
      const onContinue = vi.fn();
      const { result } = renderGuess(onReveal, onContinue);

      expect(() => act(() => result.current.guess("hit"))).not.toThrow();
      expect(onContinue).toHaveBeenCalledTimes(1);
      expect(result.current.state).toBe("ask");
    });
  });

  describe("when a second guess is made", () => {
    it("does not call onReveal again and keeps the first outcome", () => {
      const onReveal = createReveal();
      const { result } = renderGuess(onReveal);

      act(() => result.current.guess("miss"));
      act(() => result.current.guess("hit"));
      act(() => result.current.guess("miss"));

      expect(onReveal).toHaveBeenCalledTimes(1);
      expect(result.current.state).toBe("miss");
      expect(result.current.line).toBe(MISS_LINE);
    });

    it("counts two guesses made in the same turn as one", () => {
      const onReveal = createReveal();
      const { result } = renderGuess(onReveal);

      act(() => {
        result.current.guess("hit");
        result.current.guess("miss");
      });

      expect(onReveal).toHaveBeenCalledTimes(1);
      expect(result.current.state).toBe("hit");
    });
  });

  describe("when mounted again with the same card", () => {
    it("is in ask again", () => {
      const first = renderGuess();

      act(() => first.result.current.guess("hit"));
      first.unmount();

      const onReveal = createReveal();
      const second = renderGuess(onReveal);

      expect(second.result.current.state).toBe("ask");
      expect(second.result.current.line).toBe(card.line);

      act(() => second.result.current.guess("miss"));

      expect(onReveal).toHaveBeenCalledWith("miss");
      expect(second.result.current.state).toBe("miss");
    });
  });
});

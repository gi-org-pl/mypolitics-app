import { describe, expect, it } from "vitest";

import type { PositionPuzzleCheckpointCard } from "@/types/checkpoint";
import type { Orientation } from "@/types/orientation";
import { createOrientation } from "@/utils/vitest/createOrientation";

import { canDrawPositionPuzzle } from "./canDrawPositionPuzzle";

const LEADER = createOrientation("green", "Zielony postępowiec");
const SECOND = createOrientation("national", "Narodowy konserwatysta");
const THIRD = createOrientation("sovereign", "Suwerenny patriota");
const FOURTH = createOrientation("liberal", "Wolnorynkowy liberał");

const createCard = (
  closeness: number,
  options: Orientation[] = [SECOND, LEADER, THIRD],
  leader: Orientation = LEADER,
): PositionPuzzleCheckpointCard => ({
  type: "position-puzzle",
  boundary: 5,
  leader,
  closeness,
  options,
  line: { pool: "position-puzzle-ask", index: 0 },
});

describe("canDrawPositionPuzzle()", () => {
  it("is true for three named options that include the leader and a closeness of 50 or more", () => {
    expect(canDrawPositionPuzzle(createCard(79))).toBe(true);
    expect(canDrawPositionPuzzle(createCard(100))).toBe(true);
    expect(canDrawPositionPuzzle(createCard(79, [LEADER, SECOND, THIRD]))).toBe(
      true,
    );
  });

  it("is true at a closeness of exactly 50", () => {
    expect(canDrawPositionPuzzle(createCard(50))).toBe(true);
  });

  it("is true for a closeness above 100: the bar clamps it", () => {
    expect(canDrawPositionPuzzle(createCard(140))).toBe(true);
  });

  it("is false for two options and for four", () => {
    expect(canDrawPositionPuzzle(createCard(79, [LEADER, SECOND]))).toBe(false);
    expect(
      canDrawPositionPuzzle(createCard(79, [LEADER, SECOND, THIRD, FOURTH])),
    ).toBe(false);
    expect(canDrawPositionPuzzle(createCard(79, []))).toBe(false);
  });

  it("is false when the leader is not among the options", () => {
    expect(canDrawPositionPuzzle(createCard(79, [SECOND, THIRD, FOURTH]))).toBe(
      false,
    );
  });

  it("is false when an option has no name or a name of only space", () => {
    expect(
      canDrawPositionPuzzle(
        createCard(79, [LEADER, createOrientation("national"), THIRD]),
      ),
    ).toBe(false);
    expect(
      canDrawPositionPuzzle(
        createCard(79, [
          LEADER,
          SECOND,
          createOrientation("sovereign", " \n "),
        ]),
      ),
    ).toBe(false);
  });

  it("is false when the leader itself has no name", () => {
    expect(
      canDrawPositionPuzzle(
        createCard(79, [LEADER, SECOND, THIRD], createOrientation("green")),
      ),
    ).toBe(false);
    expect(
      canDrawPositionPuzzle(
        createCard(
          79,
          [createOrientation("green", "  "), SECOND, THIRD],
          createOrientation("green", "  "),
        ),
      ),
    ).toBe(false);
  });

  it("is false for a closeness under 50 or one that is not a number", () => {
    expect(canDrawPositionPuzzle(createCard(49.99))).toBe(false);
    expect(canDrawPositionPuzzle(createCard(0))).toBe(false);
    expect(canDrawPositionPuzzle(createCard(-20))).toBe(false);
    expect(canDrawPositionPuzzle(createCard(Number.NaN))).toBe(false);
    expect(
      canDrawPositionPuzzle({
        ...createCard(79),
        closeness: "79",
      } as unknown as PositionPuzzleCheckpointCard),
    ).toBe(false);
    expect(
      canDrawPositionPuzzle({
        ...createCard(79),
        closeness: undefined,
      } as unknown as PositionPuzzleCheckpointCard),
    ).toBe(false);
  });

  it("is false, without throwing, for a card that cannot be read", () => {
    expect(
      canDrawPositionPuzzle({
        ...createCard(79),
        options: undefined,
      } as unknown as PositionPuzzleCheckpointCard),
    ).toBe(false);
    expect(
      canDrawPositionPuzzle({
        ...createCard(79),
        leader: undefined,
      } as unknown as PositionPuzzleCheckpointCard),
    ).toBe(false);
  });
});

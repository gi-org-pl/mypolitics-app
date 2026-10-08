import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { SurveySession } from "@/types/survey";
import {
  axisPuzzleCard,
  halfwayCard,
  newTraitCard,
} from "@/utils/checkpoint/getNextCheckpoint.fixtures";
import { closeSessionCheckpoint } from "@/utils/survey/closeSessionCheckpoint";
import { getSurveySessionStore } from "@/utils/survey/getSurveySessionStore";
import { setSessionCheckpointRecord } from "@/utils/survey/setSessionCheckpointRecord";
import { turnSessionCheckpointsOff } from "@/utils/survey/turnSessionCheckpointsOff";
import { useSurveySession } from "@/utils/survey/useSurveySession";
import { createStartedSession } from "@/utils/vitest/createStartedSession";
import { createSurvey } from "@/utils/vitest/createSurvey";

import { CHECKPOINT_CARDS } from "../../../SurveyQuestionnaire.constants";
import { useCheckpointCard } from "./useCheckpointCard";

vi.mock("../../../SurveyQuestionnaire.constants", () => ({
  CHECKPOINT_CARDS: {},
}));
vi.mock("@/utils/survey/closeSessionCheckpoint", { spy: true });
vi.mock("@/utils/survey/turnSessionCheckpointsOff", { spy: true });
vi.mock("@/utils/survey/setSessionCheckpointRecord", { spy: true });

const StubCard = () => null;

// A session with a card up after the second question of a quiz of its own:
// the stores live as long as the module does.
const renderCard = (
  cardsShown: unknown[],
  overrides: Partial<SurveySession> = {},
) => {
  const survey = createSurvey({ id: crypto.randomUUID() });
  const store = getSurveySessionStore(survey);

  store.setState(
    {
      ...createStartedSession(survey, 2),
      phase: "checkpoints",
      checkpointRecord: { cardsShown, timeSamples: [] },
      ...overrides,
    },
    true,
  );

  return renderHook(() => {
    const session = useSurveySession(survey);

    return { session: session.session, controls: useCheckpointCard(session) };
  });
};

describe("useCheckpointCard()", () => {
  beforeEach(() => {
    CHECKPOINT_CARDS.halfway = StubCard;
    CHECKPOINT_CARDS["axis-puzzle"] = StubCard;
  });

  afterEach(() => {
    CHECKPOINT_CARDS.halfway = undefined;
    CHECKPOINT_CARDS["axis-puzzle"] = undefined;
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  describe("given a record whose last card has a registered type", () => {
    it("gives that card", () => {
      const { result } = renderCard([
        { card: axisPuzzleCard },
        { card: halfwayCard },
      ]);

      expect(result.current.controls.card).toBe(halfwayCard);
      expect(result.current.session.phase).toBe("checkpoints");
      expect(closeSessionCheckpoint).not.toHaveBeenCalled();
    });

    it("keeps giving the same card between renders", () => {
      const { result, rerender } = renderCard([{ card: halfwayCard }]);
      const { card, reveal } = result.current.controls;

      rerender();

      expect(result.current.controls.card).toBe(card);
      expect(result.current.controls.reveal).toBe(reveal);
    });
  });

  describe("given no readable card on record, or a type that is not registered", () => {
    it("gives no card and closes the checkpoint", () => {
      const { result } = renderCard([{ card: { type: "halfway" } }]);

      expect(result.current.controls.card).toBeNull();
      expect(result.current.session.phase).toBe("questions");
      expect(result.current.session.entries).toHaveLength(2);
      expect(closeSessionCheckpoint).toHaveBeenCalledTimes(1);
    });

    it("never puts up an earlier card in place of one that cannot be read", () => {
      const { result } = renderCard([{ card: halfwayCard }, halfwayCard]);

      expect(result.current.controls.card).toBeNull();
      expect(result.current.session.phase).toBe("questions");
    });

    it("gives no card of a type that has no component and closes the checkpoint", () => {
      const { result } = renderCard([{ card: newTraitCard }]);

      expect(result.current.controls.card).toBeNull();
      expect(result.current.session.phase).toBe("questions");
      expect(result.current.session.areCheckpointsOff).toBe(false);
    });

    it("gives no reveal line", () => {
      const { result } = renderCard([{ card: newTraitCard }]);

      expect(result.current.controls.reveal("hit")).toBeUndefined();
      expect(setSessionCheckpointRecord).not.toHaveBeenCalled();
    });
  });

  describe("when closed", () => {
    it("calls closeCheckpoint once", () => {
      const { result } = renderCard([{ card: halfwayCard }]);

      act(() => result.current.controls.close());

      expect(closeSessionCheckpoint).toHaveBeenCalledTimes(1);
      expect(result.current.session.phase).toBe("questions");
      expect(result.current.session.areCheckpointsOff).toBe(false);
      expect(result.current.session.checkpointRecord.cardsShown).toEqual([
        { card: halfwayCard },
      ]);
    });
  });

  describe("when the taker opts out", () => {
    it("calls turnCheckpointsOff once", () => {
      const { result } = renderCard([{ card: halfwayCard }]);

      act(() => result.current.controls.optOut());

      expect(turnSessionCheckpointsOff).toHaveBeenCalledTimes(1);
      expect(result.current.session.phase).toBe("questions");
      expect(result.current.session.areCheckpointsOff).toBe(true);
    });
  });

  describe("when a puzzle asks for a reveal line", () => {
    it("returns the line and writes the record that holds it with setCheckpointRecord", () => {
      const { result } = renderCard([
        { card: halfwayCard },
        { card: axisPuzzleCard },
      ]);
      const { card } = result.current.controls;
      const lines: unknown[] = [];

      act(() => {
        lines.push(result.current.controls.reveal("hit"));
      });

      expect(lines).toEqual([
        { pool: "axis-puzzle-hit", index: expect.any(Number) },
      ]);
      expect(setSessionCheckpointRecord).toHaveBeenCalledTimes(1);
      expect(result.current.session.checkpointRecord.cardsShown).toEqual([
        { card: halfwayCard },
        { card: axisPuzzleCard, revealLines: { hit: lines[0] } },
      ]);
      expect(result.current.session.phase).toBe("checkpoints");
      expect(result.current.controls.card).toBe(card);
    });

    it("returns the recorded line when that outcome was revealed before", () => {
      const recorded = { pool: "axis-puzzle-miss", index: 1 };
      const { result } = renderCard([
        { card: axisPuzzleCard, revealLines: { miss: recorded } },
      ]);
      const lines: unknown[] = [];

      act(() => {
        lines.push(result.current.controls.reveal("miss"));
      });

      expect(lines).toEqual([recorded]);
      expect(setSessionCheckpointRecord).not.toHaveBeenCalled();
    });

    it("keeps the line of one outcome when the other is revealed", () => {
      const { result } = renderCard([{ card: axisPuzzleCard }]);
      const lines: unknown[] = [];

      act(() => {
        lines.push(result.current.controls.reveal("hit"));
      });
      act(() => {
        lines.push(result.current.controls.reveal("miss"));
      });

      expect(result.current.session.checkpointRecord.cardsShown).toEqual([
        {
          card: axisPuzzleCard,
          revealLines: { hit: lines[0], miss: lines[1] },
        },
      ]);
    });

    it("gives a card that is not a puzzle no line and writes nothing", () => {
      const { result } = renderCard([{ card: halfwayCard }]);

      expect(result.current.controls.reveal("hit")).toBeUndefined();
      expect(setSessionCheckpointRecord).not.toHaveBeenCalled();
    });
  });
});

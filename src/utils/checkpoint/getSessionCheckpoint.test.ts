import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { CheckpointType } from "@/types/checkpoint";
import type { SurveySession } from "@/types/survey";
import { getRunningState } from "@/utils/running-state/getRunningState";
import { createNineQuestionSurvey } from "@/utils/vitest/createNineQuestionSurvey";
import { createStartedSession } from "@/utils/vitest/createStartedSession";

import { getNextCheckpoint } from "./getNextCheckpoint";
import {
  axisPuzzleCard,
  createState,
  halfwayCard,
} from "./getNextCheckpoint.fixtures";
import { getSessionCheckpoint } from "./getSessionCheckpoint";

vi.mock("@/utils/running-state/getRunningState");
vi.mock("./getNextCheckpoint");

const survey = createNineQuestionSurvey();
const STATE = createState(5, 9);
const HALFWAY: readonly CheckpointType[] = ["halfway"];

const createBoundary = (
  done = 5,
  overrides: Partial<SurveySession> = {},
): SurveySession => ({ ...createStartedSession(survey, done), ...overrides });

describe("getSessionCheckpoint()", () => {
  beforeEach(() => {
    vi.mocked(getRunningState).mockReturnValue(STATE);
    vi.mocked(getNextCheckpoint).mockReturnValue(halfwayCard);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("given checkpoints are off", () => {
    it("returns nothing and runs neither the running state nor the engine", () => {
      const session = createBoundary(5, { areCheckpointsOff: true });

      expect(getSessionCheckpoint(survey, session, HALFWAY)).toBeNull();
      expect(getRunningState).not.toHaveBeenCalled();
      expect(getNextCheckpoint).not.toHaveBeenCalled();
    });
  });

  describe("given no enabled type", () => {
    it("returns nothing and runs neither", () => {
      expect(getSessionCheckpoint(survey, createBoundary(), [])).toBeNull();
      expect(getRunningState).not.toHaveBeenCalled();
      expect(getNextCheckpoint).not.toHaveBeenCalled();
    });
  });

  describe("given no question is open", () => {
    it("returns nothing, whatever the engine would return", () => {
      expect(
        getSessionCheckpoint(survey, createBoundary(9), HALFWAY),
      ).toBeNull();
      expect(getRunningState).not.toHaveBeenCalled();
      expect(getNextCheckpoint).not.toHaveBeenCalled();
    });
  });

  describe("given a boundary where the engine has a card", () => {
    it("returns that card", () => {
      expect(getSessionCheckpoint(survey, createBoundary(), HALFWAY)).toBe(
        halfwayCard,
      );
    });

    it("asks the engine with the entries, the read record, the session id as the seed and the enabled types", () => {
      const session = createBoundary(5, {
        checkpointRecord: {
          cardsShown: [{ card: axisPuzzleCard }, "not a card"],
          timeSamples: [{ questionId: "q1", seconds: 3 }],
        },
      });
      const aggregates = { q5: { resultsCounted: 200, chosen: {} } };

      getSessionCheckpoint(survey, session, HALFWAY, aggregates);

      expect(getRunningState).toHaveBeenCalledWith(survey, session);
      expect(getNextCheckpoint).toHaveBeenCalledTimes(1);
      expect(getNextCheckpoint).toHaveBeenCalledWith({
        survey,
        entries: session.entries,
        state: STATE,
        record: {
          cardsShown: [{ card: axisPuzzleCard }],
          timeSamples: [{ questionId: "q1", seconds: 3 }],
        },
        seed: session.id,
        isOptedOut: false,
        enabledTypes: HALFWAY,
        aggregates,
      });
    });

    it("passes no aggregates when it is handed none", () => {
      getSessionCheckpoint(survey, createBoundary(), HALFWAY);

      expect(
        vi.mocked(getNextCheckpoint).mock.calls[0][0].aggregates,
      ).toBeUndefined();
    });
  });

  describe("given a boundary where the engine has nothing", () => {
    it("returns nothing", () => {
      vi.mocked(getNextCheckpoint).mockReturnValue(null);

      expect(
        getSessionCheckpoint(survey, createBoundary(), HALFWAY),
      ).toBeNull();
    });
  });

  describe("given the running state or the engine throws", () => {
    it("returns nothing and does not throw", () => {
      vi.mocked(getRunningState).mockImplementation(() => {
        throw new Error("no state");
      });

      expect(
        getSessionCheckpoint(survey, createBoundary(), HALFWAY),
      ).toBeNull();

      vi.mocked(getRunningState).mockReturnValue(STATE);
      vi.mocked(getNextCheckpoint).mockImplementation(() => {
        throw new Error("no engine");
      });

      expect(
        getSessionCheckpoint(survey, createBoundary(), HALFWAY),
      ).toBeNull();
    });
  });

  describe("given the engine returns a card of a type that is not enabled", () => {
    it("returns nothing", () => {
      vi.mocked(getNextCheckpoint).mockReturnValue(axisPuzzleCard);

      expect(
        getSessionCheckpoint(survey, createBoundary(), HALFWAY),
      ).toBeNull();
    });
  });
});

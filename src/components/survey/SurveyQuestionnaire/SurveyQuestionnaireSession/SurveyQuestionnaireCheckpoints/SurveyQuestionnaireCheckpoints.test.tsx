import { fireEvent, screen } from "@testing-library/react";
import { type ComponentType, useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type {
  CheckpointCardProps,
  CheckpointLine,
  CheckpointType,
} from "@/types/checkpoint";
import {
  axisPuzzleCard,
  halfwayCard,
} from "@/utils/checkpoint/getNextCheckpoint.fixtures";
import { closeSessionCheckpoint } from "@/utils/survey/closeSessionCheckpoint";
import { createStartedSession } from "@/utils/vitest/createStartedSession";
import { createSurvey } from "@/utils/vitest/createSurvey";
import { renderPhaseContent } from "@/utils/vitest/renderPhaseContent";

import { CHECKPOINT_CARDS } from "../../SurveyQuestionnaire.constants";
import { SurveyQuestionnaireCheckpoints } from "./SurveyQuestionnaireCheckpoints";

vi.mock("../../SurveyQuestionnaire.constants", () => ({
  CHECKPOINT_CARDS: {},
}));
vi.mock("@/utils/survey/closeSessionCheckpoint", { spy: true });

// A card that shows what it was handed and has a control for each of its
// three callbacks.
const StubCard = ({
  card,
  onReveal,
  onContinue,
  onOptOut,
}: CheckpointCardProps) => {
  const [line, setLine] = useState<CheckpointLine>();

  return (
    <section aria-label="Checkpoint">
      <p>{`${card.type} ${card.boundary}`}</p>
      {line && <p>{`${line.pool} ${line.index}`}</p>}
      <button type="button" onClick={() => setLine(onReveal("hit"))}>
        Zgadnij
      </button>
      <button type="button" onClick={onContinue}>
        Dalej
      </button>
      <button type="button" onClick={onOptOut}>
        Wyłącz checkpointy
      </button>
    </section>
  );
};

// The registry ties each type to a component of that type's own card; the
// stub stands in for any of them.
const cards = CHECKPOINT_CARDS as Partial<
  Record<CheckpointType, ComponentType<CheckpointCardProps>>
>;

const BrokenCard = (): never => {
  throw new Error("The chart cannot be drawn");
};

const renderPhase = (cardsShown: unknown[]) => {
  // The stores live as long as the module does: a quiz of its own.
  const survey = createSurvey({ id: crypto.randomUUID() });

  return renderPhaseContent(SurveyQuestionnaireCheckpoints, survey, {
    ...createStartedSession(survey, 2),
    phase: "checkpoints",
    checkpointRecord: { cardsShown, timeSamples: [] },
  });
};

const getButton = (name: string) => screen.getByRole("button", { name });

describe("<SurveyQuestionnaireCheckpoints />", () => {
  beforeEach(() => {
    cards.halfway = StubCard;
    cards["axis-puzzle"] = StubCard;
  });

  afterEach(() => {
    cards.halfway = undefined;
    cards["axis-puzzle"] = undefined;
    vi.restoreAllMocks();
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  describe("given a card whose type is registered", () => {
    it("renders the registered component with the card and the three callbacks", () => {
      const { getSession } = renderPhase([{ card: halfwayCard }]);

      expect(screen.getByRole("region", { name: "Checkpoint" })).toBeVisible();
      expect(screen.getByText("halfway 20")).toBeVisible();
      expect(getSession().phase).toBe("checkpoints");
    });

    it('closes the checkpoint on "Dalej": the questions follow, with checkpoints on', () => {
      const { getSession } = renderPhase([{ card: halfwayCard }]);

      fireEvent.click(getButton("Dalej"));

      expect(getSession().phase).toBe("questions");
      expect(getSession().areCheckpointsOff).toBe(false);
      expect(getSession().entries).toHaveLength(2);
    });

    it('turns checkpoints off on "Wyłącz checkpointy": the questions follow', () => {
      const { getSession } = renderPhase([{ card: halfwayCard }]);

      fireEvent.click(getButton("Wyłącz checkpointy"));

      expect(getSession().phase).toBe("questions");
      expect(getSession().areCheckpointsOff).toBe(true);
    });

    it("hands a puzzle its reveal line, keeps it with the card and leaves the card up", () => {
      const { getSession } = renderPhase([{ card: axisPuzzleCard }]);

      fireEvent.click(getButton("Zgadnij"));

      const [shownCard] = getSession().checkpointRecord.cardsShown as {
        revealLines: { hit: CheckpointLine };
      }[];

      expect(shownCard.revealLines.hit.pool).toBe("axis-puzzle-hit");
      expect(
        screen.getByText(`axis-puzzle-hit ${shownCard.revealLines.hit.index}`),
      ).toBeVisible();
      expect(screen.getByText("axis-puzzle 24")).toBeVisible();
      expect(getSession().phase).toBe("checkpoints");
    });

    it("makes no use of the lock or of leaving", () => {
      const { lock, onLeave } = renderPhase([{ card: halfwayCard }]);

      fireEvent.click(getButton("Dalej"));

      expect(lock).not.toHaveBeenCalled();
      expect(onLeave).not.toHaveBeenCalled();
    });
  });

  describe("given the card component throws while rendering", () => {
    it("shows nothing of the failure and closes the checkpoint once", () => {
      vi.spyOn(console, "error").mockImplementation(() => undefined);
      cards.halfway = BrokenCard;

      const { getSession, container } = renderPhase([{ card: halfwayCard }]);

      expect(container).toBeEmptyDOMElement();
      expect(closeSessionCheckpoint).toHaveBeenCalledTimes(1);
      expect(getSession().phase).toBe("questions");
      expect(getSession().areCheckpointsOff).toBe(false);
    });
  });

  describe("given no card that can be put up", () => {
    it("draws nothing and closes the checkpoint", () => {
      const { getSession, container } = renderPhase([{ card: "unreadable" }]);

      expect(container).toBeEmptyDOMElement();
      expect(getSession().phase).toBe("questions");
    });
  });
});

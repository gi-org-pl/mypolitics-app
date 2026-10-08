import { describe, expect, it } from "vitest";
import { SurveyCheckpointAxisCloseness } from "@/components/survey/SurveyCheckpointAxisCloseness/SurveyCheckpointAxisCloseness";
import { SurveyCheckpointAxisPuzzle } from "@/components/survey/SurveyCheckpointAxisPuzzle/SurveyCheckpointAxisPuzzle";
import { SurveyCheckpointHalfway } from "@/components/survey/SurveyCheckpointHalfway/SurveyCheckpointHalfway";
import { getEnabledCheckpointTypes } from "@/utils/checkpoint/getEnabledCheckpointTypes";

import { CHECKPOINT_CARDS } from "./SurveyQuestionnaire.constants";

describe("CHECKPOINT_CARDS", () => {
  it('holds SurveyCheckpointHalfway under "halfway"', () => {
    expect(CHECKPOINT_CARDS.halfway).toBe(SurveyCheckpointHalfway);
  });

  it('makes "halfway" one of the enabled types', () => {
    expect(getEnabledCheckpointTypes(CHECKPOINT_CARDS)).toContain("halfway");
  });

  it('holds SurveyCheckpointAxisCloseness under "axis-closeness"', () => {
    expect(CHECKPOINT_CARDS["axis-closeness"]).toBe(
      SurveyCheckpointAxisCloseness,
    );
  });

  it('maps "axis-puzzle" to SurveyCheckpointAxisPuzzle', () => {
    expect(CHECKPOINT_CARDS["axis-puzzle"]).toBe(SurveyCheckpointAxisPuzzle);
    expect(getEnabledCheckpointTypes(CHECKPOINT_CARDS)).toContain(
      "axis-puzzle",
    );
  });
});

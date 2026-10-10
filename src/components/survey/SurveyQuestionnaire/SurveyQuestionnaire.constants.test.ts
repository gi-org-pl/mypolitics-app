import { describe, expect, it } from "vitest";
import { SurveyCheckpointAxisCloseness } from "@/components/survey/SurveyCheckpointAxisCloseness/SurveyCheckpointAxisCloseness";
import { SurveyCheckpointHalfway } from "@/components/survey/SurveyCheckpointHalfway/SurveyCheckpointHalfway";
import { SurveyCheckpointNewTrait } from "@/components/survey/SurveyCheckpointNewTrait/SurveyCheckpointNewTrait";
import { getEnabledCheckpointTypes } from "@/utils/checkpoint/engine/getEnabledCheckpointTypes";

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

  it('holds SurveyCheckpointNewTrait under "new-trait"', () => {
    expect(CHECKPOINT_CARDS["new-trait"]).toBe(SurveyCheckpointNewTrait);
  });

  it('makes "new-trait" one of the enabled types', () => {
    expect(getEnabledCheckpointTypes(CHECKPOINT_CARDS)).toContain("new-trait");
  });
});

import { describe, expect, it } from "vitest";

import { SurveyCheckpointHalfway } from "@/components/survey/SurveyCheckpointHalfway/SurveyCheckpointHalfway";
import { getEnabledCheckpointTypes } from "@/utils/checkpoint/engine/getEnabledCheckpointTypes";

import { CHECKPOINT_CARDS } from "./SurveyQuestionnaire.constants";

describe("CHECKPOINT_CARDS", () => {
  it('holds SurveyCheckpointHalfway under "halfway"', () => {
    expect(CHECKPOINT_CARDS.halfway).toBe(SurveyCheckpointHalfway);
  });

  it('makes "halfway" one of the enabled types', () => {
    expect(getEnabledCheckpointTypes(CHECKPOINT_CARDS)).toContain("halfway");
  });
});

import { describe, expect, it } from "vitest";

import { SurveyCheckpointHalfway } from "@/components/survey/SurveyCheckpointHalfway/SurveyCheckpointHalfway";
import { SurveyCheckpointNolanPath } from "@/components/survey/SurveyCheckpointNolanPath/SurveyCheckpointNolanPath";
import { getEnabledCheckpointTypes } from "@/utils/checkpoint/getEnabledCheckpointTypes";

import { CHECKPOINT_CARDS } from "./SurveyQuestionnaire.constants";

describe("CHECKPOINT_CARDS", () => {
  it('holds SurveyCheckpointHalfway under "halfway"', () => {
    expect(CHECKPOINT_CARDS.halfway).toBe(SurveyCheckpointHalfway);
  });

  it('makes "halfway" one of the enabled types', () => {
    expect(getEnabledCheckpointTypes(CHECKPOINT_CARDS)).toContain("halfway");
  });

  it('maps "nolan-path" to SurveyCheckpointNolanPath', () => {
    expect(CHECKPOINT_CARDS["nolan-path"]).toBe(SurveyCheckpointNolanPath);
  });

  it('makes "nolan-path" one of the enabled types', () => {
    expect(getEnabledCheckpointTypes(CHECKPOINT_CARDS)).toContain("nolan-path");
  });
});

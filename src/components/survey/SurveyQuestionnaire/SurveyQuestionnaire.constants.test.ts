import { describe, expect, it } from "vitest";

import { SurveyCheckpointAxisCloseness } from "@/components/survey/SurveyCheckpointAxisCloseness/SurveyCheckpointAxisCloseness";

import { CHECKPOINT_CARDS } from "./SurveyQuestionnaire.constants";

describe("CHECKPOINT_CARDS", () => {
  it('holds SurveyCheckpointAxisCloseness under "axis-closeness"', () => {
    expect(CHECKPOINT_CARDS["axis-closeness"]).toBe(
      SurveyCheckpointAxisCloseness,
    );
  });
});

import { SurveyCheckpointHalfway } from "@/components/survey/SurveyCheckpointHalfway/SurveyCheckpointHalfway";
import { SurveyCheckpointNewTrait } from "@/components/survey/SurveyCheckpointNewTrait/SurveyCheckpointNewTrait";
import type { CheckpointCardRegistry } from "@/types/checkpoint";

// The card component of every checkpoint type that has one. A card task
// registers its card by adding one entry here - `halfway:
// SurveyCheckpointHalfway` - and from then on its type is handed to the
// engine and can be selected. A type with no entry is never selected, so the
// questionnaire works at every step of the build; with no entry at all, no
// card ever appears.
//
// This file imports card components and nothing else. The phases of the
// screen read it, so it must not import any of them.
export const CHECKPOINT_CARDS: CheckpointCardRegistry = {
  halfway: SurveyCheckpointHalfway,
  "new-trait": SurveyCheckpointNewTrait,
};

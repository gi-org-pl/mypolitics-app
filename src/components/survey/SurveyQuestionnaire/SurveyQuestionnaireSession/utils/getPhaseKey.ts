import type { SurveySession } from "@/types/survey";

// What counts as "another phase is on screen": another session or another
// phase. The content of a phase is mounted once per key, so a question that
// takes the place of another leaves the content of the questions phase where
// it is - see `getContentKey` for the changes inside a phase.
export const getPhaseKey = ({ id, phase }: SurveySession): string =>
  JSON.stringify([id, phase]);

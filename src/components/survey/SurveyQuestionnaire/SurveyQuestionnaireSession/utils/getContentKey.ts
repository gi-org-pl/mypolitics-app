import type { SurveySession } from "@/types/survey";

// What counts as "the content changed": another session, another phase, or
// another question. Picking a category or a field changes the session and leaves
// the content where it is.
export const getContentKey = ({ id, phase, entries }: SurveySession): string =>
  JSON.stringify([id, phase, entries.length]);

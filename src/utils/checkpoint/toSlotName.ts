import type { Orientation } from "@/types/orientation";
import { toTrimmedText } from "@/utils/text/toTrimmedText";

// The name of an orientation as a line prints it: exactly as the quiz wrote
// it, trimmed. Nothing for a name that is missing or empty.
export const toSlotName = (orientation?: Orientation): string | undefined =>
  toTrimmedText(orientation?.name);

import { escapeLineBreaks } from "@/utils/json/escapeLineBreaks";
import { parseJsonObject } from "@/utils/json/parseJsonObject";
import { toTrimmedText } from "@/utils/text/toTrimmedText";

export type PackedText =
  | { kind: "absent" }
  | { kind: "plain"; text: string }
  | { kind: "packed"; value: Record<string, unknown> };

export const parsePackedText = (text?: string | null): PackedText => {
  const trimmedText = toTrimmedText(text);

  if (trimmedText === undefined) return { kind: "absent" };
  if (!trimmedText.startsWith("{")) return { kind: "plain", text: trimmedText };

  const value =
    parseJsonObject(trimmedText) ??
    parseJsonObject(escapeLineBreaks(trimmedText));

  return value ? { kind: "packed", value } : { kind: "absent" };
};

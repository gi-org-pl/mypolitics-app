import { toTrimmedText } from "@/utils/text/toTrimmedText";

const FULL_STOP = ".";

// The text of a question as a line quotes it: as written, trimmed, with one
// closing full stop removed, so that the line's own punctuation ends the
// sentence. A closing question mark or exclamation mark and a full stop in
// the middle are kept. Nothing for a thesis with no text.
export const toSlotThesis = (text: unknown): string | undefined => {
  const thesis = toTrimmedText(text);

  return toTrimmedText(
    thesis?.endsWith(FULL_STOP) ? thesis.slice(0, -FULL_STOP.length) : thesis,
  );
};

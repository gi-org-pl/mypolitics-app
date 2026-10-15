export const DISPLAY_NAME_MAX_LENGTH = 50;
export const DISPLAY_NAME_MIN_LENGTH = 2;

// Control characters (line breaks and tabs among them) as they can arrive in
// a pasted or a suggested name.
const CONTROL_CHARACTERS = /\p{Cc}/gu;

// What may stand in the name field while it is typed in: the text without
// control characters, at most as long as a name may be. Spaces stay as they
// are, so a space typed between two words is not taken away.
export const toTypedName = (text: string): string =>
  Array.from(text.replace(CONTROL_CHARACTERS, " "))
    .slice(0, DISPLAY_NAME_MAX_LENGTH)
    .join("");

// The name as it is saved: trimmed, with every run of spaces inside it made
// one space, and at most as long as a name may be.
export const toDisplayName = (text: string): string =>
  Array.from(toTypedName(text).replace(/\s+/gu, " ").trim())
    .slice(0, DISPLAY_NAME_MAX_LENGTH)
    .join("");

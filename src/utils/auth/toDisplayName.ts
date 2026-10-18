export const DISPLAY_NAME_MAX_LENGTH = 50;
export const DISPLAY_NAME_MIN_LENGTH = 2;

// Control characters (line breaks and tabs among them) as they can arrive in
// a pasted or a suggested name.
const CONTROL_CHARACTERS = /\p{Cc}/gu;

// A run of spaces, together with the invisible format characters around it
// (zero-width spaces, direction marks), which the name keeps as one space.
const SPACE_RUN = /[\s\p{Cf}]*\s[\s\p{Cf}]*/gu;

// Spaces and invisible format characters at either end of the name. Inside
// the name format characters stay: the zero-width joiner holds emoji
// sequences together.
const INVISIBLE_ENDS = /^[\s\p{Cf}]+|[\s\p{Cf}]+$/gu;

// What may stand in the name field while it is typed in: the text without
// control characters, at most as long as a name may be. Spaces stay as they
// are, so a space typed between two words is not taken away.
export const toTypedName = (text: string): string =>
  Array.from(text.replace(CONTROL_CHARACTERS, " "))
    .slice(0, DISPLAY_NAME_MAX_LENGTH)
    .join("");

// The name as it is saved: without spaces or invisible characters at its
// ends, with every run of spaces inside it made one space, and at most as
// long as a name may be. A name made only of invisible characters comes out
// empty, so it cannot pass for a name.
export const toDisplayName = (text: string): string =>
  Array.from(
    toTypedName(text).replace(SPACE_RUN, " ").replace(INVISIBLE_ENDS, ""),
  )
    .slice(0, DISPLAY_NAME_MAX_LENGTH)
    .join("");

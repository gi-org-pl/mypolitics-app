// How the text of the pill fits its room. A text of several words wraps onto
// a second line at a space, and is cut only after two lines; a word longer
// than the line breaks inside before that cut. A single word stays on one
// line and is cut with an ellipsis when it is longer than the room: broken
// inside, it would read as two words.
export const getPillTextClassName = (text: string): string =>
  /\s/.test(text.trim())
    ? "line-clamp-2 py-0.5 leading-5 wrap-break-word"
    : "truncate leading-6";

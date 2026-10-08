const STRING_PATTERN = /"(?:[^"\\]|\\.)*"/gs;

export const escapeLineBreaks = (json: string): string =>
  json.replace(STRING_PATTERN, (text) =>
    text.replaceAll("\r", "\\r").replaceAll("\n", "\\n"),
  );

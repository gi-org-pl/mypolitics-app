export const toTrimmedText = (text?: unknown): string | undefined => {
  const trimmedText = typeof text === "string" ? text.trim() : "";

  return trimmedText === "" ? undefined : trimmedText;
};

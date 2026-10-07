export const toDescription = (text?: string): string =>
  typeof text === "string"
    ? text
        .replace(/\r\n?/g, "\n")
        .trim()
        .replace(/\n\s*\n/g, "\n\n")
    : "";

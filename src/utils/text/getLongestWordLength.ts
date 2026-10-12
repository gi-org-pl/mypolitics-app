const HYPHENS = /[-‐–—]/g;

/**
 * The number of characters of the longest part of a text that a line cannot
 * break: a line breaks at whitespace and after a hyphen or a dash, so the
 * hyphen counts with the part it ends.
 */
export const getLongestWordLength = (text?: string): number =>
  typeof text === "string"
    ? text
        .replace(HYPHENS, "$& ")
        .split(/\s+/)
        .reduce((longest, word) => Math.max(longest, [...word].length), 0)
    : 0;

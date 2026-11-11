// The initials an avatar shows without a photo: the first letters of the
// first two words of the name, in capitals ("Ala Nowak" - "AN"), or the
// first letter alone for a one-word name.
export const getInitials = (name: string): string =>
  name
    .trim()
    .split(/\s+/u)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => Array.from(word)[0].toLocaleUpperCase())
    .join("");

// What ties a tab panel to its tab: its own identifier, and the identifier of
// the tab that names it.
export interface TabPanelIdentity {
  id: string;
  labelledBy: string;
}

// How copying a text to the clipboard ended. An enum, written as a constant
// with a type of the same name - see ApiFailureKind in types/api.ts.
export const CopyOutcome = {
  Copied: "copied",
  Failed: "failed", // the browser has no Clipboard API, or refused to write
} as const;

export type CopyOutcome = (typeof CopyOutcome)[keyof typeof CopyOutcome];

// What the image of an orientation is drawn as. A picture - a portrait, a
// logo, a photograph - fills the place it is given. A glyph - an icon - has a
// size of its own and keeps it.
export type ImageKind = "picture" | "glyph";

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

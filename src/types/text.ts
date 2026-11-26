export interface TextRange {
  start: number;
  end: number;
}

// A text the app holds in more than one language, by language code. Polish is
// the source language, so it is always there.
export type TranslatedText = { pl: string } & Partial<Record<string, string>>;

import type { ReadyResults } from "../ResultsScreen.types";

// A result that can be drawn, as the screen read and resolved it.
export type ResultsScreenContentProps = Pick<
  ReadyResults,
  "survey" | "resolved"
>;

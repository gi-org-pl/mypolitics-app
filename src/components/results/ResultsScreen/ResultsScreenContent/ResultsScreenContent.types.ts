import type { ReadyResults } from "../ResultsScreen.types";

// A result that can be drawn, as the screen read and resolved it: the quiz,
// the result itself - the comparison tab needs its identifier and its
// answers - and what the header and the modules are given.
export type ResultsScreenContentProps = Pick<
  ReadyResults,
  "survey" | "result" | "resolved"
>;

import type { ResultsTab } from "../../ResultsHeader.types";

export const toResultsTab = (value: string): ResultsTab =>
  value === "comparison" ? "comparison" : "results";

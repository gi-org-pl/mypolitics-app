import type { Orientation } from "@/types/orientation";
import type { ResolvedModule } from "@/types/results";

// The other side of a comparison, laid over the modules: who it is, and what
// each module of the quiz is given for their result.
export interface ModulesComparison {
  orientation: Orientation;
  modules: ResolvedModule[]; // resolved from the other result as the modules that are drawn are. A module with none here is drawn with no overlay
}

export interface ResultsColumnsProps {
  modules: ResolvedModule[]; // only the ones that can be drawn, in the order they are drawn
  comparison?: ModulesComparison; // absent = the modules are drawn for one side alone
}

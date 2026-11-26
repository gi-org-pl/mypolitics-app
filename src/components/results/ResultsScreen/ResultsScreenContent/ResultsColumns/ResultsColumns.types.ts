import type { ResolvedModule } from "@/types/results";

export interface ResultsColumnsProps {
  modules: ResolvedModule[]; // only the ones that can be drawn, in the order they are drawn
}

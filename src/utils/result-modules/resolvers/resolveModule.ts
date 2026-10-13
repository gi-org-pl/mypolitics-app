import { HEADER_MODULE_TYPE } from "@/constants/results";
import type {
  DrawnModuleType,
  ModuleResolver,
  ResolutionContext,
  ResolvedModule,
  ResultModule,
} from "@/types/results";

import { resolveArchetype } from "./resolveArchetype";
import { resolveDoubleAxis } from "./resolveDoubleAxis";
import { resolveHorizontalBar } from "./resolveHorizontalBar";
import { resolveMultiAxis } from "./resolveMultiAxis";
import { resolveNolanChart } from "./resolveNolanChart";
import { resolveSingleAxis } from "./resolveSingleAxis";
import { resolveTraits } from "./resolveTraits";

// The resolver of every type that stands among the modules.
const RESOLVERS: { [Type in DrawnModuleType]: ModuleResolver<Type> } = {
  single_axis: resolveSingleAxis,
  double_axis: resolveDoubleAxis,
  multi_axis: resolveMultiAxis,
  horizontal_bar: resolveHorizontalBar,
  nolan_chart: resolveNolanChart,
  archetype: resolveArchetype,
  traits: resolveTraits,
};

// What the module of a record is given, with where the record asks to stand
// and the author's title and description. There is nothing for a record that
// cannot be drawn, and nothing for a header record: the header is never one
// of the modules.
export const resolveModule = (
  record: ResultModule,
  context: ResolutionContext,
): ResolvedModule | undefined => {
  if (record.type === HEADER_MODULE_TYPE) return undefined;

  const content = RESOLVERS[record.type](record, context);
  const { id, position, column, title, description } = record;

  return content && { id, position, column, title, description, ...content };
};

import type {
  ModuleResolver,
  ResolutionContext,
  ResolvedModule,
  ResultModuleOf,
  ResultModuleType,
  ResultModuleValues,
} from "@/types/results";
import { getModuleValues } from "@/utils/result-modules/values/getModuleValues";

import { resolveArchetype } from "./resolveArchetype";
import { resolveDoubleAxis } from "./resolveDoubleAxis";
import { resolveHorizontalBar } from "./resolveHorizontalBar";
import { resolveMultiAxis } from "./resolveMultiAxis";
import { resolveNolanChart } from "./resolveNolanChart";
import { resolveSingleAxis } from "./resolveSingleAxis";
import { resolveTraits } from "./resolveTraits";

// The resolver of every type. Each takes a record of its own type, which is
// what lets it ask for the keys of that type. The header is resolved
// on its own and is never one of the modules, so its record gives nothing.
const RESOLVERS: { [Type in ResultModuleType]: ModuleResolver<Type> } = {
  header: () => undefined,
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
export const resolveModule = <Type extends ResultModuleType>(
  record: ResultModuleOf<Type>,
  context: ResolutionContext,
): ResolvedModule | undefined => {
  const content = RESOLVERS[record.type](record, context);
  const { id, position, column } = record;
  // The record is of any type here, so it is read as one: a type that reads
  // no title has none, whatever its record holds.
  const { title, description }: Partial<ResultModuleValues> =
    getModuleValues<ResultModuleType>(record);

  return content && { id, position, column, title, description, ...content };
};

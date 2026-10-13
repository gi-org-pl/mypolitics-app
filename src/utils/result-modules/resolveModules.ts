import type { ResolutionContext, ResolvedModule } from "@/types/results";
import { resolveModule } from "@/utils/result-modules/resolvers/resolveModule";

// What every module of the quiz that can be drawn is given for one result, in
// the order the quiz lists its records.
//
// The leader is part of what a record is resolved against, and it is the
// caller who names it. A second result that is laid over the first - of a
// friend, in a comparison - is resolved against the leader of the first, so a
// list tied to the leader keeps the same rows for both.
export const resolveModules = (context: ResolutionContext): ResolvedModule[] =>
  context.survey.resultModules.flatMap(
    (record) => resolveModule(record, context) ?? [],
  );

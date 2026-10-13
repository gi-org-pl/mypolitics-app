import type { ResolvedModule } from "@/types/results";

// The module of the other result that is laid over a module: the one resolved
// from the same record, which is the one with the same identifier and type.
// There is none when the other result does not draw that module.
export const findComparedModule = <Module extends ResolvedModule>(
  module: Module,
  others: readonly ResolvedModule[],
): Extract<ResolvedModule, { type: Module["type"] }> | undefined =>
  others.find(
    (other): other is Extract<ResolvedModule, { type: Module["type"] }> =>
      other.id === module.id && other.type === module.type,
  );

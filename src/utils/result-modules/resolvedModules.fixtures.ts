import type { DrawnModuleType, ResolvedModule } from "@/types/results";

import { resolveResult } from "./resolveResult";
import { moduleQuiz, moduleQuizResult } from "./resolveResult.fixtures";

// The modules of the quiz that has one record of every module type, resolved
// against its result, in the order they are drawn:
//
//   identity    archetype "Tożsamość"       end
//   ecology     single axis (Ekologia)      start
//   economy     double axis, described      end
//   ideologies  multi axis "Ideologie"      start
//   parties     horizontal bar "Partie"     start
//   compass     Nolan chart                 end
//   traits      traits "Cechy"              start
export const resolvedModules: ResolvedModule[] = resolveResult(
  moduleQuiz,
  moduleQuizResult,
).modules;

// The module of one type among them.
export const findModule = <Type extends DrawnModuleType>(
  type: Type,
): Extract<ResolvedModule, { type: Type }> =>
  resolvedModules.find(
    (module): module is Extract<ResolvedModule, { type: Type }> =>
      module.type === type,
  ) as Extract<ResolvedModule, { type: Type }>;

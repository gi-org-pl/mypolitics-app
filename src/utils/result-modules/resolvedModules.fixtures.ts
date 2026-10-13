import type {
  DrawnModuleType,
  QuizResult,
  ResolvedModule,
} from "@/types/results";

import { resolveModules } from "./resolveModules";
import { resolveResult } from "./resolveResult";
import { moduleQuiz, moduleQuizResult } from "./resolveResult.fixtures";

type ModuleOf<Type extends DrawnModuleType> = Extract<
  ResolvedModule,
  { type: Type }
>;

const findIn = <Type extends DrawnModuleType>(
  modules: ResolvedModule[],
  type: Type,
): ModuleOf<Type> =>
  modules.find(
    (module): module is ModuleOf<Type> => module.type === type,
  ) as ModuleOf<Type>;

const resolved = resolveResult(moduleQuiz, moduleQuizResult);

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
export const resolvedModules: ResolvedModule[] = resolved.modules;

// The module of one type among them.
export const findModule = <Type extends DrawnModuleType>(
  type: Type,
): ModuleOf<Type> => findIn(resolvedModules, type);

// A second result of that quiz, of a made-up friend who chose the second
// answer of q1, q2 and q4 and the first of q3 and q5, with the points and the
// maximum the back-end counts for those answers. Unlike the first result it
// gives two parties a score.
//
//   socialist 25   liberal 60   left 0   right 100   progress 50
//   tradition 50   green 100    brave 0  calm 100
//   party-left 25  party-green 75
export const friendQuizResult: QuizResult = {
  scores: {
    socialist: { points: 1, maximum: 4 },
    liberal: { points: 3, maximum: 5 },
    anarchist: { points: 0, maximum: 3 },
    left: { points: 0, maximum: 3 },
    right: { points: 3, maximum: 3 },
    progress: { points: 1, maximum: 2 },
    tradition: { points: 1, maximum: 2 },
    green: { points: 1, maximum: 1 },
    secret: { points: 1, maximum: 1 },
    brave: { points: 0, maximum: 3 },
    calm: { points: 1, maximum: 1 },
    "party-left": { points: 1, maximum: 4 },
    "party-green": { points: 3, maximum: 4 },
  },
  answers: [
    { questionId: "q1", answerId: "q1-a2" },
    { questionId: "q2", answerId: "q2-a2" },
    { questionId: "q3", answerId: "q3-a1" },
    { questionId: "q4", answerId: "q4-a2" },
    { questionId: "q5", answerId: "q5-a1" },
  ],
};

// The modules of the friend, resolved as a comparison lays them over the
// first result: against the leader of the first, so the parties are the same
// rows.
export const friendModules: ResolvedModule[] = resolveModules({
  survey: moduleQuiz,
  result: friendQuizResult,
  leader: resolved.leader,
});

// The module of one type among those of the friend.
export const findFriendModule = <Type extends DrawnModuleType>(
  type: Type,
): ModuleOf<Type> => findIn(friendModules, type);

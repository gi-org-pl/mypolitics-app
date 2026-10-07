import { msg } from "@lingui/core/macro";

import type { QuizTab, QuizTabOption } from "./QuizSection.types";

export const DEFAULT_QUIZ_TAB: QuizTab = "all";

export const QUIZ_TABS: QuizTabOption[] = [
  { value: "all", label: msg`Wszystkie` },
  { value: "electoral", label: msg`Wyborcze` },
  { value: "social", label: msg`Społecznościowe` },
];

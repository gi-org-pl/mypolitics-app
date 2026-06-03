import type { MessageDescriptor } from "@lingui/core";
import { i18n } from "@lingui/core";
import { msg } from "@lingui/core/macro";

export const UNDERSCORED_PHRASES: MessageDescriptor[] = [
  msg`nie powinien`,
  msg`powinien`,
  msg`nie`,
];

export const getUnderscoredPhrases = (): string[] =>
  UNDERSCORED_PHRASES.map((phrase) => i18n._(phrase));

export const EXPLANATION_TRIGGER_PHRASES: string[] = [
  "oznaczone",
  "wyjaśnienie",
  "przykład",
  "np.",
];

export const EXPLANATION_PREVIEW_FALLBACK_CHARS = 50;
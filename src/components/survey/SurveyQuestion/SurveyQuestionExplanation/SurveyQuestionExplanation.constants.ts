import type { MessageDescriptor } from "@lingui/core";
import { msg } from "@lingui/core/macro";

export const EXPLANATION_TRIGGER_PHRASES: MessageDescriptor[] = [
  msg({
    message: "to",
    context: "survey question: explanation trigger phrase",
    comment:
      "The word that ends the preview of an explanation: the preview is the explanation up to its first whole-word occurrence, e.g. 'Obraza uczuć religijnych to...'.",
  }),
];

export const EXPLANATION_FALLBACK: MessageDescriptor = msg`Sprawdź wyjaśnienie`;

export const EXPLANATION_PREVIEW_ELLIPSIS: MessageDescriptor = msg({
  message: "...",
  context: "survey question: explanation preview ellipsis",
  comment:
    "Ends the one-line preview of an explanation, right after the trigger phrase, e.g. 'Obraza uczuć religijnych to...'.",
});

import type { MessageDescriptor } from "@lingui/core";
import { msg } from "@lingui/core/macro";

export const EMPHASISED_PHRASES: MessageDescriptor[] = [
  msg({
    message: "nie",
    context: "survey question: emphasised phrase",
    comment:
      "A word underlined in a quiz statement wherever it stands as a whole word. Translate it as the negation of the language.",
  }),
];

export const EXPLANATION_TRIGGER_PHRASES: MessageDescriptor[] = [
  msg({
    message: "to",
    context: "survey question: explanation trigger phrase",
    comment:
      "The word that ends the preview of an explanation: the preview is the explanation up to its first whole-word occurrence, e.g. 'Obraza uczuć religijnych to...'.",
  }),
];

export const EXPLANATION_FALLBACK: MessageDescriptor = msg`Sprawdź wyjaśnienie`;

export const EXPLANATION_PREVIEW_ELLIPSIS = "...";

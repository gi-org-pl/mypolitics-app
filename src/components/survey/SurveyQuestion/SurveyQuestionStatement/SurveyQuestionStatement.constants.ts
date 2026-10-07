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

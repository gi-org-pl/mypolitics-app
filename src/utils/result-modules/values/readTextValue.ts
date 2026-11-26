import type {
  ResultModuleValue,
  ResultModuleValueDefinition,
} from "@/types/results";
import { toTrimmedText } from "@/utils/text/toTrimmedText";

// A text is the saved value without the space around it. A value that is
// blank or is not a text, a key that is left out included, is no text. A
// text per language is read the same way: it arrives in one language.
export const readTextValue = (
  _: ResultModuleValueDefinition<"text" | "localizedText">,
  value?: ResultModuleValue,
): string | undefined => toTrimmedText(value);

import { DEFAULT_LANGUAGE } from "@/constants/common";
import type { TranslatedText } from "@/types/text";

import { toTrimmedText } from "./toTrimmedText";

// A text in the language asked for, without the space around it. A language
// the text is not written in, or is empty in, falls back to the default one.
export const pickTranslation = (
  text: TranslatedText | undefined,
  language: string,
): string | undefined =>
  toTrimmedText(text?.[language]) ?? toTrimmedText(text?.[DEFAULT_LANGUAGE]);

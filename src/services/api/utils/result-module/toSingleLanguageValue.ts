import type { OwnResultModulePair } from "@/types/results";
import { pickTranslation } from "@/utils/text/pickTranslation";

// A value of the app's own list as the API would send it for one language: a
// value that holds each language is the text of that language, whatever its
// key, and a plain value stays as it is.
export const toSingleLanguageValue = (
  value: OwnResultModulePair["value"],
  language: string,
) =>
  typeof value === "object" && value !== null
    ? pickTranslation(value, language)
    : value;

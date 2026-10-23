import type { OwnResultModule } from "@/types/results";

import { toSingleLanguageValue } from "./toSingleLanguageValue";

// A record of the app's own list as the API would send it for one language:
// every value that holds each language is the text of that language.
export const toSingleLanguageModule = (
  record: OwnResultModule,
  language: string,
) => ({
  ...record,
  values: record.values.map(({ key, value }) => ({
    key,
    value: toSingleLanguageValue(value, language),
  })),
});

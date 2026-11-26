import type { OwnResultModule } from "@/types/results";
import { pickTranslation } from "@/utils/text/pickTranslation";

// A record of the app's own list as the API would send it for one language:
// every text is the one of that language.
export const toSingleLanguageModule = (
  record: OwnResultModule,
  language: string,
) => ({
  ...record,
  title: pickTranslation(record.title, language),
  description: pickTranslation(record.description, language),
  labels: Object.fromEntries(
    Object.entries(record.labels ?? {}).map(([slot, text]) => [
      slot,
      pickTranslation(text, language),
    ]),
  ),
});

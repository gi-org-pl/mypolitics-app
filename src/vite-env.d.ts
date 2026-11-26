/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  // Local-only project mapping used to run the migrated Polish 1990s quiz
  // against its mock API. It has no production default.
  readonly VITE_POLISH_NINETIES_PROJECT_ID?: string;
  readonly VITE_RESULTS_EMAIL_URL?: string;
  // The full address of the source of answer counts, for the stats chart
  // checkpoint. Unset or blank = no source: nothing is requested.
  readonly VITE_ANSWER_COUNTS_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

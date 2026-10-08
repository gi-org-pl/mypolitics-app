/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_RESULTS_EMAIL_URL?: string;
  // The full address of the source of answer counts, for the stats chart
  // checkpoint. Unset or blank = no source: nothing is requested.
  readonly VITE_ANSWER_COUNTS_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

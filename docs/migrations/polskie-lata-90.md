# Polskie lata 90. — lokalny mock

The production API cannot be changed for this migration. `server.mjs` serves the
converted quiz and a minimal in-memory results endpoint only for manual local
verification.

## Start

1. In one terminal, run `node server.mjs 4010`.
2. In another, run:

   ```sh
   VITE_API_URL=http://localhost:4010/api \
   VITE_POLISH_NINETIES_PROJECT_ID=polskie-lata-90-mock-project \
   yarn dev
   ```

   The project ID is an environment-only override, so it cannot be
   accidentally committed as a production mapping.

3. Open `/quizzes/polskie-lata-90`, answer the questions, and inspect the
   resulting `/results/<uuid>` page.

The mock reads `quiz-data-1MRfrZ26Fl.json` and
`question-effects-1MRfrZ26Fl.json`. The latter supplies the legacy
agree/disagree orientation effects needed to calculate a locally visible
result.

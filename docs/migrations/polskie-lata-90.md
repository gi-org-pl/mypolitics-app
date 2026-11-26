# Polskie lata 90. — lokalny mock

The production API cannot be changed for this migration. `server.mjs` serves the
converted quiz and a minimal in-memory results endpoint only for manual local
verification.

## Start

1. Add the temporary local mapping below to `src/constants/survey.ts`. Do not
   commit it: the mock project ID does not exist in production.

   ```ts
   "polskie-lata-90": "polskie-lata-90-mock-project",
   ```

2. In one terminal, run `node server.mjs 4010`.
3. In another, run `VITE_API_URL=http://localhost:4010/api yarn dev`.
4. Open `/quizzes/polskie-lata-90`, answer the questions, and inspect the
   resulting `/results/<uuid>` page.

The mock reads `quiz-data-1MRfrZ26Fl.json` and
`question-effects-1MRfrZ26Fl.json`. The latter supplies the legacy
agree/disagree orientation effects needed to calculate a locally visible
result.

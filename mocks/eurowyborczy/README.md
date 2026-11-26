# Eurowyborczy 2023 - local mocks

- `quiz-data-eurowyborczy2024.json` - output of `quiz-conversion-bot` for the slug `eurowyborczy2024` (questions, categories, orientations, axes). The bot gives no answers and no scoring.
- `mock-api.mjs` - local API stand-in. The answers and the scoring are made up (see `SCORING`), only to have a result to look at.
- `results.png` - the result page against the mock.

```
node mocks/eurowyborczy/mock-api.mjs
VITE_API_URL=http://localhost:4010 yarn dev
# /quizzes/eurowyborczy2024  and  /results/3f0c2a52-6f7b-4d53-9a55-0d5f1b9f3c11
```

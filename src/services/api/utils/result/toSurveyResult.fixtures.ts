// A result as GET /api/v1/result/{resultId} sends it once it is calculated:
// the body the back-end's own scenario of that request expects, with the two
// dates it leaves open filled in.
export const RESULT_ID = "18d38e48-f49f-418c-aa8f-6211601cfaa4";

export const RESULT_SURVEY_ID = "96032c50-f243-4d2c-86a5-9088dd077417";

export const resultCalculation = {
  algorithm: "mp-qu-2025-1.0.0",
  calculatedAt: "2025-01-01T21:37:00Z",
  orientations: [
    {
      id: "a3bf56a8-a29b-4bfd-992b-c4017e659e7a",
      maxPossible: 20,
      points: 10,
    },
  ],
};

export const resultResponse = {
  id: RESULT_ID,
  surveyId: RESULT_SURVEY_ID,
  results: resultCalculation,
  prioritizedCategories: [
    {
      id: "e3df1bea-450f-4f64-a3f8-4e23e4c1e622",
      name: "Comfort",
      weight: 3,
    },
    {
      id: "553441b4-8ce0-45f7-8927-63a76a1c2b23",
      name: "Technology",
      weight: 4,
    },
  ],
  answers: [
    {
      questionId: "1d61087b-2e8c-4c66-bac1-7b7d75f2855b",
      answerId: "0bf0f5e4-9ff7-4a85-98a3-3e087af4d1f0",
    },
    {
      questionId: "5a4cc455-0e56-47f0-92a5-0ae8ed843d6e",
      answerId: "30e8a748-5517-4d5c-a3cf-0d83702d3c7e",
    },
  ],
  createdAt: "2025-01-01T21:36:58Z",
  calculatedAt: null,
};

// The same result before it is calculated.
export const pendingResultResponse = { ...resultResponse, results: null };

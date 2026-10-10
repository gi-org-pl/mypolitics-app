// A small quiz in the shape GET /v1/survey/{surveyId} sends it: three
// categories with packed names, of which one is hidden, and four questions
// that mix the categories - scale and one-of-many.
//
//   q1  economy  scale, with an explanation   q3  economy  scale
//   q2  ecology  one of many                  q4  hidden   scale

export const SURVEY_ID = "60beb898-a4e4-4160-88c4-07a9931ab499";

// The project the app keeps for the slug of the quiz. The mocked API names
// the survey above as its latest.
export const PROJECT_ID = "5ab50822-e95e-4c7c-a1d6-14aceb68f108";
export const QUIZ_NAME = "Quiz próbny";

export const CATEGORY_IDS = {
  economy: "f9cc62af-260b-46f0-ac55-ad86e818b009",
  ecology: "a7cafe79-7c59-4d6e-880e-764176e99b9f",
  control: "0c1f6f0e-5a43-4a53-9d4b-0d1a2b3c4d5e",
};

const toPackedName = (name: string, isHidden: boolean): string =>
  JSON.stringify({ name, isHidden }, null, 2);

const toAnswer = (questionId: string, text: string, index: number) => ({
  id: `${questionId}-a${index + 1}`,
  text,
  weight: 2,
  questionId,
  orientationIds: [] as string[],
});

const toQuestion = (
  id: string,
  categoryId: string,
  text: string,
  answerType: "AGREE_OR_DISAGREE" | "ONE_OF_MANY",
  answerTexts: string[],
  explanation: string | null = null,
) => ({
  id,
  surveyId: SURVEY_ID,
  categoryId,
  text,
  explanation,
  answerType,
  status: "LIVE",
  possibleAnswers: answerTexts.map((answerText, index) =>
    toAnswer(id, answerText, index),
  ),
});

const SCALE = [
  "Zdecydowanie za",
  "Częściowo za",
  "Częściowo przeciw",
  "Zdecydowanie przeciw",
];

export const QUESTIONS = [
  toQuestion(
    "q1",
    CATEGORY_IDS.economy,
    "Stawka procentowa podatku powinna zależeć od zamożności.",
    "AGREE_OR_DISAGREE",
    SCALE,
    "Stawka zależna od zamożności to progresywny podatek, czyli system, w którym osoby o wyższych dochodach płacą większy procent swojego dochodu.",
  ),
  toQuestion(
    "q2",
    CATEGORY_IDS.ecology,
    "Z czego Polska powinna czerpać energię?",
    "ONE_OF_MANY",
    ["Z węgla", "Z atomu", "Ze źródeł odnawialnych"],
  ),
  toQuestion(
    "q3",
    CATEGORY_IDS.economy,
    "Państwo powinno dopłacać do kredytów mieszkaniowych.",
    "AGREE_OR_DISAGREE",
    SCALE,
  ),
  toQuestion(
    "q4",
    CATEGORY_IDS.control,
    "Odpowiadam na pytania uważnie.",
    "AGREE_OR_DISAGREE",
    SCALE,
  ),
];

export const surveyFixture = {
  id: SURVEY_ID,
  title: QUIZ_NAME,
  description: "Quiz do testów.",
  createdAt: "2025-03-01T22:25:03.037Z",
  type: "OFFICIAL",
  isPublic: true,
  averageFinishTime: 1,
  version: "e2e-1",
  algorithm: "default",
  authors: [],
  defaultLanguage: "pl",
  supportedLanguages: ["pl"],
  orientations: [],
  categories: [
    {
      id: CATEGORY_IDS.economy,
      name: toPackedName("Gospodarka", false),
      weight: 1.25,
    },
    {
      id: CATEGORY_IDS.ecology,
      name: toPackedName("Ekologia", false),
      weight: 1.25,
    },
    {
      id: CATEGORY_IDS.control,
      name: toPackedName("Pytania kontrolne", true),
      weight: 1,
    },
  ],
  axis: [],
  questions: QUESTIONS,
};

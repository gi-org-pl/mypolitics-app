import { SURVEY_ID } from "./survey.fixture";

// A quiz with three archetypes, in the shape GET /v1/survey/{surveyId} sends
// it: ten scale questions of one category and three orientations of type
// identity, none hidden and none with an image. In every question the two
// agreeing answers score the first archetype, "Częściowo przeciw" the second
// and "Zdecydowanie przeciw" the third.
//
// It has one visible category, so no categories are picked, and it has no axes
// at all. After five answers of "Zdecydowanie za" the first archetype stands
// at 100 and the other two at 0, and half the questions are done, so the
// double axis puzzle is due at that boundary. With no axes and no compass no
// other personal card can fire there, and the halfway card, due at the same
// boundary, loses to it. With three archetypes the rows are exactly these
// three; their order follows the seed of the session.

const CATEGORY_ID = "5d7e9f1a-2b4c-4d6e-8f1a-3c5e7a9b1d2f";
const QUESTION_COUNT = 10;

const toArchetype = (id: string, generalName: string, color: string) => ({
  id,
  type: "IDENTITY",
  color,
  logoUrl: null,
  surveyId: SURVEY_ID,
  generalName,
  explanation: null,
  linkedOrientations: [],
});

const GREEN_PROGRESSIVE = toArchetype(
  "b2c3d4e5-1111-4b7c-8d9e-2e3f4a5b6c7d",
  "Zielony postępowiec",
  "#27ae60",
);
const NATIONAL_CONSERVATIVE = toArchetype(
  "b2c3d4e5-2222-4b7c-8d9e-2e3f4a5b6c7d",
  "Narodowy konserwatysta",
  "#2c3e50",
);
const SOVEREIGN_PATRIOT = toArchetype(
  "b2c3d4e5-3333-4b7c-8d9e-2e3f4a5b6c7d",
  "Suwerenny patriota",
  "#c0392b",
);

const ARCHETYPES = [
  GREEN_PROGRESSIVE,
  NATIONAL_CONSERVATIVE,
  SOVEREIGN_PATRIOT,
];

// The names of the three archetypes, in the order of the quiz. The first is
// the one the answers "Zdecydowanie za" lead to.
export const ARCHETYPE_NAMES = ARCHETYPES.map(({ generalName }) => generalName);

// The four answers of a scale question, each with its weight and the
// archetype it scores.
const SCALE = [
  { text: "Zdecydowanie za", weight: 2, archetype: GREEN_PROGRESSIVE },
  { text: "Częściowo za", weight: 1, archetype: GREEN_PROGRESSIVE },
  { text: "Częściowo przeciw", weight: 1, archetype: NATIONAL_CONSERVATIVE },
  { text: "Zdecydowanie przeciw", weight: 2, archetype: SOVEREIGN_PATRIOT },
];

export const ARCHETYPE_QUESTIONS = Array.from(
  { length: QUESTION_COUNT },
  (_, questionIndex) => {
    const id = `archetype-q${questionIndex + 1}`;

    return {
      id,
      surveyId: SURVEY_ID,
      categoryId: CATEGORY_ID,
      text: `Stwierdzenie ${questionIndex + 1} o społeczeństwie.`,
      explanation: null as string | null,
      answerType: "AGREE_OR_DISAGREE" as const,
      status: "LIVE",
      possibleAnswers: SCALE.map(({ text, weight, archetype }, index) => ({
        id: `${id}-a${index + 1}`,
        text,
        weight,
        questionId: id,
        orientationIds: [archetype.id],
      })),
    };
  },
);

export const archetypesSurveyFixture = {
  id: SURVEY_ID,
  title: "Quiz próbny z trzema postaciami",
  description: "Quiz do testów kart checkpointów.",
  createdAt: "2025-03-01T22:25:03.037Z",
  type: "OFFICIAL",
  isPublic: true,
  averageFinishTime: QUESTION_COUNT,
  version: "e2e-archetypes-1",
  algorithm: "default",
  authors: [],
  defaultLanguage: "pl",
  supportedLanguages: ["pl"],
  orientations: ARCHETYPES,
  categories: [
    {
      id: CATEGORY_ID,
      name: JSON.stringify({ name: "Społeczeństwo", isHidden: false }),
      weight: 1,
    },
  ],
  axis: [],
  questions: ARCHETYPE_QUESTIONS,
};

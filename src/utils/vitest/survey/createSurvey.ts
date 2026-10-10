import type { Survey } from "@/types/survey";

// A small quiz for tests and stories: two visible categories and a hidden
// one, mixed in the order of the questions, with scale questions and
// one-of-many questions.
//
//   q1  economy  scale        q4  hidden   scale
//   q2  ecology  one of many  q5  ecology  one of many
//   q3  economy  scale
export const createSurvey = (overrides: Partial<Survey> = {}): Survey => ({
  id: "survey",
  name: "Quiz testowy",
  isOfficial: true,
  supportedLanguages: ["pl"],
  orientations: [],
  categories: [
    { id: "economy", name: "Gospodarka", weight: 1, isHidden: false },
    { id: "ecology", name: "Ekologia", weight: 1, isHidden: false },
    { id: "hidden", name: "Pytania kontrolne", weight: 1, isHidden: true },
  ],
  axes: [],
  questions: [
    {
      id: "q1",
      categoryId: "economy",
      text: "Podatki powinny być niższe.",
      answerType: "agree-or-disagree",
      possibleAnswers: [
        {
          id: "q1-strongly-agree",
          text: "Zdecydowanie za",
          weight: 1,
          orientationIds: [],
        },
        {
          id: "q1-agree",
          text: "Częściowo za",
          weight: 0.5,
          orientationIds: [],
        },
        {
          id: "q1-disagree",
          text: "Częściowo przeciw",
          weight: 0.5,
          orientationIds: [],
        },
        {
          id: "q1-strongly-disagree",
          text: "Zdecydowanie przeciw",
          weight: 1,
          orientationIds: [],
        },
      ],
    },
    {
      id: "q2",
      categoryId: "ecology",
      text: "Z czego Polska powinna czerpać energię?",
      explanation: "Chodzi o główne źródło energii w najbliższych dekadach.",
      answerType: "one-of-many",
      possibleAnswers: [
        { id: "q2-coal", text: "Z węgla", weight: 1, orientationIds: [] },
        { id: "q2-nuclear", text: "Z atomu", weight: 1, orientationIds: [] },
        {
          id: "q2-renewables",
          text: "Ze źródeł odnawialnych",
          weight: 1,
          orientationIds: [],
        },
      ],
    },
    {
      id: "q3",
      categoryId: "economy",
      text: "Państwo powinno dopłacać do kredytów mieszkaniowych.",
      answerType: "agree-or-disagree",
      possibleAnswers: [
        {
          id: "q3-strongly-agree",
          text: "Zdecydowanie za",
          weight: 1,
          orientationIds: [],
        },
        { id: "q3-agree", text: "Za", weight: 0.5, orientationIds: [] },
        { id: "q3-disagree", text: "Przeciw", weight: 0.5, orientationIds: [] },
        {
          id: "q3-strongly-disagree",
          text: "Zdecydowanie przeciw",
          weight: 1,
          orientationIds: [],
        },
      ],
    },
    {
      id: "q4",
      categoryId: "hidden",
      text: "Odpowiadam na pytania uważnie.",
      answerType: "agree-or-disagree",
      possibleAnswers: [
        { id: "q4-agree", text: "Za", weight: 1, orientationIds: [] },
        { id: "q4-disagree", text: "Przeciw", weight: 1, orientationIds: [] },
      ],
    },
    {
      id: "q5",
      categoryId: "ecology",
      text: "Kto powinien płacić za ochronę klimatu?",
      answerType: "one-of-many",
      possibleAnswers: [
        { id: "q5-state", text: "Państwo", weight: 1, orientationIds: [] },
        { id: "q5-companies", text: "Firmy", weight: 1, orientationIds: [] },
      ],
    },
  ],
  ...overrides,
});

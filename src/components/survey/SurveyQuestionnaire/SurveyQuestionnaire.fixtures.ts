import type { Survey, SurveySession } from "@/types/survey";
import { createSession } from "@/utils/survey/session/createSession";
import { createStartedSession } from "@/utils/vitest/createStartedSession";
import { createSurvey } from "@/utils/vitest/createSurvey";
import { createSurveyCategory } from "@/utils/vitest/createSurveyCategory";
import { createSurveyQuestion } from "@/utils/vitest/createSurveyQuestion";
import { padWithCopies } from "@/utils/vitest/padWithCopies";

// The quizzes and sessions of the stories. The store of a session lives as
// long as the page does and is found by the quiz identifier, so every story
// has a quiz of its own.

export interface QuestionnaireFixture {
  survey: Survey;
  session: SurveySession;
}

const SCALE = [
  "Zdecydowanie za",
  "Częściowo za",
  "Częściowo przeciw",
  "Zdecydowanie przeciw",
];

const categories = [
  createSurveyCategory("worldview", { name: "Światopogląd" }),
  createSurveyCategory("system", { name: "Ustrój" }),
  createSurveyCategory("economy", { name: "Gospodarka" }),
  createSurveyCategory("foreign", { name: "Polityka zagraniczna" }),
  createSurveyCategory("ecology", { name: "Ekologia" }),
  createSurveyCategory("control", {
    name: "Pytania kontrolne",
    isHidden: true,
  }),
];

const scaleQuestion = createSurveyQuestion("religion", SCALE, {
  categoryId: "foreign",
  text: "Obraza uczuć religijnych nie powinna być karalna.",
  explanation:
    "Obraza uczuć religijnych to publiczne znieważenie przedmiotu czci religijnej lub miejsca przeznaczonego do wykonywania obrzędów. W Polsce grozi za nią grzywna, ograniczenie wolności albo do dwóch lat więzienia.",
});

const customQuestion = createSurveyQuestion(
  "energy",
  [
    "Z węgla, dopóki mamy własne złoża i kopalnie, które dają pracę całym regionom",
    "Z atomu: z dużych elektrowni budowanych przez państwo i z małych reaktorów modułowych",
    "Ze źródeł odnawialnych, przede wszystkim z wiatru na morzu i ze słońca",
    "Nie mam zdania",
  ],
  {
    categoryId: "ecology",
    text: "Z czego Polska powinna czerpać energię w najbliższych dekadach?",
    answerType: "one-of-many",
  },
);

const controlQuestion = createSurveyQuestion("control", SCALE, {
  categoryId: "control",
  text: "Odpowiadam na pytania uważnie.",
});

// Eleven questions of one category, so that the pill counts eleven.
const foreignQuestions = padWithCopies([scaleQuestion], 11);

const createQuiz = (id: string, overrides: Partial<Survey> = {}): Survey =>
  createSurvey({
    id: `story-${id}`,
    name: "Nazwa quizu",
    categories,
    questions: [...foreignQuestions, customQuestion, controlQuestion],
    ...overrides,
  });

const createFixture = (
  survey: Survey,
  toSession: (survey: Survey) => SurveySession,
): QuestionnaireFixture => ({ survey, session: toSession(survey) });

export const loadingSurvey = createQuiz("loading");

export const categorySelect = createFixture(
  createQuiz("category-select"),
  createSession,
);

export const categorySelectAtLimit = createFixture(
  createQuiz("category-select-at-limit"),
  (survey) => ({
    ...createSession(survey),
    prioritizedCategoryIds: ["system", "economy", "ecology"],
  }),
);

// One question of eighteen is done: the bar shows an eighth, as in the frame.
export const questions = createFixture(
  createQuiz("questions", {
    questions: [
      customQuestion,
      ...foreignQuestions,
      ...padWithCopies([controlQuestion], 6),
    ],
  }),
  (survey) => createStartedSession(survey, 1),
);

export const questionsCustomAnswers = createFixture(
  createQuiz("questions-custom-answers", {
    questions: [customQuestion, ...foreignQuestions],
  }),
  (survey) => createStartedSession(survey, 0),
);

export const questionsHiddenCategory = createFixture(
  createQuiz("questions-hidden-category", {
    questions: [controlQuestion, ...foreignQuestions],
  }),
  (survey) => createStartedSession(survey, 0),
);

// One visible category: the quiz has no category select, so nothing is done
// and nothing is picked on its first question.
export const questionsFirst = createFixture(
  createQuiz("questions-first", {
    categories: categories.filter(({ id }) => id === "foreign"),
  }),
  createSession,
);

export const questionsLongStatement = createFixture(
  createQuiz("questions-long-statement", {
    name: "Bardzo długa nazwa quizu, która nie mieści się w jednej linii",
    questions: [
      createSurveyQuestion("long", SCALE, {
        categoryId: "foreign",
        text: "Państwo powinno w pierwszej kolejności dbać o bezpieczeństwo energetyczne kraju, nawet jeżeli oznacza to wolniejsze odchodzenie od paliw kopalnych, wyższe ceny uprawnień do emisji i spór z instytucjami Unii Europejskiej.",
        explanation:
          "Bezpieczeństwoenergetyczneoznaczastałydostępdoenergiipoakceptowalnejcenie.",
      }),
      ...foreignQuestions,
    ],
  }),
  (survey) => createStartedSession(survey, 0),
);

export const demographics = createFixture(
  createQuiz("demographics"),
  (survey) => createStartedSession(survey, survey.questions.length),
);

export const demographicsComplete = createFixture(
  createQuiz("demographics-complete"),
  (survey) => ({
    ...createStartedSession(survey, survey.questions.length),
    demographics: {
      age: "27",
      gender: "female",
      residenceAreaSize: "city_below_200k",
      education: "higher",
    },
  }),
);

// The e-mail phase is part of a session only where sending is set up: the
// story that shows it turns the switch on.
export const emailCapture = createFixture(
  createQuiz("email-capture"),
  (survey) => ({
    ...createStartedSession(survey, survey.questions.length),
    phase: "email-capture",
  }),
);

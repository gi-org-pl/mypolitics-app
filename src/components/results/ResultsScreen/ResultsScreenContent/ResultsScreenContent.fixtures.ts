import type { QuizResult } from "@/types/results";
import type { Survey, SurveyQuestion } from "@/types/survey";
import {
  identityQuizResult,
  identityResultQuiz,
} from "@/utils/result-modules/identityQuizResult.fixtures";
import { resolveResult } from "@/utils/result-modules/resolveResult";
import { getDoneQuestions } from "@/utils/running-state/progress/getDoneQuestions";
import { getRunningScores } from "@/utils/running-state/scores/getRunningScores";
import { createOrientation } from "@/utils/vitest/createOrientation";
import { createResultModule } from "@/utils/vitest/results/createResultModule";
import { createScoredQuestion } from "@/utils/vitest/survey/createScoredQuestion";
import { createSurvey } from "@/utils/vitest/survey/createSurvey";
import { createSurveyCategory } from "@/utils/vitest/survey/createSurveyCategory";

import type { ResultsScreenContentProps } from "./ResultsScreenContent.types";

// Results for the stories and the tests of the screen. Nothing here is read
// from the API, and the people of the candidate quiz are made up.

const toContent = (
  survey: Survey,
  result: QuizResult,
): ResultsScreenContentProps => ({
  survey,
  resolved: resolveResult(survey, result),
});

// The result the back-end counts for a taker who picks the first answer of
// every question.
const answerFirst = (survey: Survey): QuizResult => {
  const answers = survey.questions.map(({ id, possibleAnswers }) => ({
    questionId: id,
    answerId: possibleAnswers[0].id,
  }));

  return {
    scores: getRunningScores(survey, getDoneQuestions(survey, answers), []),
    answers,
  };
};

const toPortraitUrl = (color: string): string =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="${color}"/><circle cx="16" cy="12" r="6" fill="white"/><path d="M4 32a12 12 0 0 1 24 0z" fill="white"/></svg>`,
  )}`;

const IDENTITY_COLOR = "#16a34a";

// The cut of the identity quiz holds no image, slogan or description, so the
// identities are given the ones the header and the archetype card draw.
const identityQuiz: Survey = {
  ...identityResultQuiz,
  name: "Quiz Tożsamościowy",
  orientations: identityResultQuiz.orientations.map((orientation) =>
    orientation.type === "identity"
      ? {
          ...orientation,
          imageUrl: toPortraitUrl(IDENTITY_COLOR),
          slogan: "Razem w stronę zielonego świata!",
          description:
            "Twoje poglądy łączą troskę o klimat, postęp społeczny i umiarkowany patriotyzm z wiarą w wolny rynek i pomoc słabszym.",
        }
      : orientation,
  ),
};

// The identity quiz: the header over the identities, the ideologies and the
// parties of the leader in the start column, the identity and the map in the
// end column.
export const identityResults = toContent(identityQuiz, identityQuizResult);

// The scores of the orientations of one side of an axis, each at the given
// share of its maximum.
const toSideScores = (
  orientationIds: string[],
  share: number,
): QuizResult["scores"] =>
  Object.fromEntries(
    orientationIds.map((id) => {
      const { maximum } = identityQuizResult.scores[id];

      return [id, { points: maximum * share, maximum }];
    }),
  );

const socialAxes = identityQuiz.axes.filter(
  ({ type }) => type === "compass_y_axis",
);

export const LONG_CORNER_NAME =
  "Lewicowy gospodarczo, prawicowy światopoglądowo";

// The identity quiz with a long name written for one corner of its map.
const longCornerNameQuiz: Survey = {
  ...identityQuiz,
  resultModules: identityQuiz.resultModules.map((record) =>
    record.type === "nolan_chart"
      ? {
          ...record,
          labels: {
            ...record.labels,
            topLeftModerate: LONG_CORNER_NAME,
            topLeftExtreme: LONG_CORNER_NAME,
          },
        }
      : record,
  ),
};

// That quiz for a taker who stands on the economic left and the social
// right: in the corner with the long name. The card of the map writes the
// name on one line, so it shows how a long one is cut.
export const longCornerNameResults = toContent(longCornerNameQuiz, {
  ...identityQuizResult,
  scores: {
    ...identityQuizResult.scores,
    ...toSideScores(
      socialAxes.flatMap((axis) => axis.negativeOrientationIds),
      0,
    ),
    ...toSideScores(
      socialAxes.flatMap((axis) => axis.positiveOrientationIds),
      1,
    ),
  },
});

// The same quiz for a taker who answered nothing: no leader, and no value in
// any module.
export const noMatchResults = toContent(identityQuiz, {
  scores: {},
  answers: [],
});

const CANDIDATES: [id: string, name: string, color: string][] = [
  ["candidate-1", "Anna Kowalska", "#dc2626"],
  ["candidate-2", "Jan Nowak", "#be123c"],
  ["candidate-3", "Maria Wiśniewska", "#1e3a8a"],
  ["candidate-4", "Piotr Zieliński", "#0f172a"],
  ["candidate-5", "Ewa Kamińska", "#86198f"],
  ["candidate-6", "Tomasz Lewandowski", "#eab308"],
  ["candidate-7", "Katarzyna Wójcik", "#111827"],
  ["candidate-8", "Marek Dąbrowski", "#7c2d12"],
];

const PRESIDENTS: [id: string, name: string, description: string][] = [
  [
    "president-1",
    "Nowoczesny liberał",
    "Oczekujesz prezydenta, który stawia na otwartość, współpracę z Europą i spokojną zmianę.",
  ],
  [
    "president-2",
    "Strażnik tradycji",
    "Oczekujesz prezydenta, który broni tego, co sprawdzone.",
  ],
  [
    "president-3",
    "Trybun ludowy",
    "Oczekujesz prezydenta, który mówi w imieniu zwykłych ludzi.",
  ],
];

const CANDIDATE_CATEGORIES: [id: string, name: string][] = [
  ["foreign", "Polityka zagraniczna"],
  ["worldview", "Światopogląd"],
  ["domestic", "Polityka krajowa"],
  ["economy", "Gospodarka"],
  ["law", "Praworządność"],
];

const QUESTIONS_PER_CATEGORY = 3;

const candidateIds = CANDIDATES.map(([id]) => id);
const presidentIds = PRESIDENTS.map(([id]) => id);

const everyNth = (step: number) => (index: number) => index % step === 0;
const allButEveryNth = (step: number) => (index: number) =>
  index % step !== step - 1;

// Which questions an orientation sides with the first answer of; it sides
// with the second answer of the others. The taker of the stories picks the
// first answers, so this is how often each of them agrees with the taker.
const AGREEMENT: Record<string, (index: number) => boolean> = {
  "candidate-1": allButEveryNth(4),
  "candidate-2": allButEveryNth(3),
  "candidate-3": everyNth(2),
  "candidate-4": everyNth(3),
  "candidate-5": everyNth(4),
  "candidate-6": everyNth(5),
  "candidate-7": everyNth(6),
  "candidate-8": everyNth(15),
  "president-1": allButEveryNth(5),
  "president-2": everyNth(2),
  "president-3": everyNth(4),
};

const scoredIds = Object.keys(AGREEMENT);

const createCandidateQuestion = (
  index: number,
  categoryId: string,
): SurveyQuestion =>
  createScoredQuestion(
    `question-${index + 1}`,
    [
      [1, scoredIds.filter((id) => AGREEMENT[id](index))],
      [1, scoredIds.filter((id) => !AGREEMENT[id](index))],
    ],
    { categoryId },
  );

// A quiz of candidates, composed like the presidential one: the header over
// the candidates with a link label, every candidate in the start column, and
// the kind of president and the candidates by category in the end column.
const candidateQuiz: Survey = createSurvey({
  id: "candidate-quiz",
  name: "Barometr Prezydencki",
  orientations: [
    ...CANDIDATES.map(([id, name, color], place) =>
      createOrientation(id, name, {
        type: "party",
        color,
        imageUrl: toPortraitUrl(color),
        isOfficial: place % 3 !== 2,
        slogan: "Razem w stronę zielonego świata!",
        websiteUrl: "https://example.org",
      }),
    ),
    ...PRESIDENTS.map(([id, name, description]) =>
      createOrientation(id, name, {
        type: "identity",
        color: "#059669",
        imageUrl: toPortraitUrl("#059669"),
        description,
        fullDescription: `${description} Cenisz przewidywalność, dialog i szacunek dla instytucji.`,
      }),
    ),
  ],
  categories: CANDIDATE_CATEGORIES.map(([id, name]) =>
    createSurveyCategory(id, { name }),
  ),
  questions: CANDIDATE_CATEGORIES.flatMap(([categoryId], place) =>
    Array.from({ length: QUESTIONS_PER_CATEGORY }, (_, index) =>
      createCandidateQuestion(
        place * QUESTIONS_PER_CATEGORY + index,
        categoryId,
      ),
    ),
  ),
  resultModules: [
    createResultModule("candidate-header", "header", {
      orientationIds: candidateIds,
      labels: { link: "Program" },
    }),
    createResultModule("candidate-ranking", "horizontal_bar", {
      position: 1,
      title: "Kandydaci",
      orientationIds: candidateIds,
      visibleRows: candidateIds.length,
    }),
    createResultModule("candidate-president", "archetype", {
      position: 2,
      column: "end",
      title: "Prezydent",
      description:
        "Prezydent to typ głowy państwa, do którego jest Ci najbliżej.\nNie jest to żaden z kandydatów.",
      orientationIds: presidentIds,
    }),
    createResultModule("candidate-categories", "horizontal_bar", {
      position: 3,
      column: "end",
      title: "Kategorie",
      orientationIds: candidateIds,
      groupBy: "category",
    }),
  ],
});

export const candidateResults = toContent(
  candidateQuiz,
  answerFirst(candidateQuiz),
);

const LONG =
  "o wyjątkowo długiej nazwie, która nie mieści się w jednym wierszu";

// The quiz of candidates with every name written by an author made long: the
// quiz, the orientations, the categories and the titles of the modules.
const longNamesQuiz: Survey = {
  ...candidateQuiz,
  id: "long-names-quiz",
  name: `Barometr Prezydencki ${LONG}`,
  orientations: candidateQuiz.orientations.map((orientation) => ({
    ...orientation,
    name: `${orientation.name} ${LONG}`,
    slogan: `Razem w stronę zielonego świata ${LONG}`,
  })),
  categories: candidateQuiz.categories.map((category) => ({
    ...category,
    name: `${category.name} ${LONG}`,
  })),
  resultModules: candidateQuiz.resultModules.map((record) => ({
    ...record,
    title: record.title && `${record.title} ${LONG}`,
    labels: record.labels.link ? { link: `Program ${LONG}` } : record.labels,
  })),
};

export const longNamesResults = toContent(
  longNamesQuiz,
  answerFirst(longNamesQuiz),
);

// A quiz whose modules all name the same column: one column at any width.
const oneColumnQuiz: Survey = {
  ...candidateQuiz,
  id: "one-column-quiz",
  resultModules: candidateQuiz.resultModules.map((record) => ({
    ...record,
    column: "start",
  })),
};

export const oneColumnResults = toContent(
  oneColumnQuiz,
  answerFirst(oneColumnQuiz),
);

import personAvatar from "@/assets/icons/person-avatar.svg";
import {
  type ComparedQuestion,
  ComparisonMode,
  type FriendSide,
  type OrientationSide,
  type OtherSide,
} from "@/types/comparison";
import type { ResultAnswer } from "@/types/results";
import type { Survey, SurveyQuestion } from "@/types/survey";
import { getAgreementScore } from "@/utils/comparison/getAgreementScore";
import { getComparedQuestions } from "@/utils/comparison/getComparedQuestions";
import { resolveResult } from "@/utils/result-modules/resolveResult";
import { createSurvey } from "@/utils/vitest/survey/createSurvey";
import { createSurveyResult } from "@/utils/vitest/survey/createSurveyResult";

import {
  exampleOrientations,
  identityFriendComparison,
  identityOrientationComparison,
  identityTaker,
} from "../../ResultsComparison.fixtures";
import {
  type ComparingState,
  ComparisonStatus,
  ComparisonView,
  type ComparisonViewProps,
} from "../../ResultsComparison.types";

// A quiz and two comparisons of one taker for the stories and the tests of
// the questions view: the questions the design draws, and around them every
// case a row has. Nothing here is read from the API, and the people are made
// up.
//
//                 the orientation lists   taker  friend   with it    with the friend
//   democracy     a1, a2                  a1     a1       agree      agree
//   future        a1                      a1     a3       agree      disagree
//   breadwinner   a3, a4                  a1     a1       disagree   agree
//   housing       a1                      a2     a1       disagree   disagree
//   rents         -                       a2     -        neither    neither
//   prices        a1, a2                  a1     a2       agree      disagree
//   vaccines      a1, a2                  a2     a2       agree      agree
//   army          a3, a4                  -      a4       neither    neither

const [progressivism] = exampleOrientations;

const SCALE = [
  "Zdecydowanie za",
  "Częściowo za",
  "Częściowo przeciw",
  "Zdecydowanie przeciw",
];

// A question whose answers are given by their texts, each with whether the
// orientation of the example is listed by it. The answers are identified by
// their place: `${id}-a1`, ...
const toQuestion = (
  id: string,
  text: string,
  answers: [text: string, isListed: boolean][],
): SurveyQuestion => ({
  id,
  text,
  answerType: "other",
  possibleAnswers: answers.map(([answerText, isListed], index) => ({
    id: `${id}-a${index + 1}`,
    text: answerText,
    weight: 1,
    orientationIds: isListed ? [progressivism.id] : [],
  })),
});

const toScaleQuestion = (
  id: string,
  text: string,
  listed: boolean[],
): SurveyQuestion =>
  toQuestion(
    id,
    text,
    SCALE.map((answerText, index) => [answerText, listed[index]]),
  );

const FOR = [true, true, false, false];
const AGAINST = [false, false, true, true];

export const exampleQuiz: Survey = createSurvey({
  id: "example-quiz",
  orientations: exampleOrientations,
  questions: [
    toScaleQuestion(
      "democracy",
      "Unia Europejska dba o demokrację w Polsce.",
      FOR,
    ),
    toQuestion(
      "future",
      "Jaka powinna być przyszłość Polski w Unii Europejskiej?",
      [
        ["Dalsza integracja z Unią Europejską", true],
        ["Pozostanie w Unii na obecnych zasadach", false],
        ["Wyjście z Unii Europejskiej", false],
      ],
    ),
    toScaleQuestion(
      "breadwinner",
      "W większości przypadków mężczyzna powinien być głównym żywicielem rodziny.",
      AGAINST,
    ),
    toQuestion(
      "housing",
      "Jaki jest najlepszy sposób na walkę z kryzysem mieszkaniowym?",
      [
        ["Budowa tanich mieszkań na wynajem z publicznych pieniędzy", true],
        ["Rząd nie powinien interweniować na rynku mieszkaniowym", false],
      ],
    ),
    toQuestion("rents", "Kto powinien ustalać wysokość czynszów?", [
      ["Samorząd, w porozumieniu z mieszkańcami", false],
      ["Rząd nie powinien interweniować na rynku mieszkaniowym", false],
    ]),
    toQuestion("prices", "Co najszybciej obniży ceny mieszkań?", [
      ["Rząd nie powinien interweniować na rynku mieszkaniowym", true],
      ["Uproszczenie prawa budowlanego", true],
      ["Dopłaty do kredytów", false],
    ]),
    toScaleQuestion(
      "vaccines",
      "Szczepienia na choroby zakaźne poważnie zagrażające życiu i zdrowiu powinny być obowiązkowe.",
      FOR,
    ),
    toScaleQuestion(
      "army",
      "Służba wojskowa powinna być obowiązkowa.",
      AGAINST,
    ),
  ],
});

export const exampleAnswers: ResultAnswer[] = [
  { questionId: "democracy", answerId: "democracy-a1" },
  { questionId: "future", answerId: "future-a1" },
  { questionId: "breadwinner", answerId: "breadwinner-a1" },
  { questionId: "housing", answerId: "housing-a2" },
  { questionId: "rents", answerId: "rents-a2" },
  { questionId: "prices", answerId: "prices-a1" },
  { questionId: "vaccines", answerId: "vaccines-a2" },
];

const friendAnswers: ResultAnswer[] = [
  { questionId: "democracy", answerId: "democracy-a1" },
  { questionId: "future", answerId: "future-a3" },
  { questionId: "breadwinner", answerId: "breadwinner-a1" },
  { questionId: "housing", answerId: "housing-a1" },
  { questionId: "prices", answerId: "prices-a2" },
  { questionId: "vaccines", answerId: "vaccines-a2" },
  { questionId: "army", answerId: "army-a4" },
];

export const exampleOrientationSide: OrientationSide = {
  mode: ComparisonMode.Orientation,
  orientation: progressivism,
};

export const exampleFriendSide: FriendSide = {
  mode: ComparisonMode.Friend,
  orientation: {
    id: "5218cde2-beac-4234-a0a7-c72f46e979a8",
    type: "person",
    name: "Znajomy",
    imageUrl: personAvatar,
  },
  result: { scores: {}, answers: friendAnswers },
};

const exampleResult = createSurveyResult({
  id: "3f0c2a52-6f7b-4d53-9a55-0d5f1b9f3c11",
  isCalculated: true,
  surveyId: exampleQuiz.id,
  answers: exampleAnswers,
});

// A running comparison on its questions view. The view reads the other side
// and nothing else of it.
const toComparison = (
  survey: Survey,
  answers: ResultAnswer[],
  other: OtherSide,
): ComparingState => ({
  status: ComparisonStatus.Comparing,
  other,
  score: getAgreementScore(survey, answers, other),
  views: [ComparisonView.Questions],
  view: ComparisonView.Questions,
});

const toExampleView = (other: OtherSide): ComparisonViewProps => ({
  survey: exampleQuiz,
  result: exampleResult,
  resolved: resolveResult(exampleQuiz, exampleResult),
  comparison: toComparison(exampleQuiz, exampleAnswers, other),
});

// The taker of the example quiz compared with the orientation, and with the
// friend.
export const exampleOrientationView = toExampleView(exampleOrientationSide);
export const exampleFriendView = toExampleView(exampleFriendSide);

// The questions of the example quiz as each comparison lists them.
export const orientationQuestions: ComparedQuestion[] = getComparedQuestions(
  exampleQuiz,
  exampleAnswers,
  exampleOrientationSide,
);

export const friendQuestions: ComparedQuestion[] = getComparedQuestions(
  exampleQuiz,
  exampleAnswers,
  exampleFriendSide,
);

// One question of a list, by its identifier.
export const findCompared = (
  questions: ComparedQuestion[],
  questionId: string,
): ComparedQuestion =>
  questions.find(({ question }) => question.id === questionId) ?? questions[0];

// The long quiz: all 102 questions of the identity quiz, with a friend and
// with the first orientation the quiz offers.
export const longFriendView: ComparisonViewProps = {
  ...identityTaker,
  comparison: identityFriendComparison,
};

export const longOrientationView: ComparisonViewProps = {
  ...identityTaker,
  comparison: identityOrientationComparison,
};

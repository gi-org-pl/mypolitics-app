// Turns the output of quiz-conversion-bot (quiz-data-eurowyborczy2024.json) into the
// payloads the new API would send: a project, a survey and the ids the layout config uses.
//
//   node build-survey.mjs
//
// WHAT IS REAL AND WHAT IS NOT
//   real:        title, categories, questions (text), orientations (name, colour, logo), axes
//   PLACEHOLDER: which orientation each answer scores for (PLACEHOLDER_SCORING below).
//                The bot does not fetch the old effects of a FOR_AND_AGAINST question and the
//                production GraphQL API has introspection off, so the real weights were not
//                available. The mapping is an illustration so that the quiz can be taken locally
//                and the result page has numbers to draw. It must be replaced with the real data.
//
// Old Mongo ids are turned into deterministic UUIDs (v5), so reruns give the same ids.
import { createHash } from "node:crypto";
import fs from "node:fs";

const here = new URL(".", import.meta.url).pathname;
const quiz = JSON.parse(
  fs.readFileSync(`${here}../quiz-data-eurowyborczy2024.json`, "utf8"),
);

const NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8"; // RFC 4122 DNS namespace
const uuid5 = (name) => {
  const ns = Buffer.from(NAMESPACE.replaceAll("-", ""), "hex");
  const h = createHash("sha1")
    .update(ns)
    .update(`mypolitics-migration:${name}`)
    .digest();
  h[6] = (h[6] & 0x0f) | 0x40; // v4-shaped: the app requires v4-looking ids
  h[8] = (h[8] & 0x3f) | 0x80;
  const x = h.subarray(0, 16).toString("hex");
  return `${x.slice(0, 8)}-${x.slice(8, 12)}-${x.slice(12, 16)}-${x.slice(16, 20)}-${x.slice(20)}`;
};

const pl = (languages) => languages?.pl ?? null;
const SLUG = "eurowyborczy2024";

const ids = {
  project: uuid5(`project:${SLUG}`),
  survey: uuid5(`survey:${quiz.id}`),
};
const map = (kind, oldId) => uuid5(`${kind}:${oldId}`);

// ---- PLACEHOLDER_SCORING ---------------------------------------------------------------
// index of the question in the bot output -> [orientations an "agree" answer scores for,
// orientations a "disagree" answer scores for]. PE Pro-Euro, AE Anty-Euro, F Federalizm,
// P Paneuropeizm, E Eurosceptycyzm.
const BY_NAME = {
  "Pro-Euro": "PE",
  "Anty-Euro": "AE",
  Federalizm: "F",
  Paneuropeizm: "P",
  Eurosceptycyzm: "E",
};
const PLACEHOLDER_SCORING = {
  0: [["PE"], ["AE"]],
  1: [["F"], ["E"]],
  2: [["E"], ["F"]],
  3: [
    ["E", "AE"],
    ["F", "PE"],
  ],
  4: [
    ["E", "AE"],
    ["PE", "F"],
  ],
  5: [["F"], ["E"]],
  6: [["P"], []],
  7: [["P", "F"], ["E"]],
  8: [["F"], ["E"]],
  9: [["P"], []],
  10: [["F"], ["E"]],
  11: [["P", "F"], ["E"]],
  12: [["F"], ["E"]],
  13: [["P"], []],
  14: [["P"], []],
  15: [["P", "F"], ["E"]],
  16: [["F"], ["E"]],
  17: [["F", "P"], []],
  18: [["E"], ["F"]],
  19: [["F"], ["E"]],
  20: [["P"], []],
  21: [["P"], []],
  22: [["E"], ["P"]],
  23: [["P"], []],
  24: [["F"], ["E"]],
  25: [["P"], []],
  26: [["P", "PE"], ["E"]],
  27: [["P"], []],
  28: [["P", "F"], ["E"]],
  29: [["P"], []],
};
// -----------------------------------------------------------------------------------------

const orientationByCode = {};
for (const o of quiz.orientations)
  orientationByCode[BY_NAME[pl(o.generalName)]] = map("orientation", o.id);

const orientations = quiz.orientations.map((o) => ({
  id: map("orientation", o.id),
  type: o.type,
  color: o.color,
  logoUrl: o.logoUrl,
  surveyId: ids.survey,
  generalName: pl(o.generalName),
  explanation: null,
  linkedOrientations: [],
}));

const categories = quiz.categories.map((c) => ({
  id: map("category", c.id),
  name: pl(c.name),
  weight: c.weight,
}));

// The bot repeats the same pair as an `axis` and as a `compass_x_axis`; both are kept as sent.
const axis = quiz.axes.map((a) => ({
  id: map("axis", a.id),
  name:
    pl(a.name) ??
    `${pl(quiz.orientations.find((o) => o.id === a.positiveOrientations)?.generalName)} - ${pl(quiz.orientations.find((o) => o.id === a.negativeOrientations)?.generalName)}`,
  type: a.type,
  description: null,
  positiveOrientations: [map("orientation", a.positiveOrientations)],
  negativeOrientations: [map("orientation", a.negativeOrientations)],
}));

const ANSWERS = [
  { text: "Zdecydowanie za", weight: 4, side: 0 },
  { text: "Częściowo za", weight: 2, side: 0 },
  { text: "Częściowo przeciw", weight: 2, side: 1 },
  { text: "Zdecydowanie przeciw", weight: 4, side: 1 },
];

const questions = quiz.questions.map((q, index) => {
  const questionId = map("question", q.id);
  const scoring = PLACEHOLDER_SCORING[index];
  if (!scoring)
    throw new Error(
      `no placeholder scoring for question ${index}: ${pl(q.text)}`,
    );
  return {
    id: questionId,
    surveyId: ids.survey,
    categoryId: map("category", q.categoryId),
    text: pl(q.text),
    explanation: pl(q.explanation),
    answerType: "AGREE_OR_DISAGREE", // the bot says FOR_AND_AGAINST, which the app does not know
    status: "LIVE",
    possibleAnswers: ANSWERS.map((a, i) => ({
      id: uuid5(`answer:${q.id}:${i}`),
      text: a.text,
      weight: a.weight,
      questionId,
      orientationIds: scoring[a.side].map((code) => orientationByCode[code]),
    })),
  };
});

const survey = {
  title: pl(quiz.title),
  type: quiz.type,
  averageFinishTime: quiz.averageFinishTime,
  algorithm: "default",
  defaultLanguage: "pl",
  supportedLanguages: ["pl"],
  orientations,
  categories,
  axis,
  questions,
};

const project = { id: ids.project, latestSurveyId: ids.survey };

const out = {
  ids: {
    ...ids,
    orientations: orientationByCode,
    axes: axis.map((a) => ({ id: a.id, type: a.type, name: a.name })),
  },
};
fs.writeFileSync(`${here}survey.json`, JSON.stringify(survey, null, 2));
fs.writeFileSync(`${here}project.json`, JSON.stringify(project, null, 2));
fs.writeFileSync(`${here}ids.json`, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out.ids, null, 2));
console.log(
  `questions: ${questions.length}, answers each: 4, orientations: ${orientations.length}, categories: ${categories.length}`,
);

// Local mock of the myPolitics API for the migrated quiz "Kraje starożytne"
// (old slug -TJxxhTS47). No dependencies: `node server.mjs [port]`.
//
// Serves what mypolitics-app reads:
//   GET  /api/v1/project/:id   -> the project, its latestSurveyId = the quiz id
//   GET  /api/v1/survey/:id    -> the survey, built from the files below
//   POST /api/v1/result        -> stores the answers, calculates the scores
//   GET  /api/v1/result/:id    -> the stored, calculated result
//
// Source data:
//   quiz-data-TJxxhTS47.json        output of quiz-conversion-bot
//   question-effects-TJxxhTS47.json agree/disagree effects of each question,
//                                   from gql.mypolitics.pl (the bot's query
//                                   does not ask for them)
import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const read = (name) => JSON.parse(readFileSync(join(here, name), "utf8"));

const quiz = read("quiz-data-TJxxhTS47.json");
const effects = new Map(
  read("question-effects-TJxxhTS47.json").map((q) => [q.id, q.effects]),
);

export const PROJECT_ID = "kraje-starozytne-mock-project";
const SURVEY_ID = quiz.id;
const PORT = Number(process.argv[2] ?? 4010);

const pl = (text) => text?.pl ?? undefined;
const nameOf = new Map(quiz.orientations.map((o) => [o.id, pl(o.generalName)]));
const ids = (list) => list.map(({ id }) => id);

// The old quiz drew an axis from `left` to `right`; the bot writes left as
// `positiveOrientations`. The new API reads an axis "A-B" with A negative
// (drawn at the start) and B positive, so the sides are swapped here.
const axes = quiz.axes.map((axis) => {
  const left = axis.positiveOrientations;
  const right = axis.negativeOrientations;
  // The old result page showed every axis, so each is a main one.
  return {
    id: axis.id,
    name: JSON.stringify({
      name: `${nameOf.get(left)}-${nameOf.get(right)}`,
      isMain: true,
    }),
    type: "axis",
    description: null,
    negativeOrientations: [left],
    positiveOrientations: [right],
  };
});

// A FOR_AND_AGAINST question of the old quiz becomes AGREE_OR_DISAGREE: both
// "za" steps add to the ideologies of `agree`, both "przeciw" steps to those
// of `disagree`; a strong step weighs 2, a partial one 1.
const questions = quiz.questions.map((question) => {
  const { agree, disagree } = effects.get(question.id);
  const answer = (suffix, text, weight, orientationIds) => ({
    id: `${question.id}-${suffix}`,
    text,
    weight,
    questionId: question.id,
    orientationIds,
  });
  return {
    id: question.id,
    surveyId: SURVEY_ID,
    categoryId: null,
    text: pl(question.text),
    explanation: pl(question.explanation) ?? null,
    answerType: "AGREE_OR_DISAGREE",
    status: "LIVE",
    possibleAnswers: [
      answer("sa", "Zdecydowanie za", 2, ids(agree.ideologies)),
      answer("a", "Częściowo za", 1, ids(agree.ideologies)),
      answer("d", "Częściowo przeciw", 1, ids(disagree.ideologies)),
      answer("sd", "Zdecydowanie przeciw", 2, ids(disagree.ideologies)),
    ],
  };
});

const survey = {
  id: SURVEY_ID,
  title: pl(quiz.title),
  description: pl(quiz.description),
  createdAt: quiz.createdAt,
  type: quiz.type,
  isPublic: quiz.isPublic,
  logoUrl: quiz.logoUrl || null,
  imageUrl: null,
  averageFinishTime: quiz.averageFinishTime,
  projectId: PROJECT_ID,
  version: "mock-1",
  algorithm: "default",
  orientations: quiz.orientations.map((o) => ({
    id: o.id,
    description: pl(o.description) ?? null,
    type: o.type,
    color: o.color,
    // files.mypolitics.pl answers 403; the same files are on the CDN.
    logoUrl: o.logoUrl?.replace(
      "https://files.mypolitics.pl",
      "https://orlow.fra1.cdn.digitaloceanspaces.com",
    ),
    surveyId: SURVEY_ID,
    generalName: pl(o.generalName),
    explanation: null,
    linkedOrientations: [],
  })),
  categories: [],
  axis: axes,
  authors: [],
  questions,
  defaultLanguage: "pl",
  supportedLanguages: ["pl"],
};

// points: the weights of the chosen answers that name the orientation;
// maxPossible: per question, the heaviest answer that names it.
const calculate = (answers) => {
  const chosen = new Map(answers.map((a) => [a.questionId, a.answerId]));
  const totals = new Map(
    survey.orientations.map((o) => [o.id, { points: 0, maxPossible: 0 }]),
  );
  for (const question of questions) {
    for (const [id, total] of totals) {
      const naming = question.possibleAnswers.filter((a) =>
        a.orientationIds.includes(id),
      );
      if (naming.length === 0) continue;
      total.maxPossible += Math.max(...naming.map((a) => a.weight));
      const picked = naming.find((a) => a.id === chosen.get(question.id));
      if (picked) total.points += picked.weight;
    }
  }
  return {
    orientations: [...totals].map(([id, t]) => ({ id, ...t })),
  };
};

const results = new Map();

const send = (res, status, body) => {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  });
  res.end(body === undefined ? "" : JSON.stringify(body));
};

createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  const path = url.pathname.replace(/^\/api/, "");
  console.log(req.method, url.pathname + url.search);

  if (req.method === "OPTIONS") return send(res, 204);

  if (req.method === "GET" && path === `/v1/project/${PROJECT_ID}`) {
    return send(res, 200, {
      id: PROJECT_ID,
      name: survey.title,
      latestSurveyId: SURVEY_ID,
    });
  }
  if (req.method === "GET" && path === `/v1/survey/${SURVEY_ID}`) {
    return send(res, 200, survey);
  }
  if (req.method === "POST" && path === "/v1/result") {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
    });
    req.on("end", () => {
      const input = JSON.parse(raw || "{}");
      if (results.has(input.sessionId)) return send(res, 409, {});
      results.set(input.sessionId, {
        id: input.sessionId,
        surveyId: input.surveyId,
        answers: input.answers ?? [],
        results: calculate(input.answers ?? []),
      });
      return send(res, 201, { id: input.sessionId });
    });
    return;
  }
  const result = path.match(/^\/v1\/result\/([^/]+)$/);
  if (req.method === "GET" && result && results.has(result[1])) {
    return send(res, 200, results.get(result[1]));
  }
  return send(res, 404, { message: "Not found in the mock" });
}).listen(PORT, () => {
  console.log(`Mock API on http://localhost:${PORT}/api`);
  console.log(`project ${PROJECT_ID} -> survey ${SURVEY_ID}`);
});

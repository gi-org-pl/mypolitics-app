// Local stand-in for the API, so the Eurowyborczy 2023 quiz can run and its
// result page can be looked at without any write access to the real API.
//
//   node mocks/eurowyborczy/mock-api.mjs            # listens on :4010
//   VITE_API_URL=http://localhost:4010 yarn dev     # then open /quizzes/eurowyborczy2024
//
// The quiz is the output of quiz-conversion-bot (quiz-data-eurowyborczy2024.json).
// The bot gives no answers: every question is FOR_AND_AGAINST with an empty
// `possibleAnswers`. So the four-step scale and the orientation each side of a
// question scores are MADE UP here (SCORING below) - only to have something to
// calculate. They are not the weights of the old quiz.
import { readFileSync } from "node:fs";
import { createServer } from "node:http";

const PORT = Number(process.env.PORT ?? 4010);
const quiz = JSON.parse(
  readFileSync(new URL("./quiz-data-eurowyborczy2024.json", import.meta.url)),
);

const PRO = "664b9ebc21aaa90007ed7c2d";
const ANTI = "664b9ec021aaa90007ed7c2e";
const FED = "664b9ecb21aaa90007ed7c30";
const PAN = "664b9ed321aaa90007ed7c33";
const SCEP = "664b9ee021aaa90007ed7c34";

// By the position of the question: [orientation of agreeing, of disagreeing].
const SCORING = [
  [PRO, ANTI],
  [FED, SCEP],
  [SCEP, FED],
  [SCEP, FED],
  [ANTI, PAN],
  [FED, SCEP],
  [PAN, SCEP],
  [PAN, SCEP],
  [FED, SCEP],
  [PAN, SCEP],
  [FED, SCEP],
  [PAN, SCEP],
  [FED, SCEP],
  [PAN, SCEP],
  [PAN, SCEP],
  [FED, ANTI],
  [FED, SCEP],
  [PAN, SCEP],
  [SCEP, FED],
  [FED, SCEP],
  [PAN, SCEP],
  [PAN, SCEP],
  [SCEP, FED],
  [PRO, ANTI],
  [FED, SCEP],
  [PAN, SCEP],
  [PAN, SCEP],
  [PAN, SCEP],
  [FED, SCEP],
  [SCEP, PAN],
];
const SCALE = [
  { text: "Zdecydowanie się zgadzam", weight: 2, side: 0 },
  { text: "Raczej się zgadzam", weight: 1, side: 0 },
  { text: "Raczej się nie zgadzam", weight: 1, side: 1 },
  { text: "Zdecydowanie się nie zgadzam", weight: 2, side: 1 },
];

const text = (value) => value?.pl ?? undefined;
const answerId = (questionId, index) => `${questionId}-a${index + 1}`;

const questions = quiz.questions.map((question, position) => ({
  id: question.id,
  surveyId: quiz.id,
  categoryId: question.categoryId,
  text: text(question.text),
  explanation: text(question.explanation) ?? null,
  answerType: "AGREE_OR_DISAGREE",
  status: "LIVE",
  possibleAnswers: SCALE.map(({ text: label, weight, side }, index) => ({
    id: answerId(question.id, index),
    text: label,
    weight,
    questionId: question.id,
    orientationIds: [SCORING[position][side]],
  })),
}));

const survey = {
  id: quiz.id,
  title: text(quiz.title),
  description: text(quiz.description),
  createdAt: quiz.createdAt,
  type: quiz.type,
  isPublic: quiz.isPublic,
  averageFinishTime: quiz.averageFinishTime,
  algorithm: "default",
  authors: [],
  defaultLanguage: "pl",
  supportedLanguages: ["pl"],
  orientations: quiz.orientations.map((orientation) => ({
    id: orientation.id,
    type: orientation.type,
    color: orientation.color,
    logoUrl: orientation.logoUrl,
    surveyId: quiz.id,
    generalName: text(orientation.generalName),
    explanation: null,
    linkedOrientations: [],
  })),
  categories: quiz.categories.map((category) => ({
    id: category.id,
    name: JSON.stringify({ name: text(category.name), isHidden: false }),
    weight: category.weight,
  })),
  // The API sends the poles as lists; the bot gives a single id.
  axis: quiz.axes
    .filter((axis) => text(axis.name))
    .map((axis) => ({
      id: axis.id,
      name: JSON.stringify({ name: text(axis.name), isMain: true }),
      type: axis.type,
      description: null,
      positiveOrientations: [axis.positiveOrientations],
      negativeOrientations: [axis.negativeOrientations],
    })),
  questions,
};

const maxPossible = new Map();
for (const [agree, disagree] of SCORING) {
  for (const id of [agree, disagree]) {
    maxPossible.set(id, (maxPossible.get(id) ?? 0) + 2);
  }
}

const calculate = (answers) => {
  const points = new Map(quiz.orientations.map(({ id }) => [id, 0]));
  for (const { questionId, answerId: chosen } of answers) {
    const question = questions.find(({ id }) => id === questionId);
    const answer = question?.possibleAnswers.find(({ id }) => id === chosen);
    for (const id of answer?.orientationIds ?? []) {
      points.set(id, (points.get(id) ?? 0) + answer.weight);
    }
  }
  return {
    orientations: [...points].map(([id, value]) => ({
      id,
      points: value,
      maxPossible: maxPossible.get(id) ?? 0,
    })),
  };
};

// A taker who leans pro-European and federalist, to have a result to open at
// /results/3f0c2a52-6f7b-4d53-9a55-0d5f1b9f3c11 without taking the quiz.
const demoAnswers = questions.map(({ id }, position) => ({
  questionId: id,
  answerId: answerId(id, position % 5 === 4 ? 2 : position % 3 === 0 ? 1 : 0),
}));
const results = new Map([
  [
    "3f0c2a52-6f7b-4d53-9a55-0d5f1b9f3c11",
    { surveyId: quiz.id, answers: demoAnswers },
  ],
]);

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "*",
  "content-type": "application/json",
};
const send = (response, status, body = {}) => {
  response.writeHead(status, CORS);
  response.end(JSON.stringify(body));
};

createServer((request, response) => {
  const { pathname } = new URL(request.url, "http://localhost");
  const [, , kind, rawId] = pathname.split("/");
  const id = rawId && decodeURIComponent(rawId);

  if (request.method === "OPTIONS") return send(response, 204);
  if (request.method === "GET" && kind === "project" && id)
    return send(response, 200, { id, latestSurveyId: quiz.id });
  if (request.method === "GET" && kind === "survey" && id === quiz.id)
    return send(response, 200, survey);
  if (request.method === "GET" && kind === "result" && id) {
    const stored = results.get(id);
    return stored
      ? send(response, 200, { ...stored, results: calculate(stored.answers) })
      : send(response, 404);
  }
  if (request.method === "POST" && kind === "result") {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
    });
    return request.on("end", () => {
      const input = JSON.parse(body || "{}");
      if (results.has(input.sessionId)) return send(response, 409);
      results.set(input.sessionId, {
        surveyId: input.surveyId,
        answers: input.answers ?? [],
      });
      return send(response, 201);
    });
  }
  return send(response, 404);
}).listen(PORT, () => {
  console.log(
    `mock API on http://localhost:${PORT} - open /results/3f0c2a52-6f7b-4d53-9a55-0d5f1b9f3c11`,
  );
});

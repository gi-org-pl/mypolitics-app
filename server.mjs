import { createServer } from "node:http";
import { readFileSync } from "node:fs";

const quiz = JSON.parse(readFileSync("quiz-data-1MRfrZ26Fl.json", "utf8"));
const effects = JSON.parse(readFileSync("question-effects-1MRfrZ26Fl.json", "utf8"));
const surveyId = quiz.id;
const projectId = "polskie-lata-90-mock-project";
const results = new Map();

const survey = {
  title: quiz.title.pl,
  type: "OFFICIAL",
  averageFinishTime: quiz.averageFinishTime,
  algorithm: quiz.algorithm,
  defaultLanguage: "pl",
  supportedLanguages: ["pl"],
  orientations: quiz.orientations.map(({ id, type, color, generalName, description, logoUrl }) => ({
    id, type, color, generalName: generalName.pl, description: description.pl, logoUrl,
  })),
  categories: [],
  axis: quiz.axes.map(({ id, name, type, description, positiveOrientations, negativeOrientations }) => ({
    id, name: name.pl, type, description: description?.pl,
    positiveOrientations: [positiveOrientations], negativeOrientations: [negativeOrientations],
  })),
  questions: quiz.questions.map(({ id, text, explanation, categoryId }) => ({
    id, text: text.pl, explanation: explanation?.pl, categoryId, answerType: "AGREE_OR_DISAGREE", status: "LIVE",
    possibleAnswers: [
      { id: `${id}:agree`, text: "Za", weight: 1, orientationIds: effects[id].agree },
      { id: `${id}:disagree`, text: "Przeciw", weight: 1, orientationIds: effects[id].disagree },
    ],
  })),
  resultModules: [],
};

const reply = (res, status, body) => {
  res.writeHead(status, { "content-type": "application/json", "access-control-allow-origin": "*" });
  res.end(JSON.stringify(body));
};

createServer(async (req, res) => {
  if (req.method === "OPTIONS") return reply(res, 204, {});
  const url = new URL(req.url, "http://localhost");
  if (req.method === "GET" && url.pathname === `/api/v1/project/${projectId}`) return reply(res, 200, { id: projectId, latestSurveyId: surveyId });
  if (req.method === "GET" && url.pathname === `/api/v1/survey/${surveyId}`) return reply(res, 200, survey);
  if (req.method === "POST" && url.pathname === "/api/v1/result") {
    let raw = ""; for await (const chunk of req) raw += chunk;
    const input = JSON.parse(raw); const scores = Object.fromEntries(quiz.orientations.map(({ id }) => [id, 0]));
    for (const { questionId, answerId } of input.answers ?? []) for (const id of survey.questions.find((q) => q.id === questionId)?.possibleAnswers.find((a) => a.id === answerId)?.orientationIds ?? []) scores[id] += 1;
    results.set(input.sessionId, { surveyId, answers: input.answers ?? [], results: { orientations: quiz.orientations.map(({ id }) => ({ id, points: scores[id], maxPossible: 75 })) } });
    return reply(res, 201, {});
  }
  if (req.method === "GET" && url.pathname.startsWith("/api/v1/result/")) return reply(res, results.get(url.pathname.split("/").pop()) ? 200 : 404, results.get(url.pathname.split("/").pop()) ?? {});
  return reply(res, 404, {});
}).listen(Number(process.argv[2] ?? 4010), () => console.log("Mock API: http://localhost:4010/api"));

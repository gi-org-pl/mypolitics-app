// Local stand-in for https://api.mypolitics.pl/api for the migrated quiz only. Nothing leaves
// this machine. Run it, then start the app against it:
//
//   node mock-api.mjs                                   (listens on http://localhost:4010)
//   echo 'VITE_API_URL=http://localhost:4010/api' > .env.local   (in mypolitics-app, git-ignored)
//   yarn dev
//
// Endpoints (the ones the app calls):
//   GET  /api/v1/project/:id      the project of the quiz
//   GET  /api/v1/survey/:id       the survey, in the shape of the new API
//   POST /api/v1/result           stores the answers, 201; the same session again is 409
//   GET  /api/v1/result/:id       the result; `results` is null for the first second and a half,
//                                 like a result the Lambda has not finished yet
//
// The result is calculated with the algorithm of mypolitics-survey-consumer
// (src/service/calculator/calculator.service.ts), on the survey's own answers.

import fs from "node:fs";
import http from "node:http";

const here = new URL(".", import.meta.url).pathname;
const survey = JSON.parse(fs.readFileSync(`${here}survey.json`, "utf8"));
const project = JSON.parse(fs.readFileSync(`${here}project.json`, "utf8"));
const { ids } = JSON.parse(fs.readFileSync(`${here}ids.json`, "utf8"));
const PORT = Number(process.env.PORT ?? 4010);
const DELAY_MS = Number(process.env.RESULT_DELAY_MS ?? 1500);
const ALGORITHM = "mp-qu-2025-1.0.1";

const results = new Map(); // sessionId -> { surveyId, answers, prioritizedCategories, createdAt, calculation }

const questionsById = new Map(survey.questions.map((q) => [q.id, q]));
const categoryWeight = new Map(
  survey.categories.map((c) => [c.id, c.weight ?? 1]),
);

// Same arithmetic as CalculatorService.calculate in the consumer.
const calculate = (answers, prioritizedCategories) => {
  const points = Object.fromEntries(
    survey.orientations.map((o) => [
      o.id,
      { id: o.id, points: 0, maxPossible: 0 },
    ]),
  );
  const multiplier = (categoryId) =>
    prioritizedCategories.includes(categoryId)
      ? (categoryWeight.get(categoryId) ?? 1)
      : 1;

  for (const { questionId, answerId } of answers) {
    const question = questionsById.get(questionId);
    const answer = question.possibleAnswers.find((a) => a.id === answerId);
    for (const orientationId of answer.orientationIds) {
      points[orientationId].points +=
        answer.weight * multiplier(question.categoryId);
    }
  }
  for (const question of survey.questions) {
    const orientationIds = new Set(
      question.possibleAnswers.flatMap((a) => a.orientationIds),
    );
    for (const orientationId of orientationIds) {
      const max = Math.max(
        0,
        ...question.possibleAnswers
          .filter((a) => a.orientationIds.includes(orientationId))
          .map((a) => a.weight),
      );
      points[orientationId].maxPossible +=
        max * multiplier(question.categoryId);
    }
  }
  return {
    algorithm: ALGORITHM,
    calculatedAt: new Date().toISOString(),
    orientations: Object.values(points),
  };
};

const send = (res, status, body) => {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
  });
  res.end(body === undefined ? "" : JSON.stringify(body));
};

const readBody = (req) =>
  new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) {
        reject(e);
      }
    });
  });

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;
  const log = (status) => console.log(`${req.method} ${path} -> ${status}`);

  if (req.method === "OPTIONS") return send(res, 204), log(204);

  let m;
  if (
    req.method === "GET" &&
    (m = path.match(/^\/api\/v1\/project\/([^/]+)$/))
  ) {
    const found = decodeURIComponent(m[1]) === project.id;
    return (
      send(res, found ? 200 : 404, found ? project : { message: "Not found" }),
      log(found ? 200 : 404)
    );
  }
  if (
    req.method === "GET" &&
    (m = path.match(/^\/api\/v1\/survey\/([^/]+)$/))
  ) {
    const found = decodeURIComponent(m[1]) === ids.survey;
    return (
      send(res, found ? 200 : 404, found ? survey : { message: "Not found" }),
      log(found ? 200 : 404)
    );
  }
  if (req.method === "POST" && path === "/api/v1/result") {
    let body;
    try {
      body = await readBody(req);
    } catch {
      return send(res, 400, { message: "Bad JSON" }), log(400);
    }
    const {
      surveyId,
      sessionId,
      answers = [],
      prioritizedCategories = [],
    } = body;
    if (surveyId !== ids.survey)
      return send(res, 404, { message: "Survey not found" }), log(404);
    if (typeof sessionId !== "string" || !sessionId)
      return send(res, 422, { message: "sessionId" }), log(422);
    if (results.has(sessionId))
      return send(res, 409, { message: "Result already exists." }), log(409);
    for (const { questionId, answerId } of answers) {
      const q = questionsById.get(questionId);
      if (!q || !q.possibleAnswers.some((a) => a.id === answerId)) {
        return (
          send(res, 422, {
            message: `Unknown question or answer: ${questionId}`,
          }),
          log(422)
        );
      }
    }
    results.set(sessionId, {
      surveyId,
      answers,
      prioritizedCategories,
      createdAt: Date.now(),
      calculation: calculate(answers, prioritizedCategories),
    });
    return (
      send(res, 201, {
        id: sessionId,
        surveyId,
        results: null,
        createdAt: new Date().toISOString(),
      }),
      log(201)
    );
  }
  if (
    req.method === "GET" &&
    (m = path.match(/^\/api\/v1\/result\/([^/]+)$/))
  ) {
    const stored = results.get(decodeURIComponent(m[1]));
    if (!stored) return send(res, 404, { message: "Not found" }), log(404);
    const ready = Date.now() - stored.createdAt >= DELAY_MS;
    return (
      send(res, 200, {
        id: decodeURIComponent(m[1]),
        surveyId: stored.surveyId,
        results: ready ? stored.calculation : null,
        prioritizedCategories: stored.prioritizedCategories,
        answers: stored.answers,
      }),
      log(200)
    );
  }
  send(res, 404, { message: "Not found" });
  log(404);
});

server.listen(PORT, () => {
  console.log(`mock API for "${survey.title}" on http://localhost:${PORT}/api`);
  console.log(`project ${project.id}  survey ${ids.survey}`);
});

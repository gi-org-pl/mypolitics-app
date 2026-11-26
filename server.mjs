import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const quiz = JSON.parse(readFileSync("quiz-data-1MRfrZ26Fl.json", "utf8"));
const effects = JSON.parse(readFileSync("question-effects-1MRfrZ26Fl.json", "utf8"));
export const surveyId = quiz.id;
export const projectId = "polskie-lata-90-mock-project";

const resultMaximums = Object.fromEntries(
  quiz.orientations.map(({ id }) => [id, 0]),
);

for (const effect of Object.values(effects)) {
  for (const orientationId of new Set([...effect.agree, ...effect.disagree])) {
    resultMaximums[orientationId] += 1;
  }
}

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
  res.writeHead(status, {
    "content-type": "application/json",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "content-type",
  });
  res.end(JSON.stringify(body));
};

export const createMockServer = () => {
  const results = new Map();

  return createServer(async (req, res) => {
    if (req.method === "OPTIONS") return reply(res, 204, {});

    const url = new URL(req.url, "http://localhost");

    if (req.method === "GET" && url.pathname === `/api/v1/project/${projectId}`) {
      return reply(res, 200, { id: projectId, latestSurveyId: surveyId });
    }

    if (req.method === "GET" && url.pathname === `/api/v1/survey/${surveyId}`) {
      return reply(res, 200, survey);
    }

    if (req.method === "POST" && url.pathname === "/api/v1/result") {
      let raw = "";

      for await (const chunk of req) raw += chunk;

      const input = JSON.parse(raw);
      const scores = Object.fromEntries(
        quiz.orientations.map(({ id }) => [id, 0]),
      );

      for (const { questionId, answerId } of input.answers ?? []) {
        const question = survey.questions.find((entry) => entry.id === questionId);
        const answer = question?.possibleAnswers.find(
          (entry) => entry.id === answerId,
        );

        for (const orientationId of answer?.orientationIds ?? []) {
          scores[orientationId] += 1;
        }
      }

      results.set(input.sessionId, {
        surveyId,
        answers: input.answers ?? [],
        results: {
          orientations: quiz.orientations.map(({ id }) => ({
            id,
            points: scores[id],
            maxPossible: resultMaximums[id],
          })),
        },
      });

      return reply(res, 201, {});
    }

    if (req.method === "GET" && url.pathname.startsWith("/api/v1/result/")) {
      const result = results.get(url.pathname.split("/").pop());

      return reply(res, result ? 200 : 404, result ?? {});
    }

    return reply(res, 404, {});
  });
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  createMockServer().listen(Number(process.argv[2] ?? 4010), () => {
    console.log("Mock API: http://localhost:4010/api");
  });
}

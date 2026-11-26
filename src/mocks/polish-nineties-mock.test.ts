// @vitest-environment node
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  createMockServer,
  projectId,
  surveyId,
} from "../../server.mjs";

const listen = (server: Server): Promise<string> =>
  new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address() as AddressInfo;

      resolve(`http://127.0.0.1:${port}`);
    });
  });

const close = (server: Server): Promise<void> =>
  new Promise((resolve) => {
    server.closeAllConnections();
    server.close(() => resolve());
  });

describe("Polish 1990s local mock", () => {
  let server: Server;
  let baseURL: string;

  beforeAll(async () => {
    server = createMockServer();
    baseURL = await listen(server);
  });

  afterAll(async () => {
    await close(server);
  });

  it("allows the JSON result request through CORS preflight", async () => {
    const response = await fetch(`${baseURL}/api/v1/result`, {
      method: "OPTIONS",
      headers: {
        "access-control-request-headers": "content-type",
        "access-control-request-method": "POST",
        origin: "http://localhost:5173",
      },
    });

    expect(response.status).toBe(204);
    expect(response.headers.get("access-control-allow-headers")).toContain(
      "content-type",
    );
    expect(response.headers.get("access-control-allow-methods")).toContain(
      "POST",
    );
  });

  it("stores an answer and returns its per-orientation maximum", async () => {
    const survey = await fetch(`${baseURL}/api/v1/survey/${surveyId}`).then(
      (response) => response.json(),
    );
    const question = survey.questions[0];
    const answer = question.possibleAnswers[0];
    const orientationId = answer.orientationIds[0];
    const expectedMaximum = survey.questions.filter((entry) =>
      entry.possibleAnswers.some((possibleAnswer) =>
        possibleAnswer.orientationIds.includes(orientationId),
      ),
    ).length;
    const sessionId = "cb8ddf8f-1c62-4ff6-bc05-1dc52c159040";

    const created = await fetch(`${baseURL}/api/v1/result`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        sessionId,
        projectId,
        answers: [{ questionId: question.id, answerId: answer.id }],
      }),
    });
    const result = await fetch(`${baseURL}/api/v1/result/${sessionId}`).then(
      (response) => response.json(),
    );
    const orientation = result.results.orientations.find(
      (entry) => entry.id === orientationId,
    );

    expect(created.status).toBe(201);
    expect(orientation).toMatchObject({
      id: orientationId,
      points: 1,
      maxPossible: expectedMaximum,
    });
    expect(orientation.maxPossible).not.toBe(75);
  });
});

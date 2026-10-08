import { describe, expect, it } from "vitest";

import { createStartedSession } from "./createStartedSession";
import { createSurvey } from "./createSurvey";

describe("createStartedSession()", () => {
  it("starts on the first question, past category select", () => {
    const session = createStartedSession(createSurvey());

    expect(session.phase).toBe("questions");
    expect(session.areTopicsConfirmed).toBe(true);
    expect(session.topicIds).toEqual([]);
    expect(session.entries).toEqual([]);
  });

  it("skips the first questions it is asked to", () => {
    const session = createStartedSession(createSurvey(), 2);

    expect(session.phase).toBe("questions");
    expect(session.entries).toEqual([
      { questionId: "q1" },
      { questionId: "q2" },
    ]);
  });

  it("ends on demographics when every question is done", () => {
    const survey = createSurvey();
    const session = createStartedSession(survey, survey.questions.length);

    expect(session.phase).toBe("demographics");
    expect(session.entries).toHaveLength(5);
  });

  it("starts on the first question of a quiz without category select", () => {
    const session = createStartedSession(createSurvey({ categories: [] }));

    expect(session.phase).toBe("questions");
    expect(session.areTopicsConfirmed).toBe(false);
  });
});

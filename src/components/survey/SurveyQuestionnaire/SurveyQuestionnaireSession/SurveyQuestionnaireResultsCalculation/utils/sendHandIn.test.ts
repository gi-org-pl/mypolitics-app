import { afterEach, describe, expect, it, vi } from "vitest";
import { createResult } from "@/services/api/client/createResult";
import { CreateResultOutcome, type ResultInput } from "@/types/survey";
import { CREATE_RESULT_TIMEOUT_MS } from "../SurveyQuestionnaireResultsCalculation.constants";
import { sendHandIn } from "./sendHandIn";

vi.mock("@/services/api/client/createResult");

const createResultMock = vi.mocked(createResult);

const INPUT: ResultInput = {
  surveyId: "survey",
  sessionId: "0b9f3c1e-5a7d-4e2b-9c41-7f6a2d8e1b35",
  prioritizedCategories: [],
  answers: [{ questionId: "q1", answerId: "q1-agree" }],
};

describe("sendHandIn()", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("given a stored result", () => {
    it("sends the hand-in once, with a time limit of 10 seconds", async () => {
      const { signal } = new AbortController();

      createResultMock.mockResolvedValue(CreateResultOutcome.Stored);

      await expect(sendHandIn(INPUT, signal)).resolves.toBe(
        CreateResultOutcome.Stored,
      );
      expect(CREATE_RESULT_TIMEOUT_MS).toBe(10_000);
      expect(createResultMock).toHaveBeenCalledTimes(1);
      expect(createResultMock).toHaveBeenCalledWith(INPUT, {
        signal,
        timeoutMs: CREATE_RESULT_TIMEOUT_MS,
      });
    });
  });

  describe("given an unreachable API", () => {
    it("sends the same hand-in once more by itself", async () => {
      const { signal } = new AbortController();

      createResultMock
        .mockResolvedValueOnce(CreateResultOutcome.Unreachable)
        .mockResolvedValueOnce(CreateResultOutcome.Stored);

      await expect(sendHandIn(INPUT, signal)).resolves.toBe(
        CreateResultOutcome.Stored,
      );
      expect(createResultMock).toHaveBeenCalledTimes(2);
      expect(createResultMock.mock.calls[1]).toEqual(
        createResultMock.mock.calls[0],
      );
      expect(createResultMock.mock.calls[1][0]).toBe(INPUT);
    });

    it.each([
      CreateResultOutcome.Unreachable,
      CreateResultOutcome.Refused,
    ] satisfies CreateResultOutcome[])("ends with what the second try got, and tries no third time: %s", async (outcome) => {
      createResultMock
        .mockResolvedValueOnce(CreateResultOutcome.Unreachable)
        .mockResolvedValueOnce(outcome);

      await expect(
        sendHandIn(INPUT, new AbortController().signal),
      ).resolves.toBe(outcome);
      expect(createResultMock).toHaveBeenCalledTimes(2);
    });
  });

  describe("given a refused hand-in", () => {
    it("ends refused with no second try", async () => {
      createResultMock.mockResolvedValue(CreateResultOutcome.Refused);

      await expect(
        sendHandIn(INPUT, new AbortController().signal),
      ).resolves.toBe(CreateResultOutcome.Refused);
      expect(createResultMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("when the run is left while the hand-in is on its way", () => {
    it("sends nothing more", async () => {
      const controller = new AbortController();

      // A cancelled request reads as one that got no answer.
      createResultMock.mockImplementationOnce(async () => {
        controller.abort();

        return CreateResultOutcome.Unreachable;
      });

      await expect(sendHandIn(INPUT, controller.signal)).resolves.toBe(
        CreateResultOutcome.Unreachable,
      );
      expect(createResultMock).toHaveBeenCalledTimes(1);
    });
  });
});

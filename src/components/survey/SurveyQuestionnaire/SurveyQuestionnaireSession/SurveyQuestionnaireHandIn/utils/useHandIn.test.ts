import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createResult } from "@/services/api/client/createResult";
import type { CreateResultOutcome, Survey } from "@/types/survey";
import { buildResultInput } from "@/utils/survey/buildResultInput";
import { getSurveySessionStore } from "@/utils/survey/getSurveySessionStore";
import { useSurveySession } from "@/utils/survey/useSurveySession";
import { createStartedSession } from "@/utils/vitest/createStartedSession";
import { createSurvey } from "@/utils/vitest/createSurvey";

import { useHandIn } from "./useHandIn";

vi.mock("@/services/api/client/createResult");

const createResultMock = vi.mocked(createResult);

// A request that the test ends by hand.
const holdRequest = () => {
  let finish: (outcome: CreateResultOutcome) => void = () => undefined;

  createResultMock.mockImplementationOnce(
    () =>
      new Promise<CreateResultOutcome>((resolve) => {
        finish = resolve;
      }),
  );

  return (outcome: CreateResultOutcome) => act(async () => finish(outcome));
};

const renderHandIn = () => {
  // The stores live as long as the module does: a quiz of its own.
  const survey: Survey = createSurvey({ id: crypto.randomUUID() });
  const session = {
    ...createStartedSession(survey, survey.questions.length),
    phase: "results-calculation" as const,
  };
  const onLeave = vi.fn();

  getSurveySessionStore(survey).setState(session, true);

  const view = renderHook(() => {
    const api = useSurveySession(survey);

    return {
      session: api.session,
      handIn: useHandIn({ survey, session: api, onLeave }),
    };
  });

  return { ...view, onLeave, input: buildResultInput(survey, session) };
};

describe("useHandIn()", () => {
  beforeEach(() => {
    createResultMock.mockResolvedValue("stored");
  });

  afterEach(() => {
    vi.resetAllMocks();
    sessionStorage.clear();
  });

  describe("when the phase opens", () => {
    it("sends the hand-in of the session once", () => {
      const finish = holdRequest();
      const { input, rerender } = renderHandIn();

      rerender();

      expect(createResultMock).toHaveBeenCalledTimes(1);
      expect(createResultMock).toHaveBeenCalledWith(input, {
        signal: expect.any(AbortSignal),
      });

      return finish("stored");
    });

    it("sets the result state to sending, and has not failed", () => {
      const finish = holdRequest();
      const { result } = renderHandIn();

      expect(result.current.session.resultState).toBe("sending");
      expect(result.current.handIn.hasFailed).toBe(false);

      return finish("stored");
    });
  });

  describe("given a stored result", () => {
    it("sets the result state to created and leaves", async () => {
      const finish = holdRequest();
      const { result, onLeave } = renderHandIn();

      expect(onLeave).not.toHaveBeenCalled();

      await finish("stored");

      expect(result.current.session.resultState).toBe("created");
      expect(result.current.handIn.hasFailed).toBe(false);
      expect(onLeave).toHaveBeenCalledTimes(1);
    });
  });

  describe.each([
    "refused",
    "unreachable",
  ] satisfies CreateResultOutcome[])("given a hand-in that is %s", (outcome) => {
    it("sets the result state to failed, and does not leave", async () => {
      const finish = holdRequest();
      const { result, onLeave } = renderHandIn();

      await finish(outcome);

      expect(result.current.session.resultState).toBe("failed");
      expect(result.current.handIn.hasFailed).toBe(true);
      expect(onLeave).not.toHaveBeenCalled();
    });
  });

  describe("when retry is called after a failure", () => {
    it("is sending again and sends the same hand-in again", async () => {
      const finishFirst = holdRequest();
      const { result, input, onLeave } = renderHandIn();

      await finishFirst("unreachable");

      const finishSecond = holdRequest();

      act(() => result.current.handIn.retry());

      expect(result.current.session.resultState).toBe("sending");
      expect(result.current.handIn.hasFailed).toBe(false);
      expect(createResultMock).toHaveBeenCalledTimes(2);
      expect(createResultMock.mock.calls[1][0]).toBe(
        createResultMock.mock.calls[0][0],
      );
      expect(createResultMock.mock.calls[1][0]).toEqual(input);

      await finishSecond("stored");

      expect(result.current.session.resultState).toBe("created");
      expect(onLeave).toHaveBeenCalledTimes(1);
    });

    it("sends one request when called twice", async () => {
      const finishFirst = holdRequest();
      const { result } = renderHandIn();

      await finishFirst("refused");

      const finishSecond = holdRequest();

      act(() => result.current.handIn.retry());
      act(() => result.current.handIn.retry());

      expect(createResultMock).toHaveBeenCalledTimes(2);

      await finishSecond("stored");
    });
  });

  describe("when retry is called while the hand-in is on its way", () => {
    it("sends nothing more", () => {
      const finish = holdRequest();
      const { result } = renderHandIn();

      act(() => result.current.handIn.retry());

      expect(createResultMock).toHaveBeenCalledTimes(1);

      return finish("stored");
    });
  });

  describe("when unmounted while the request is on its way", () => {
    it("cancels it and ignores its outcome", async () => {
      const finish = holdRequest();
      const { result, unmount, onLeave } = renderHandIn();
      const signal = createResultMock.mock.calls[0][1]?.signal;

      expect(signal?.aborted).toBe(false);

      unmount();

      expect(signal?.aborted).toBe(true);

      await finish("stored");

      expect(result.current.session.resultState).toBe("sending");
      expect(onLeave).not.toHaveBeenCalled();
    });
  });
});

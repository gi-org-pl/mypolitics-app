import { describe, expect, it } from "vitest";

import {
  HandInState,
  ResultLinkState,
} from "../SurveyQuestionnaireResultsCalculation.types";
import { isReadyToLeave } from "./isReadyToLeave";

describe("isReadyToLeave()", () => {
  describe("given a result that is not calculated", () => {
    it.each([
      HandInState.Sending,
      HandInState.Created,
      HandInState.NotSaved,
      HandInState.NotReady,
    ] satisfies HandInState[])("is not ready before the result is calculated: %s", (handIn) => {
      expect(
        isReadyToLeave({
          handIn,
          link: ResultLinkState.None,
          hasStayedLongEnough: true,
        }),
      ).toBe(false);
    });
  });

  describe("given a calculated result", () => {
    it("is not ready while the link request is pending", () => {
      expect(
        isReadyToLeave({
          handIn: HandInState.Calculated,
          link: ResultLinkState.Pending,
          hasStayedLongEnough: true,
        }),
      ).toBe(false);
    });

    it("is not ready before the run has stayed long enough", () => {
      expect(
        isReadyToLeave({
          handIn: HandInState.Calculated,
          link: ResultLinkState.None,
          hasStayedLongEnough: false,
        }),
      ).toBe(false);
    });

    it.each([
      ResultLinkState.None,
      ResultLinkState.Accepted,
      ResultLinkState.NotSent,
    ] satisfies ResultLinkState[])("is ready when the result is calculated, the link has ended or was never asked for, and the stay is over: %s", (link) => {
      expect(
        isReadyToLeave({
          handIn: HandInState.Calculated,
          link,
          hasStayedLongEnough: true,
        }),
      ).toBe(true);
    });
  });
});

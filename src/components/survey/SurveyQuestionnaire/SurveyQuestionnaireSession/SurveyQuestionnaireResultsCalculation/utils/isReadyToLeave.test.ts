import { describe, expect, it } from "vitest";

import type {
  HandInState,
  ResultLinkState,
} from "../SurveyQuestionnaireResultsCalculation.types";
import { isReadyToLeave } from "./isReadyToLeave";

describe("isReadyToLeave()", () => {
  describe("given a result that is not calculated", () => {
    it.each([
      "sending",
      "created",
      "not-saved",
      "not-ready",
    ] satisfies HandInState[])("is not ready before the result is calculated: %s", (handIn) => {
      expect(
        isReadyToLeave({ handIn, link: "none", hasStayedLongEnough: true }),
      ).toBe(false);
    });
  });

  describe("given a calculated result", () => {
    it("is not ready while the link request is pending", () => {
      expect(
        isReadyToLeave({
          handIn: "calculated",
          link: "pending",
          hasStayedLongEnough: true,
        }),
      ).toBe(false);
    });

    it("is not ready before the run has stayed long enough", () => {
      expect(
        isReadyToLeave({
          handIn: "calculated",
          link: "none",
          hasStayedLongEnough: false,
        }),
      ).toBe(false);
    });

    it.each([
      "none",
      "accepted",
      "not-sent",
    ] satisfies ResultLinkState[])("is ready when the result is calculated, the link has ended or was never asked for, and the stay is over: %s", (link) => {
      expect(
        isReadyToLeave({
          handIn: "calculated",
          link,
          hasStayedLongEnough: true,
        }),
      ).toBe(true);
    });
  });
});

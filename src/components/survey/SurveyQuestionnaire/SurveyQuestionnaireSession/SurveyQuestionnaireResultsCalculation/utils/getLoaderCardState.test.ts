import { describe, expect, it } from "vitest";

import {
  HandInState,
  ResultLinkState,
} from "../SurveyQuestionnaireResultsCalculation.types";
import { getLoaderCardState } from "./getLoaderCardState";

const LINK_STATES: ResultLinkState[] = [
  ResultLinkState.None,
  ResultLinkState.Pending,
  ResultLinkState.Accepted,
  ResultLinkState.NotSent,
];

describe("getLoaderCardState()", () => {
  describe("given a run under way", () => {
    it.each([
      HandInState.Sending,
      HandInState.Created,
      HandInState.Calculated,
    ] satisfies HandInState[])("is running while the hand-in is sending, created or calculated: %s", (handIn) => {
      for (const link of LINK_STATES) {
        expect(
          getLoaderCardState({ handIn, link, isReadyToLeave: false }),
        ).toBe("running");
      }
    });

    it("is running when the run is ready to leave and the link was sent, or never asked for", () => {
      expect(
        getLoaderCardState({
          handIn: HandInState.Calculated,
          link: ResultLinkState.Accepted,
          isReadyToLeave: true,
        }),
      ).toBe("running");
      expect(
        getLoaderCardState({
          handIn: HandInState.Calculated,
          link: ResultLinkState.None,
          isReadyToLeave: true,
        }),
      ).toBe("running");
    });
  });

  describe("given a run that failed", () => {
    it("is failed-not-saved and failed-not-ready for the two failures", () => {
      expect(
        getLoaderCardState({
          handIn: HandInState.NotSaved,
          link: ResultLinkState.None,
          isReadyToLeave: false,
        }),
      ).toBe("failed-not-saved");
      expect(
        getLoaderCardState({
          handIn: HandInState.NotReady,
          link: ResultLinkState.None,
          isReadyToLeave: false,
        }),
      ).toBe("failed-not-ready");
    });

    it("shows the failure, not the notice, when the link was not sent and the run failed", () => {
      expect(
        getLoaderCardState({
          handIn: HandInState.NotReady,
          link: ResultLinkState.NotSent,
          isReadyToLeave: false,
        }),
      ).toBe("failed-not-ready");
      expect(
        getLoaderCardState({
          handIn: HandInState.NotSaved,
          link: ResultLinkState.NotSent,
          isReadyToLeave: false,
        }),
      ).toBe("failed-not-saved");
    });
  });

  describe("given a link that was not sent", () => {
    it("is link-not-sent when the run is ready to leave and the link was not sent", () => {
      expect(
        getLoaderCardState({
          handIn: HandInState.Calculated,
          link: ResultLinkState.NotSent,
          isReadyToLeave: true,
        }),
      ).toBe("link-not-sent");
    });

    it("is running until the run is ready to leave", () => {
      expect(
        getLoaderCardState({
          handIn: HandInState.Calculated,
          link: ResultLinkState.NotSent,
          isReadyToLeave: false,
        }),
      ).toBe("running");
    });
  });
});

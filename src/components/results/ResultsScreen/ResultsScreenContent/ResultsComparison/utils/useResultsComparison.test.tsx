import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getResult } from "@/services/api/client/getResult";
import { ComparisonMode } from "@/types/comparison";
import { type ResultLoadResult, ResultLoadStatus } from "@/types/survey";

import { INITIAL_COMPARISON_STATE } from "../ResultsComparison.constants";
import {
  FRIEND_ID,
  friendComparison,
  moduleFriendResult,
  moduleOrientations,
  moduleTaker,
  orientationComparison,
  TAKER_ID,
} from "../ResultsComparison.fixtures";
import {
  ComparisonStatus,
  ComparisonView,
  FriendRefusal,
} from "../ResultsComparison.types";
import { useResultsComparison } from "./useResultsComparison";

vi.mock("@/services/api/client/getResult");

const getResultMock = vi.mocked(getResult);

const READY: ResultLoadResult = {
  status: ResultLoadStatus.Ready,
  result: moduleFriendResult,
};
const OTHER_ID = "0b9f3c1e-5a7d-4e2b-9c41-7f6a2d8e1b35";

const wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider i18n={i18n}>{children}</I18nProvider>
);

const renderComparison = () =>
  renderHook(() => useResultsComparison(moduleTaker), { wrapper });

// A read that ends when the test says so.
const deferRead = () => {
  let resolve: (load: ResultLoadResult) => void = () => undefined;

  getResultMock.mockReturnValueOnce(
    new Promise((done) => {
      resolve = done;
    }),
  );

  return (load: ResultLoadResult) => act(async () => resolve(load));
};

describe("useResultsComparison()", () => {
  beforeEach(() => {
    getResultMock.mockReset();
    getResultMock.mockResolvedValue(READY);
  });

  describe("when the tab is opened", () => {
    it("is choosing, on the friend mode, with an empty field", () => {
      const { result } = renderComparison();

      expect(result.current.state).toEqual(INITIAL_COMPARISON_STATE);
      expect(getResultMock).not.toHaveBeenCalled();
    });

    it("offers the orientations of the quiz that an answer lists", () => {
      const { result } = renderComparison();

      expect(result.current.orientations).toEqual(moduleOrientations);
      expect(result.current.orientations.map(({ id }) => id)).not.toContain(
        "secret",
      );
    });
  });

  describe("when a mode is chosen", () => {
    it("shows that mode", () => {
      const { result } = renderComparison();

      act(() => result.current.chooseMode(ComparisonMode.Orientation));

      expect(result.current.state).toMatchObject({
        status: ComparisonStatus.Choosing,
        mode: ComparisonMode.Orientation,
      });
    });
  });

  describe("when the identifier of a friend is entered", () => {
    it("is fetching, and asks for that result once", async () => {
      const finish = deferRead();
      const { result } = renderComparison();

      act(() => result.current.enterFriendId(` ${FRIEND_ID} `));

      expect(result.current.state).toMatchObject({
        status: ComparisonStatus.Fetching,
        requestedId: FRIEND_ID,
      });
      expect(getResultMock).toHaveBeenCalledExactlyOnceWith(FRIEND_ID, {
        signal: expect.any(AbortSignal),
      });

      await finish(READY);

      expect(getResultMock).toHaveBeenCalledTimes(1);
    });

    it("allows nothing while the result is on the way", () => {
      deferRead();

      const { result } = renderComparison();

      act(() => result.current.enterFriendId(FRIEND_ID));

      const fetching = result.current.state;

      act(() => result.current.chooseMode(ComparisonMode.Orientation));
      act(() => result.current.enterFriendId(OTHER_ID));
      act(() => result.current.pickOrientation(moduleOrientations[0].id));
      act(() => result.current.end());

      expect(result.current.state).toBe(fetching);
      expect(getResultMock).toHaveBeenCalledTimes(1);
    });

    it("starts the comparison when the result is calculated and of the same survey", async () => {
      const { result } = renderComparison();

      act(() => result.current.enterFriendId(FRIEND_ID));

      await waitFor(() =>
        expect(result.current.state).toEqual(friendComparison),
      );
    });

    it("refuses a result of another survey", async () => {
      getResultMock.mockResolvedValue({
        status: ResultLoadStatus.Ready,
        result: { ...moduleFriendResult, surveyId: "another" },
      });

      const { result } = renderComparison();

      act(() => result.current.enterFriendId(FRIEND_ID));

      await waitFor(() =>
        expect(result.current.state).toMatchObject({
          status: ComparisonStatus.Refused,
          refusal: FriendRefusal.OtherSurvey,
          friendId: FRIEND_ID,
        }),
      );
    });

    it.each([
      ["does not exist", { status: ResultLoadStatus.NotFound }],
      ["cannot be read", { status: ResultLoadStatus.Failed }],
      [
        "is not calculated",
        {
          status: ResultLoadStatus.Ready,
          result: { ...moduleFriendResult, isCalculated: false },
        },
      ],
    ] as [
      string,
      ResultLoadResult,
    ][])("refuses a result that %s", async (_, load) => {
      getResultMock.mockResolvedValue(load);

      const { result } = renderComparison();

      act(() => result.current.enterFriendId(FRIEND_ID));

      await waitFor(() =>
        expect(result.current.state).toMatchObject({
          status: ComparisonStatus.Refused,
          refusal: FriendRefusal.Unreadable,
        }),
      );
    });
  });

  describe("when the identifier of the taker is entered", () => {
    it("refuses it, and asks for nothing", () => {
      const { result } = renderComparison();

      act(() => result.current.enterFriendId(TAKER_ID));

      expect(result.current.state).toMatchObject({
        status: ComparisonStatus.Refused,
        refusal: FriendRefusal.Own,
      });
      expect(getResultMock).not.toHaveBeenCalled();
    });
  });

  describe("when a text that is not an identifier is entered", () => {
    it("stays choosing, and asks for nothing", () => {
      const { result } = renderComparison();

      act(() => result.current.enterFriendId("5218cde2"));

      expect(result.current.state).toEqual({
        status: ComparisonStatus.Choosing,
        mode: ComparisonMode.Friend,
        friendId: "5218cde2",
      });
      expect(getResultMock).not.toHaveBeenCalled();
    });
  });

  describe("after a refusal", () => {
    it("takes another identifier, and asks for that result", async () => {
      getResultMock.mockResolvedValueOnce({
        status: ResultLoadStatus.NotFound,
      });

      const { result } = renderComparison();

      act(() => result.current.enterFriendId(OTHER_ID));
      await waitFor(() =>
        expect(result.current.state.status).toBe(ComparisonStatus.Refused),
      );

      act(() => result.current.enterFriendId(FRIEND_ID));
      await waitFor(() =>
        expect(result.current.state).toEqual(friendComparison),
      );

      expect(getResultMock).toHaveBeenCalledTimes(2);
      expect(getResultMock).toHaveBeenLastCalledWith(FRIEND_ID, {
        signal: expect.any(AbortSignal),
      });
    });
  });

  describe("when an orientation is picked", () => {
    it("starts the comparison with it, and asks for nothing", () => {
      const { result } = renderComparison();

      act(() => result.current.chooseMode(ComparisonMode.Orientation));
      act(() => result.current.pickOrientation(moduleOrientations[0].id));

      expect(result.current.state).toEqual(orientationComparison);
      expect(getResultMock).not.toHaveBeenCalled();
    });
  });

  describe("while a comparison runs", () => {
    it("starts no other one until it is ended", async () => {
      const { result } = renderComparison();

      act(() => result.current.enterFriendId(FRIEND_ID));
      await waitFor(() =>
        expect(result.current.state).toEqual(friendComparison),
      );

      act(() => result.current.pickOrientation(moduleOrientations[0].id));
      act(() => result.current.enterFriendId(OTHER_ID));

      expect(result.current.state).toEqual(friendComparison);
      expect(getResultMock).toHaveBeenCalledTimes(1);
    });

    it("shows the view that is chosen, of the two a friend has", async () => {
      const { result } = renderComparison();

      act(() => result.current.enterFriendId(FRIEND_ID));
      await waitFor(() =>
        expect(result.current.state).toEqual(friendComparison),
      );

      act(() => result.current.chooseView(ComparisonView.Questions));

      expect(result.current.state).toEqual({
        ...friendComparison,
        view: ComparisonView.Questions,
      });

      act(() => result.current.chooseView(ComparisonView.Results));

      expect(result.current.state).toEqual(friendComparison);
    });

    it("shows no view the comparison does not have: an orientation has the questions alone", () => {
      const { result } = renderComparison();

      act(() => result.current.chooseMode(ComparisonMode.Orientation));
      act(() => result.current.pickOrientation(moduleOrientations[0].id));
      act(() => result.current.chooseView(ComparisonView.Results));

      expect(result.current.state).toMatchObject({
        views: [ComparisonView.Questions],
        view: ComparisonView.Questions,
      });
    });
  });

  describe("when the comparison is ended", () => {
    it("is choosing again, with the mode last used", () => {
      const { result } = renderComparison();

      act(() => result.current.chooseMode(ComparisonMode.Orientation));
      act(() => result.current.pickOrientation(moduleOrientations[0].id));
      act(() => result.current.end());

      expect(result.current.state).toEqual({
        status: ComparisonStatus.Choosing,
        mode: ComparisonMode.Orientation,
        friendId: "",
      });
    });

    it("keeps nothing of the friend", async () => {
      const { result } = renderComparison();

      act(() => result.current.enterFriendId(FRIEND_ID));
      await waitFor(() =>
        expect(result.current.state).toEqual(friendComparison),
      );
      act(() => result.current.end());

      expect(result.current.state).toEqual(INITIAL_COMPARISON_STATE);
      expect(JSON.stringify(result.current.state)).not.toContain(FRIEND_ID);
    });
  });

  describe("when the tab goes while a result is on the way", () => {
    it("cancels the read", () => {
      deferRead();

      const { result, unmount } = renderComparison();

      act(() => result.current.enterFriendId(FRIEND_ID));

      const { signal } = getResultMock.mock.calls[0][1] ?? {};

      expect(signal?.aborted).toBe(false);

      unmount();

      expect(signal?.aborted).toBe(true);
    });

    it("ignores the read when it ends all the same", async () => {
      const finish = deferRead();
      const { result, unmount } = renderComparison();

      act(() => result.current.enterFriendId(FRIEND_ID));

      const fetching = result.current.state;

      unmount();
      await finish(READY);

      expect(result.current.state).toBe(fetching);
    });
  });

  describe("nothing about the other side", () => {
    it("is put in the storage of the browser or in the address", async () => {
      const address = window.location.href;
      const { result } = renderComparison();

      act(() => result.current.enterFriendId(FRIEND_ID));
      await waitFor(() =>
        expect(result.current.state).toEqual(friendComparison),
      );

      expect(window.localStorage).toHaveLength(0);
      expect(window.sessionStorage).toHaveLength(0);
      expect(window.location.href).toBe(address);
    });
  });
});

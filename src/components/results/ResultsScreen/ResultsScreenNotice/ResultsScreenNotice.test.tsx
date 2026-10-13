import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import {
  type ResultsNoticeStatus,
  ResultsScreenStatus,
} from "../ResultsScreen.types";
import { ResultsScreenNotice } from "./ResultsScreenNotice";
import { RESULTS_NOTICES } from "./ResultsScreenNotice.constants";

const RETRY = "Spróbuj ponownie";

const renderNotice = (status: ResultsNoticeStatus) => {
  const onRetry = vi.fn();

  renderWithI18n(<ResultsScreenNotice status={status} onRetry={onRetry} />);

  return { onRetry };
};

describe("<ResultsScreenNotice />", () => {
  describe("given loading", () => {
    it('says "Wczytujemy wynik…" as a status, with no heading and nothing to press', () => {
      renderNotice(ResultsScreenStatus.Loading);

      expect(screen.getByRole("status")).toHaveTextContent(
        /^Wczytujemy wynik…$/,
      );
      expect(screen.queryByRole("heading")).not.toBeInTheDocument();
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  describe("given a result the API does not have", () => {
    it("shows the heading and the line, and no retry", () => {
      renderNotice(ResultsScreenStatus.NotFound);

      expect(
        screen.getByRole("heading", {
          level: 1,
          name: "Nie znaleźliśmy takiego wyniku",
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Sprawdź, czy adres jest pełny."),
      ).toBeInTheDocument();
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
  });

  describe.each([
    [ResultsScreenStatus.NotReady, "Wynik nie jest jeszcze gotowy"],
    [ResultsScreenStatus.Failed, "Nie udało się wczytać wyniku"],
  ] as const)("given %s", (status, heading) => {
    it("shows the heading and the retry, announced when it appears", () => {
      renderNotice(status);

      expect(
        screen.getByRole("heading", { level: 1, name: heading }),
      ).toBeInTheDocument();
      expect(screen.getByRole("alert")).toHaveTextContent(heading);
      expect(screen.getByRole("button", { name: RETRY })).toBeEnabled();
    });

    it("calls onRetry when the retry is pressed", () => {
      const { onRetry } = renderNotice(status);

      fireEvent.click(screen.getByRole("button", { name: RETRY }));

      expect(onRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe("given a quiz with no result view", () => {
    it("shows the heading, and nothing to press", () => {
      renderNotice(ResultsScreenStatus.NotConfigured);

      expect(
        screen.getByRole("heading", {
          level: 1,
          name: "Ten quiz nie ma jeszcze widoku wyników",
        }),
      ).toBeInTheDocument();
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
  });

  describe("the notices", () => {
    it("has one for every state but ready", () => {
      expect(Object.keys(RESULTS_NOTICES).sort()).toEqual(
        Object.values(ResultsScreenStatus)
          .filter((status) => status !== ResultsScreenStatus.Ready)
          .sort(),
      );
    });

    it("offers the retry where the spec says so: not ready and failed", () => {
      expect(
        Object.entries(RESULTS_NOTICES)
          .filter(([, { canRetry }]) => canRetry)
          .map(([status]) => status)
          .sort(),
      ).toEqual([ResultsScreenStatus.Failed, ResultsScreenStatus.NotReady]);
    });
  });
});

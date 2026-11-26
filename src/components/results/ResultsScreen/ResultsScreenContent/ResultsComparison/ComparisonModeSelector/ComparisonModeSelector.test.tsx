import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ComparisonMode } from "@/types/comparison";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import {
  choosingFriend,
  choosingOrientation,
  choosingWithInvalidId,
  exampleOrientations,
  FRIEND_ID,
  fetchingFriend,
  refusedOtherSurvey,
  refusedOwn,
  refusedUnreadable,
  TAKER_ID,
} from "../ResultsComparison.fixtures";
import { ComparisonModeSelector } from "./ComparisonModeSelector";
import {
  COMPARISON_MODE_LABELS,
  COMPARISON_MODES,
} from "./ComparisonModeSelector.constants";
import type { ComparisonModeSelectorProps } from "./ComparisonModeSelector.types";

const FRIEND_FIELD = "Identyfikator wyników znajomego";

const renderSelector = (props: Partial<ComparisonModeSelectorProps> = {}) => {
  const handlers = {
    onModeChange: vi.fn(),
    onFriendIdChange: vi.fn(),
    onOrientationPick: vi.fn(),
  };

  renderWithI18n(
    <ComparisonModeSelector
      state={choosingFriend}
      resultId={TAKER_ID}
      orientations={exampleOrientations}
      {...handlers}
      {...props}
    />,
  );

  return handlers;
};

const getTab = (name: string) => screen.getByRole("tab", { name });
const getField = () => screen.getByRole("textbox", { name: FRIEND_FIELD });

describe("<ComparisonModeSelector />", () => {
  describe("when the tab is opened and no comparison runs", () => {
    it("offers two modes as a tab list, the friend first", () => {
      renderSelector();

      expect(
        screen.getByRole("tablist", { name: "Tryb porównania" }),
      ).toBeInTheDocument();
      expect(screen.getAllByRole("tab").map((tab) => tab.textContent)).toEqual([
        "Ze znajomym",
        "Z orientacją",
      ]);
    });

    it("starts on the friend mode", () => {
      renderSelector();

      expect(getTab("Ze znajomym")).toHaveAttribute("aria-selected", "true");
      expect(getTab("Z orientacją")).toHaveAttribute("aria-selected", "false");
    });
  });

  describe("given the friend mode", () => {
    it("shows the identifier of the taker with a copy control, and a field for the friend's, in the panel of the mode", () => {
      renderSelector();

      const panel = within(
        screen.getByRole("tabpanel", { name: "Ze znajomym" }),
      );

      expect(panel.getByText(TAKER_ID)).toBeVisible();
      expect(
        panel.getByRole("button", { name: "Skopiuj identyfikator" }),
      ).toBeEnabled();
      expect(panel.getByRole("textbox", { name: FRIEND_FIELD })).toHaveValue(
        "",
      );
    });

    it("shows the hint under the field", () => {
      renderSelector();

      expect(
        screen.getByText(
          "Wymień się identyfikatorami wyników ze znajomym, aby porównać wzajemnie swoje odpowiedzi.",
        ),
      ).toBeVisible();
    });

    it("shows no list of orientations", () => {
      renderSelector();

      expect(
        screen.queryByRole("button", { name: "Progresywizm" }),
      ).not.toBeInTheDocument();
    });

    it("hands on what is typed in the field of the friend", () => {
      const { onFriendIdChange } = renderSelector();

      fireEvent.change(getField(), { target: { value: FRIEND_ID } });

      expect(onFriendIdChange).toHaveBeenCalledExactlyOnceWith(FRIEND_ID);
    });
  });

  describe("given a text in the field that is not an identifier in form", () => {
    it("says that it is not an identifier", () => {
      renderSelector({ state: choosingWithInvalidId });

      expect(getField()).toHaveValue(choosingWithInvalidId.friendId);
      expect(getField()).toBeInvalid();
      expect(
        screen.getByText("To nie jest identyfikator wyników."),
      ).toBeVisible();
    });
  });

  describe("given a result on the way", () => {
    it("says so, and does not let the field be changed", () => {
      renderSelector({ state: fetchingFriend });

      expect(screen.getByText("Wczytujemy wynik…")).toBeVisible();
      expect(getField()).toHaveValue(FRIEND_ID);
      expect(getField()).toHaveAttribute("readonly");
      expect(getField()).toHaveAttribute("aria-busy", "true");
    });
  });

  describe("given a refusal", () => {
    it.each([
      [
        "the identifier of the taker",
        refusedOwn,
        "To jest Twój identyfikator.",
      ],
      [
        "a result of another survey",
        refusedOtherSurvey,
        "Ten wynik pochodzi z innego quizu.",
      ],
      [
        "a result that cannot be read",
        refusedUnreadable,
        "Nie znaleźliśmy takiego wyniku.",
      ],
    ])("says so in a line under the field: %s", (_, state, line) => {
      renderSelector({ state });

      expect(screen.getByText(line)).toBeVisible();
      expect(getField()).toBeInvalid();
      expect(getField()).toHaveValue(state.friendId);
      expect(getField()).not.toHaveAttribute("readonly");
    });
  });

  describe("given the orientation mode", () => {
    it("shows a search field and the offered orientations as a list, in the panel of the mode", () => {
      renderSelector({ state: choosingOrientation });

      const panel = within(
        screen.getByRole("tabpanel", { name: "Z orientacją" }),
      );

      expect(getTab("Z orientacją")).toHaveAttribute("aria-selected", "true");
      expect(
        panel.getByRole("searchbox", { name: "Szukaj po nazwie" }),
      ).toBeVisible();
      expect(
        panel.getAllByRole("listitem").map((item) => item.textContent),
      ).toEqual([
        "Progresywizm",
        "Tradycjonalizm",
        "Interwencjonizm",
        "Wolny rynek",
      ]);
    });

    it("shows no form of a friend", () => {
      renderSelector({ state: choosingOrientation });

      expect(
        screen.queryByRole("textbox", { name: FRIEND_FIELD }),
      ).not.toBeInTheDocument();
      expect(screen.queryByText(TAKER_ID)).not.toBeInTheDocument();
    });

    it("says which orientation was picked", () => {
      const { onOrientationPick } = renderSelector({
        state: choosingOrientation,
      });

      fireEvent.click(screen.getByRole("button", { name: "Tradycjonalizm" }));

      expect(onOrientationPick).toHaveBeenCalledExactlyOnceWith(
        "traditionalism",
      );
    });
  });

  describe("when the other mode is chosen", () => {
    it("says which mode was chosen", () => {
      const { onModeChange } = renderSelector();

      fireEvent.click(getTab("Z orientacją"));

      expect(onModeChange).toHaveBeenCalledExactlyOnceWith(
        ComparisonMode.Orientation,
      );
    });
  });

  describe("given a quiz that offers no orientation", () => {
    it("does not offer the orientation mode: the form of a friend stands alone", () => {
      renderSelector({ orientations: [] });

      expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
      expect(screen.queryByRole("tab")).not.toBeInTheDocument();
      expect(screen.queryByRole("tabpanel")).not.toBeInTheDocument();
      expect(getField()).toBeVisible();
    });

    it("shows the form of a friend even in a state of the orientation mode", () => {
      renderSelector({ orientations: [], state: choosingOrientation });

      expect(getField()).toBeVisible();
      expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
    });
  });

  describe("the modes", () => {
    it("are the friend and the orientation, in that order, each with a name", () => {
      expect(COMPARISON_MODES).toEqual([
        ComparisonMode.Friend,
        ComparisonMode.Orientation,
      ]);
      expect(Object.keys(COMPARISON_MODE_LABELS).sort()).toEqual(
        [...COMPARISON_MODES].sort(),
      );
    });
  });
});

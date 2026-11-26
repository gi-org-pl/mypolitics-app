import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { exampleOrientations } from "../../ResultsComparison.fixtures";
import { OrientationList } from "./OrientationList";
import type { OrientationListProps } from "./OrientationList.types";

const renderList = (props: Partial<OrientationListProps> = {}) => {
  const onPick = vi.fn();

  renderWithI18n(
    <OrientationList
      orientations={exampleOrientations}
      onPick={onPick}
      {...props}
    />,
  );

  return { onPick };
};

const getSearch = () =>
  screen.getByRole("searchbox", { name: "Szukaj po nazwie" });

const getNames = () =>
  screen.queryAllByRole("listitem").map((item) => item.textContent);

const search = (text: string) =>
  fireEvent.change(getSearch(), { target: { value: text } });

describe("<OrientationList />", () => {
  describe("given the offered orientations", () => {
    it("lists them in the order given, each as a control named by it", () => {
      renderList();

      expect(getNames()).toEqual([
        "Progresywizm",
        "Tradycjonalizm",
        "Interwencjonizm",
        "Wolny rynek",
      ]);
      expect(screen.getByRole("button", { name: "Wolny rynek" })).toBeEnabled();
    });

    it("shows an empty search field over the list", () => {
      renderList();

      expect(getSearch()).toHaveValue("");
      expect(getSearch()).toHaveAttribute("placeholder", "Szukaj po nazwie");
    });
  });

  describe("when a name is searched for", () => {
    it("narrows the list to the orientations whose name contains it", () => {
      renderList();

      search("izm");

      expect(getNames()).toEqual([
        "Progresywizm",
        "Tradycjonalizm",
        "Interwencjonizm",
      ]);
    });

    it("ignores letter case", () => {
      renderList();

      search("WOLNY");

      expect(getNames()).toEqual(["Wolny rynek"]);
    });

    it("ignores the space around what was typed", () => {
      renderList();

      search("  rynek ");

      expect(getNames()).toEqual(["Wolny rynek"]);
    });

    it("lists nothing when no name contains it", () => {
      renderList();

      search("konserwatyzm");

      expect(getNames()).toEqual([]);
    });

    it("lists everything again when the search is cleared", () => {
      renderList();

      search("rynek");
      search("");

      expect(getNames()).toHaveLength(exampleOrientations.length);
    });
  });

  describe("when an orientation is pressed", () => {
    it("says which one was picked", () => {
      const { onPick } = renderList();

      fireEvent.click(screen.getByRole("button", { name: "Interwencjonizm" }));

      expect(onPick).toHaveBeenCalledExactlyOnceWith("interventionism");
    });

    it("picks one of a narrowed list as well", () => {
      const { onPick } = renderList();

      search("trad");
      fireEvent.click(screen.getByRole("button", { name: "Tradycjonalizm" }));

      expect(onPick).toHaveBeenCalledExactlyOnceWith("traditionalism");
    });
  });

  describe("given no orientation", () => {
    it("lists nothing", () => {
      renderList({ orientations: [] });

      expect(getNames()).toEqual([]);
      expect(getSearch()).toBeVisible();
    });
  });
});

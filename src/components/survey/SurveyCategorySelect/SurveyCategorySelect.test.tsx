import { screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { SurveyCategorySelect } from "./SurveyCategorySelect";
import type {
  SurveyCategory,
  SurveyCategorySelectProps,
} from "./SurveyCategorySelect.types";

const CATEGORIES: SurveyCategory[] = [
  { id: "worldview", name: "Światopogląd" },
  { id: "system", name: "Ustrój" },
  { id: "economy", name: "Gospodarka" },
  { id: "foreign", name: "Polityka zagraniczna" },
  { id: "ecology", name: "Ekologia" },
];

const NAMES = CATEGORIES.map((category) => category.name);

const DEFAULT_PROMPT = "Wybierz 3 najważniejsze dla Ciebie tematy.";

const renderSelect = (props: Partial<SurveyCategorySelectProps> = {}) => {
  const onChange = vi.fn();

  renderWithI18n(
    <SurveyCategorySelect
      categories={CATEGORIES}
      selectedIds={[]}
      onChange={onChange}
      {...props}
    />,
  );

  return { onChange };
};

const getRow = (name: string) => screen.getByRole("button", { name });

const getRowNames = () =>
  screen.getAllByRole("button").map((row) => row.textContent);

describe("<SurveyCategorySelect />", () => {
  describe("given no categories are selected", () => {
    it("renders the default prompt with the maxSelection number", () => {
      renderSelect({ maxSelection: 3 });

      expect(screen.getByText(DEFAULT_PROMPT)).toBeInTheDocument();
    });

    it("renders a row for every category, in order", () => {
      renderSelect();

      expect(screen.getAllByRole("listitem")).toHaveLength(CATEGORIES.length);
      expect(getRowNames()).toEqual(NAMES);
    });

    it("renders every row unselected", () => {
      renderSelect();

      for (const name of NAMES) {
        expect(getRow(name)).toHaveAttribute("aria-pressed", "false");
      }
    });

    it("keeps every row enabled", () => {
      renderSelect();

      for (const name of NAMES) {
        expect(getRow(name)).toBeEnabled();
      }
    });
  });

  describe("given maxSelection of 1, 3, 5, 12 and 22", () => {
    it.each([
      [1, "Wybierz 1 najważniejszy dla Ciebie temat."],
      [3, "Wybierz 3 najważniejsze dla Ciebie tematy."],
      [5, "Wybierz 5 najważniejszych dla Ciebie tematów."],
      [12, "Wybierz 12 najważniejszych dla Ciebie tematów."],
      [22, "Wybierz 22 najważniejsze dla Ciebie tematy."],
    ])("uses the right form in the prompt for %d", (maxSelection, prompt) => {
      renderSelect({ maxSelection });

      expect(screen.getByText(prompt)).toBeInTheDocument();
    });
  });

  describe("given some categories are selected (below max)", () => {
    it("renders the matching rows as selected", () => {
      renderSelect({ selectedIds: ["worldview", "economy"], maxSelection: 3 });

      expect(getRow("Światopogląd")).toHaveAttribute("aria-pressed", "true");
      expect(getRow("Gospodarka")).toHaveAttribute("aria-pressed", "true");
      expect(getRow("Ustrój")).toHaveAttribute("aria-pressed", "false");
    });

    it("keeps the unselected rows enabled", () => {
      renderSelect({ selectedIds: ["worldview", "economy"], maxSelection: 3 });

      expect(getRow("Ustrój")).toBeEnabled();
      expect(getRow("Polityka zagraniczna")).toBeEnabled();
      expect(getRow("Ekologia")).toBeEnabled();
    });
  });

  describe("given the selection has reached maxSelection", () => {
    const selectedIds = ["worldview", "system", "economy"];

    it("keeps the selected rows enabled", () => {
      renderSelect({ selectedIds, maxSelection: 3 });

      expect(getRow("Światopogląd")).toBeEnabled();
      expect(getRow("Ustrój")).toBeEnabled();
      expect(getRow("Gospodarka")).toBeEnabled();
    });

    it("disables the unselected rows", () => {
      renderSelect({ selectedIds, maxSelection: 3 });

      expect(getRow("Polityka zagraniczna")).toBeDisabled();
      expect(getRow("Ekologia")).toBeDisabled();
    });
  });

  describe("given a selection longer than maxSelection", () => {
    const selectedIds = ["worldview", "system", "economy"];

    it("disables the unselected rows", () => {
      renderSelect({ selectedIds, maxSelection: 2 });

      expect(getRow("Polityka zagraniczna")).toBeDisabled();
      expect(getRow("Ekologia")).toBeDisabled();
    });

    it("lets a selected row be removed", async () => {
      const user = userEvent.setup();
      const { onChange } = renderSelect({ selectedIds, maxSelection: 2 });

      await user.click(getRow("Ustrój"));

      expect(onChange).toHaveBeenCalledWith(["worldview", "economy"]);
    });
  });

  describe("when a user activates a selected row", () => {
    it("calls onChange with the id removed", async () => {
      const user = userEvent.setup();
      const { onChange } = renderSelect({
        selectedIds: ["worldview", "system"],
        maxSelection: 3,
      });

      await user.click(getRow("Światopogląd"));

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(["system"]);
    });
  });

  describe("when a user activates an unselected row under the limit", () => {
    it("calls onChange with the id appended", async () => {
      const user = userEvent.setup();
      const { onChange } = renderSelect({
        selectedIds: ["worldview"],
        maxSelection: 3,
      });

      await user.click(getRow("Ustrój"));

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(["worldview", "system"]);
    });

    it("works from the keyboard as well", async () => {
      const user = userEvent.setup();
      const { onChange } = renderSelect();

      await user.tab();
      await user.keyboard(" ");

      expect(getRow("Światopogląd")).toHaveFocus();
      expect(onChange).toHaveBeenCalledWith(["worldview"]);
    });
  });

  describe("when a user activates a disabled row", () => {
    it("does not call onChange", async () => {
      const user = userEvent.setup();
      const { onChange } = renderSelect({
        selectedIds: ["worldview", "system", "economy"],
        maxSelection: 3,
      });

      await user.click(getRow("Ekologia"));

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe("given a custom prompt", () => {
    it("renders it instead of the default", () => {
      renderSelect({ prompt: <span>Własny prompt</span> });

      expect(screen.getByText("Własny prompt")).toBeInTheDocument();
      expect(screen.queryByText(DEFAULT_PROMPT)).not.toBeInTheDocument();
    });
  });

  describe("given an invalid maxSelection", () => {
    it.each([
      0,
      -1,
      2.5,
      Number.NaN,
    ])("falls back to 3 for %d", (maxSelection) => {
      renderSelect({
        maxSelection,
        selectedIds: ["worldview", "system", "economy"],
      });

      expect(screen.getByText(DEFAULT_PROMPT)).toBeInTheDocument();
      expect(getRow("Gospodarka")).toBeEnabled();
      expect(getRow("Ekologia")).toBeDisabled();
    });
  });

  describe("given an id in selectedIds that matches no category", () => {
    it("ignores it for display and keeps it out of the limit count", () => {
      renderSelect({
        selectedIds: ["worldview", "ghost", "system"],
        maxSelection: 3,
      });

      expect(getRow("Światopogląd")).toHaveAttribute("aria-pressed", "true");
      expect(getRow("Ustrój")).toHaveAttribute("aria-pressed", "true");
      expect(getRow("Ekologia")).toBeEnabled();
    });

    it("leaves it out of the selection passed to onChange", async () => {
      const user = userEvent.setup();
      const { onChange } = renderSelect({
        selectedIds: ["worldview", "ghost"],
        maxSelection: 3,
      });

      await user.click(getRow("Ekologia"));

      expect(onChange).toHaveBeenCalledWith(["worldview", "ecology"]);
    });
  });

  describe("given the same id twice in selectedIds", () => {
    it("counts it once", () => {
      renderSelect({
        selectedIds: ["worldview", "worldview", "system"],
        maxSelection: 3,
      });

      expect(getRow("Światopogląd")).toHaveAttribute("aria-pressed", "true");
      expect(getRow("Ekologia")).toBeEnabled();
    });

    it("removes it completely when its row is activated", async () => {
      const user = userEvent.setup();
      const { onChange } = renderSelect({
        selectedIds: ["worldview", "worldview", "system"],
        maxSelection: 3,
      });

      await user.click(getRow("Światopogląd"));

      expect(onChange).toHaveBeenCalledWith(["system"]);
    });
  });

  describe("given two categories with the same id", () => {
    it("renders the first one only", () => {
      renderSelect({
        categories: [
          { id: "economy", name: "Gospodarka" },
          { id: "economy", name: "Ekonomia" },
          { id: "ecology", name: "Ekologia" },
        ],
      });

      expect(getRowNames()).toEqual(["Gospodarka", "Ekologia"]);
    });
  });

  describe("given no categories", () => {
    it("renders the prompt alone", () => {
      renderSelect({ categories: [] });

      expect(screen.getByText(DEFAULT_PROMPT)).toBeInTheDocument();
      expect(screen.queryByRole("list")).not.toBeInTheDocument();
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
  });

  describe("given a category name longer than the row", () => {
    it("renders the whole name", () => {
      const name =
        "Bardzo długa nazwa kategorii, która nie mieści się w jednej linii";

      renderSelect({ categories: [{ id: "long", name }] });

      expect(getRow(name)).toHaveTextContent(name);
    });
  });

  describe("accessibility", () => {
    it("names each row after its category", () => {
      renderSelect();

      for (const name of NAMES) {
        expect(getRow(name)).toBeInTheDocument();
      }
    });

    it("exposes the selected state of each row", () => {
      renderSelect({ selectedIds: ["system"] });

      expect(
        screen.getByRole("button", { name: "Ustrój", pressed: true }),
      ).toBeInTheDocument();
      expect(
        screen
          .getAllByRole("button", { pressed: false })
          .map((row) => row.textContent),
      ).toEqual(NAMES.filter((name) => name !== "Ustrój"));
    });

    it("groups the rows under the prompt", () => {
      renderSelect();

      const group = screen.getByRole("group", { name: DEFAULT_PROMPT });

      expect(within(group).getAllByRole("button")).toHaveLength(
        CATEGORIES.length,
      );
    });
  });
});

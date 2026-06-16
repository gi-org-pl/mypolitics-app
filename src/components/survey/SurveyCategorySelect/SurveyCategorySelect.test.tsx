import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SurveyCategorySelect } from "./SurveyCategorySelect";
import type { SurveyCategory } from "./SurveyCategorySelect.types";

vi.mock("@lingui/core/macro", () => ({
  t: (strings: TemplateStringsArray, ...values: unknown[]) =>
    strings.reduce(
      (acc: string, str: string, i: number) => acc + str + (values[i] ?? ""),
      "",
    ),
}));

vi.mock("@lingui/react", () => ({
  useLingui: () => ({}),
}));

const MOCK_CATEGORIES: SurveyCategory[] = [
  { id: "worldview", name: "Światopogląd" },
  { id: "system", name: "Ustrój" },
  { id: "economy", name: "Gospodarka" },
  { id: "foreign", name: "Polityka zagraniczna" },
  { id: "ecology", name: "Ekologia" },
];

describe("<SurveyCategorySelect />", () => {
  describe("given no categories are selected", () => {
    it("renders the default prompt with the maxSelection number", () => {
      render(
        <SurveyCategorySelect
          categories={MOCK_CATEGORIES}
          selectedIds={[]}
          onChange={vi.fn()}
          maxSelection={3}
        />,
      );
      expect(screen.getByText(/3/)).toBeInTheDocument();
    });

    it("renders a Checkbox for every category", () => {
      render(
        <SurveyCategorySelect
          categories={MOCK_CATEGORIES}
          selectedIds={[]}
          onChange={vi.fn()}
        />,
      );
      const checkboxes = screen.getAllByRole("checkbox");
      expect(checkboxes).toHaveLength(MOCK_CATEGORIES.length);
    });

    it("renders every Checkbox unchecked", () => {
      render(
        <SurveyCategorySelect
          categories={MOCK_CATEGORIES}
          selectedIds={[]}
          onChange={vi.fn()}
        />,
      );
      const checkboxes = screen.getAllByRole("checkbox");
      for (const checkbox of checkboxes) {
        expect(checkbox).not.toBeChecked();
      }
    });
  });

  describe("given some categories are selected (below max)", () => {
    it("renders the matching Checkboxes as checked", () => {
      render(
        <SurveyCategorySelect
          categories={MOCK_CATEGORIES}
          selectedIds={["worldview", "economy"]}
          onChange={vi.fn()}
          maxSelection={3}
        />,
      );
      expect(screen.getByLabelText("Światopogląd")).toBeChecked();
      expect(screen.getByLabelText("Gospodarka")).toBeChecked();
    });

    it("keeps the unselected Checkboxes enabled", () => {
      render(
        <SurveyCategorySelect
          categories={MOCK_CATEGORIES}
          selectedIds={["worldview"]}
          onChange={vi.fn()}
          maxSelection={3}
        />,
      );
      expect(screen.getByLabelText("Ustrój")).not.toBeDisabled();
      expect(screen.getByLabelText("Ekologia")).not.toBeDisabled();
    });
  });

  describe("given the selection has reached maxSelection", () => {
    it("keeps already-selected Checkboxes enabled", () => {
      render(
        <SurveyCategorySelect
          categories={MOCK_CATEGORIES}
          selectedIds={["worldview", "system", "economy"]}
          onChange={vi.fn()}
          maxSelection={3}
        />,
      );
      expect(screen.getByLabelText("Światopogląd")).not.toBeDisabled();
      expect(screen.getByLabelText("Ustrój")).not.toBeDisabled();
      expect(screen.getByLabelText("Gospodarka")).not.toBeDisabled();
    });

    it("renders the unselected Checkboxes as visually disabled", () => {
      render(
        <SurveyCategorySelect
          categories={MOCK_CATEGORIES}
          selectedIds={["worldview", "system", "economy"]}
          onChange={vi.fn()}
          maxSelection={3}
        />,
      );
      expect(screen.getByLabelText("Polityka zagraniczna")).toBeDisabled();
      expect(screen.getByLabelText("Ekologia")).toBeDisabled();
    });
  });

  describe("when a user toggles an already-selected category off", () => {
    it("calls onChange with the id removed", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <SurveyCategorySelect
          categories={MOCK_CATEGORIES}
          selectedIds={["worldview", "system"]}
          onChange={handleChange}
          maxSelection={3}
        />,
      );

      await user.click(screen.getByLabelText("Światopogląd"));
      expect(handleChange).toHaveBeenCalledWith(["system"]);
    });
  });

  describe("when a user toggles an unselected category on (under the limit)", () => {
    it("calls onChange with the id appended", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <SurveyCategorySelect
          categories={MOCK_CATEGORIES}
          selectedIds={["worldview"]}
          onChange={handleChange}
          maxSelection={3}
        />,
      );

      await user.click(screen.getByLabelText("Ustrój"));
      expect(handleChange).toHaveBeenCalledWith(["worldview", "system"]);
    });
  });

  describe("when a user toggles an unselected category on (at the limit)", () => {
    it("does not call onChange", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <SurveyCategorySelect
          categories={MOCK_CATEGORIES}
          selectedIds={["worldview", "system", "economy"]}
          onChange={handleChange}
          maxSelection={3}
        />,
      );

      await user.click(screen.getByLabelText("Ekologia"));
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe("given a custom prompt prop", () => {
    it("renders the custom prompt instead of the default", () => {
      render(
        <SurveyCategorySelect
          categories={MOCK_CATEGORIES}
          selectedIds={[]}
          onChange={vi.fn()}
          prompt={<span>Własny prompt</span>}
        />,
      );
      expect(screen.getByText("Własny prompt")).toBeInTheDocument();
    });
  });
});
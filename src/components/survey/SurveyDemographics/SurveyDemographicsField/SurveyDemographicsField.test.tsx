import { fireEvent, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";

import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import type { DemographicsOption } from "../SurveyDemographics.types";
import { SurveyDemographicsField } from "./SurveyDemographicsField";

const options: DemographicsOption[] = [
  { value: "male", label: "Mężczyzna" },
  { value: "female", label: "Kobieta" },
  { value: "other", label: "Inna płeć" },
];

const renderField = (
  props: Partial<ComponentProps<typeof SurveyDemographicsField>> = {},
) => {
  const onChange = vi.fn();
  renderWithI18n(
    <SurveyDemographicsField
      name="Płeć"
      width="half"
      options={options}
      onChange={onChange}
      {...props}
    />,
  );

  return { onChange, field: screen.getByRole("button", { name: "Płeć" }) };
};

const open = (field: HTMLElement) => {
  field.focus();
  fireEvent.keyDown(field, { key: "Enter" });
};

describe("<SurveyDemographicsField />", () => {
  describe("given no value", () => {
    it("shows the field name", () => {
      const { field } = renderField();

      expect(field).toHaveTextContent("Płeć");
    });

    it("has no description", () => {
      const { field } = renderField();

      expect(field).not.toHaveAttribute("aria-describedby");
    });
  });

  describe("given a value that matches an option", () => {
    it("shows the option label", () => {
      const { field } = renderField({ value: "female" });

      expect(field).toHaveTextContent("Kobieta");
      expect(field).not.toHaveTextContent("Płeć");
    });

    it("is still named after the field", () => {
      const { field } = renderField({ value: "female" });

      expect(field).toHaveAccessibleName("Płeć");
    });

    it("is described by the chosen label", () => {
      const { field } = renderField({ value: "female" });

      expect(field).toHaveAccessibleDescription("Kobieta");
    });
  });

  describe("given a value that matches no option", () => {
    it("shows the field name", () => {
      const { field } = renderField({ value: "unknown" });

      expect(field).toHaveTextContent("Płeć");
      expect(field).not.toHaveAttribute("aria-describedby");
    });
  });

  describe("given two options with the same value", () => {
    it("shows the label of the first one", () => {
      const { field } = renderField({
        options: [
          { value: "same", label: "Pierwsza" },
          { value: "same", label: "Druga" },
        ],
        value: "same",
      });

      expect(field).toHaveTextContent("Pierwsza");
    });
  });

  describe("given an empty option list", () => {
    it("is disabled", () => {
      const { field } = renderField({ options: [] });

      expect(field).toHaveAttribute("aria-disabled", "true");
      expect(field).toHaveAttribute("tabindex", "-1");
    });

    it("does not open", () => {
      const { field } = renderField({ options: [] });

      open(field);

      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });
  });

  describe("given isDisabled", () => {
    it("is disabled", () => {
      const { field } = renderField({ isDisabled: true });

      expect(field).toHaveAttribute("aria-disabled", "true");
    });

    it("does not open", () => {
      const { field } = renderField({ isDisabled: true });

      open(field);

      expect(screen.queryByRole("menuitem")).not.toBeInTheDocument();
    });
  });

  describe("given it can be used", () => {
    it("is not marked as disabled", () => {
      const { field } = renderField();

      expect(field).toHaveAttribute("aria-disabled", "false");
      expect(field).toHaveAttribute("tabindex", "0");
    });

    it("draws a visible outline when focused with the keyboard", () => {
      const { field } = renderField();

      expect(field).toHaveClass(
        "focus-visible:outline-2",
        "focus-visible:outline-offset-2",
        "focus-visible:outline-gi-primary",
      );
    });
  });

  describe("given the half width", () => {
    it("takes one column of the row", () => {
      const { field } = renderField({ width: "half" });

      expect(field.closest(".col-span-1")).toBeInTheDocument();
    });
  });

  describe("given the full width", () => {
    it("takes the whole row", () => {
      const { field } = renderField({ width: "full" });

      expect(field.closest(".col-span-2")).toBeInTheDocument();
    });
  });

  describe("when opened", () => {
    it("lists the options in the order given", () => {
      const { field } = renderField();

      open(field);

      expect(
        screen.getAllByRole("menuitem").map((item) => item.textContent),
      ).toEqual(["Mężczyzna", "Kobieta", "Inna płeć"]);
    });

    it("does not call its handler", () => {
      const { field, onChange } = renderField();

      open(field);

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe("when an option is activated", () => {
    it("calls its handler with the option value", () => {
      const { field, onChange } = renderField();

      open(field);
      fireEvent.click(screen.getByRole("menuitem", { name: "Kobieta" }));

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith("female");
    });

    it("closes the list", () => {
      const { field } = renderField();

      open(field);
      fireEvent.click(screen.getByRole("menuitem", { name: "Kobieta" }));

      expect(screen.queryByRole("menuitem")).not.toBeInTheDocument();
    });
  });
});

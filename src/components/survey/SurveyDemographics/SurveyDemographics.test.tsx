import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { DemographicsValues } from "@/types/survey";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { SurveyDemographics } from "./SurveyDemographics";
import type { SurveyDemographicsProps } from "./SurveyDemographics.types";

const FIELD_NAMES = [
  "Wiek",
  "Płeć",
  "Wielkość miejsca zamieszkania",
  "Wykształcenie",
];

const options: SurveyDemographicsProps["options"] = {
  age: [
    { value: "18_24", label: "18–24" },
    { value: "25_34", label: "25–34" },
  ],
  gender: [
    { value: "male", label: "Mężczyzna" },
    { value: "female", label: "Kobieta" },
  ],
  residenceAreaSize: [
    { value: "village", label: "Wieś" },
    { value: "city", label: "Miasto" },
  ],
  education: [
    { value: "secondary", label: "Średnie" },
    { value: "higher", label: "Wyższe" },
  ],
};

const renderDemographics = (props: Partial<SurveyDemographicsProps> = {}) => {
  const onChange = vi.fn();
  renderWithI18n(
    <SurveyDemographics
      options={options}
      values={{}}
      onChange={onChange}
      {...props}
    />,
  );

  return { onChange };
};

const getField = (name: string) => screen.getByRole("button", { name });

const getFields = () => FIELD_NAMES.map(getField);

const choose = (fieldName: string, optionLabel: string) => {
  const field = getField(fieldName);

  field.focus();
  fireEvent.keyDown(field, { key: "Enter" });
  fireEvent.click(screen.getByRole("menuitem", { name: optionLabel }));
};

const openDialog = () => {
  const control = getField("To znaczy?");

  control.focus();
  fireEvent.click(control);

  return control;
};

const finishClosing = () =>
  fireEvent.transitionEnd(
    screen.getByRole("dialog").parentElement as HTMLElement,
  );

describe("<SurveyDemographics />", () => {
  describe("given no values", () => {
    it("renders the four fields in order, each showing its name", () => {
      renderDemographics();

      const fields = screen.getAllByRole("button").slice(0, FIELD_NAMES.length);

      expect(fields.map((field) => field.textContent)).toEqual(FIELD_NAMES);
      expect(fields).toEqual(getFields());
    });

    it("renders no region field", () => {
      renderDemographics();

      expect(
        screen.queryByRole("button", { name: "Województwo" }),
      ).not.toBeInTheDocument();
      expect(screen.getAllByRole("button")).toHaveLength(
        FIELD_NAMES.length + 1,
      );
    });

    it("renders the header and the info sentence", () => {
      renderDemographics();

      expect(
        screen.getByRole("heading", { name: "Twoja tożsamość" }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /Powyższe dane w przyszłości pozwolą Ci porównać się z innymi!/,
        ),
      ).toBeInTheDocument();
    });

    it("keeps the dialog closed", () => {
      renderDemographics();

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("given values", () => {
    it("shows the chosen label in each field", () => {
      renderDemographics({
        values: {
          age: "25_34",
          gender: "female",
          residenceAreaSize: "village",
          education: "higher",
        },
      });

      expect(getFields().map((field) => field.textContent)).toEqual([
        "25–34",
        "Kobieta",
        "Wieś",
        "Wyższe",
      ]);
    });
  });

  describe("given a value that matches no option of its field", () => {
    it("shows the field name", () => {
      renderDemographics({ values: { age: "25_34", gender: "village" } });

      expect(getField("Wiek")).toHaveTextContent("25–34");
      expect(getField("Płeć")).toHaveTextContent("Płeć");
    });

    it("passes it back untouched when another field is chosen", () => {
      const { onChange } = renderDemographics({
        values: { gender: "village" },
      });

      choose("Wiek", "18–24");

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange.mock.calls[0][0]).toStrictEqual({
        age: "18_24",
        gender: "village",
      });
    });
  });

  describe("given a field with an empty option list", () => {
    it("disables that field only", () => {
      renderDemographics({ options: { ...options, education: [] } });

      expect(getField("Wykształcenie")).toHaveAttribute(
        "aria-disabled",
        "true",
      );
      expect(getField("Wiek")).toHaveAttribute("aria-disabled", "false");
    });
  });

  describe("when an option is chosen", () => {
    it("calls onChange with the other values kept and this one added", () => {
      const { onChange } = renderDemographics({
        values: { age: "18_24", education: "higher" },
      });

      choose("Płeć", "Kobieta");

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith({
        age: "18_24",
        gender: "female",
        education: "higher",
      });
    });

    it("closes the list", () => {
      renderDemographics();

      choose("Płeć", "Kobieta");

      expect(screen.queryByRole("menuitem")).not.toBeInTheDocument();
    });

    it("keeps showing what the parent passes", () => {
      renderDemographics();

      choose("Płeć", "Kobieta");

      expect(getField("Płeć")).toHaveTextContent("Płeć");
    });
  });

  describe("when a different option is chosen for a filled field", () => {
    it("calls onChange with the value replaced", () => {
      const { onChange } = renderDemographics({
        values: { age: "18_24", gender: "male" },
      });

      choose("Płeć", "Kobieta");

      expect(onChange).toHaveBeenCalledWith({
        age: "18_24",
        gender: "female",
      });
    });
  });

  describe("given a key that is not one of the four fields", () => {
    it("does not pass it back through onChange", () => {
      const { onChange } = renderDemographics({
        values: { age: "18_24", region: "mazowieckie" } as DemographicsValues,
      });

      choose("Płeć", "Kobieta");

      expect(onChange.mock.calls[0][0]).toStrictEqual({
        age: "18_24",
        gender: "female",
      });
    });
  });

  describe("given isDisabled", () => {
    it("disables every field", () => {
      renderDemographics({ isDisabled: true });

      for (const field of getFields()) {
        expect(field).toHaveAttribute("aria-disabled", "true");
      }
    });

    it("does not open a field", () => {
      renderDemographics({ isDisabled: true });

      const field = getField("Płeć");
      field.focus();
      fireEvent.keyDown(field, { key: "Enter" });

      expect(screen.queryByRole("menuitem")).not.toBeInTheDocument();
    });

    it('keeps "To znaczy?" working', () => {
      renderDemographics({ isDisabled: true });

      openDialog();

      expect(
        screen.getByRole("dialog", { name: "Zakres wykorzystania danych" }),
      ).toBeInTheDocument();
    });
  });

  describe('when "To znaczy?" is activated', () => {
    it("opens the dialog", () => {
      renderDemographics();

      openDialog();

      expect(
        screen.getByRole("dialog", { name: "Zakres wykorzystania danych" }),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Twoje dane pozostaną całkowicie anonimowe."),
      ).toBeInTheDocument();
    });

    it("does not call onChange", () => {
      const { onChange } = renderDemographics();

      openDialog();

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe("when the dialog is dismissed", () => {
    it("closes it on the close button", () => {
      renderDemographics();
      openDialog();

      fireEvent.click(screen.getByRole("button", { name: "Close modal" }));
      finishClosing();

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("closes it on Escape", () => {
      renderDemographics();
      openDialog();

      fireEvent.keyDown(document, { key: "Escape" });
      finishClosing();

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("closes it on the overlay", () => {
      renderDemographics();
      openDialog();

      fireEvent.click(screen.getByRole("dialog").parentElement as HTMLElement);
      finishClosing();

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it('returns focus to "To znaczy?"', () => {
      renderDemographics();
      const control = openDialog();

      expect(control).not.toHaveFocus();

      fireEvent.keyDown(document, { key: "Escape" });

      expect(control).toHaveFocus();
    });

    it("does not call onChange", () => {
      const { onChange } = renderDemographics({ values: { age: "18_24" } });
      openDialog();

      fireEvent.keyDown(document, { key: "Escape" });
      finishClosing();

      expect(onChange).not.toHaveBeenCalled();
    });

    it("keeps the values shown", () => {
      renderDemographics({ values: { age: "18_24" } });
      openDialog();

      fireEvent.keyDown(document, { key: "Escape" });
      finishClosing();

      expect(getField("Wiek")).toHaveTextContent("18–24");
    });
  });
});

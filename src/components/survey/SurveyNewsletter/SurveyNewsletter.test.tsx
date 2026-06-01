import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";
import SurveyNewsletter from "./SurveyNewsletter";

vi.mock("@lingui/macro", () => ({
  t: (chunks: TemplateStringsArray | string) =>
    typeof chunks === "string" ? chunks : chunks.join(""),
  msg: (chunks: TemplateStringsArray | string) =>
    typeof chunks === "string" ? chunks : chunks.join(""),
}));

describe("SurveyNewsletter", () => {
  const defaultProps = {
    email: "",
    onEmailChange: vi.fn(),
    consent: false,
    onConsentChange: vi.fn(),
  };

  describe("given the component is rendered with initial values", () => {
    it("displays the provided email value in the input", () => {
      renderWithI18n(<SurveyNewsletter {...defaultProps} email="test@example.com" />);

      const emailInput = screen.getByRole("textbox");
      expect(emailInput).toHaveValue("test@example.com");
    });

    it("reflects the provided consent state in the checkbox", () => {
      renderWithI18n(<SurveyNewsletter {...defaultProps} consent={true} />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeChecked();
    });

    it("renders the form structure correctly and does not render any submit button", () => {
      renderWithI18n(<SurveyNewsletter {...defaultProps} />);

      expect(screen.getByRole("textbox")).toBeInTheDocument();
      expect(screen.getByRole("checkbox")).toBeInTheDocument();

      const submitButton = screen.queryByRole("button");
      expect(submitButton).not.toBeInTheDocument();
    });
  });

  describe("when the user types in the email input", () => {
    it("calls onEmailChange with the new value", async () => {
      const onEmailChangeMock = vi.fn();
      renderWithI18n(
        <SurveyNewsletter
          {...defaultProps}
          onEmailChange={onEmailChangeMock}
        />,
      );

      const emailInput = screen.getByRole("textbox");

      await userEvent.type(emailInput, "x");

      expect(onEmailChangeMock).toHaveBeenCalledWith("x");
    });
  });

  describe("when the user toggles the consent checkbox", () => {
    it("calls onConsentChange with the new value", async () => {
      const onConsentChangeMock = vi.fn();
      renderWithI18n(
        <SurveyNewsletter
          {...defaultProps}
          consent={false}
          onConsentChange={onConsentChangeMock}
        />,
      );

      const checkbox = screen.getByRole("checkbox");

      await userEvent.click(checkbox);

      expect(onConsentChangeMock).toHaveBeenCalledWith(true);
    });
  });
});

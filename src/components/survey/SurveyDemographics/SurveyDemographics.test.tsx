import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import SurveyDemographics from "./SurveyDemographics";

const renderWithI18n = (ui: React.ReactElement) => {
  return render(<I18nProvider i18n={i18n}>{ui}</I18nProvider>);
};

const fillRequiredFields = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByLabelText("Wiek"));
  await user.click(screen.getByText("25"));

  await user.click(screen.getByLabelText("Płeć"));
  await user.click(screen.getByText("Kobieta"));

  await user.click(screen.getByLabelText("Wielkość miejsca zamieszkania"));
  await user.click(screen.getByText("Wieś"));

  await user.click(screen.getByLabelText("Wykształcenie"));
  await user.click(screen.getByText("Wykształcenie wyższe"));
};

describe("<SurveyDemographics />", () => {
  describe("when all required fields are filled via ActionList", () => {
    it("enables the submit button", async () => {
      const user = userEvent.setup();
      renderWithI18n(
        <SurveyDemographics onSubmit={vi.fn()} onSkip={vi.fn()} />,
      );

      await fillRequiredFields(user);

      expect(
        screen.getByRole("button", { name: /zobacz wyniki/i }),
      ).not.toBeDisabled();
    });
  });

  describe('when "To znaczy?" link is clicked', () => {
    it("opens the modal", async () => {
      const user = userEvent.setup();
      renderWithI18n(
        <SurveyDemographics onSubmit={vi.fn()} onSkip={vi.fn()} />,
      );

      await user.click(screen.getByText(/to znaczy/i));

      const modal = await screen.findByRole("dialog");
      expect(modal).toBeInTheDocument();
      expect(
        screen.getByText(/zakres wykorzystania danych/i),
      ).toBeInTheDocument();
    });
  });
});

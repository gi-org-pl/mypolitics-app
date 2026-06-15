import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { DemographicsInput } from "../SurveyDemographics.types";
import SurveyDemographicsContent from "./SurveyDemographicsContent";

const defaultMockValue: DemographicsInput = {
  age: null,
  gender: null,
  residenceAreaSize: null,
  education: null,
  region: "",
};

const renderWithI18n = (ui: React.ReactElement) => {
  return render(<I18nProvider i18n={i18n}>{ui}</I18nProvider>);
};

describe("<SurveyDemographicsContent />", () => {
  describe("given rendered", () => {
    it("renders custom triggers for each demographic field", () => {
      const handleChange = vi.fn();
      const { container } = renderWithI18n(
        <SurveyDemographicsContent
          value={defaultMockValue}
          handleChange={handleChange}
          onLearnMoreClick={vi.fn()}
        />,
      );

      expect(container.querySelector("#age")).toBeInTheDocument();
      expect(container.querySelector("#gender")).toBeInTheDocument();
      expect(container.querySelector("#residenceAreaSize")).toBeInTheDocument();
      expect(container.querySelector("#education")).toBeInTheDocument();
      expect(container.querySelector("#region")).toBeInTheDocument();
    });
  });

  describe("when an action item is clicked", () => {
    it("opens dropdown and calls handleChange with correct parameters", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      const { container } = renderWithI18n(
        <SurveyDemographicsContent
          value={defaultMockValue}
          handleChange={handleChange}
          onLearnMoreClick={vi.fn()}
        />,
      );

      const genderTrigger = container.querySelector("#gender") as HTMLElement;
      await user.click(genderTrigger);

      const maleOption = await screen.findByText("Mężczyzna");
      await user.click(maleOption);

      expect(handleChange).toHaveBeenCalledWith("gender", "male");
    });
  });
});

import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { SurveyDemographicsInfo } from "./SurveyDemographicsInfo";

const renderInfo = () => {
  const onExplain = vi.fn();
  renderWithI18n(<SurveyDemographicsInfo onExplain={onExplain} />);

  return { onExplain };
};

describe("<SurveyDemographicsInfo />", () => {
  describe("when rendered", () => {
    it("renders the sentence", () => {
      renderInfo();

      expect(
        screen.getByText(
          /Powyższe dane w przyszłości pozwolą Ci porównać się z innymi!/,
        ),
      ).toBeInTheDocument();
    });

    it('renders "To znaczy?" as a button that announces a dialog', () => {
      renderInfo();

      const control = screen.getByRole("button", { name: "To znaczy?" });

      expect(control).toHaveAttribute("type", "button");
      expect(control).toHaveAttribute("aria-haspopup", "dialog");
    });

    it("does not call its handler", () => {
      const { onExplain } = renderInfo();

      expect(onExplain).not.toHaveBeenCalled();
    });
  });

  describe('when "To znaczy?" is activated', () => {
    it("calls its handler once", () => {
      const { onExplain } = renderInfo();

      fireEvent.click(screen.getByRole("button", { name: "To znaczy?" }));

      expect(onExplain).toHaveBeenCalledTimes(1);
    });
  });
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import SurveyDemographics from "./SurveyDemographics";

// Helper: fill all required fields via the underlying selects
const fillRequiredFields = async (user: ReturnType<typeof userEvent.setup>) => {
  // Age
  await user.click(screen.getByLabelText("Wiek"));
  await user.click(await screen.findByRole("option", { name: "25" }));

  // Gender
  await user.click(screen.getByLabelText("Płeć"));
  await user.click(await screen.findByRole("option", { name: "Kobieta" }));

  // Residence area size
  await user.click(screen.getByLabelText("Wielkość miejsca zamieszkania"));
  await user.click(await screen.findByRole("option", { name: "Wieś" }));

  // Education
  await user.click(screen.getByLabelText("Wykształcenie"));
  await user.click(
    await screen.findByRole("option", { name: "Wykształcenie wyższe" })
  );
};

describe("<SurveyDemographics />", () => {
  describe("given no demographic fields are filled", () => {
    it("disables the primary submit button", () => {
      render(
        <SurveyDemographics onSubmit={vi.fn()} onSkip={vi.fn()} />
      );
      expect(
        screen.getByRole("button", { name: /zobacz wyniki/i })
      ).toBeDisabled();
    });

    it("does not disable the skip button", () => {
      render(
        <SurveyDemographics onSubmit={vi.fn()} onSkip={vi.fn()} />
      );
      expect(screen.getByRole("button", { name: /pomiń/i })).toBeEnabled();
    });
  });

  describe("given all required demographic fields are filled", () => {
    it("enables the primary submit button", async () => {
      const user = userEvent.setup();
      render(
        <SurveyDemographics onSubmit={vi.fn()} onSkip={vi.fn()} />
      );

      await fillRequiredFields(user);

      expect(
        screen.getByRole("button", { name: /zobacz wyniki/i })
      ).toBeEnabled();
    });
  });

  describe("when the primary button is clicked", () => {
    it("calls onSubmit with the current demographics object", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<SurveyDemographics onSubmit={onSubmit} onSkip={vi.fn()} />);

      await fillRequiredFields(user);
      await user.click(screen.getByRole("button", { name: /zobacz wyniki/i }));

      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          age: 25,
          gender: "female",
          residenceAreaSize: "village",
          education: "higher",
        })
      );
    });
  });

  describe("when the skip button is clicked", () => {
    it("calls onSkip", async () => {
      const user = userEvent.setup();
      const onSkip = vi.fn();
      render(<SurveyDemographics onSubmit={vi.fn()} onSkip={onSkip} />);

      await user.click(screen.getByRole("button", { name: /pomiń/i }));

      expect(onSkip).toHaveBeenCalledOnce();
    });
  });

  describe("when isLoading is true", () => {
    it("disables both buttons", () => {
      render(
        <SurveyDemographics
          
          onSubmit={vi.fn()}
          onSkip={vi.fn()}
        />
      );
      expect(
        screen.getByRole("button", { name: /zobacz wyniki/i })
      ).toBeDisabled();
      expect(screen.getByRole("button", { name: /pomiń/i })).toBeDisabled();
    });

    it("shows loading state on both buttons", () => {
      render(
        <SurveyDemographics
          
          onSubmit={vi.fn()}
          onSkip={vi.fn()}
        />
      );
      // Athena Button renders aria-busy when loading
      const submitBtn = screen.getByRole("button", { name: /zobacz wyniki/i });
      const skipBtn = screen.getByRole("button", { name: /pomiń/i });
      expect(submitBtn).toHaveAttribute("aria-busy", "true");
      expect(skipBtn).toHaveAttribute("aria-busy", "true");
    });
  });

  describe('when "To znaczy?" link is clicked', () => {
    it("opens the modal", async () => {
      const user = userEvent.setup();
      render(<SurveyDemographics onSubmit={vi.fn()} onSkip={vi.fn()} />);

      await user.click(screen.getByRole("button", { name: /to znaczy/i }));

      expect(
        await screen.findByRole("dialog", { name: /zakres wykorzystania danych/i })
      ).toBeInTheDocument();
    });
  });

  describe("when the modal is closed", () => {
    it("hides the modal", async () => {
      const user = userEvent.setup();
      render(<SurveyDemographics onSubmit={vi.fn()} onSkip={vi.fn()} />);

      await user.click(screen.getByRole("button", { name: /to znaczy/i }));
      // Dialog should be visible
      expect(
        await screen.findByRole("dialog", { name: /zakres wykorzystania danych/i })
      ).toBeInTheDocument();

      // Close via the close button rendered by shadcn DialogContent
      await user.click(screen.getByRole("button", { name: /close/i }));

      expect(
        screen.queryByRole("dialog", { name: /zakres wykorzystania danych/i })
      ).not.toBeInTheDocument();
    });
  });
});
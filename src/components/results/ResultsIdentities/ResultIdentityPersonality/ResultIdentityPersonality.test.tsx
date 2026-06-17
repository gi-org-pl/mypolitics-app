import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";
import { ResultIdentityPersonality } from "./ResultIdentityPersonality";
import type { IdentityInfoElement } from "./ResultIdentityPersonality.types";

const mockIdentity: IdentityInfoElement = {
  id: "1",
  name: "Test Name",
  shortDescription: "Short Desc",
  description: "Long Desc",
  imageUrl: "https://example.com/image.jpg",
  agreementPercent: 66.6,
  slogan: "Slogan",
};

describe("<ResultIdentityPersonality />", () => {
  describe("given a title prop", () => {
    it("renders the provided title before the percent", () => {
      renderWithI18n(
        <ResultIdentityPersonality
          identity={mockIdentity}
          mode="modal"
          title="Custom Title"
        />,
      );
      expect(screen.getByText(/Custom Title/)).toBeInTheDocument();
    });
  });

  describe("given no title prop", () => {
    it("renders the default neutral label", () => {
      renderWithI18n(
        <ResultIdentityPersonality identity={mockIdentity} mode="modal" />,
      );
      expect(screen.getByText(/Tożsamość/)).toBeInTheDocument();
    });
  });

  describe("given agreementPercent", () => {
    it("renders the percent with one decimal place", () => {
      renderWithI18n(
        <ResultIdentityPersonality
          identity={{ ...mockIdentity, agreementPercent: 66.6 }}
          mode="modal"
        />,
      );
      expect(screen.getByText(/\(66.6%\)/)).toBeInTheDocument();
    });

    it("formats whole number percents with .0", () => {
      renderWithI18n(
        <ResultIdentityPersonality
          identity={{ ...mockIdentity, agreementPercent: 12 }}
          mode="modal"
        />,
      );
      expect(screen.getByText(/\(12.0%\)/)).toBeInTheDocument();
    });

    it("clamps values below 0 and above 100", () => {
      const { rerender } = renderWithI18n(
        <ResultIdentityPersonality
          identity={{ ...mockIdentity, agreementPercent: -10 }}
          mode="modal"
        />,
      );
      expect(screen.getByText(/\(0.0%\)/)).toBeInTheDocument();

      rerender(
        <I18nProvider i18n={i18n}>
          <ResultIdentityPersonality
            identity={{ ...mockIdentity, agreementPercent: 150 }}
            mode="modal"
          />
        </I18nProvider>,
      );
      expect(screen.getByText(/\(100.0%\)/)).toBeInTheDocument();
    });
  });

  describe('given mode "expanded"', () => {
    it("shows a chevron-down when not expanded", () => {
      renderWithI18n(
        <ResultIdentityPersonality
          identity={mockIdentity}
          mode="expanded"
          expanded={false}
        />,
      );
      expect(screen.getByLabelText(/Rozwiń/)).toBeInTheDocument();
    });

    it("shows a chevron-up when expanded", () => {
      renderWithI18n(
        <ResultIdentityPersonality
          identity={mockIdentity}
          mode="expanded"
          expanded={true}
        />,
      );
      expect(screen.getByLabelText(/Zwiń/)).toBeInTheDocument();
    });

    it("calls onToggleExpanded on button click", async () => {
      const onToggleExpanded = vi.fn();
      const user = userEvent.setup();
      renderWithI18n(
        <ResultIdentityPersonality
          identity={mockIdentity}
          mode="expanded"
          onToggleExpanded={onToggleExpanded}
        />,
      );

      await user.click(screen.getByRole("button"));
      expect(onToggleExpanded).toHaveBeenCalledTimes(1);
    });

    it("renders only description when expanded and hides short description", () => {
      renderWithI18n(
        <ResultIdentityPersonality
          identity={mockIdentity}
          mode="expanded"
          expanded={true}
        />,
      );

      expect(
        screen.queryByText(`"${mockIdentity.slogan}"`),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(mockIdentity.shortDescription),
      ).not.toBeInTheDocument();
      expect(screen.getByText(mockIdentity.description)).toBeInTheDocument();
    });

    it("renders short description when collapsed", () => {
      renderWithI18n(
        <ResultIdentityPersonality
          identity={mockIdentity}
          mode="expanded"
          expanded={false}
        />,
      );

      expect(
        screen.getByText(mockIdentity.shortDescription),
      ).toBeInTheDocument();
      expect(
        screen.queryByText(mockIdentity.description),
      ).not.toBeInTheDocument();
    });
  });

  describe('given mode "modal"', () => {
    it("shows the info icon", () => {
      renderWithI18n(
        <ResultIdentityPersonality identity={mockIdentity} mode="modal" />,
      );
      expect(screen.getByLabelText(/Szczegóły/)).toBeInTheDocument();
    });

    it("does not render descriptions inline in modal mode initially", () => {
      renderWithI18n(
        <ResultIdentityPersonality identity={mockIdentity} mode="modal" />,
      );
      expect(
        screen.queryByText(mockIdentity.shortDescription),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(mockIdentity.description),
      ).not.toBeInTheDocument();
    });

    it("calls onToggleModal on button click", async () => {
      const onToggleModal = vi.fn();
      const user = userEvent.setup();
      renderWithI18n(
        <ResultIdentityPersonality
          identity={mockIdentity}
          mode="modal"
          onToggleModal={onToggleModal}
        />,
      );

      await user.click(screen.getByRole("button"));
      expect(onToggleModal).toHaveBeenCalledTimes(1);
    });

    it("renders modal content after clicking info button and can be closed", async () => {
      const user = userEvent.setup();
      renderWithI18n(
        <ResultIdentityPersonality identity={mockIdentity} mode="modal" />,
      );

      await user.click(screen.getByRole("button"));

      // Modal content should now be visible
      expect(screen.getByText(mockIdentity.shortDescription)).toBeInTheDocument();
      expect(screen.getAllByText(mockIdentity.name).length).toBeGreaterThan(0);

      // Close the modal
      await user.click(screen.getByLabelText(/Close modal/));
    });

    it("can expand internal content in modal (swaps description)", async () => {
      const user = userEvent.setup();
      renderWithI18n(
        <ResultIdentityPersonality identity={mockIdentity} mode="modal" />,
      );

      await user.click(screen.getByRole("button"));

      // Initially shows short description
      expect(screen.getByText(mockIdentity.shortDescription)).toBeInTheDocument();
      expect(screen.queryByText(mockIdentity.description)).not.toBeInTheDocument();

      // Find the expansion button inside the modal
      const expandButton = screen.getAllByRole("button", { name: /Rozwiń/ })[0];
      await user.click(expandButton);

      // Should now show long description and hide short description
      expect(screen.getByText(mockIdentity.description)).toBeInTheDocument();
      expect(screen.queryByText(mockIdentity.shortDescription)).not.toBeInTheDocument();

      // Collapse it back
      await user.click(screen.getByRole("button", { name: /Zwiń/ }));
      expect(screen.getByText(mockIdentity.shortDescription)).toBeInTheDocument();
      expect(screen.queryByText(mockIdentity.description)).not.toBeInTheDocument();
    });
  });

  describe("given an imageUrl", () => {
    it("renders the avatar with alt set to name", () => {
      renderWithI18n(
        <ResultIdentityPersonality identity={mockIdentity} mode="modal" />,
      );
      expect(screen.getByLabelText(/Test Name/)).toBeInTheDocument();
    });
  });

  describe("given no imageUrl", () => {
    it("renders the fallback personality icon", () => {
      renderWithI18n(
        <ResultIdentityPersonality
          identity={{ ...mockIdentity, imageUrl: "" }}
          mode="modal"
        />,
      );
      const img = screen.getByRole("img", { name: /Test Name/ }).querySelector("img");
      expect(img).toHaveAttribute("src", expect.stringContaining("icon.png"));
    });
  });
});

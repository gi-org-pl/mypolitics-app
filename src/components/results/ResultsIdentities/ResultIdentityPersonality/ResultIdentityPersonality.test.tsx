import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ResultIdentityPersonality } from "./ResultIdentityPersonality";
import type { IdentityInfoElement } from "./ResultIdentityPersonality.types";

vi.mock("@lingui/react/macro", () => ({
  Trans: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("@lingui/core/macro", () => ({
  t: (strings: TemplateStringsArray) => strings[0],
}));

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
      render(
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
      render(
        <ResultIdentityPersonality identity={mockIdentity} mode="modal" />,
      );
      expect(screen.getByText(/Tożsamość/)).toBeInTheDocument();
    });
  });

  describe("given agreementPercent", () => {
    it("renders the rounded percent", () => {
      render(
        <ResultIdentityPersonality
          identity={{ ...mockIdentity, agreementPercent: 66.6 }}
          mode="modal"
        />,
      );
      expect(screen.getByText(/\(67%\)/)).toBeInTheDocument();
    });

    it("rounds fractional percents to a whole number", () => {
      render(
        <ResultIdentityPersonality
          identity={{ ...mockIdentity, agreementPercent: 12.3 }}
          mode="modal"
        />,
      );
      expect(screen.getByText(/\(12%\)/)).toBeInTheDocument();
    });

    it("clamps values below 0 and above 100", () => {
      const { rerender } = render(
        <ResultIdentityPersonality
          identity={{ ...mockIdentity, agreementPercent: -10 }}
          mode="modal"
        />,
      );
      expect(screen.getByText(/\(0%\)/)).toBeInTheDocument();

      rerender(
        <ResultIdentityPersonality
          identity={{ ...mockIdentity, agreementPercent: 150 }}
          mode="modal"
        />,
      );
      expect(screen.getByText(/\(100%\)/)).toBeInTheDocument();
    });
  });

  describe('given mode "expanded"', () => {
    it("shows a chevron-down when not expanded", () => {
      render(
        <ResultIdentityPersonality
          identity={mockIdentity}
          mode="expanded"
          expanded={false}
        />,
      );
      // We check for the aria-label which is t`Rozwiń`
      expect(screen.getByLabelText(/Rozwiń/)).toBeInTheDocument();
    });

    it("shows a chevron-up when expanded", () => {
      render(
        <ResultIdentityPersonality
          identity={mockIdentity}
          mode="expanded"
          expanded={true}
        />,
      );
      // We check for the aria-label which is t`Zwiń`
      expect(screen.getByLabelText(/Zwiń/)).toBeInTheDocument();
    });

    it("calls onToggleExpanded on button click", async () => {
      const onToggleExpanded = vi.fn();
      const user = userEvent.setup();
      render(
        <ResultIdentityPersonality
          identity={mockIdentity}
          mode="expanded"
          onToggleExpanded={onToggleExpanded}
        />,
      );

      await user.click(screen.getByRole("button"));
      expect(onToggleExpanded).toHaveBeenCalledTimes(1);
    });

    it("renders slogan, shortDescription and description when expanded", () => {
      render(
        <ResultIdentityPersonality
          identity={mockIdentity}
          mode="expanded"
          expanded={true}
        />,
      );

      expect(screen.getByText(`"${mockIdentity.slogan}"`)).toBeInTheDocument();
      expect(screen.getByText(mockIdentity.shortDescription)).toBeInTheDocument();
      expect(screen.getByText(mockIdentity.description)).toBeInTheDocument();
    });
  });

  describe('given mode "modal"', () => {
    it("shows the info icon", () => {
      render(
        <ResultIdentityPersonality identity={mockIdentity} mode="modal" />,
      );
      expect(screen.getByLabelText(/Szczegóły/)).toBeInTheDocument();
    });

    it("calls onToggleModal on button click", async () => {
      const onToggleModal = vi.fn();
      const user = userEvent.setup();
      render(
        <ResultIdentityPersonality
          identity={mockIdentity}
          mode="modal"
          onToggleModal={onToggleModal}
        />,
      );

      await user.click(screen.getByRole("button"));
      expect(onToggleModal).toHaveBeenCalledTimes(1);
    });
  });

  describe("given an imageUrl", () => {
    it("renders the avatar with alt set to name", () => {
      render(
        <ResultIdentityPersonality identity={mockIdentity} mode="modal" />,
      );
      // Athena Avatar uses the alt/name for aria-label on the wrapper
      expect(screen.getByLabelText(/Test Name/)).toBeInTheDocument();
    });
  });
});

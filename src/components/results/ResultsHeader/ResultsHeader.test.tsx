import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";
import { ResultsHeader } from "./ResultsHeader";

describe("<ResultsHeader />", () => {
  const resultsHeaderProps = {
    name: "Result name",
    slogan: "Result slogan",
    imageUrl: "result-image.png",
    agreementPercent: 76,
  };

  describe("given name, slogan and imageUrl", () => {
    it("renders the name", () => {
      renderWithI18n(<ResultsHeader {...resultsHeaderProps} />);
      expect(screen.getByText("Result name")).toBeInTheDocument();
    });

    it("renders the slogan", () => {
      renderWithI18n(<ResultsHeader {...resultsHeaderProps} />);
      expect(screen.getByText("Result slogan")).toBeInTheDocument();
    });

    it("renders the avatar with alt set to name", () => {
      renderWithI18n(<ResultsHeader {...resultsHeaderProps} />);
      expect(
        screen.getByRole("img", { name: "Result name" }),
      ).toBeInTheDocument();
    });
  });

  describe("given agreementPercent", () => {
    it('renders the rounded percent label "{n}% pewności"', () => {
      renderWithI18n(
        <ResultsHeader {...resultsHeaderProps} agreementPercent={76} />,
      );
      expect(screen.getByText("76% pewności")).toBeInTheDocument();
    });

    it("rounds fractional percents", () => {
      renderWithI18n(
        <ResultsHeader {...resultsHeaderProps} agreementPercent={66.6} />,
      );
      expect(screen.getByText("67% pewności")).toBeInTheDocument();
    });

    it("clamps values below 0 to 0", () => {
      renderWithI18n(
        <ResultsHeader {...resultsHeaderProps} agreementPercent={-10} />,
      );
      expect(screen.getByText("0% pewności")).toBeInTheDocument();
    });

    it("clamps values above 100 to 100", () => {
      renderWithI18n(
        <ResultsHeader {...resultsHeaderProps} agreementPercent={150} />,
      );
      expect(screen.getByText("100% pewności")).toBeInTheDocument();
    });
  });

  describe("color tier", () => {
    it("uses the high green tier for a high percent", () => {
      renderWithI18n(
        <ResultsHeader {...resultsHeaderProps} agreementPercent={76} />,
      );
      expect(screen.getByText("76% pewności")).toHaveClass("text-gi-green");
    });

    it("uses the mid amber tier for a mid percent", () => {
      renderWithI18n(
        <ResultsHeader {...resultsHeaderProps} agreementPercent={51} />,
      );
      expect(screen.getByText("51% pewności")).toHaveClass("text-gi-orange");
    });

    it("uses the low red tier for a low percent", () => {
      renderWithI18n(
        <ResultsHeader {...resultsHeaderProps} agreementPercent={12} />,
      );
      expect(screen.getByText("12% pewności")).toHaveClass("text-gi-red");
    });
  });

  describe("action button", () => {
    describe("when actionLabel and onActionClick are provided", () => {
      it("renders the action button", () => {
        renderWithI18n(
          <ResultsHeader
            {...resultsHeaderProps}
            actionLabel="Full action label"
            onActionClick={vi.fn()}
          />,
        );

        expect(
          screen.getByRole("button", { name: "Full action label" }),
        ).toBeInTheDocument();
      });

      it("calls onActionClick when clicked", () => {
        const handleActionClick = vi.fn();

        renderWithI18n(
          <ResultsHeader
            {...resultsHeaderProps}
            actionLabel="Full action label"
            onActionClick={handleActionClick}
          />,
        );

        fireEvent.click(
          screen.getByRole("button", { name: "Full action label" }),
        );

        expect(handleActionClick).toHaveBeenCalledTimes(1);
      });

      it("uses actionShortLabel as a fallback to actionLabel when omitted", () => {
        renderWithI18n(
          <ResultsHeader
            {...resultsHeaderProps}
            actionLabel="Full action label"
            onActionClick={vi.fn()}
          />,
        );

        expect(
          screen.getByRole("button", { name: "Full action label" }),
        ).toBeInTheDocument();
      });
    });

    describe("when action props are missing", () => {
      it("does not render an action button", () => {
        renderWithI18n(
          <ResultsHeader
            {...resultsHeaderProps}
            actionLabel="Full action label"
          />,
        );

        expect(screen.queryByRole("button")).not.toBeInTheDocument();
      });
    });
  });

  describe("given an id", () => {
    it("applies the id to the root element", () => {
      const { container } = renderWithI18n(
        <ResultsHeader {...resultsHeaderProps} id="result-header" />,
      );

      expect(container.firstChild).toHaveAttribute("id", "result-header");
    });
  });
});

import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { DEFAULT_LANGUAGE } from "@/constants/common";
import { messages as enMessages } from "@/locales/en/messages";
import { messages as plMessages } from "@/locales/pl/messages";
import { ResultsHeader } from "./ResultsHeader";

const defaultProps = {
  name: "Result name",
  slogan: "Result slogan",
  imageUrl: "result-image.png",
  agreementPercent: 76,
};

function renderWithI18n(children: ReactNode) {
  i18n.load({ en: enMessages, pl: plMessages });
  i18n.activate(DEFAULT_LANGUAGE);

  return render(<I18nProvider i18n={i18n}>{children}</I18nProvider>);
}

describe("<ResultsHeader />", () => {
  describe("given name, slogan and imageUrl", () => {
    it("renders the name", () => {
      renderWithI18n(<ResultsHeader {...defaultProps} />);

      expect(screen.getByText("Result name")).toBeInTheDocument();
    });

    it("renders the slogan", () => {
      renderWithI18n(<ResultsHeader {...defaultProps} />);

      expect(screen.getByText("Result slogan")).toBeInTheDocument();
    });

    it("renders the avatar with alt set to name", () => {
      renderWithI18n(<ResultsHeader {...defaultProps} />);

      expect(
        screen.getByRole("img", { name: "Result name" }),
      ).toBeInTheDocument();
    });
  });

  describe("given agreementPercent", () => {
    it('renders the rounded percent label "{n}% pewności"', () => {
      renderWithI18n(<ResultsHeader {...defaultProps} agreementPercent={76} />);

      expect(screen.getByText("76% pewności")).toBeInTheDocument();
    });

    it("rounds fractional percents", () => {
      renderWithI18n(
        <ResultsHeader {...defaultProps} agreementPercent={66.6} />,
      );

      expect(screen.getByText("67% pewności")).toBeInTheDocument();
    });

    it("clamps values below 0 to 0", () => {
      renderWithI18n(
        <ResultsHeader {...defaultProps} agreementPercent={-10} />,
      );

      expect(screen.getByText("0% pewności")).toBeInTheDocument();
    });

    it("clamps values above 100 to 100", () => {
      renderWithI18n(
        <ResultsHeader {...defaultProps} agreementPercent={150} />,
      );

      expect(screen.getByText("100% pewności")).toBeInTheDocument();
    });
  });

  describe("color tier", () => {
    it("uses the high green tier for a high percent", () => {
      renderWithI18n(<ResultsHeader {...defaultProps} agreementPercent={76} />);

      expect(screen.getByText("76% pewności")).toHaveClass("text-gi-green");
    });

    it("uses the mid amber tier for a mid percent", () => {
      renderWithI18n(<ResultsHeader {...defaultProps} agreementPercent={51} />);

      expect(screen.getByText("51% pewności")).toHaveClass("text-gi-orange");
    });

    it("uses the low red tier for a low percent", () => {
      renderWithI18n(<ResultsHeader {...defaultProps} agreementPercent={12} />);

      expect(screen.getByText("12% pewności")).toHaveClass("text-gi-red");
    });
  });

  describe("action button", () => {
    describe("when actionLabel and onActionClick are provided", () => {
      it("renders the action button", () => {
        renderWithI18n(
          <ResultsHeader
            {...defaultProps}
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
            {...defaultProps}
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
            {...defaultProps}
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
          <ResultsHeader {...defaultProps} actionLabel="Full action label" />,
        );

        expect(screen.queryByRole("button")).not.toBeInTheDocument();
      });
    });
  });

  describe("given an id", () => {
    it("applies the id to the root element", () => {
      const { container } = renderWithI18n(
        <ResultsHeader {...defaultProps} id="result" />,
      );

      expect(container.firstChild).toHaveAttribute("id", "result");
    });
  });
});

import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createOrientation } from "@/utils/vitest/createOrientation";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { ResultsHeader } from "./ResultsHeader";
import type { ResultsHeaderProps } from "./ResultsHeader.types";

const IMAGE_URL = "https://example.org/liberalism.png";
const LONG_NAME =
  "Socjaldemokratyczny liberalizm instytucjonalny o bardzo długiej autorskiej nazwie";
const LONG_TEXT =
  "Wolność, równość i solidarność dla każdego, kto chce budować wspólną przyszłość";

const liberalism = createOrientation("liberalism", "Liberalizm", {
  imageUrl: IMAGE_URL,
});

const withSlogan = (slogan: string) => ({ ...liberalism, slogan });
const withWebsite = (websiteUrl?: string) => ({ ...liberalism, websiteUrl });

const renderHeader = (props: Partial<ResultsHeaderProps> = {}) => {
  const onTabChange = vi.fn();
  const view = renderWithI18n(
    <ResultsHeader
      orientation={liberalism}
      confidence={80}
      activeTab="results"
      onTabChange={onTabChange}
      {...props}
    />,
  );

  return { ...view, onTabChange };
};

const expectNoMatch = () => {
  expect(
    screen.getByRole("heading", { level: 1, name: "Brak dopasowania" }),
  ).toBeInTheDocument();
  expect(
    screen.getByTestId("results-header-question-mark"),
  ).toBeInTheDocument();
  expect(screen.queryByTestId("results-header-ring")).not.toBeInTheDocument();
  expect(
    screen.queryByTestId("results-header-confidence"),
  ).not.toBeInTheDocument();
};

describe("<ResultsHeader />", () => {
  describe("given a match", () => {
    it("renders the image, the name and the rounded confidence with its word", () => {
      renderHeader({ confidence: 86.6 });

      expect(
        screen.getByTestId("results-header-image").querySelector("img"),
      ).toHaveAttribute("src", IMAGE_URL);
      expect(screen.getByText("Liberalizm")).toBeInTheDocument();
      expect(screen.getByText("87% pewności")).toBeInTheDocument();
    });

    it("renders the name as the main heading", () => {
      renderHeader();

      expect(
        screen.getByRole("heading", { level: 1, name: "Liberalizm" }),
      ).toBeInTheDocument();
      expect(screen.getAllByRole("heading")).toHaveLength(1);
    });

    it("renders the ring and the confidence in the match colour", () => {
      renderHeader();

      expect(
        screen.getByTestId("results-header-ring").parentElement,
      ).toHaveClass("text-gi-green");
      expect(screen.getByTestId("results-header-confidence")).toHaveClass(
        "text-gi-green",
      );
    });

    it("draws an arc as long as the confidence", () => {
      renderHeader({ confidence: 86.6 });

      const arc = screen.getByTestId("results-header-ring-arc");

      expect(arc).toHaveAttribute("pathLength", "100");
      expect(arc).toHaveAttribute("stroke-dasharray", "86.6 100");
    });

    it("hides the decorative ring from assistive technology", () => {
      renderHeader();

      expect(screen.getByTestId("results-header-ring")).toHaveAttribute(
        "aria-hidden",
        "true",
      );
    });
  });

  describe("given a partial match", () => {
    it("renders the ring and the confidence in the partial colour", () => {
      renderHeader({ confidence: 75 });

      expect(screen.getByText("75% pewności")).toHaveClass("text-gi-orange");
      expect(
        screen.getByTestId("results-header-ring").parentElement,
      ).toHaveClass("text-gi-orange");
    });

    it("decides the band on the exact value, not the rounded one", () => {
      renderHeader({ confidence: 79.9 });

      expect(screen.getByText("80% pewności")).toHaveClass("text-gi-orange");
    });
  });

  describe("given no match", () => {
    it("renders the question mark and the no match wording", () => {
      renderHeader({ confidence: 49 });

      expect(
        screen.getByTestId("results-header-question-mark"),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { level: 1, name: "Brak dopasowania" }),
      ).toBeInTheDocument();
    });

    it("renders no ring and no confidence", () => {
      renderHeader({ confidence: 49 });

      expect(
        screen.queryByTestId("results-header-ring"),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("results-header-confidence"),
      ).not.toBeInTheDocument();
      expect(screen.queryByText(/pewności/)).not.toBeInTheDocument();
    });

    it("does not render the orientation name or image", () => {
      renderHeader({ confidence: 49 });

      expect(screen.queryByText("Liberalizm")).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("results-header-image"),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("results-header-image-placeholder"),
      ).not.toBeInTheDocument();
    });

    it("draws neither the slogan nor the link, whatever the orientation carries", () => {
      renderHeader({
        confidence: 49,
        orientation: {
          ...liberalism,
          slogan: "Wolność i równość",
          websiteUrl: "https://example.org",
        },
        linkLabel: "Program",
      });

      expect(screen.queryByText("Wolność i równość")).not.toBeInTheDocument();
      expect(screen.queryByRole("link")).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("results-header-extras"),
      ).not.toBeInTheDocument();
    });
  });

  describe("given no orientation or no confidence", () => {
    it("renders no match", () => {
      const { unmount } = renderHeader({ orientation: undefined });
      expectNoMatch();
      unmount();

      const withoutConfidence = renderHeader({ confidence: undefined });
      expectNoMatch();
      withoutConfidence.unmount();

      const notANumber = renderHeader({ confidence: Number.NaN });
      expectNoMatch();
      notANumber.unmount();

      renderHeader({ confidence: "90" as unknown as number });
      expectNoMatch();
    });
  });

  describe("given a confidence outside 0-100", () => {
    it("clamps it", () => {
      const { unmount } = renderHeader({ confidence: 140 });

      expect(screen.getByText("100% pewności")).toBeInTheDocument();
      expect(screen.getByTestId("results-header-ring-arc")).toHaveAttribute(
        "stroke-dasharray",
        "100 100",
      );
      unmount();

      renderHeader({ confidence: -5 });
      expectNoMatch();
    });
  });

  describe("given the orientation has a slogan", () => {
    it("draws the slogan chip", () => {
      renderHeader({ orientation: withSlogan("Wolność i równość") });

      expect(screen.getByTestId("results-header-extras")).toContainElement(
        screen.getByTestId("results-header-slogan"),
      );
      expect(screen.getByText("Wolność i równość")).toBeInTheDocument();
    });

    it("renders it as a non-interactive chip", () => {
      renderHeader({ orientation: withSlogan("Wolność i równość") });

      const slogan = screen.getByTestId("results-header-slogan");

      expect(slogan).toHaveTextContent("Wolność i równość");
      expect(slogan.closest("a, button")).toBeNull();
      expect(slogan.querySelector("a, button")).toBeNull();
      expect(slogan).not.toHaveAttribute("tabindex");
    });

    it("collapses line breaks into one line", () => {
      renderHeader({
        orientation: withSlogan("  Wolność\n\ni równość\r\n dla każdego "),
      });

      expect(screen.getByTestId("results-header-slogan").textContent).toBe(
        "Wolność i równość dla każdego",
      );
    });

    it("truncates a long slogan to one line and keeps it complete", () => {
      renderHeader({ orientation: withSlogan(LONG_TEXT) });

      const text = screen.getByText(LONG_TEXT);

      expect(text).toHaveClass("truncate");
      expect(text).toHaveTextContent(LONG_TEXT);
    });

    it("renders nothing when the slogan is blank", () => {
      renderHeader({ orientation: withSlogan(" \n ") });

      expect(
        screen.queryByTestId("results-header-slogan"),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("results-header-extras"),
      ).not.toBeInTheDocument();
    });
  });

  describe("given the orientation has a website", () => {
    it("draws the link with linkLabel as its label", () => {
      renderHeader({
        orientation: withWebsite("https://example.org/a"),
        linkLabel: "Program",
      });

      const link = screen.getByRole("link");

      expect(link).toHaveTextContent("Program");
      expect(link).toHaveAttribute("href", "https://example.org/a");
    });

    it("renders a link that opens in a new tab and says so", () => {
      renderHeader({
        orientation: withWebsite("https://example.org/a"),
        linkLabel: "Program",
      });

      const link = screen.getByRole("link", {
        name: "Program (otwiera się w nowej karcie)",
      });

      expect(link).toHaveTextContent("Program");
      expect(link).toHaveAttribute("href", "https://example.org/a");
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("shows the address when linkLabel is empty", () => {
      const { unmount } = renderHeader({
        orientation: withWebsite("https://example.org/a"),
        linkLabel: "  ",
      });

      expect(screen.getByRole("link")).toHaveTextContent(
        "https://example.org/a",
      );
      unmount();

      renderHeader({ orientation: withWebsite("http://example.org/b") });

      expect(
        screen.getByRole("link", {
          name: "http://example.org/b (otwiera się w nowej karcie)",
        }),
      ).toHaveTextContent("http://example.org/b");
    });

    it("does not draw the link when the website is not a web address", () => {
      for (const websiteUrl of [
        "javascript:alert(1)",
        "mailto:autor@example.org",
        "data:text/html,x",
        "/program",
        "example.org",
        "",
      ]) {
        const { unmount } = renderHeader({
          orientation: withWebsite(websiteUrl),
          linkLabel: "Program",
        });

        expect(screen.queryByRole("link")).not.toBeInTheDocument();
        expect(screen.queryByText("Program")).not.toBeInTheDocument();
        expect(
          screen.queryByTestId("results-header-extras"),
        ).not.toBeInTheDocument();
        unmount();
      }
    });

    it("renders nothing when the address is not a string", () => {
      renderHeader({ orientation: withWebsite(), linkLabel: "Program" });

      expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });

    it("truncates a long label to one line and keeps it complete", () => {
      renderHeader({
        orientation: withWebsite("https://example.org"),
        linkLabel: LONG_TEXT,
      });

      const text = screen.getByText(LONG_TEXT);

      expect(text).toHaveClass("truncate");
      expect(
        screen.getByRole("link", {
          name: `${LONG_TEXT} (otwiera się w nowej karcie)`,
        }),
      ).toBeInTheDocument();
    });
  });

  describe("given a slogan and a link", () => {
    it("renders the slogan before the link in one row", () => {
      renderHeader({
        orientation: {
          ...liberalism,
          slogan: "Wolność i równość",
          websiteUrl: "https://example.org",
        },
        linkLabel: "Program",
      });

      const extras = screen.getByTestId("results-header-extras");

      expect(extras.children).toHaveLength(2);
      expect(extras.children[0]).toHaveTextContent("Wolność i równość");
      expect(extras.children[1]).toBe(screen.getByRole("link"));
    });
  });

  describe("given neither slogan nor link", () => {
    it("does not render the extras row", () => {
      renderHeader();

      expect(
        screen.queryByTestId("results-header-extras"),
      ).not.toBeInTheDocument();
    });
  });

  describe("given an orientation without an image", () => {
    it("renders a placeholder inside the ring", () => {
      renderHeader({ orientation: { ...liberalism, imageUrl: undefined } });

      const placeholder = screen.getByTestId(
        "results-header-image-placeholder",
      );

      expect(placeholder.parentElement).toContainElement(
        screen.getByTestId("results-header-ring"),
      );
      expect(
        screen.queryByTestId("results-header-image"),
      ).not.toBeInTheDocument();
    });
  });

  describe("given a name longer than the room", () => {
    it("clamps it to two lines and keeps it complete", () => {
      renderHeader({ orientation: { ...liberalism, name: LONG_NAME } });

      const heading = screen.getByRole("heading", { name: LONG_NAME });

      expect(heading).toHaveClass("line-clamp-2");
      expect(heading).toHaveTextContent(LONG_NAME);
    });
  });

  describe("tabs", () => {
    it("renders both tabs, results first", () => {
      renderHeader();

      const tabs = screen.getAllByRole("tab");

      expect(screen.getByRole("tablist")).toBeInTheDocument();
      expect(tabs).toHaveLength(2);
      expect(tabs[0]).toHaveTextContent("Twoje wyniki");
      expect(tabs[1]).toHaveTextContent("Tryb porównania");
    });

    it("marks the active tab as selected", () => {
      renderHeader({ activeTab: "comparison" });

      expect(screen.getByRole("tab", { name: "Twoje wyniki" })).toHaveAttribute(
        "aria-selected",
        "false",
      );
      expect(
        screen.getByRole("tab", { name: "Tryb porównania" }),
      ).toHaveAttribute("aria-selected", "true");
    });

    describe("when the other tab is pressed", () => {
      it("calls onTabChange with that tab", () => {
        const { onTabChange, unmount } = renderHeader();

        fireEvent.click(screen.getByRole("tab", { name: "Tryb porównania" }));

        expect(onTabChange).toHaveBeenCalledTimes(1);
        expect(onTabChange).toHaveBeenCalledWith("comparison");
        unmount();

        const second = renderHeader({ activeTab: "comparison" });

        fireEvent.click(screen.getByRole("tab", { name: "Twoje wyniki" }));

        expect(second.onTabChange).toHaveBeenCalledWith("results");
      });

      it("does not switch until activeTab changes", () => {
        renderHeader();

        fireEvent.click(screen.getByRole("tab", { name: "Tryb porównania" }));

        expect(
          screen.getByRole("tab", { name: "Twoje wyniki" }),
        ).toHaveAttribute("aria-selected", "true");
        expect(
          screen.getByRole("tab", { name: "Tryb porównania" }),
        ).toHaveAttribute("aria-selected", "false");
      });
    });

    it("is operable from the keyboard", () => {
      const { onTabChange } = renderHeader();

      const resultsTab = screen.getByRole("tab", { name: "Twoje wyniki" });
      const comparisonTab = screen.getByRole("tab", {
        name: "Tryb porównania",
      });

      expect(resultsTab).toHaveAttribute("tabindex", "0");
      expect(comparisonTab).toHaveAttribute("tabindex", "-1");

      resultsTab.focus();
      fireEvent.keyDown(resultsTab, { key: "ArrowRight" });

      expect(onTabChange).toHaveBeenCalledWith("comparison");
      expect(comparisonTab).toHaveFocus();
    });
  });

  describe("in no match", () => {
    it("still renders the tabs", () => {
      renderHeader({ orientation: undefined, activeTab: "comparison" });

      expect(
        screen.getByRole("tab", { name: "Tryb porównania" }),
      ).toHaveAttribute("aria-selected", "true");
    });
  });
});

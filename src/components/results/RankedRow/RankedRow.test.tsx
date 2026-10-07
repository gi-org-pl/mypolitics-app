import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createOrientation } from "@/utils/vitest/createOrientation";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { RankedRow } from "./RankedRow";
import type { RankedEntry, RankedRowProps } from "./RankedRow.types";

const IMAGE_URL = "https://example.org/liberalism.png";
const ICON_URL = "https://example.org/verified.svg";
const LONG_NAME =
  "Socjaldemokratyczny liberalizm instytucjonalny o bardzo długiej autorskiej nazwie";

const orientation = createOrientation("liberalism", "Liberalizm", {
  imageUrl: IMAGE_URL,
  color: "#d5213d",
});

const renderRow = (
  entry: Partial<RankedEntry> = {},
  props: Partial<RankedRowProps> = {},
) =>
  renderWithI18n(
    <RankedRow entry={{ orientation, value: 80, ...entry }} {...props} />,
  );

describe("<RankedRow />", () => {
  it("renders the name and a one-sided bar with no marker and no labels", () => {
    renderRow();

    expect(screen.getByTestId("ranked-row-name")).toHaveTextContent(
      "Liberalizm",
    );
    expect(screen.getByTestId("ranked-row-name").tagName).toBe("P");
    expect(
      screen.getByRole("img", { name: "Liberalizm: 80%" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("universal-axis-fill-start")).toHaveStyle({
      width: "80%",
    });
    expect(
      screen.getByTestId("universal-axis-cap-start").querySelector("img"),
    ).toHaveAttribute("src", IMAGE_URL);
    expect(
      screen.queryByTestId("universal-axis-fill-end"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("universal-axis-marker"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("universal-axis-labels"),
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId("ranked-row-badge")).not.toBeInTheDocument();
  });

  it("passes the orientation colour to the bar", () => {
    renderRow();

    expect(
      screen
        .getByTestId("universal-axis-fill-start")
        .style.getPropertyValue("--axis-color"),
    ).toBe("#d5213d");
  });

  it("renders an icon-only badge with its text name", () => {
    renderRow({ badge: { iconUrl: ICON_URL, label: "Zweryfikowany" } });

    const icon = screen.getByRole("img", { name: "Zweryfikowany" });

    expect(icon).toHaveAttribute("src", ICON_URL);
    expect(screen.getByTestId("ranked-row-badge")).toContainElement(icon);
  });

  it("renders an icon-only badge without a label as decoration", () => {
    renderRow({ badge: { iconUrl: ICON_URL } });

    expect(
      screen.getByTestId("ranked-row-badge").querySelector("img"),
    ).toHaveAttribute("alt", "");
  });

  it("renders a badge with icon and text", () => {
    renderRow({
      badge: { iconUrl: ICON_URL, text: "Oficjalne", label: "Ignored" },
    });

    const badge = screen.getByTestId("ranked-row-badge");

    expect(badge).toHaveTextContent("Oficjalne");
    expect(badge.querySelector("img")).toHaveAttribute("src", ICON_URL);
    expect(badge.querySelector("img")).toHaveAttribute("alt", "");
  });

  it("renders a badge with a text but no icon", () => {
    renderRow({ badge: { text: "Oficjalne" } });

    const badge = screen.getByTestId("ranked-row-badge");

    expect(badge).toHaveTextContent("Oficjalne");
    expect(badge.querySelector("img")).not.toBeInTheDocument();
  });

  it("renders no badge when it has neither icon nor text", () => {
    renderRow({ badge: { label: "Zweryfikowany", text: "   " } });

    expect(screen.queryByTestId("ranked-row-badge")).not.toBeInTheDocument();
  });

  it("renders an empty track when the value is absent", () => {
    renderRow({ value: undefined });

    expect(screen.getByTestId("ranked-row-name")).toHaveTextContent(
      "Liberalizm",
    );
    expect(
      screen.getByRole("img", { name: "Brak wyniku" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("universal-axis-fill-start"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("universal-axis-cap-start"),
    ).not.toBeInTheDocument();
  });

  it("passes a comparison to the bar", () => {
    renderRow(
      {},
      {
        comparison: {
          orientation: { id: "ania", type: "person", name: "Ania" },
          value: 40,
        },
      },
    );

    expect(
      screen.getByRole("img", {
        name: "Liberalizm: 80%, porównanie z Ania: 40%",
      }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("universal-axis-band")).toBeInTheDocument();
    expect(
      screen.getByTestId("universal-axis-comparison-image"),
    ).toBeInTheDocument();
  });

  it("renders no overlay without a comparison", () => {
    renderRow();

    expect(
      screen.queryByTestId("universal-axis-comparison-image"),
    ).not.toBeInTheDocument();
  });

  it("is not interactive", () => {
    const { container } = renderRow({
      badge: { iconUrl: ICON_URL, text: "Oficjalne" },
    });
    const before = container.innerHTML;

    fireEvent.click(screen.getByTestId("ranked-row-name"));
    fireEvent.click(screen.getByTestId("ranked-row-badge"));

    expect(container.querySelector("button, a, [tabindex]")).toBeNull();
    expect(container.innerHTML).toBe(before);
  });

  it("truncates a long name and keeps it complete in the document", () => {
    renderRow({
      orientation: { ...orientation, name: LONG_NAME },
      badge: { text: "Oficjalne" },
    });

    expect(screen.getByTestId("ranked-row-name")).toHaveClass(
      "truncate",
      "min-w-0",
    );
    expect(screen.getByTestId("ranked-row-name")).toHaveTextContent(LONG_NAME);
    expect(screen.getByTestId("ranked-row-badge")).toHaveClass("shrink-0");
  });

  it("renders the bar under an empty name", () => {
    renderRow({ orientation: { ...orientation, name: "" } });

    expect(screen.getByTestId("ranked-row-name")).toBeEmptyDOMElement();
    expect(screen.getByTestId("universal-axis-fill-start")).toBeInTheDocument();
  });

  describe("given an orientation without a name", () => {
    it("draws the bar under an empty name", () => {
      renderRow({ orientation: { ...orientation, name: undefined } });

      expect(screen.getByTestId("ranked-row-name")).toBeEmptyDOMElement();
      expect(
        screen.getByTestId("universal-axis-fill-start"),
      ).toBeInTheDocument();
      expect(screen.getByRole("img")).toHaveAccessibleName(": 80%");
    });
  });

  it("renders an empty track for an entry without an orientation", () => {
    renderWithI18n(<RankedRow entry={{} as RankedEntry} />);

    expect(screen.getByTestId("ranked-row-name")).toBeEmptyDOMElement();
    expect(
      screen.getByRole("img", { name: "Brak wyniku" }),
    ).toBeInTheDocument();
  });

  describe("given a prefix", () => {
    it("renders it quietly before the name, as two parts that can wrap", () => {
      renderRow({}, { prefix: " Gospodarka\n" });

      const name = screen.getByTestId("ranked-row-name");

      expect(name).toHaveTextContent("Gospodarka — Liberalizm");
      expect(name).toHaveClass("flex-wrap");
      expect(screen.getByTestId("ranked-row-name-prefix")).toHaveClass(
        "text-gi-primary/50",
      );
      expect(screen.getByTestId("ranked-row-name-value").textContent).toBe(
        "— Liberalizm",
      );
    });

    it("keeps the badge beside the label, outside of it", () => {
      renderRow(
        { badge: { text: "Oficjalne" } },
        { prefix: "Gospodarka", isHeading: true },
      );

      const name = screen.getByTestId("ranked-row-name");
      const badge = screen.getByTestId("ranked-row-badge");

      expect(name).not.toContainElement(badge);
      expect(name.nextElementSibling).toBe(badge);
      expect(name.parentElement).toHaveClass("flex", "items-center");
      expect(name.parentElement).not.toHaveClass("flex-wrap");
    });

    it("renders the name alone for an empty prefix", () => {
      renderRow({}, { prefix: "  " });

      expect(screen.getByTestId("ranked-row-name").textContent).toBe(
        "Liberalizm",
      );
    });
  });

  describe("given isHeading", () => {
    it("renders the name as a heading", () => {
      renderRow({}, { isHeading: true, prefix: "Gospodarka" });

      expect(
        screen.getByRole("heading", {
          level: 3,
          name: "Gospodarka — Liberalizm",
        }),
      ).toBeInTheDocument();
    });
  });
});

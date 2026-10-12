import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { OrientationChipName } from "./OrientationChipName";

const TEXT_CLASS_NAMES = ["min-w-0", "text-base", "leading-5", "font-bold"];

describe("<OrientationChipName />", () => {
  describe("given a name", () => {
    it("renders it as one truncated line", () => {
      const { container } = renderWithI18n(
        <OrientationChipName name="Radykalizm" />,
      );

      const name = screen.getByText("Radykalizm");

      expect(name).toHaveClass("truncate", ...TEXT_CLASS_NAMES);
      expect(container.firstChild).toBe(name);
    });

    it("renders no short name and nothing that switches", () => {
      renderWithI18n(<OrientationChipName name="Radykalizm" />);

      expect(
        screen.queryByTestId("orientation-chip-name"),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("orientation-chip-short-name"),
      ).not.toBeInTheDocument();
      expect(screen.getByText("Radykalizm")).not.toHaveClass(
        "@max-[240px]:sr-only",
      );
    });
  });

  describe("given a second name", () => {
    it("renders both names as a pair, the name first", () => {
      const { container } = renderWithI18n(
        <OrientationChipName name="Liberalizm" secondName="Konserwatyzm" />,
      );

      const pair = screen.getByTestId("orientation-chip-name-pair");

      expect(pair.textContent).toBe("Liberalizm / Konserwatyzm");
      expect(pair).toHaveClass(...TEXT_CLASS_NAMES);
      expect(pair).not.toHaveClass("@max-[240px]:sr-only");
      expect(container.firstChild).toBe(pair);
    });
  });

  describe("given a short name", () => {
    it("renders the name and the short name inside a container that spans the room for the text", () => {
      renderWithI18n(
        <OrientationChipName name="Radykalizm" shortName="Rad." />,
      );

      const container = screen.getByTestId("orientation-chip-name");

      expect(container).toHaveClass("@container", "min-w-0", "flex-1");
      expect(container).toContainElement(screen.getByText("Radykalizm"));
      expect(container).toContainElement(
        screen.getByTestId("orientation-chip-short-name"),
      );
    });

    it("takes the name out of sight in a narrow room and leaves it to assistive technology", () => {
      renderWithI18n(
        <OrientationChipName name="Radykalizm" shortName="Rad." />,
      );

      const name = screen.getByText("Radykalizm");

      expect(name).toHaveClass("truncate", "@max-[240px]:sr-only");
      expect(name).not.toHaveAttribute("aria-hidden");
    });

    it("shows the short name in a narrow room only, hidden from assistive technology", () => {
      renderWithI18n(
        <OrientationChipName name="Radykalizm" shortName="Rad." />,
      );

      const shortName = screen.getByTestId("orientation-chip-short-name");

      expect(shortName).toHaveTextContent(/^Rad\.$/);
      expect(shortName).toHaveClass(
        "hidden",
        "@max-[240px]:block",
        "truncate",
        ...TEXT_CLASS_NAMES,
      );
      expect(shortName).toHaveAttribute("aria-hidden", "true");
    });
  });

  describe("given a second name and a short name", () => {
    it("switches between the pair and the short name", () => {
      renderWithI18n(
        <OrientationChipName
          name="Liberalizm"
          secondName="Konserwatyzm"
          shortName="Remis"
        />,
      );

      const pair = screen.getByTestId("orientation-chip-name-pair");

      expect(pair.textContent).toBe("Liberalizm / Konserwatyzm");
      expect(pair).toHaveClass("@max-[240px]:sr-only");
      expect(screen.getByTestId("orientation-chip-name")).toContainElement(
        pair,
      );
      expect(
        screen.getByTestId("orientation-chip-short-name"),
      ).toHaveTextContent(/^Remis$/);
    });
  });
});

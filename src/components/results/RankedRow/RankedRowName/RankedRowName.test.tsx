import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RankedRowName } from "./RankedRowName";

const LONG_NAME =
  "Socjaldemokratyczny liberalizm instytucjonalny o bardzo długiej autorskiej nazwie";
const LONG_PREFIX =
  "Polityka społeczna, gospodarcza i zagraniczna w ujęciu wieloletnim";

describe("<RankedRowName />", () => {
  describe("given a name alone", () => {
    it("renders it as one paragraph that truncates", () => {
      render(<RankedRowName name={LONG_NAME} />);

      const name = screen.getByTestId("ranked-row-name");

      expect(name.tagName).toBe("P");
      expect(name.textContent).toBe(LONG_NAME);
      expect(name).toHaveClass("truncate", "min-w-0");
      expect(name).not.toHaveClass("flex-wrap");
      expect(
        screen.queryByTestId("ranked-row-name-prefix"),
      ).not.toBeInTheDocument();
    });

    it("keeps its height when the name is empty", () => {
      render(<RankedRowName name="" />);

      expect(screen.getByTestId("ranked-row-name")).toBeEmptyDOMElement();
      expect(screen.getByTestId("ranked-row-name")).toHaveClass("min-h-5");
    });
  });

  describe("given an empty prefix", () => {
    it("renders the name alone", () => {
      render(<RankedRowName name="Liberalizm" prefix="" />);

      expect(screen.getByTestId("ranked-row-name").textContent).toBe(
        "Liberalizm",
      );
    });
  });

  describe("given a prefix", () => {
    it("renders the prefix and the dash with the name as two parts", () => {
      render(<RankedRowName name="Liberalizm" prefix="Gospodarka" />);

      expect(screen.getByTestId("ranked-row-name-prefix").textContent).toBe(
        "Gospodarka",
      );
      expect(screen.getByTestId("ranked-row-name-value").textContent).toBe(
        "— Liberalizm",
      );
    });

    it("lets the parts wrap, so the dash moves to the second line with the name", () => {
      render(<RankedRowName name="Liberalizm" prefix="Gospodarka" />);

      const name = screen.getByTestId("ranked-row-name");

      expect(name).toHaveClass("flex", "flex-wrap", "min-w-0");
      expect(name).not.toHaveClass("truncate");
      expect([...name.children]).toEqual([
        screen.getByTestId("ranked-row-name-prefix"),
        screen.getByTestId("ranked-row-name-value"),
      ]);
    });

    it("truncates each part only against the whole row", () => {
      render(<RankedRowName name={LONG_NAME} prefix={LONG_PREFIX} />);

      for (const id of ["ranked-row-name-prefix", "ranked-row-name-value"]) {
        expect(screen.getByTestId(id)).toHaveClass(
          "truncate",
          "max-w-full",
          "min-w-0",
        );
      }
      expect(screen.getByTestId("ranked-row-name")).toHaveTextContent(
        `${LONG_PREFIX} — ${LONG_NAME}`,
      );
    });

    it("renders the prefix and the dash quietly and the name in full colour", () => {
      render(<RankedRowName name="Liberalizm" prefix="Gospodarka" />);

      expect(screen.getByTestId("ranked-row-name-prefix")).toHaveClass(
        "text-gi-primary/50",
      );
      expect(screen.getByText("—")).toHaveClass("text-gi-primary/50");
      expect(screen.getByTestId("ranked-row-name-value")).not.toHaveClass(
        "text-gi-primary/50",
      );
    });

    it("reads as one phrase", () => {
      render(<RankedRowName name="Liberalizm" prefix="Gospodarka" isHeading />);

      expect(
        screen.getByRole("heading", { name: "Gospodarka — Liberalizm" }),
      ).toBeInTheDocument();
    });
  });

  describe("given isHeading", () => {
    it("renders a level 3 heading", () => {
      render(<RankedRowName name="Liberalizm" isHeading />);

      expect(
        screen.getByRole("heading", { level: 3, name: "Liberalizm" }),
      ).toBeInTheDocument();
    });
  });
});

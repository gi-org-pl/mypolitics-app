import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { OrientationChipNamePair } from "./OrientationChipNamePair";

const LONG_START_NAME = "Eurosceptycyzm z bardzo długą nazwą autorską";
const LONG_END_NAME = "Federacjonizm z równie długą nazwą autorską";

const getPair = () => screen.getByTestId("orientation-chip-name-pair");

describe("<OrientationChipNamePair />", () => {
  describe("given two names", () => {
    it("renders them around the separator, start first", () => {
      renderWithI18n(
        <OrientationChipNamePair
          start="Liberalizm"
          end="Konserwatyzm"
          className=""
        />,
      );

      expect(getPair().textContent).toBe("Liberalizm / Konserwatyzm");
    });

    it("keeps each name in a box of its own, with the separator between them", () => {
      renderWithI18n(
        <OrientationChipNamePair
          start="Liberalizm"
          end="Konserwatyzm"
          className=""
        />,
      );

      const [start, separator, end] = getPair().childNodes;

      expect(getPair().childNodes).toHaveLength(3);
      expect(start).toBe(screen.getByText("Liberalizm"));
      expect(separator.nodeType).toBe(Node.TEXT_NODE);
      expect(separator.textContent).toBe(" / ");
      expect(end).toBe(screen.getByText("Konserwatyzm"));
    });

    it("keeps the spaces around the separator", () => {
      renderWithI18n(
        <OrientationChipNamePair
          start="Liberalizm"
          end="Konserwatyzm"
          className=""
        />,
      );

      expect(getPair()).toHaveClass("whitespace-pre");
    });
  });

  describe("given names longer than the room", () => {
    it("truncates each name on its own, never the pair as one text", () => {
      renderWithI18n(
        <OrientationChipNamePair
          start={LONG_START_NAME}
          end={LONG_END_NAME}
          className=""
        />,
      );

      expect(screen.getByText(LONG_START_NAME)).toHaveClass("truncate");
      expect(screen.getByText(LONG_END_NAME)).toHaveClass("truncate");
      expect(getPair()).not.toHaveClass("truncate");
    });

    it("lets every part shrink and gives none more than its content", () => {
      renderWithI18n(
        <OrientationChipNamePair
          start={LONG_START_NAME}
          end={LONG_END_NAME}
          className=""
        />,
      );

      expect(getPair()).toHaveClass(
        "grid",
        "grid-flow-col",
        "auto-cols-[minmax(0,auto)]",
      );
    });
  });

  describe("given a class name", () => {
    it("adds it to the pair", () => {
      renderWithI18n(
        <OrientationChipNamePair
          start="Liberalizm"
          end="Konserwatyzm"
          className="min-w-0 font-bold"
        />,
      );

      expect(getPair()).toHaveClass("min-w-0", "font-bold", "grid");
    });
  });
});

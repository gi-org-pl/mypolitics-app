import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { createAxisPair } from "@/utils/vitest/createAxisPair";
import { PreviewIcons } from "./PreviewIcons";

const AXES = [
  createAxisPair("force", "Pacyfizm", "Militaryzm", 5, 95),
  createAxisPair("faith", "Sekularyzm", "Religijność", 60, 40),
];

const getSources = (testId: string) =>
  Array.from(screen.getByTestId(testId).querySelectorAll("img")).map((image) =>
    image.getAttribute("src"),
  );

describe("<PreviewIcons />", () => {
  describe("given the start side", () => {
    it("renders the icons of the start poles, aligned to the start", () => {
      render(<PreviewIcons axes={AXES} side="start" />);

      expect(getSources("multi-axis-chart-preview-start")).toEqual([
        "https://example.com/force-start.svg",
        "https://example.com/faith-start.svg",
      ]);
      expect(screen.getByTestId("multi-axis-chart-preview-start")).toHaveClass(
        "justify-start",
      );
    });
  });

  describe("given the end side", () => {
    it("renders the icons of the end poles, aligned to the end", () => {
      render(<PreviewIcons axes={AXES} side="end" />);

      expect(getSources("multi-axis-chart-preview-end")).toEqual([
        "https://example.com/force-end.svg",
        "https://example.com/faith-end.svg",
      ]);
      expect(screen.getByTestId("multi-axis-chart-preview-end")).toHaveClass(
        "justify-end",
      );
    });
  });

  describe("given an orientation without an icon", () => {
    it("leaves it out", () => {
      const [force, faith] = AXES;

      render(
        <PreviewIcons
          axes={[
            {
              ...force,
              start: {
                ...force.start,
                orientation: {
                  ...force.start.orientation,
                  imageUrl: undefined,
                },
              },
            },
            faith,
          ]}
          side="start"
        />,
      );

      expect(getSources("multi-axis-chart-preview-start")).toEqual([
        "https://example.com/faith-start.svg",
      ]);
    });
  });

  describe("given an icon that fails to load", () => {
    it("leaves it out, as an orientation without an icon", () => {
      render(<PreviewIcons axes={AXES} side="start" />);

      const preview = screen.getByTestId("multi-axis-chart-preview-start");

      fireEvent.error(preview.querySelectorAll("img")[0]);

      expect(getSources("multi-axis-chart-preview-start")).toEqual([
        "https://example.com/faith-start.svg",
      ]);
      expect(preview.children).toHaveLength(1);
    });

    it("leaves the row empty when every icon fails", () => {
      render(<PreviewIcons axes={AXES} side="end" />);

      const preview = screen.getByTestId("multi-axis-chart-preview-end");

      for (const image of preview.querySelectorAll("img")) {
        fireEvent.error(image);
      }

      expect(preview).toBeEmptyDOMElement();
    });
  });

  describe("given more icons than fit", () => {
    it("cuts the row at what fits instead of growing", () => {
      render(<PreviewIcons axes={AXES} side="start" />);

      expect(screen.getByTestId("multi-axis-chart-preview-start")).toHaveClass(
        "h-4",
        "min-w-0",
        "flex-wrap",
        "overflow-hidden",
      );
    });
  });

  describe("accessibility", () => {
    it("renders the icons as decoration", () => {
      render(<PreviewIcons axes={AXES} side="start" />);

      expect(screen.queryByRole("img")).not.toBeInTheDocument();
      expect(
        screen
          .getByTestId("multi-axis-chart-preview-start")
          .querySelectorAll('img[alt=""]'),
      ).toHaveLength(2);
    });
  });
});

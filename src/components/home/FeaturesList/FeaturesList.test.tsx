import { render, screen } from "@testing-library/react";
import { FeaturesList } from "./FeaturesList";
import type { Feature } from "./FeaturesList.types";

describe("<FeaturesList />", () => {
  describe("given a list of features", () => {
    it("renders a card for each feature", () => {
      const features: Feature[] = [
        { title: "Title 1", description: "Desc 1" },
        { title: "Title 2", description: "Desc 2" },
      ];

      render(<FeaturesList features={features} />);

      expect(screen.getAllByRole("article")).toHaveLength(2);
    });

    it("renders the title of each feature", () => {
      const features: Feature[] = [
        { title: "Title 1", description: "Desc 1" },
        { title: "Title 2", description: "Desc 2" },
      ];

      render(<FeaturesList features={features} />);

      expect(screen.getByRole("heading", { name: "Title 1" })).toBeVisible();
      expect(screen.getByRole("heading", { name: "Title 2" })).toBeVisible();
    });

    it("renders the description of each feature", () => {
      const features: Feature[] = [
        { title: "Title 1", description: "Desc 1" },
        { title: "Title 2", description: "Desc 2" },
      ];

      render(<FeaturesList features={features} />);

      expect(screen.getByText("Desc 1")).toBeVisible();
      expect(screen.getByText("Desc 2")).toBeVisible();
    });
  });

  describe("given a feature with a ReactNode description", () => {
    it("renders the inline link within the description", () => {
      const features: Feature[] = [
        {
          title: "Title 1",
          description: (
            <>
              Learn more <a href="/docs">here</a>.
            </>
          ),
        },
      ];

      render(<FeaturesList features={features} />);

      expect(screen.getByRole("link", { name: "here" })).toHaveAttribute(
        "href",
        "/docs"
      );
    });
  });

  describe("given an empty features array", () => {
    it("renders no cards", () => {
      render(<FeaturesList features={[]} />);

      expect(screen.queryAllByRole("article")).toHaveLength(0);
    });
  });

  describe("layout", () => {
    it("applies a single-column layout on mobile", () => {
      const features: Feature[] = [{ title: "Title 1", description: "Desc 1" }];

      const { container } = render(<FeaturesList features={features} />);

      const list = container.querySelector("ul");
      expect(list).toHaveClass("grid-cols-1");
    });

    it("applies a 3-column grid layout on desktop", () => {
      const features: Feature[] = [{ title: "Title 1", description: "Desc 1" }];

      const { container } = render(<FeaturesList features={features} />);

      const list = container.querySelector("ul");
      expect(list).toHaveClass("md:grid-cols-3");
    });
  });
});
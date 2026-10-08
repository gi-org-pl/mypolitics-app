import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FeatureCard } from "./FeatureCard";

const TITLE = "Algorytm jest jawny";
const DESCRIPTION = "Nie ukrywamy, jak dopasowujemy użytkowników.";
const LINK_NAME = "Sprawdź jak działa algorytm.";
const LINK_PATH = "/static/whitepaper.pdf";

describe("<FeatureCard />", () => {
  describe("when the description is a text", () => {
    it("renders the title as the heading of the card", () => {
      render(
        <FeatureCard feature={{ title: TITLE, description: DESCRIPTION }} />,
      );

      expect(
        within(screen.getByRole("article")).getByRole("heading", {
          level: 3,
          name: TITLE,
        }),
      ).toBeInTheDocument();
    });

    it("renders the description", () => {
      render(
        <FeatureCard feature={{ title: TITLE, description: DESCRIPTION }} />,
      );

      expect(
        within(screen.getByRole("article")).getByText(DESCRIPTION),
      ).toBeInTheDocument();
    });
  });

  describe("when the description holds a link", () => {
    it("renders the link inside the card", () => {
      render(
        <FeatureCard
          feature={{
            title: TITLE,
            description: <a href={LINK_PATH}>{LINK_NAME}</a>,
          }}
        />,
      );

      expect(
        within(screen.getByRole("article")).getByRole("link", {
          name: LINK_NAME,
        }),
      ).toHaveAttribute("href", LINK_PATH);
    });
  });
});

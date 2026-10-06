import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ArchetypeDescription } from "./ArchetypeDescription";

const MARKUP =
  '<b>Mocne</b> [link](https://example.com) <a href="https://example.com">odnośnik</a>';

describe("<ArchetypeDescription />", () => {
  describe("given a text", () => {
    it("renders it in one paragraph", () => {
      render(<ArchetypeDescription text="Opis archetypu." />);

      const description = screen.getByTestId("archetype-description");

      expect(description.tagName).toBe("P");
      expect(description.textContent).toBe("Opis archetypu.");
    });
  });

  describe("given a text with paragraph breaks", () => {
    it("keeps them", () => {
      render(<ArchetypeDescription text={"Raz.\n\nDwa.\nTrzy."} />);

      const description = screen.getByTestId("archetype-description");

      expect(description.textContent).toBe("Raz.\n\nDwa.\nTrzy.");
      expect(description).toHaveClass("whitespace-pre-line");
    });
  });

  describe("given a text with markup", () => {
    it("renders it as written, as plain text", () => {
      render(<ArchetypeDescription text={MARKUP} />);

      const description = screen.getByTestId("archetype-description");

      expect(description.textContent).toBe(MARKUP);
      expect(description.children).toHaveLength(0);
      expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });
  });

  describe("given a word longer than the card", () => {
    it("lets it break", () => {
      render(<ArchetypeDescription text={"a".repeat(200)} />);

      expect(screen.getByTestId("archetype-description")).toHaveClass(
        "wrap-anywhere",
      );
    });
  });
});

import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { PartnersList } from "./PartnersList";
import type { PartnerSection } from "./PartnersList.types";

const PARTNERS_SECTION: PartnerSection = {
  title: "Partnerzy",
  partners: [
    {
      title: "Demagog",
      logoUrl: "/assets/demagog.png",
      www: "https://demagog.org.pl",
    },
    { title: "Onet", logoUrl: "/assets/onet.png" },
  ],
};

const PATRONS_SECTION: PartnerSection = {
  title: "Patroni medialni",
  partners: [{ title: "Wprost", logoUrl: "/assets/wprost.png" }],
};

const UNTITLED_SECTION: PartnerSection = {
  partners: [{ title: "Polityka", logoUrl: "/assets/polityka.png" }],
};

describe("<PartnersList />", () => {
  describe("when it gets sections", () => {
    it("renders one list of logos per section, in the given order", () => {
      renderWithI18n(
        <PartnersList sections={[PARTNERS_SECTION, PATRONS_SECTION]} />,
      );

      const [partners, patrons] = screen.getAllByRole("list");

      expect(partners).toHaveAccessibleName("Partnerzy");
      expect(within(partners).getAllByRole("img")).toHaveLength(2);
      expect(patrons).toHaveAccessibleName("Patroni medialni");
      expect(
        within(patrons).getByRole("img", { name: "Wprost" }),
      ).toBeVisible();
    });

    it("passes each partner to its section", () => {
      renderWithI18n(<PartnersList sections={[PARTNERS_SECTION]} />);

      expect(screen.getByRole("link", { name: "Demagog" })).toHaveAttribute(
        "href",
        "https://demagog.org.pl",
      );
      expect(screen.getByRole("img", { name: "Onet" })).toBeVisible();
    });
  });

  describe("when two sections have no title", () => {
    it("renders both", () => {
      renderWithI18n(
        <PartnersList sections={[UNTITLED_SECTION, UNTITLED_SECTION]} />,
      );

      expect(screen.getAllByRole("img", { name: "Polityka" })).toHaveLength(2);
    });
  });

  describe("when the list of sections is empty", () => {
    it("renders nothing", () => {
      const { container } = renderWithI18n(<PartnersList sections={[]} />);

      expect(container).toBeEmptyDOMElement();
    });
  });
});

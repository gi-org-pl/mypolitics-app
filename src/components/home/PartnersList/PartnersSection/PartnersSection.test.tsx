import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import type { Partner } from "../PartnersList.types";
import { PartnersSection } from "./PartnersSection";

const TITLE = "Mówili o nas";
const PARTNERS: Partner[] = [
  { title: "Onet", logoUrl: "/assets/onet.png", www: "https://www.onet.pl" },
  { title: "Wprost", logoUrl: "/assets/wprost.png" },
];

const getLogoNames = () =>
  screen
    .getAllByRole("listitem")
    .map((item) => within(item).getByRole("img").getAttribute("alt"));

describe("<PartnersSection />", () => {
  describe("when the section has a title", () => {
    it("renders the title followed by a colon", () => {
      renderWithI18n(
        <PartnersSection section={{ title: TITLE, partners: PARTNERS }} />,
      );

      expect(screen.getByText(`${TITLE}:`)).toBeInTheDocument();
    });

    it("names the list of logos by the title", () => {
      renderWithI18n(
        <PartnersSection section={{ title: TITLE, partners: PARTNERS }} />,
      );

      expect(screen.getByRole("list", { name: TITLE })).toBeInTheDocument();
    });
  });

  describe("when the section has no title", () => {
    it("renders the logos alone", () => {
      renderWithI18n(<PartnersSection section={{ partners: PARTNERS }} />);

      expect(screen.queryByText(/:$/)).not.toBeInTheDocument();
      expect(screen.getByRole("list")).not.toHaveAccessibleName();
    });
  });

  describe("when it gets partners", () => {
    it("renders one logo per partner, in the given order", () => {
      renderWithI18n(<PartnersSection section={{ partners: PARTNERS }} />);

      expect(getLogoNames()).toEqual(PARTNERS.map(({ title }) => title));
    });

    it("renders both of two partners that share a title", () => {
      renderWithI18n(
        <PartnersSection section={{ partners: [PARTNERS[1], PARTNERS[1]] }} />,
      );

      expect(screen.getAllByRole("img", { name: "Wprost" })).toHaveLength(2);
    });
  });
});

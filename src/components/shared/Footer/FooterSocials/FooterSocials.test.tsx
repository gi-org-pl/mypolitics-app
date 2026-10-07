import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FOCUS_CLASS_NAME } from "@/constants/focus";
import { LINK_ICON_MASK_CLASS_NAME } from "@/constants/icon";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { FooterSocials } from "./FooterSocials";

const SOCIAL_PROFILES = [
  ["Odwiedź nasz profil na Facebooku", "https://facebook.com/myPoliticsTest"],
  ["Odwiedź nasz profil na X", "https://x.com/myPolitics__"],
  [
    "Odwiedź nasz profil na Instagramie",
    "https://www.instagram.com/mypolitics_/",
  ],
  [
    "Odwiedź nasz profil na LinkedIn",
    "https://www.linkedin.com/company/mypolitics",
  ],
  ["Odwiedź nasz profil na Telegramie", "https://t.me/mypoliticsofficial"],
  ["Odwiedź nasz profil na GitHub", "https://github.com/mypolitics"],
  ["Odwiedź nasz kanał na YouTube", "https://www.youtube.com/myPolitics"],
];

const getIcons = () =>
  screen.getAllByRole("link").map((link) => link.querySelector("span"));

describe("<FooterSocials />", () => {
  describe("given any page", () => {
    it("renders the seven social profiles in the order of the design", () => {
      renderWithI18n(<FooterSocials />);

      expect(
        screen
          .getAllByRole("link")
          .map((link) => [
            link.getAttribute("aria-label"),
            link.getAttribute("href"),
          ]),
      ).toEqual(SOCIAL_PROFILES);
    });

    it.each(
      SOCIAL_PROFILES,
    )("names the link '%s' by its label only, not by its icon", (name) => {
      renderWithI18n(<FooterSocials />);

      const link = screen.getByRole("link", { name });

      expect(link).toHaveAccessibleName(name);
      expect(link.querySelector("img")).not.toBeInTheDocument();
    });

    it("opens every profile in a new tab without access to the opener", () => {
      renderWithI18n(<FooterSocials />);

      for (const link of screen.getAllByRole("link")) {
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
      }
    });

    it("gives every profile its own icon, drawn as a mask", () => {
      renderWithI18n(<FooterSocials />);

      const masks = getIcons().map((icon) => icon?.style.maskImage);

      expect(new Set(masks).size).toBe(SOCIAL_PROFILES.length);
      expect(masks.every((mask) => mask?.startsWith('url("'))).toBe(true);
    });

    it("draws every icon in the shared way that survives forced colours", () => {
      renderWithI18n(<FooterSocials />);

      for (const icon of getIcons()) {
        expect(icon).toHaveClass(...LINK_ICON_MASK_CLASS_NAME.split(" "));
      }
    });

    it("shows keyboard focus on every link as the shared outline", () => {
      renderWithI18n(<FooterSocials />);

      for (const link of screen.getAllByRole("link")) {
        expect(link).toHaveClass(...FOCUS_CLASS_NAME.split(" "));
      }
    });
  });
});

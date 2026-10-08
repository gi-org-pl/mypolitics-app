import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PartnerLogo } from "./PartnerLogo";

const TITLE = "Stowarzyszenie Demagog";
const LOGO_URL = "/assets/demagog.png";
const WEBSITE = "https://demagog.org.pl";

describe("<PartnerLogo />", () => {
  describe("when the partner has a website", () => {
    it("renders the logo as a link to the website, named by the partner", () => {
      render(
        <PartnerLogo
          partner={{ title: TITLE, logoUrl: LOGO_URL, www: WEBSITE }}
        />,
      );

      expect(screen.getByRole("link", { name: TITLE })).toHaveAttribute(
        "href",
        WEBSITE,
      );
    });

    it("opens the website in a new tab, without access to the app", () => {
      render(
        <PartnerLogo
          partner={{ title: TITLE, logoUrl: LOGO_URL, www: WEBSITE }}
        />,
      );

      const link = screen.getByRole("link", { name: TITLE });

      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });
  });

  describe("when the partner has no website", () => {
    it("renders the logo alone, named and titled by the partner", () => {
      render(<PartnerLogo partner={{ title: TITLE, logoUrl: LOGO_URL }} />);

      const logo = screen.getByRole("img", { name: TITLE });

      expect(logo).toHaveAttribute("src", LOGO_URL);
      expect(logo).toHaveAttribute("title", TITLE);
      expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });
  });
});

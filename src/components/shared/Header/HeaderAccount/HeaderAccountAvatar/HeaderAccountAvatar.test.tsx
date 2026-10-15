import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HeaderAccountAvatar } from "./HeaderAccountAvatar";

describe("HeaderAccountAvatar", () => {
  describe("given no photo", () => {
    it("shows the first letters of the first two words", () => {
      const { container } = render(
        <HeaderAccountAvatar displayName="Anna Maria Kowalska" size="small" />,
      );

      expect(container).toHaveTextContent("AM");
    });

    it("shows one letter for a one-word name", () => {
      const { container } = render(
        <HeaderAccountAvatar displayName="ola" size="medium" />,
      );

      expect(container).toHaveTextContent("O");
    });
  });

  describe("given a photo", () => {
    it("shows the photo, and the initials when it fails to load", () => {
      const { container } = render(
        <HeaderAccountAvatar
          displayName="Ala Nowak"
          avatarUrl="https://example.com/ala.png"
          size="small"
        />,
      );
      const photo = container.querySelector("img") as HTMLImageElement;

      expect(photo).toHaveAttribute("src", "https://example.com/ala.png");

      fireEvent.error(photo);

      expect(container).toHaveTextContent("AN");
    });
  });

  describe("given any avatar", () => {
    it("is decoration, hidden from assistive technology", () => {
      const { container } = render(
        <HeaderAccountAvatar displayName="Ala Nowak" size="small" />,
      );
      const avatar = container.firstElementChild as HTMLElement;

      expect(avatar).toHaveAttribute("aria-hidden", "true");
      expect(avatar).not.toHaveAttribute("role");
      expect(avatar).not.toHaveAttribute("aria-label");
    });
  });
});

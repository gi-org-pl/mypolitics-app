import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PartnersList } from "./PartnersList";
import type { PartnerSection } from "./PartnersList.types";

const sectionWithTitle: PartnerSection = {
    title: "Section title",
    partners: [
        {
            title: "Linked partner",
            logoUrl: "linked-partner.svg",
            www: "https://example.com/linked-partner",
        },
        {
            title: "Second linked partner",
            logoUrl: "second-linked-partner.svg",
            www: "https://example.com/second-linked-partner",
        },
    ],
};

const sectionWithoutTitle: PartnerSection = {
    partners: [
        {
            title: "Third linked partner",
            logoUrl: "third-linked-partner.svg",
            www: "https://example.com/third-linked-partner",
        },
        {
            title: "Unlinked partner",
            logoUrl: "unlinked-partner.svg",
        },
    ],
};

describe("<PartnersList />", () => {
    describe("given sections with partners", () => {
        it("renders a logo for each partner", () => {
            render(<PartnersList sections={[sectionWithTitle, sectionWithoutTitle]} />);

            expect(screen.getAllByRole("img")).toHaveLength(4);
        });

        it("renders the correct alt and title attributes on each logo", () => {
            render(<PartnersList sections={[sectionWithTitle]} />);

            const linkedPartnerLogo = screen.getByAltText("Linked partner");
            const secondLinkedPartnerLogo = screen.getByAltText("Second linked partner");

            expect(linkedPartnerLogo).toHaveAttribute("alt", "Linked partner");
            expect(linkedPartnerLogo).toHaveAttribute("title", "Linked partner");
            expect(secondLinkedPartnerLogo).toHaveAttribute("alt", "Second linked partner");
            expect(secondLinkedPartnerLogo).toHaveAttribute("title", "Second linked partner");
        });
    });

    describe("given a partner with a www URL", () => {
        it("wraps the logo in an external link", () => {
            render(<PartnersList sections={[sectionWithTitle]} />);

            expect(screen.getByRole("link", { name: "Linked partner" })).toHaveAttribute(
                "href",
                "https://example.com/linked-partner",
            );
        });

        it('sets target="_blank" and rel="noopener noreferrer" on the link', () => {
            render(<PartnersList sections={[sectionWithTitle]} />);

            const link = screen.getByRole("link", { name: "Linked partner" });

            expect(link).toHaveAttribute("target", "_blank");
            expect(link).toHaveAttribute("rel", "noopener noreferrer");
        });
    });

    describe("given a partner without a www URL", () => {
        it("renders the logo without a link wrapper", () => {
            render(<PartnersList sections={[sectionWithoutTitle]} />);

            expect(screen.getByAltText("Unlinked partner").closest("a")).toBeNull();
        });
    });

    describe("given a section with a title", () => {
        it("renders the section title with a colon suffix", () => {
            render(<PartnersList sections={[sectionWithTitle]} />);

            expect(screen.getByText("Section title:")).toBeInTheDocument();
        });
    });

    describe("given a section without a title", () => {
        it("does not render any section title", () => {
            render(<PartnersList sections={[sectionWithoutTitle]} />);

            expect(screen.queryByText("Section title:")).not.toBeInTheDocument();
        });
    });

    describe("given an empty sections array", () => {
        it("renders nothing", () => {
            const { container } = render(<PartnersList sections={[]} />);

            expect(container.firstChild).toBeNull();
        });
    });
});

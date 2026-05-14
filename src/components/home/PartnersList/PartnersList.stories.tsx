import MYPOLITICS_LOGO from "@/assets/vectors/mypolitics.svg";
import type { Meta, StoryObj } from "@storybook/react";
import { PartnersList } from "./PartnersList";
import type { Partner, PartnerSection } from "./PartnersList.types";

const meta: Meta<typeof PartnersList> = {
    title: "home/PartnersList",
    component: PartnersList,
    parameters: {
        layout: "padded",
    },
};

export default meta;

type Story = StoryObj<typeof PartnersList>;

const linkedPartner = (partnerNumber: number): Partner => ({
    title: `Partner ${partnerNumber}`,
    logoUrl: MYPOLITICS_LOGO,
    www: "https://mypolitics.pl",
});

const unlinkedPartner = (partnerNumber: number): Partner => ({
    title: `Partner ${partnerNumber}`,
    logoUrl: MYPOLITICS_LOGO,
});

const defaultSections: PartnerSection[] = [
    {
        title: "Partnerzy",
        partners: Array.from({ length: 4 }, (_, index) =>
            index % 3 === 0 ? unlinkedPartner(index + 1) : linkedPartner(index + 1),
        ),
    },
    {
        title: "Patroni medialni",
        partners: Array.from({ length: 4 }, (_, index) =>
            index % 2 === 0 ? linkedPartner(index + 5) : unlinkedPartner(index + 5),
        ),
    },
    {
        title: "Mówili o nas",
        partners: Array.from({ length: 8 }, (_, index) =>
            index % 4 === 0 ? unlinkedPartner(index + 9) : linkedPartner(index + 9),
        ),
    },
];

export const Default: Story = {
    args: {
        sections: defaultSections,
    },
};

export const SingleSection: Story = {
    args: {
        sections: [
            {
                partners: Array.from({ length: 16 }, (_, index) => linkedPartner(index + 1)),
            },
        ],
    },
};

export const NoLinks: Story = {
    args: {
        sections: [
            {
                title: "Patroni medialni",
                partners: Array.from({ length: 10 }, (_, index) => unlinkedPartner(index + 1)),
            },
        ],
    },
};

export const MobileViewport: Story = {
    args: {
        sections: defaultSections,
    },
    parameters: {
        viewport: {
            defaultViewport: "mobile1",
        },
    },
};

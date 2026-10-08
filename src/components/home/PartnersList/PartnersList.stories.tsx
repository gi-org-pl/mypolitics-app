import type { Meta, StoryObj } from "@storybook/react-vite";

import myPoliticsLogo from "@/assets/vectors/mypolitics.svg";

import { PartnersList } from "./PartnersList";
import type { Partner, PartnerSection } from "./PartnersList.types";

const linkedPartner = (partnerNumber: number): Partner => ({
  title: `Partner ${partnerNumber}`,
  logoUrl: myPoliticsLogo,
  www: "https://mypolitics.pl",
});

const unlinkedPartner = (partnerNumber: number): Partner => ({
  title: `Partner ${partnerNumber}`,
  logoUrl: myPoliticsLogo,
});

const sections: PartnerSection[] = [
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
    partners: Array.from({ length: 8 }, (_, index) =>
      index % 4 === 0 ? unlinkedPartner(index + 9) : linkedPartner(index + 9),
    ),
  },
];

const meta = {
  title: "Home/PartnersList",
  component: PartnersList,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    sections,
  },
} satisfies Meta<typeof PartnersList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SingleSection: Story = {
  args: {
    sections: [
      {
        partners: Array.from({ length: 28 }, (_, index) =>
          linkedPartner(index + 1),
        ),
      },
    ],
  },
};

export const NoLinks: Story = {
  args: {
    sections: [
      {
        partners: Array.from({ length: 10 }, (_, index) =>
          unlinkedPartner(index + 1),
        ),
      },
    ],
  },
};

export const LongSectionTitle: Story = {
  args: {
    sections: [
      {
        title:
          "Organizacje, redakcje i twórcy, którzy pisali i mówili o naszych quizach",
        partners: Array.from({ length: 6 }, (_, index) =>
          linkedPartner(index + 1),
        ),
      },
    ],
  },
};

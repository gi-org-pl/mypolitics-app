import type { Meta, StoryObj } from "@storybook/react";
import { FeaturesList } from "./FeaturesList";
import type { Feature } from "./FeaturesList.types";

const meta = {
  title: "Home/FeaturesList",
  component: FeaturesList,
} satisfies Meta<typeof FeaturesList>;

export default meta;
type Story = StoryObj<typeof FeaturesList>;

const defaultFeatures: Feature[] = [    
  {
    title: "+4 000 000 osób",
    description: "Milionom Polek i Polaków pomogliśmy...",
  },
  {
    title: "Nikt nas nie finansuje",
    description: "Platformę tworzą wolontariusze...",
  },
  {
    title: "Algorytm jest jawny",
    description: (
      <>
        Sprawdź jak działa algorytm.{" "}
        <a className="text-teal-600 underline" href="/whitepaper">
          Zobacz whitepaper
        </a>
      </>
    ),
  },
];

export const Default: Story = {
  args: {
    features: defaultFeatures,
  },
};

export const SingleFeature: Story = {
  args: {
    features: [defaultFeatures[0]],
  },
};

export const ManyFeatures: Story = {
  args: {
    features: [
      ...defaultFeatures,
      {
        title: "Zaufanie społeczne",
        description: "Setki partnerów wspierają nasze działania.",
      },
      {
        title: "Transparentność danych",
        description: "Publiczne raporty aktualizowane co miesiąc.",
      },
      {
        title: "Otwarte API",
        description: "Możesz integrować dane w swoich projektach.",
      },
    ],
  },
};
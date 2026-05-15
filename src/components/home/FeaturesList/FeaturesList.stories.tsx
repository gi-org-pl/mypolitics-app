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
    description: "Milionom Polek i Polaków pomogliśmy poszerzyć świadomość polityczną poprzez quizy światopoglądowe.",
  },
  {
    title: "Nikt nas nie finansuje",
    description: "Platformę tworzą wolontariusze ze wsparciem ekspertów. Nie przyjęliśmy ani złotówki ze środków publicznych ani zagranicznych.",
  },
  {
    title: "Algorytm jest jawny",
    description: (
      <>
        Jesteśmy w pełni transparentni, nie ukrywamy jak dopasowujemy użytkowników. <a href="/whitepaper">Sprawdź jak działa algorytm.</a>
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
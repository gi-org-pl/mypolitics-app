import type { Meta, StoryObj } from "@storybook/react-vite";

import { FeaturesList } from "./FeaturesList";
import type { Feature } from "./FeaturesList.types";

const features: Feature[] = [
  {
    title: "+4 000 000 osób",
    description:
      "Milionom Polek i Polaków pomogliśmy poszerzyć świadomość polityczną poprzez quizy światopoglądowe.",
  },
  {
    title: "Nikt nas nie finansuje",
    description:
      "Platformę tworzą wolontariusze ze wsparciem ekspertów. Nie przyjęliśmy ani złotówki ze środków publicznych ani zagranicznych.",
  },
  {
    title: "Algorytm jest jawny",
    description: (
      <>
        Jesteśmy w pełni transparentni, nie ukrywamy jak dopasowujemy
        użytkowników.{" "}
        <a href="/static/whitepaper.pdf">Sprawdź jak działa algorytm.</a>
      </>
    ),
  },
];

const meta = {
  title: "Home/FeaturesList",
  component: FeaturesList,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    features,
  },
} satisfies Meta<typeof FeaturesList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SingleFeature: Story = {
  args: {
    features: [features[0]],
  },
};

export const UnevenTexts: Story = {
  args: {
    features: [
      features[0],
      {
        title:
          "Najdłuższy tytuł cechy, który nie mieści się w jednej linii karty",
        description:
          "Platformę tworzą wolontariusze ze wsparciem ekspertów. Nie przyjęliśmy ani złotówki ze środków publicznych ani zagranicznych, a każdą złotówkę, którą dostajemy od darczyńców, przeznaczamy na rozwój narzędzi edukacyjnych dla wyborców.",
      },
      { title: "Krótko", description: "Jedno zdanie." },
    ],
  },
};

export const ManyFeatures: Story = {
  args: {
    features: [
      ...features,
      {
        title: "Zaufanie społeczne",
        description: "Setki partnerów wspierają nasze działania.",
      },
      {
        title: "Transparentność danych",
        description: "Publiczne raporty aktualizowane co miesiąc.",
      },
    ],
  },
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import myPoliticsLogo from "@/assets/images/myPolitics_logo.png";
import lata90Background from "@/assets/images/QuizCard_backgrounds/lata-90.png";

import { QuizCard } from "./QuizCard";

const noop = (): void => {};

const meta = {
  title: "Quiz/QuizCard",
  component: QuizCard,
  tags: ["autodocs"],
  args: {
    onButtonClick: noop,
    tags: ["+1.5M osób", "15 min"],
    description:
      "Opis quizu — w produkcji może zawierać pogrubienia i formatowanie.",
  },
} satisfies Meta<typeof QuizCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "Default (zawsze rozwinięte)",
  decorators: [
    (Story): ReactElement => (
      <div className="w-[800px] max-w-full">
        <Story />
      </div>
    ),
  ],
  args: {
    logoUrl: myPoliticsLogo,
    logoHeight: 24,
    isAlwaysExpanded: true,
    description:
      "Opis i tagi widoczne od razu — `isAlwaysExpanded` wyłącza zwijanie i chevron.",
  },
};

export const Collapsed: Story = {
  name: "Zwinięta (chevron)",
  decorators: [
    (Story): ReactElement => (
      <div className="w-[360px] max-w-full">
        <Story />
      </div>
    ),
  ],
  args: {
    logoUrl: myPoliticsLogo,
    logoHeight: 24,
    isAlwaysExpanded: false,
    description:
      "Karta startuje zwinięta — rozwiń chevronem, by zobaczyć opis i tagi.",
  },
};

export const WithBackground: Story = {
  args: {
    backgroundUrl: lata90Background,
    logoUrl: myPoliticsLogo,
    logoHeight: 24,
    isAlwaysExpanded: true,
    description:
      "Karta z obrazem w nagłówku — pełna treść po ustawieniu `isAlwaysExpanded`.",
  },
};

export const WithCTA: Story = {
  args: {
    backgroundUrl: lata90Background,
    title: "Polskie Lata 90.",
    cta: "Kiedyś to było... no właśnie, jak?",
    description: "Przypięta etykieta CTA na dolnym brzegu zdjęcia.",
  },
};

export const Highlighted: Story = {
  args: {
    isHighlighted: true,
    isMainAction: true,
    isShowStartText: true,
    cta: "Nowy Quiz Tożsamościowy!",
    logoUrl: myPoliticsLogo,
    logoHeight: 24,
    description: "Ciemna karta wyróżniona z przyciskiem „Rozpocznij”.",
  },
};

export const TitleLogo: Story = {
  args: {
    title: "Generacja Innowacja",
    description: "Brak logoUrl — tytuł w polu logo.",
  },
};

export const Loading: Story = {
  args: {
    logoUrl: myPoliticsLogo,
    logoHeight: 24,
    isButtonLoading: true,
  },
};

export const DisabledButton: Story = {
  args: {
    logoUrl: myPoliticsLogo,
    logoHeight: 24,
    isButtonDisabled: true,
  },
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn, userEvent, within } from "storybook/test";

import myPoliticsLogo from "@/assets/icons/quiz-logo-mypolitics.svg";
import radarLogo from "@/assets/icons/quiz-logo-warszawski-radar-wyborczy.svg";
import wyborczyLogo from "@/assets/icons/quiz-logo-wyborczy-2023.svg";
import lata90Background from "@/assets/images/home/quiz-card-lata-90.png";
import myPoliticsBackground from "@/assets/images/home/quiz-card-mypolitics.png";

import { QuizCard } from "./QuizCard";

const meta = {
  title: "Quiz/QuizCard",
  component: QuizCard,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    description: (
      <>
        <strong>Poznaj najbliższych sobie warszawskich polityków!</strong>{" "}
        Dowiesz się także, który z nich jest Tobie najbliższy w określonych
        tematach.
      </>
    ),
    tags: ["+40K osób", "9 min"],
    onButtonClick: fn(),
  },
} satisfies Meta<typeof QuizCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ImageAndBadgeCollapsed: Story = {
  args: {
    title: "Polskie Lata 90.",
    backgroundUrl: lata90Background,
    cta: "Kiedyś to było... no właśnie, jak?",
  },
};

export const LogoExpanded: Story = {
  args: {
    title: "Warszawski Radar Wyborczy",
    logoUrl: radarLogo,
  },
  globals: {
    viewport: { value: "mobile1" },
  },
  play: async ({ canvasElement }) => {
    const toggle = within(canvasElement).getByRole("button", {
      name: "Rozwiń",
      hidden: true,
    });

    await userEvent.click(toggle);
    toggle.blur();
  },
};

export const ImageAlwaysExpanded: Story = {
  args: {
    title: "myPolitics",
    logoUrl: myPoliticsLogo,
    backgroundUrl: myPoliticsBackground,
    description: (
      <>
        <strong>Najbardziej zaawansowany test poglądów politycznych.</strong>{" "}
        Poznaj najbliższą ideologię, partię i porównaj ze znajomymi!
      </>
    ),
    tags: ["+1.5M osób", "15 min"],
    isAlwaysExpanded: true,
    isHighlighted: true,
    isShowStartText: true,
  },
  globals: {
    viewport: { value: "mobile1" },
  },
};

export const Highlighted: Story = {
  args: {
    title: "myPolitics",
    logoUrl: myPoliticsLogo,
    cta: "Nowy Quiz Tożsamościowy!",
    description: (
      <>
        <strong>Najbardziej zaawansowany test poglądów politycznych.</strong>{" "}
        Poznaj swoją tożsamość, najbliższą ideologię, partię i porównaj ze
        znajomymi!
      </>
    ),
    tags: ["+2M osób", "15 min"],
    isHighlighted: true,
    isShowStartText: true,
  },
};

export const HighlightedWithoutBadge: Story = {
  args: {
    ...Highlighted.args,
    cta: undefined,
    tags: ["+1.5M osób", "15 min"],
  },
};

export const BadgeAndTitle: Story = {
  args: {
    title: "Generacja Innowacja",
    cta: "Poznaj Generację Innowację",
  },
  globals: {
    viewport: { value: "mobile1" },
  },
};

export const LogoOnly: Story = {
  args: {
    title: "Wyborczy 2023",
    logoUrl: wyborczyLogo,
  },
  globals: {
    viewport: { value: "mobile1" },
  },
};

export const Loading: Story = {
  args: {
    title: "Wyborczy 2023",
    logoUrl: wyborczyLogo,
    isButtonLoading: true,
  },
};

export const DisabledButton: Story = {
  args: {
    title: "Wyborczy 2023",
    logoUrl: wyborczyLogo,
    isButtonDisabled: true,
  },
};

export const LongTitle: Story = {
  args: {
    title:
      "Najdłuższy quiz o poglądach politycznych, gospodarczych i światopoglądowych w całej Polsce",
    cta: "Zamiast o politykę, pokłóćmy się o muzykę, filmy, książki i wszystko inne!",
  },
};

export const ManyTags: Story = {
  args: {
    title: "600+ pytań",
    tags: [
      "+1.5M osób",
      "15 min",
      "600 pytań",
      "12 osi",
      "Polityka",
      "Gospodarka",
      "Światopogląd",
      "15 min",
    ],
    isAlwaysExpanded: true,
  },
};

export const NoTags: Story = {
  args: {
    title: "Warszawski Radar Wyborczy",
    logoUrl: radarLogo,
    tags: [],
    isAlwaysExpanded: true,
  },
};

export const Clickable: Story = {
  args: {
    title: "Kraje starożytne",
    cta: "Jakie miałbyś poglądy tysiące lat temu?",
    isAlwaysExpanded: true,
    onCardClick: fn(),
  },
};

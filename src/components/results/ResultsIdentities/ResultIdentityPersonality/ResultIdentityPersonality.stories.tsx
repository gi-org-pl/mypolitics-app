import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import personalityIcon from "@/assets/images/results/resultIdentities/icon.png";
import { ResultIdentityPersonality } from "./ResultIdentityPersonality";

const meta: Meta<typeof ResultIdentityPersonality> = {
  title: "Results/ResultIdentityPersonality",
  component: ResultIdentityPersonality,
  tags: ["autodocs"],
  argTypes: {
    onToggleExpanded: { action: "toggleExpanded" },
    onToggleModal: { action: "toggleModal" },
  },
  render: (args) => {
    const [isExpanded, setIsExpanded] = useState(args.expanded);

    const handleToggleExpanded = () => {
      setIsExpanded(!isExpanded);
      args.onToggleExpanded?.();
    };

    return (
      <ResultIdentityPersonality
        {...args}
        expanded={isExpanded}
        onToggleExpanded={handleToggleExpanded}
      />
    );
  },
};

export default meta;
type Story = StoryObj<typeof ResultIdentityPersonality>;

const baseIdentity = {
  id: "1",
  name: "Zielony Postępowiec",
  shortDescription: "Krótki opis tożsamości",
  description: "Długi opis tożsamości",
  imageUrl: personalityIcon,
  agreementPercent: 66,
  slogan: "Hasło wyborcze",
};

export const ExpandedCollapsed: Story = {
  args: {
    identity: baseIdentity,
    mode: "expanded",
    expanded: false,
  },
};

export const ExpandedOpen: Story = {
  args: {
    identity: baseIdentity,
    mode: "expanded",
    expanded: true,
  },
};

export const ModalTrigger: Story = {
  args: {
    identity: baseIdentity,
    mode: "modal",
  },
};

export const CustomTitle: Story = {
  args: {
    identity: baseIdentity,
    mode: "modal",
    title: "Kandydat",
  },
};

export const LowMatch: Story = {
  args: {
    identity: {
      ...baseIdentity,
      agreementPercent: 12,
    },
    mode: "modal",
  },
};

export const MediumMatch: Story = {
  args: {
    identity: {
      ...baseIdentity,
      agreementPercent: 54,
    },
    mode: "modal",
  },
};

export const HighMatch: Story = {
  args: {
    identity: {
      ...baseIdentity,
      agreementPercent: 98,
    },
    mode: "modal",
  },
};

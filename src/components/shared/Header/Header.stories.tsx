import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router";
import { PATHS } from "@/constants/paths";
import Header from "./Header";
import type { HeaderStoryProps } from "./Header.types";

const HeaderStory = ({ initialPath }: HeaderStoryProps) => (
  <MemoryRouter initialEntries={[initialPath]}>
    <Header />
  </MemoryRouter>
);

const meta: Meta<typeof HeaderStory> = {
  title: "Shared/Header",
  component: HeaderStory,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    initialPath: PATHS.home,
  },
};

export default meta;

type Story = StoryObj<typeof HeaderStory>;

export const Default: Story = {};

export const ActiveDebaty: Story = {
  args: {
    initialPath: PATHS.debates,
  },
};

export const ActiveQuizy: Story = {
  args: {
    initialPath: PATHS.quizzes,
  },
};

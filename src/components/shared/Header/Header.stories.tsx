import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router";
import { userEvent, within } from "storybook/test";
import { PATHS } from "@/constants/paths";
import {
  VIEW_VISIT_STORAGE_KEY_PREFIX,
  VIEW_VISITED,
} from "@/constants/storage";
import { Header } from "./Header";
import type { HeaderStoryProps } from "./Header.types";

const HOME_ROUTE_ID = "routes/_index";
const HOME_VISIT_KEY = `${VIEW_VISIT_STORAGE_KEY_PREFIX}${HOME_ROUTE_ID}`;

const HeaderStory = ({ initialPath, routeId }: HeaderStoryProps) => (
  <MemoryRouter initialEntries={[initialPath]}>
    <Header routeId={routeId} />
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

export const MenuOpen: Story = {
  args: {
    initialPath: PATHS.quizzes,
  },
  globals: {
    viewport: { value: "mobile1" },
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button"));
  },
};

// The first visit of the home page in the session: the logo plays its
// animation once and rests on the blue logo.
export const FirstVisit: Story = {
  args: {
    routeId: HOME_ROUTE_ID,
  },
  beforeEach: () => {
    sessionStorage.removeItem(HOME_VISIT_KEY);

    return () => sessionStorage.removeItem(HOME_VISIT_KEY);
  },
};

// A later visit of the home page in the same session: the blue logo at once.
export const AlreadySeen: Story = {
  args: {
    routeId: HOME_ROUTE_ID,
  },
  beforeEach: () => {
    sessionStorage.setItem(HOME_VISIT_KEY, VIEW_VISITED);

    return () => sessionStorage.removeItem(HOME_VISIT_KEY);
  },
};

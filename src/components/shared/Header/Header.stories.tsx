import type {Meta, StoryObj} from '@storybook/react-vite';
import Header from './Header';
import { MemoryRouter } from "react-router";

import { fn } from 'storybook/test';

const meta: Meta<typeof Header> = {
    title: "Components/shared/Header",
    component: Header,
    parameters: {
        layout: "fullscreen",
    },
    tags: ["autodocs"],
    args: {
        clickOutsideMenu: fn(),
        buttonClick: fn()
    },
    decorators: [
        (Story) => (
        <MemoryRouter>
            <Story />
        </MemoryRouter>
        ),
    ],

};

export default meta
type Story = StoryObj<typeof Header>;

export const Default: Story = {};

export const ActiveQuizy: Story = {
  args:{
        activeButton: "quizy",
        viewport: "desktop"
    }
};

export const ActiveSondaze: Story = {
    args:{
        activeButton: "sondaze",
        viewport: "desktop"
    }
};

export const ActiveDebaty: Story = {
    args:{
        activeButton: "debaty",
        viewport: "desktop"
    }
};

export const MobileClosed: Story = {
    parameters:{
        viewport: "mobile1"
    }
};

export const MobileOpen: Story = {
    args:{
        isMenuOpen: true,
        viewport: "mobile"
    }
};
